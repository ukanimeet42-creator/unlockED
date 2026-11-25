"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { CanvasShell } from "@/components/3d/canvas-shell";

export interface FunnelStageItem {
  key: "pool" | "pending" | "shortlisted" | "interviewed" | "offered";
  label: string;
  count: number;
  color: string;
  description: string;
}

interface TalentFunnelViewProps {
  stages: FunnelStageItem[];
  selectedStage: string;
  onSelectStage: (stageKey: FunnelStageItem["key"]) => void;
}

function FunnelRing({
  stage,
  index,
  selected,
  onSelect,
  onHover,
}: {
  stage: FunnelStageItem;
  index: number;
  selected: boolean;
  onSelect: (key: FunnelStageItem["key"]) => void;
  onHover: (st: FunnelStageItem | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const yPos = 1.8 - index * 0.9;
  const radius = Math.max(0.75, 2.05 - index * 0.28);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * (selected ? 0.9 : 0.22);
    }
  });

  return (
    <Float speed={1.2} floatIntensity={0.14} rotationIntensity={0.08}>
      <group position={[0, yPos, 0]} scale={selected ? 1.09 : hovered ? 1.04 : 1}>
        <mesh
          ref={meshRef}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(stage.key);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(stage);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = "auto";
          }}
        >
          <torusGeometry args={[radius, selected ? 0.12 : 0.085, 20, 64]} />
          <meshStandardMaterial
            color={stage.color}
            emissive={stage.color}
            emissiveIntensity={selected ? 1.0 : hovered ? 0.75 : 0.4}
            roughness={0.22}
            metalness={0.72}
          />
        </mesh>

        {/* Inner disc glow proportional to stage volume */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius * 0.88, 48]} />
          <meshBasicMaterial
            color={stage.color}
            transparent
            opacity={selected ? 0.18 : 0.07}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

function TalentFunnelScene({
  stages,
  selectedStage,
  onSelectStage,
  onHoverStage,
}: TalentFunnelViewProps & { onHoverStage: (s: FunnelStageItem | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.25,
      delta * 2
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.12,
      delta * 2
    );
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.65} />
      <pointLight position={[5, 6, 5]} intensity={1.7} color="#22D3EE" />
      <pointLight position={[-5, -4, 3]} intensity={1.3} color="#00DC82" />

      {/* Central vertical axis */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 4.2, 16]} />
        <meshBasicMaterial color="#16382C" transparent opacity={0.7} />
      </mesh>

      {stages.map((stage, idx) => (
        <FunnelRing
          key={stage.key}
          stage={stage}
          index={idx}
          selected={stage.key === selectedStage}
          onSelect={onSelectStage}
          onHover={onHoverStage}
        />
      ))}

      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
    </group>
  );
}

/**
 * Interactive 3D Hiring Funnel visualizing real-time recruiter stage counts with SVG fallback.
 */
export function TalentFunnelView({
  stages,
  selectedStage,
  onSelectStage,
}: TalentFunnelViewProps) {
  const [hoveredStage, setHoveredStage] = useState<FunnelStageItem | null>(null);
  const maxCount = useMemo(
    () => Math.max(1, ...stages.map((s) => s.count)),
    [stages]
  );
  const hudStage = hoveredStage || stages.find((s) => s.key === selectedStage) || stages[0];

  const fallbackUi = (
    <div className="w-full h-full rounded-2xl bg-[#07130E] border border-[#143326] p-5 flex flex-col justify-between gap-3">
      <div className="text-[11px] font-medium text-[#8FA69B]">
        Talent Pipeline Funnel (Select stage to filter)
      </div>
      <div className="space-y-2.5 my-auto">
        {stages.map((st) => {
          const widthPct = Math.max(18, Math.round((st.count / maxCount) * 100));
          const active = st.key === selectedStage;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => onSelectStage(st.key)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                active
                  ? "bg-[#0F271D] border-[#22D3EE]"
                  : "bg-[#0A1913] border-[#143326] hover:border-[#1F4D3A]"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#F0FDF4]">{st.label}</span>
                <span className="font-mono font-bold text-[#22D3EE]">{st.count}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#06100C] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: st.color }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[330px] sm:h-[360px]">
      <CanvasShell
        className="w-full h-[330px] sm:h-[360px] rounded-2xl border border-[#143326] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),rgba(6,16,12,0.96)_72%)] overflow-hidden"
        cameraPosition={[0, 0.3, 7.2]}
        fov={44}
        fallback={fallbackUi}
        ariaLabel="Interactive 3D Recruiter Talent Funnel"
      >
        <TalentFunnelScene
          stages={stages}
          selectedStage={selectedStage}
          onSelectStage={onSelectStage}
          onHoverStage={setHoveredStage}
        />
      </CanvasShell>
      {hudStage && (
        <div className="pointer-events-none absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#06100C]/90 border border-[#16382C] text-[11px] font-medium text-[#22D3EE] backdrop-blur-md">
          {hudStage.label}: {hudStage.count}
        </div>
      )}
    </div>
  );
}
