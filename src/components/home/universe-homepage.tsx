"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Code2,
  Compass,
  FolderGit2,
  Layers,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/footer";
import {
  buildKnowledgeNodes,
  type KnowledgeNode,
} from "@/components/3d/knowledge-network-scene";
import type { Course } from "@/types";

const LazyKnowledgeNetwork = dynamic(
  () =>
    import("@/components/3d/knowledge-network-scene").then(
      (mod) => mod.KnowledgeNetworkView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] rounded-2xl border border-[#143326] bg-[#0A1913]/80 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-[#8FA69B]">Initializing 3D Knowledge Ecosystem...</p>
        </div>
      </div>
    ),
  }
);

type PillarKey = "learn" | "build" | "connect";

interface PillarSpec {
  id: PillarKey;
  step: string;
  title: string;
  headline: string;
  summary: string;
  bullets: string[];
  ctaHref: string;
  ctaText: string;
  previewTitle: string;
  previewBadge: string;
  previewRows: Array<{ label: string; detail: string; status: string }>;
}

const PILLARS: PillarSpec[] = [
  {
    id: "learn",
    step: "01",
    title: "Learn",
    headline: "Structured Engineering Tracks + AI Guidance",
    summary:
      "Master full-stack architecture, cloud infrastructure, and applied AI through interactive modules with integrated knowledge checks and personalized Gemini career roadmaps.",
    bullets: [
      "Full module theory, code examples, and inline quizzes",
      "Real-time course & lesson progress synced to PostgreSQL",
      "AI Career Advisor grounded in your actual skill profile",
    ],
    ctaHref: "/courses",
    ctaText: "Explore Course Catalog",
    previewTitle: "Curriculum Workspace",
    previewBadge: "Interactive Modules",
    previewRows: [
      { label: "Module 1-4 Theory & Code", detail: "Next.js 15, Go Services, Applied AI, SRE", status: "Persisted" },
      { label: "Inline Knowledge Quiz", detail: "Instant validation & remediation tips", status: "Interactive" },
      { label: "AI Career Roadmap", detail: "Target milestones saved to profile", status: "Gemini AI" },
    ],
  },
  {
    id: "build",
    step: "02",
    title: "Build & Prove",
    headline: "Portfolio Evidence & Server-Graded Benchmarks",
    summary:
      "Ship real projects linked to GitHub repositories, complete timed skill assessments graded on the server, and earn verifiable credentials tied to completed coursework.",
    bullets: [
      "Server-evaluated timed benchmarks updating proficiency",
      "Shareable portfolio profiles & custom resume PDF exports",
      "Unique credential codes (UED-YYYY-XXXXXXXX) upon track completion",
    ],
    ctaHref: "/verify/lookup",
    ctaText: "Verify Credentials",
    previewTitle: "Verification Protocol",
    previewBadge: "Server Graded",
    previewRows: [
      { label: "Benchmark Engine", detail: "Hidden answer keys · Server-calculated score", status: "Timed" },
      { label: "Certificate Gate", detail: "100% track modules + passing benchmark", status: "Verified" },
      { label: "Public Lookup", detail: "Real-time record check via /verify/[code]", status: "Live DB" },
    ],
  },
  {
    id: "connect",
    step: "03",
    title: "Connect",
    headline: "Direct Recruiter Pipeline & Explainable Matching",
    summary:
      "Recruiters publish verified roles, discover skilled graduates through transparent skill-overlap analysis, shortlist candidates, and send instant status updates.",
    bullets: [
      "Explainable skill-gap and candidate-to-job readiness scoring",
      "Live application status transitions (applied -> shortlisted -> hired)",
      "Real-time cross-role notifications & company profile pages",
    ],
    ctaHref: "/register?role=recruiter",
    ctaText: "Launch Recruiter Portal",
    previewTitle: "Employer Talent Flow",
    previewBadge: "Real-Time Sync",
    previewRows: [
      { label: "Role Publishing", detail: "Salary bands in INR/USD & required skills", status: "Live Feed" },
      { label: "Candidate Search", detail: "Public portfolio, verified skills & certs", status: "Filterable" },
      { label: "Applicant Review", detail: "Instant status alerts delivered to learner", status: "Synced" },
    ],
  },
];

