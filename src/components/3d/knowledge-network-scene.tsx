"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Line, OrbitControls } from "@react-three/drei";
import { CanvasShell } from "@/components/3d/canvas-shell";
import type { Course } from "@/types";

export interface KnowledgeNode {
  id: string;
  label: string;
  subtitle: string;
  kind: "core" | "course" | "hub";
  color: string;
  position: [number, number, number];
  href: string;
  ctaLabel: string;
  tags: string[];
  meta: string;
}

interface KnowledgeNetworkViewProps {
  courses: Course[];
  selectedId: string;
  onSelectNode: (node: KnowledgeNode) => void;
  activePillar?: "learn" | "build" | "connect";
}

function deterministicUnit(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Builds deterministic interactive 3D coordinates mapping UnlockED courses and functional hubs.
 */
export function buildKnowledgeNodes(courses: Course[]): KnowledgeNode[] {
  const core: KnowledgeNode = {
    id: "core-unlocked",
    label: "UnlockED Core",
    subtitle: "AI-Guided Learning to Verified Employment",
    kind: "core",
    color: "#00DC82",
    position: [0, 0, 0],
    href: "/courses",
    ctaLabel: "Browse Full Catalog",
    tags: ["Courses", "Benchmarks", "AI Advisor", "Hiring"],
    meta: "Central Verified Ecosystem",
  };

  const coursePositions: Array<[number, number, number]> = [
    [-2.7, 1.35, 0.7],
    [2.65, 1.4, -0.4],
    [-2.5, -1.45, -0.5],
    [2.75, -1.3, 0.65],
  ];

  const courseColors = ["#10B981", "#22D3EE", "#34D399", "#F59E0B"];

  const courseNodes: KnowledgeNode[] = courses.slice(0, 4).map((course, idx) => ({
    id: course.slug || course.id,
    label: course.title,
    subtitle: course.short_description || course.description.slice(0, 96),
    kind: "course",
    color: courseColors[idx % courseColors.length],
    position: coursePositions[idx],
    href: `/courses/${course.slug || course.id}`,
    ctaLabel: "Inspect Curriculum",
    tags: course.tags.slice(0, 4),
    meta: `${course.duration_weeks}w Track · ${course.difficulty} · ${course.lesson_count ?? 4} Modules`,
  }));

  const hubNodes: KnowledgeNode[] = [
    {
      id: "hub-assessments",
      label: "Skill Benchmarks",
      subtitle: "Server-graded timed exams updating skill proficiency.",
      kind: "hub",
      color: "#22D3EE",
      position: [0, 2.35, -0.95],
      href: "/login?redirectTo=/student/assessments",
      ctaLabel: "Open Benchmarks",
      tags: ["Timed Grading", "Skill Proof"],
      meta: "Proctored Evaluation Engine",
    },
    {
      id: "hub-recruiters",
      label: "Recruiter Pipeline",
      subtitle: "Real-time skill matching and direct applicant review.",
      kind: "hub",
      color: "#F59E0B",
      position: [0, -2.35, 0.85],
      href: "/register?role=recruiter",
      ctaLabel: "Recruiter Access",
      tags: ["Job Matching", "Candidate Proof"],
      meta: "Verified Employer Talent Flow",
    },
  ];

  return [core, ...courseNodes, ...hubNodes];
}

function AmbientParticles({ count = 140 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4.2 + deterministicUnit(i, 1) * 4.5;
      const theta = deterministicUnit(i, 2) * Math.PI * 2;
      const phi = Math.acos(2 * deterministicUnit(i, 3) - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.05} color="#34D399" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function NetworkNodeMesh({
  node,
  selected,
  emphasized,
  onSelect,
  onHover,
}: {
  node: KnowledgeNode;
  selected: boolean;
  emphasized: boolean;
  onSelect: (n: KnowledgeNode) => void;
  onHover: (n: KnowledgeNode | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const baseScale = node.kind === "core" ? 0.56 : node.kind === "course" ? 0.34 : 0.28;

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (selected ? 1.15 : 0.45);
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  const activeScale = selected ? 1.24 : hovered ? 1.14 : emphasized ? 1.08 : 1;

  return (
    <Float speed={node.kind === "core" ? 1.2 : 1.8} rotationIntensity={0.25} floatIntensity={0.35}>
      <group position={node.position} scale={activeScale}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(node);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = "auto";
          }}
        >
          <icosahedronGeometry args={[baseScale, 2]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={selected ? 1.05 : hovered ? 0.85 : 0.45}
            roughness={0.22}
            metalness={0.68}
          />
        </mesh>

        <mesh ref={ringRef}>
          <torusGeometry args={[baseScale * 1.48, 0.022, 16, 48]} />
          <meshBasicMaterial
            color={selected ? "#FFFFFF" : node.color}
            transparent
            opacity={selected ? 0.9 : 0.45}
          />
        </mesh>
      </group>
    </Float>
  );
}

function NetworkGroup({
  nodes,
  selectedId,
  onSelectNode,
  onHoverNode,
  activePillar,
}: {
  nodes: KnowledgeNode[];
  selectedId: string;
  onSelectNode: (node: KnowledgeNode) => void;
  onHoverNode: (node: KnowledgeNode | null) => void;
  activePillar?: "learn" | "build" | "connect";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.28,
      delta * 2.2
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.16,
      delta * 2.2
    );
  });

  const corePos: [number, number, number] = [0, 0, 0];

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.55} />
      <pointLight position={[5, 5, 5]} intensity={1.8} color="#34D399" />
      <pointLight position={[-5, -4, 3]} intensity={1.2} color="#22D3EE" />

      <AmbientParticles />

      {/* Outer orbital halo rings */}
      <mesh rotation={[Math.PI / 2.6, 0.25, 0]}>
        <torusGeometry args={[3.35, 0.012, 12, 96]} />
        <meshBasicMaterial color="#16382C" transparent opacity={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 3.1, -0.3, 0]}>
        <torusGeometry args={[2.55, 0.01, 12, 80]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.28} />
      </mesh>

      {/* Neural edge connections */}
      {nodes
        .filter((n) => n.kind !== "core")
        .map((n) => {
          const isSelected = n.id === selectedId;
          return (
            <Line
              key={`edge-${n.id}`}
              points={[corePos, n.position]}
              color={isSelected ? "#00DC82" : "#1F4D3A"}
              lineWidth={isSelected ? 2 : 1}
              transparent
              opacity={isSelected ? 0.9 : 0.55}
            />
          );
        })}

      {nodes.map((node) => {
        const emphasized =
          (activePillar === "learn" && node.kind === "course") ||
          (activePillar === "build" && (node.kind === "core" || node.id === "hub-assessments")) ||
          (activePillar === "connect" && node.id === "hub-recruiters");

        return (
          <NetworkNodeMesh
            key={node.id}
            node={node}
            selected={node.id === selectedId}
            emphasized={emphasized}
            onSelect={onSelectNode}
            onHover={onHoverNode}
          />
        );
      })}

      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.55} />
    </group>
  );
}

