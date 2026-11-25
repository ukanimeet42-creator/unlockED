"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Line, OrbitControls } from "@react-three/drei";
import { CanvasShell } from "@/components/3d/canvas-shell";
import type { Course, Enrollment, UserSkill } from "@/types";

export interface ConstellationNode {
  id: string;
  label: string;
  category: "core" | "skill" | "course" | "recommended";
  statusLabel: string;
  color: string;
  position: [number, number, number];
  href: string;
  detail: string;
  metricValue: number;
}

interface SkillConstellationProps {
  learnerName: string;
  courses: Course[];
  enrollments: Enrollment[];
  userSkills: UserSkill[];
  selectedNodeId: string;
  onSelectNode: (node: ConstellationNode) => void;
}

export function buildStudentConstellation(
  learnerName: string,
  courses: Course[],
  enrollments: Enrollment[],
  userSkills: UserSkill[]
): ConstellationNode[] {
  const enrolledMap = new Map(enrollments.map((e) => [e.course_id, e]));
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((acc, e) => acc + Number(e.progress_percentage || 0), 0) /
            enrollments.length
        )
      : 0;

  const nodes: ConstellationNode[] = [
    {
      id: "learner-core",
      label: learnerName || "Your Learning Core",
      category: "core",
      statusLabel: `${enrollments.length} Active Tracks`,
      color: "#00DC82",
      position: [0, 0, 0],
      href: "/student/courses",
      detail: `Overall average course completion is ${avgProgress}% across ${enrollments.length} enrolled tracks with ${userSkills.length} verified skill badges.`,
      metricValue: avgProgress,
    },
  ];

  // Arrange courses around inner ring
  courses.slice(0, 4).forEach((course, idx) => {
    const angle = (idx / Math.max(courses.slice(0, 4).length, 1)) * Math.PI * 2 + 0.4;
    const radius = 2.65;
    const enrollment = enrolledMap.get(course.id);
    const pct = enrollment?.progress_percentage ?? 0;
    const isEnrolled = Boolean(enrollment);

    nodes.push({
      id: `course-${course.id}`,
      label: course.title,
      category: isEnrolled ? "course" : "recommended",
      statusLabel: isEnrolled ? `${pct}% Complete` : "Not Enrolled",
      color: isEnrolled ? "#22D3EE" : "#5D7A6E",
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.75,
        Math.sin(angle) * radius,
      ],
      href: `/student/courses/${course.id}`,
      detail: course.short_description || course.description.slice(0, 120),
      metricValue: pct,
    });
  });

  // Arrange verified skills on upper/outer constellation plane
  userSkills.slice(0, 5).forEach((us, idx) => {
    const angle = (idx / Math.max(userSkills.slice(0, 5).length, 1)) * Math.PI * 2 + 0.9;
    const radius = 3.45;
    const profMap = { beginner: 35, intermediate: 65, advanced: 85, expert: 98 } as const;
    const score = profMap[us.proficiency] ?? 50;

    nodes.push({
      id: `skill-${us.id}`,
      label: us.skill?.name || "Verified Skill",
      category: "skill",
      statusLabel: `${us.proficiency} · ${us.verified ? "Verified" : "Recorded"}`,
      color: "#F59E0B",
      position: [
        Math.cos(angle) * radius,
        idx % 2 === 0 ? 1.55 : -1.45,
        Math.sin(angle) * radius * 0.8,
      ],
      href: "/student/assessments",
      detail: `Skill proficiency rated ${us.proficiency}. Take track benchmarks to elevate proficiency.`,
      metricValue: score,
    });
  });

  return nodes;
}