export function UniverseHomepage({ initialCourses }: { initialCourses: Course[] }) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const nodes = useMemo(() => buildKnowledgeNodes(initialCourses), [initialCourses]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || "core-unlocked");
  const [activePillar, setActivePillar] = useState<PillarKey>("learn");
  const [verifyInput, setVerifyInput] = useState("");

  const selectedNode: KnowledgeNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  const currentPillar = useMemo(
    () => PILLARS.find((p) => p.id === activePillar) || PILLARS[0],
    [activePillar]
  );

  const dashboardHref =
    role === "admin" ? "/admin" : role === "recruiter" ? "/recruiter" : "/student";

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = verifyInput.trim();
    router.push(cleaned ? `/verify/${encodeURIComponent(cleaned)}` : "/verify/lookup");
  };

  return (
    <div className="min-h-screen bg-[#06100C] text-[#E6F4EA] flex flex-col">
      {/* Ambient Radial Spotlight */}
      <div className="pointer-events-none fixed inset-x-0 top-16 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.2),rgba(34,211,238,0.06)_45%,transparent_72%)] z-0" />

      <main className="relative z-10 flex-1">
        {/* 1. HERO + INTERACTIVE 3D KNOWLEDGE NETWORK */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A1913] border border-[#16382C] text-[11px] font-medium text-[#00DC82]">
                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                Learn &middot; Build &middot; Prove &middot; Get Hired
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F0FDF4] leading-[1.12]">
                Turn Real Engineering Mastery Into{" "}
                <span className="text-gradient-emerald">Verified Career Proof</span>
              </h1>

              <p className="text-sm sm:text-base text-[#8FA69B] leading-relaxed">
                UnlockED unites structured technical tracks, server-graded skill benchmarks,
                Gemini-powered career roadmaps, and live employer hiring workflows in one cohesive
                platform.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isAuthenticated ? (
                  <Link href={dashboardHref}>
                    <Button variant="gradient" size="lg" className="gap-2 rounded-full">
                      Enter Workspace
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button variant="gradient" size="lg" className="gap-2 rounded-full">
                      Start Learning Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}

                <Link href="/courses">
                  <Button variant="outline" size="lg" className="gap-2 rounded-full">
                    <BookOpen className="w-4 h-4 text-[#00DC82]" />
                    Explore Catalog
                  </Button>
                </Link>

                {!isAuthenticated && (
                  <Link href="/register?role=recruiter">
                    <Button variant="ghost" size="lg" className="gap-2 rounded-full text-[#22D3EE]">
                      <Building2 className="w-4 h-4" />
                      For Recruiters
                    </Button>
                  </Link>
                )}
              </div>

              {/* Selected 3D Node Inspector Card */}
              {selectedNode && (
                <div className="p-4 rounded-2xl glass-panel-elevated space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: selectedNode.color }}
                      />
                      <span className="text-xs font-bold text-[#F0FDF4] truncate">
                        {selectedNode.label}
                      </span>
                    </div>
                    <Badge variant="emerald" className="shrink-0 text-[10px]">
                      {selectedNode.kind === "core"
                        ? "Ecosystem"
                        : selectedNode.kind === "course"
                        ? "Course Track"
                        : "Platform Hub"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#8FA69B] line-clamp-2">{selectedNode.subtitle}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-[#5D7A6E]">{selectedNode.meta}</span>
                    <Link
                      href={selectedNode.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#00DC82] hover:underline"
                    >
                      {selectedNode.ctaLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Interactive 3D Knowledge Constellation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7 space-y-3"
            >
              <div className="relative h-[400px] sm:h-[460px] w-full">
                <LazyKnowledgeNetwork
                  courses={initialCourses}
                  selectedId={selectedNodeId}
                  onSelectNode={(n) => setSelectedNodeId(n.id)}
                  activePillar={activePillar}
                />
                <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#06100C]/85 border border-[#143326] text-[10px] text-[#A7F3D0] backdrop-blur-md">
                  Drag to orbit &middot; Click any 3D node to inspect
                </div>
              </div>

              {/* Accessible Quick Node Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {nodes.map((node) => {
                  const active = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                        active
                          ? "bg-[#0F271D] text-[#00DC82] border-[#00DC82]"
                          : "bg-[#0A1913] text-[#8FA69B] border-[#143326] hover:text-[#F0FDF4] hover:border-[#1F4D3A]"
                      }`}
                    >
                      {node.label.length > 26 ? `${node.label.slice(0, 24)}...` : node.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. INTERACTIVE LEARN -> BUILD -> CONNECT JOURNEY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#143326]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="cyan" className="mb-2">
                Unified Progression Pipeline
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
                How UnlockED Bridges Education to Engineering Roles
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8FA69B] max-w-md">
              Select a lifecycle stage below to inspect the exact workflow backed by live platform
              services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-3">
              {PILLARS.map((pillar) => {
                const isSelected = pillar.id === activePillar;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(pillar.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "glass-panel-elevated border-[#00DC82]/70"
                        : "bg-[#0A1913]/60 border-[#143326] hover:border-[#1F4D3A]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-[#00DC82]">STEP {pillar.step}</span>
                      <span className="text-[11px] font-medium text-[#22D3EE]">
                        {pillar.previewBadge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F0FDF4]">{pillar.title}</h3>
                    <p className="text-xs text-[#8FA69B] mt-1 leading-relaxed">{pillar.summary}</p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPillar.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="p-6 sm:p-8 rounded-2xl glass-panel-elevated space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#143326]">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#00DC82]">
                        {currentPillar.previewTitle}
                      </span>
                      <h3 className="text-xl font-bold text-[#F0FDF4] mt-0.5">
                        {currentPillar.headline}
                      </h3>
                    </div>
                    <Badge variant="emerald">{currentPillar.previewBadge}</Badge>
                  </div>

                  <div className="space-y-3">
                    {currentPillar.bullets.map((b) => (
                      <div key={b} className="flex items-start gap-2.5 text-sm text-[#E6F4EA]">
                        <CheckCircle2 className="w-4 h-4 text-[#00DC82] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {currentPillar.previewRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#06110C] border border-[#143326]"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#F0FDF4]">{row.label}</p>
                          <p className="text-[11px] text-[#8FA69B]">{row.detail}</p>
                        </div>
                        <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/15 text-[#34D399] border border-[#16382C]">
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link href={currentPillar.ctaHref}>
                      <Button variant="gradient" className="gap-2 rounded-full">
                        {currentPillar.ctaText}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 3. LIVE CURRICULUM TRACKS SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#143326]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
                Production Curriculum Tracks
              </h2>
              <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
                Synchronized live with the UnlockED database. Select any track to inspect modules
                and prerequisites.
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                View All Tracks
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {initialCourses.slice(0, 4).map((course) => {
              const slugOrId = course.slug || course.id;
              return (
                <Link
                  key={course.id}
                  href={`/courses/${slugOrId}`}
                  className="group p-5 rounded-2xl glass-panel card-hover flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="emerald" className="capitalize text-[10px]">
                        {course.difficulty}
                      </Badge>
                      <span className="text-[11px] text-[#8FA69B]">
                        {course.duration_weeks} weeks
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#F0FDF4] group-hover:text-[#00DC82] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#8FA69B] line-clamp-3 leading-relaxed">
                      {course.short_description || course.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#143326]">
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#06110C] border border-[#143326] text-[10px] text-[#A7F3D0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#00DC82]">
                      <span>{course.lesson_count ?? 4} Modules</span>
                      <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Inspect Track <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. STUDENT + RECRUITER ECOSYSTEM & LIVE VERIFICATION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#143326]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Capabilities */}
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#16382C] flex items-center justify-center text-[#00DC82]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F0FDF4]">For Learners</h3>
              <p className="text-xs text-[#8FA69B] leading-relaxed">
                Track enrolled modules, execute interactive coding checks, practice mock interviews,
                generate PDF resumes, and apply with verified skill telemetry.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A7F3D0] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#00DC82]" /> Interactive Labs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#22D3EE]" /> AI Roadmaps
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-[#00DC82]" /> Public Portfolio
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#F59E0B]" /> Track Credentials
                </span>
              </div>
              <Link href="/register" className="inline-block pt-2">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                  Create Student Account <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Recruiter Capabilities */}
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F0FDF4]">For Hiring Teams</h3>
              <p className="text-xs text-[#8FA69B] leading-relaxed">
                Publish roles with transparent compensation bands, inspect candidate skill match
                rationales, schedule reviews, and update applicant stages in real time.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A7F3D0] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#22D3EE]" /> Match Explanations
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#00DC82]" /> Verified Portfolios
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#22D3EE]" /> Company Profiles
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" /> Admin Vetted
                </span>
              </div>
              <Link href="/register?role=recruiter" className="inline-block pt-2">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                  Register Recruiter Team <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Trust & Live Certificate Lookup */}
            <div className="p-6 rounded-2xl glass-panel-elevated space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <Lock className="w-5 h-5" />
                </div>
                <Badge variant="emerald">Live Verification</Badge>
              </div>
              <h3 className="text-lg font-bold text-[#F0FDF4]">Verify a Credential</h3>
              <p className="text-xs text-[#8FA69B] leading-relaxed">
                Every certificate is issued server-side only after 100% module completion and a
                passing benchmark exam. Validate any certificate code directly against PostgreSQL.
              </p>
              <form onSubmit={handleVerifySubmit} className="space-y-2.5 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="Enter code (e.g. UED-2026-...)"
                    aria-label="Certificate code"
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="gradient" size="sm" className="w-full gap-1.5">
                  Verify Against Database <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
