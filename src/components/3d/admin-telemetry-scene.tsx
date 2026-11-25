"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Line, OrbitControls } from "@react-three/drei";
import { CanvasShell } from "@/components/3d/canvas-shell";

export interface GovernanceDomainNode {
  id: "identity" | "curriculum" | "hiring" | "moderation";
  label: string;
  metricLabel: string;
  count: number;
  alert: boolean;
  color: string;
  position: [number, number, number];
  href: string;
  description: string;
}

interface AdminTelemetryViewProps {
  domains: GovernanceDomainNode[];
  selectedDomainId: GovernanceDomainNode["id"];
  onSelectDomain: (id: GovernanceDomainNode["id"]) => void;
}

function DomainClusterMesh({
  domain,
  selected,
  onSelect,
  onHover,
}: {
  domain: GovernanceDomainNode;
  selected: boolean;
  onSelect: (id: GovernanceDomainNode["id"]) => void;
  onHover: (d: GovernanceDomainNode | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cubeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta * 0.55;
      cubeRef.current.rotation.x += delta * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * (domain.alert ? 1.1 : 0.4);
    }
  });

  const color = domain.alert ? "#F59E0B" : domain.color;

  return (
    <Float speed={1.4} floatIntensity={0.22} rotationIntensity={0.14}>
      <group position={domain.position} scale={selected ? 1.2 : hovered ? 1.1 : 1}>
        <mesh
          ref={cubeRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(domain.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(domain);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[0.58, 0.58, 0.58]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selected ? 1.05 : hovered ? 0.78 : 0.42}
            roughness={0.24}
            metalness={0.72}
          />
        </mesh>

        <mesh ref={ringRef}>
          <torusGeometry args={[0.62, 0.025, 16, 48]} />
          <meshBasicMaterial
            color={selected ? "#FFFFFF" : color}
            transparent
            opacity={selected ? 0.9 : 0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

function TelemetryScene({
  domains,
  selectedDomainId,
  onSelectDomain,
  onHoverDomain,
}: AdminTelemetryViewProps & { onHoverDomain: (d: GovernanceDomainNode | null) => void }) {
  const rootRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      pointer.x * 0.24,
      delta * 2
    );
    rootRef.current.rotation.x = THREE.MathUtils.lerp(
      rootRef.current.rotation.x,
      -pointer.y * 0.14,
      delta * 2
    );
  });

  return (
    <group ref={rootRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.7} color="#F59E0B" />
      <pointLight position={[-5, -4, 4]} intensity={1.4} color="#10B981" />

      {/* Central governance hub */}
      <mesh>
        <dodecahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#00DC82"
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {domains.map((d) => (
        <React.Fragment key={d.id}>
          <Line
            points={[[0, 0, 0], d.position]}
            color={d.id === selectedDomainId ? "#F59E0B" : "#1B3D2F"}
            lineWidth={d.id === selectedDomainId ? 2 : 1}
            transparent
            opacity={d.id === selectedDomainId ? 0.9 : 0.5}
          />
          <DomainClusterMesh
            domain={d}
            selected={d.id === selectedDomainId}
            onSelect={onSelectDomain}
            onHover={onHoverDomain}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
    </group>
  );
}

/**
 * Interactive 3D Admin Platform Governance Topology with non-WebGL accessible fallback.
 */
export function AdminTelemetryView({
  domains,
  selectedDomainId,
  onSelectDomain,
}: AdminTelemetryViewProps) {
  const [hoveredDomain, setHoveredDomain] = useState<GovernanceDomainNode | null>(null);
  const items = useMemo(() => domains, [domains]);
  const hudDomain = hoveredDomain || items.find((d) => d.id === selectedDomainId) || items[0];

  const fallbackUi = (
    <div className="w-full h-full rounded-2xl bg-[#07130E] border border-[#143326] p-5 flex flex-col justify-between gap-3">
      <div className="text-[11px] font-medium text-[#8FA69B]">
        Governance Telemetry Domains (Select cluster)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
        {items.map((d) => {
          const active = d.id === selectedDomainId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDomain(d.id)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                active
                  ? "bg-[#0F271D] border-[#F59E0B]"
                  : "bg-[#0A1913] border-[#143326] hover:border-[#1F4D3A]"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F0FDF4]">{d.label}</span>
                <span className="font-mono text-[#F59E0B]">{d.count}</span>
              </div>
              <p className="text-[11px] text-[#8FA69B] mt-1">{d.metricLabel}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[320px] sm:h-[360px]">
      <CanvasShell
        className="w-full h-[320px] sm:h-[360px] rounded-2xl border border-[#143326] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.11),rgba(6,16,12,0.96)_72%)] overflow-hidden"
        cameraPosition={[0, 0.35, 7.2]}
        fov={44}
        fallback={fallbackUi}
        ariaLabel="Interactive 3D Admin Governance Topology"
      >
        <TelemetryScene
          domains={items}
          selectedDomainId={selectedDomainId}
          onSelectDomain={onSelectDomain}
          onHoverDomain={setHoveredDomain}
        />
      </CanvasShell>
      {hudDomain && (
        <div className="pointer-events-none absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#06100C]/90 border border-[#16382C] text-[11px] font-medium text-[#F59E0B] backdrop-blur-md">
          {hudDomain.label}: {hudDomain.count}
        </div>
      )}
    </div>
  );
}