/**
 * Interactive 3D Knowledge Network with accessible SVG spatial fallback when WebGL is disabled.
 */
export function KnowledgeNetworkView({
  courses,
  selectedId,
  onSelectNode,
  activePillar,
}: KnowledgeNetworkViewProps) {
  const nodes = useMemo(() => buildKnowledgeNodes(courses), [courses]);
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const hudNode = hoveredNode || nodes.find((n) => n.id === selectedId) || nodes[0];

  const fallbackSvg = (
    <div className="relative w-full h-full rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.16),rgba(6,16,12,0.96)_72%)] border border-[#143326] p-5 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between text-[11px] text-[#8FA69B]">
        <span>Interactive Knowledge Constellation</span>
        <span className="text-[#00DC82]">Click any node to inspect</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto py-4">
        {nodes.map((node) => {
          const isSelected = node.id === selectedId;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelectNode(node)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#0F271D] border-[#00DC82] shadow-[0_0_20px_rgba(0,220,130,0.2)]"
                  : "bg-[#0A1913]/90 border-[#143326] hover:border-[#1F4D3A]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-xs font-semibold text-[#F0FDF4] truncate">{node.label}</span>
              </div>
              <p className="text-[11px] text-[#8FA69B] truncate">{node.meta}</p>
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-[#5D7A6E]">
        Spatial view runs automatically on WebGL-enabled browsers and degrades safely here.
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full min-h-[380px]">
      <CanvasShell
        className="w-full h-full min-h-[380px] rounded-2xl border border-[#143326] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),rgba(6,16,12,0.96)_72%)] overflow-hidden relative"
        cameraPosition={[0, 0.25, 8.2]}
        fov={44}
        fallback={fallbackSvg}
        ariaLabel="Interactive 3D UnlockED Knowledge Network"
      >
        <NetworkGroup
          nodes={nodes}
          selectedId={selectedId}
          onSelectNode={onSelectNode}
          onHoverNode={setHoveredNode}
          activePillar={activePillar}
        />
      </CanvasShell>
      {hudNode && (
        <div className="pointer-events-none absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#06100C]/90 border border-[#16382C] text-[11px] font-medium text-[#00DC82] backdrop-blur-md">
          {hudNode.label}
        </div>
      )}
    </div>
  );
}