function ConstellationStar({
  node,
  selected,
  onSelect,
  onHover,
}: {
  node: ConstellationNode;
  selected: boolean;
  onSelect: (n: ConstellationNode) => void;
  onHover: (n: ConstellationNode | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const orbRef = useRef<THREE.Mesh>(null);
  const size = node.category === "core" ? 0.5 : node.category === "course" ? 0.3 : 0.23;

  useFrame((_, delta) => {
    if (orbRef.current) {
      orbRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.28} rotationIntensity={0.2}>
      <group position={node.position} scale={selected ? 1.25 : hovered ? 1.15 : 1}>
        <mesh
          ref={orbRef}
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
          <octahedronGeometry args={[size, 1]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={selected ? 1.1 : hovered ? 0.8 : 0.4}
            roughness={0.25}
            metalness={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

function ConstellationScene({
  nodes,
  selectedNodeId,
  onSelectNode,
  onHoverNode,
}: {
  nodes: ConstellationNode[];
  selectedNodeId: string;
  onSelectNode: (node: ConstellationNode) => void;
  onHoverNode: (node: ConstellationNode | null) => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      pointer.x * 0.25,
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
      <pointLight position={[5, 6, 4]} intensity={1.7} color="#00DC82" />
      <pointLight position={[-5, -4, 3]} intensity={1.2} color="#22D3EE" />

      <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
        <torusGeometry args={[2.65, 0.012, 12, 80]} />
        <meshBasicMaterial color="#16382C" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2.8, -0.2, 0]}>
        <torusGeometry args={[3.45, 0.01, 12, 96]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.22} />
      </mesh>

      {nodes
        .filter((n) => n.category !== "core")
        .map((n) => (
          <Line
            key={`line-${n.id}`}
            points={[[0, 0, 0], n.position]}
            color={n.id === selectedNodeId ? "#00DC82" : "#1B3D2F"}
            lineWidth={n.id === selectedNodeId ? 2 : 1}
            transparent
            opacity={n.id === selectedNodeId ? 0.9 : 0.45}
          />
        ))}

      {nodes.map((node) => (
        <ConstellationStar
          key={node.id}
          node={node}
          selected={node.id === selectedNodeId}
          onSelect={onSelectNode}
          onHover={onHoverNode}
        />
      ))}

      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
    </group>
  );
}

/**
 * Interactive 3D Student Skill Constellation driven strictly by DB enrollments and verified skills.
 */
export function SkillConstellationView(props: SkillConstellationProps) {
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null);
  const nodes = useMemo(
    () =>
      buildStudentConstellation(
        props.learnerName,
        props.courses,
        props.enrollments,
        props.userSkills
      ),
    [props.learnerName, props.courses, props.enrollments, props.userSkills]
  );
  const hudNode = hoveredNode || nodes.find((n) => n.id === props.selectedNodeId) || nodes[0];

  const fallbackUi = (
    <div className="w-full h-full rounded-2xl bg-[#07130E] border border-[#143326] p-4 flex flex-col justify-between gap-3">
      <div className="text-[11px] font-medium text-[#8FA69B]">
        Interactive Skill Constellation (Select a node)
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-auto">
        {nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => props.onSelectNode(n)}
            className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
              n.id === props.selectedNodeId
                ? "bg-[#0F271D] border-[#00DC82]"
                : "bg-[#0A1913] border-[#143326] hover:border-[#1F4D3A]"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: n.color }}
              />
              <span className="text-xs font-semibold text-[#F0FDF4] truncate">{n.label}</span>
            </div>
            <p className="text-[10px] text-[#8FA69B] mt-0.5">{n.statusLabel}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[320px] sm:h-[360px]">
      <CanvasShell
        className="w-full h-[320px] sm:h-[360px] rounded-2xl border border-[#143326] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),rgba(6,16,12,0.96)_72%)] overflow-hidden"
        cameraPosition={[0, 0.5, 7.6]}
        fov={46}
        fallback={fallbackUi}
        ariaLabel="Interactive 3D Student Skill Constellation"
      >
        <ConstellationScene
          nodes={nodes}
          selectedNodeId={props.selectedNodeId}
          onSelectNode={props.onSelectNode}
          onHoverNode={setHoveredNode}
        />
      </CanvasShell>
      {hudNode && (
        <div className="pointer-events-none absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#06100C]/90 border border-[#16382C] text-[11px] font-medium text-[#22D3EE] backdrop-blur-md">
          {hudNode.label} &middot; {hudNode.statusLabel}
        </div>
      )}
    </div>
  );
}
