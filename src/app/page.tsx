"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Sparkles,
  Terminal,
  ShieldCheck,
  Award,
  Layers,
  ChevronRight,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  Cpu,
  Database,
  Route,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { INITIAL_COURSES } from "@/lib/data/mock-data";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  const [selectedTrack, setSelectedTrack] = useState<"retail" | "hospitality" | "logistics">("retail");

  const pathfinderData = {
    retail: {
      origin: "Shift Retail Supervisor",
      originSalary: "~$34,000/yr",
      originDesc: "High pressure triage, team synchronization, inventory routing logic, and relentless customer problem resolution.",
      transTitle: "16-Week Distributed Systems Crucible",
      transPoints: [
        "Kubernetes Multi-Node Clustering & Networking",
        "Zero-Downtime Database Sharding in PostgreSQL",
        "Prometheus & Grafana Telemetry Daemon Implementation",
      ],
      transScore: "94 / 100",
      destTitle: "Associate Cloud Infrastructure SRE",
      destSalary: "$118,000 + Equity",
      destLift: "+247% Lift",
      destDesc: "Managing high-availability edge nodes, automated rollback orchestration, and incident mitigation for high-traffic SaaS.",
    },
    hospitality: {
      origin: "Hotel Guest Operations Lead",
      originSalary: "~$38,000/yr",
      originDesc: "Real-time resource allocation, emergency escalation handling, guest experience optimization, and multilingual coordination.",
      transTitle: "14-Week Full-Stack React & Go Track",
      transPoints: [
        "Accessible Design Systems with React 19 & Radix UI",
        "High-Concurrency REST & WebSocket APIs in Go",
        "Optimistic UI Mutation & Real-Time Sync Engines",
      ],
      transScore: "96 / 100",
      destTitle: "Product Software Engineer",
      destSalary: "$125,000 + Equity",
      destLift: "+228% Lift",
      destDesc: "Building collaborative interfaces, developer dashboards, and client-side state engines for enterprise web platforms.",
    },
    logistics: {
      origin: "Warehouse Logistics Coordinator",
      originSalary: "~$42,000/yr",
      originDesc: "Supply chain routing, warehouse throughput metrics, bottleneck isolation, and database inventory audits.",
      transTitle: "16-Week Data Platform & Vector Systems",
      transPoints: [
        "Distributed Event Streaming with Kafka & Redis",
        "PostgreSQL pgvector & Vector Search Pipelines",
        "Automated Data Ingestion & Sanitization Harnesses",
      ],
      transScore: "92 / 100",
      destTitle: "Data Platform & Vector Engineer",
      destSalary: "$130,000 + Equity",
      destLift: "+210% Lift",
      destDesc: "Designing resilient high-volume data ingest pipelines, semantic search embeddings, and vector database retrieval.",
    },
  };

  const currentPath = pathfinderData[selectedTrack];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0B12] transition-colors">
      {/* Top Ambient Glow Field */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#8B5CF6]/20 via-[#3131C0]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1F1F26] border border-[#2A2931] shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-semibold text-[#D0BCFF] tracking-wide">
                AI-Powered Education to Employment Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F3FF] leading-[1.1]">
              Your potential deserves an{" "}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#16A34A] dark:from-[#D0BCFF] dark:via-[#8B5CF6] dark:to-[#22C55E] bg-clip-text text-transparent">
                opportunity.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-[#94A3B8] max-w-2xl leading-relaxed">
              UnlockED helps underserved learners master in-demand technical skills, build production-grade projects, prove abilities through AI-evaluated assessments, and connect directly with hiring partners.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/student">
                <Button size="lg" variant="gradient" className="gap-2 text-sm sm:text-base">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/student/courses">
                <Button size="lg" variant="secondary" className="gap-2 text-sm sm:text-base">
                  <PlayCircle className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Explore Opportunities</span>
                </Button>
              </Link>
            </div>

            {/* Social Proof Micro Badge */}
            <div className="mt-8 flex items-center gap-3 text-[#94A3B8] text-xs">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#34343C] border border-[#232336] flex items-center justify-center text-[10px] font-bold text-[#D0BCFF]">
                  JD
                </div>
                <div className="w-7 h-7 rounded-full bg-[#8B5CF6] border border-[#232336] flex items-center justify-center text-[10px] font-bold text-white">
                  MR
                </div>
                <div className="w-7 h-7 rounded-full bg-[#00A74B] border border-[#232336] flex items-center justify-center text-[10px] font-bold text-white">
                  SK
                </div>
              </div>
              <span>
                Trusted by <strong className="text-[#F5F3FF]">18,500+</strong> ambitious learners nationwide
              </span>
            </div>
          </div>

          {/* Live Dashboard Telemetry Preview Bento */}
          <div className="mt-16 relative w-full rounded-3xl bg-[#151520] border border-[#232336] p-4 sm:p-8 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Telemetry Radar & Score (2 cols) */}
              <div className="lg:col-span-2 flex flex-col justify-between bg-[#101018] rounded-2xl p-6 border border-[#232336]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#22C55E]">
                      Evaluation Engine 4.2
                    </span>
                    <h3 className="text-lg font-semibold text-[#F5F3FF] mt-0.5">
                      Verified Career Readiness Index
                    </h3>
                  </div>
                  <Badge variant="emerald" dot>
                    99.4% Confidence
                  </Badge>
                </div>

                <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  {/* Concentric Circular SVG telemetry */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 120 120">
                      <circle
                        className="text-[#232336]"
                        cx="60"
                        cy="60"
                        fill="transparent"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-[#22C55E] transition-all duration-1000"
                        cx="60"
                        cy="60"
                        fill="transparent"
                        r="50"
                        stroke="currentColor"
                        strokeDasharray="314.159"
                        strokeDashoffset="37.7"
                        strokeLinecap="round"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-[#8B5CF6] transition-all duration-1000"
                        cx="60"
                        cy="60"
                        fill="transparent"
                        r="38"
                        stroke="currentColor"
                        strokeDasharray="238.76"
                        strokeDashoffset="47.75"
                        strokeLinecap="round"
                        strokeWidth="6"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-bold text-[#F5F3FF] leading-none">88</span>
                      <span className="text-xs text-[#94A3B8] mt-1">Match Index</span>
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#F5F3FF]">Cloud Architecture</span>
                        <span className="text-[#22C55E] font-semibold">92% verified</span>
                      </div>
                      <div className="h-2 w-full bg-[#1F1F26] rounded-full overflow-hidden">
                        <div className="h-full bg-[#22C55E] rounded-full w-[92%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#F5F3FF]">Async Distributed Systems</span>
                        <span className="text-[#8B5CF6] font-semibold">86% verified</span>
                      </div>
                      <div className="h-2 w-full bg-[#1F1F26] rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B5CF6] rounded-full w-[86%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#F5F3FF]">Production Security CI/CD</span>
                        <span className="text-[#6366F1] font-semibold">79% verified</span>
                      </div>
                      <div className="h-2 w-full bg-[#1F1F26] rounded-full overflow-hidden">
                        <div className="h-full bg-[#6366F1] rounded-full w-[79%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 bg-[#151520] rounded-xl px-4 py-2 border border-[#232336] text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-[#94A3B8]">Immutable Skill Attestation hash #7F84-AI</span>
                  </div>
                  <span className="text-[#22C55E] font-semibold hidden sm:inline">
                    Direct Recruiter Access Enabled
                  </span>
                </div>
              </div>

              {/* Live Pipeline Feed (1 col) */}
              <div className="flex flex-col justify-between bg-[#0E0E15] rounded-2xl p-5 border border-[#232336]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#232336] mb-3">
                    <span className="text-xs font-semibold text-[#94A3B8]">
                      Direct Hires In Progress
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[#151520] border border-[#232336]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F5F3FF]">Stripe FinTech Track</span>
                        <Badge variant="emerald">Interview</Badge>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1">Alondra G. · Barista to SRE</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#151520] border border-[#232336]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F5F3FF]">Datadog Core Systems</span>
                        <Badge variant="default">Offer Made</Badge>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1">Marcus K. · Logistics to Go Eng</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#151520] border border-[#232336]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F5F3FF]">Figma Canvas Platform</span>
                        <Badge variant="indigo">AI Screen Passed</Badge>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1">DeShawn T. · Support to Fullstack</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#232336] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Live platform activity</span>
                  <span className="text-[#8B5CF6] font-semibold">32 offers this week</span>
                </div>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#101018] border border-[#232336]">
                <span className="text-2xl sm:text-3xl font-bold text-[#8B5CF6]">94%</span>
                <p className="text-xs font-semibold text-[#F5F3FF] mt-1">Placement Rate</p>
                <p className="text-[11px] text-[#94A3B8]">Within 90 days of graduation</p>
              </div>
              <div className="p-4 rounded-xl bg-[#101018] border border-[#232336]">
                <span className="text-2xl sm:text-3xl font-bold text-[#22C55E]">18,500+</span>
                <p className="text-xs font-semibold text-[#F5F3FF] mt-1">Verified Students</p>
                <p className="text-[11px] text-[#94A3B8]">Across non-traditional backgrounds</p>
              </div>
              <div className="p-4 rounded-xl bg-[#101018] border border-[#232336]">
                <span className="text-2xl sm:text-3xl font-bold text-[#6366F1]">420+</span>
                <p className="text-xs font-semibold text-[#F5F3FF] mt-1">Hiring Partners</p>
                <p className="text-[11px] text-[#94A3B8]">Including leading tech innovators</p>
              </div>
              <div className="p-4 rounded-xl bg-[#101018] border border-[#232336]">
                <span className="text-2xl sm:text-3xl font-bold text-[#D0BCFF]">4.9 / 5</span>
                <p className="text-xs font-semibold text-[#F5F3FF] mt-1">Average Rating</p>
                <p className="text-[11px] text-[#94A3B8]">From 3,400+ career switchers</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 1: HOW IT WORKS 4-STEP FRAMEWORK */}
      <section className="py-20 bg-[#0E0E15] border-y border-[#232336]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
                The Method
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F3FF] mt-1">
                Four steps to career mobility.
              </h2>
            </div>
            <p className="text-sm text-[#94A3B8] max-w-md leading-relaxed">
              A systematic framework engineered to bypass non-actionable credentials and deliver verified production-ready skill sets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded bg-[#1F1F26] text-[#8B5CF6] font-mono text-xs font-bold">
                    01
                  </span>
                  <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F3FF]">Learn</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Adaptive curriculum calibrated every month against real production codebases and high-growth hiring requisitions.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#232336]">
                <span className="text-xs text-[#22C55E] font-medium">Real-time market alignment</span>
              </div>
            </Card>

            {/* Step 2 */}
            <Card hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded bg-[#1F1F26] text-[#6366F1] font-mono text-xs font-bold">
                    02
                  </span>
                  <Terminal className="w-5 h-5 text-[#6366F1]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F3FF]">Build</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Develop production-grade software in actual containerized sandbox environments with automated pull request reviews.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#232336]">
                <span className="text-xs text-[#6366F1] font-medium">Zero toy projects</span>
              </div>
            </Card>

            {/* Step 3 */}
            <Card hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded bg-[#1F1F26] text-[#22C55E] font-mono text-xs font-bold">
                    03
                  </span>
                  <Cpu className="w-5 h-5 text-[#22C55E]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F3FF]">Prove</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Verifiable skill index backed by AI code tracing, architectural rigor ratings, and stress-tested debugging simulations.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#232336]">
                <span className="text-xs text-[#22C55E] font-medium">Tamper-proof scorecards</span>
              </div>
            </Card>

            {/* Step 4 */}
            <Card hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded bg-[#1F1F26] text-[#A078FF] font-mono text-xs font-bold">
                    04
                  </span>
                  <Award className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F3FF]">Earn</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Skip blind resume black-holes. Hiring engineering leaders initiate interviews directly from your attested project submissions.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#232336]">
                <span className="text-xs text-[#8B5CF6] font-medium">Equity & competitive salary</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 2: AI PATHFINDER INTERACTIVE SHOWCASE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#151520] border border-[#232336] p-6 sm:p-10 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-semibold mb-2">
                  <Route className="w-3.5 h-3.5" />
                  AI Pathfinder Engine
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
                  Map your trajectory from Day 0.
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                  See how prior experience transforms into high-value engineering competencies.
                </p>
              </div>

              {/* Pathfinder Filters */}
              <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#101018] border border-[#232336]">
                <button
                  onClick={() => setSelectedTrack("retail")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTrack === "retail"
                      ? "bg-[#8B5CF6] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#F5F3FF]"
                  }`}
                >
                  Retail → Cloud SRE
                </button>
                <button
                  onClick={() => setSelectedTrack("hospitality")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTrack === "hospitality"
                      ? "bg-[#8B5CF6] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#F5F3FF]"
                  }`}
                >
                  Hospitality → Product Eng
                </button>
                <button
                  onClick={() => setSelectedTrack("logistics")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTrack === "logistics"
                      ? "bg-[#8B5CF6] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#F5F3FF]"
                  }`}
                >
                  Logistics → Data Platform
                </button>
              </div>
            </div>

            {/* Dynamic 3-Card Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Origin */}
              <div className="p-6 rounded-2xl bg-[#101018] border border-[#232336] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Baseline Starting Profile
                  </span>
                  <h4 className="text-base font-semibold text-[#F5F3FF] mt-1">
                    {currentPath.origin}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                    {currentPath.originDesc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#232336]">
                  <span className="text-xs font-mono text-[#64748B]">
                    Salary baseline: {currentPath.originSalary}
                  </span>
                </div>
              </div>

              {/* Crucible */}
              <div className="p-6 rounded-2xl bg-[#1C1C2B] border border-[#8B5CF6]/40 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-[#8B5CF6]/10">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8B5CF6]/20 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D0BCFF]">
                      AI Transformation Track
                    </span>
                    <Zap className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <h4 className="text-base font-semibold text-[#F5F3FF] mt-1">
                    {currentPath.transTitle}
                  </h4>
                  <ul className="mt-4 space-y-2 text-xs text-[#E4E1EC]">
                    {currentPath.transPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-3 border-t border-[#232336] flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">AI Assessed Score</span>
                  <span className="text-sm font-bold text-[#22C55E]">{currentPath.transScore}</span>
                </div>
              </div>

              {/* Destination */}
              <div className="p-6 rounded-2xl bg-[#101018] border border-[#232336] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#22C55E]">
                      Verified Career Placement
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <h4 className="text-base font-semibold text-[#F5F3FF] mt-1">
                    {currentPath.destTitle}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                    {currentPath.destDesc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#232336] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#94A3B8] block">Avg Initial Comp</span>
                    <span className="text-sm font-bold text-[#F5F3FF]">{currentPath.destSalary}</span>
                  </div>
                  <Badge variant="emerald">{currentPath.destLift}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCELERATED PRODUCTION TRACKS */}
      <section className="py-20 bg-[#0E0E15] border-y border-[#232336]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                High-Demand Curricula
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F3FF] mt-1">
                Accelerated Production Tracks.
              </h2>
            </div>
            <Link
              href="/student/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-[#D0BCFF] transition-colors"
            >
              <span>View all courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_COURSES.slice(0, 3).map((course) => (
              <Card key={course.id} hoverEffect className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="default">{course.category}</Badge>
                    <span className="text-xs font-mono text-[#94A3B8]">
                      {course.duration_weeks} WEEKS
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#F5F3FF] leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#1F1F26] text-[11px] text-[#CBC3D7] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">
                    Enrolled: <strong className="text-[#F5F3FF]">{course.enrolled_count}</strong>
                  </span>
                  <Link href={`/student/courses/${course.id}`}>
                    <Button size="sm" variant="secondary" className="text-xs">
                      View Syllabus
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
              Documented Outcomes
            </span>
            <h2 className="text-3xl font-bold text-[#F5F3FF] mt-1">
              Real upward mobility. Real numbers.
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
              Hear from graduates and the enterprise hiring managers who recruit them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#22C55E] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#E4E1EC] italic leading-relaxed">
                  "Traditional bootcamps gave me high debt and generic toy apps. UnlockED's AI review caught real concurrency flaws in my microservices. My interviewer at Cloudflare skipped the leetcode entirely because my project proof was undeniable."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F5F3FF]">Camila Ortiz</p>
                  <p className="text-[11px] text-[#94A3B8]">SRE @ Cloudflare</p>
                </div>
                <Badge variant="emerald">+180% Compensation</Badge>
              </div>
            </Card>

            {/* Testimonial 2 */}
            <Card className="p-6 flex flex-col justify-between bg-[#1C1C2B] border-[#2A2931]">
              <div>
                <Badge variant="indigo" className="mb-3">
                  <Briefcase className="w-3 h-3" />
                  VP of Engineering Perspective
                </Badge>
                <p className="text-xs text-[#E4E1EC] italic leading-relaxed">
                  "We stopped reviewing standard resumes for junior roles. UnlockED candidates arrive with verified commit histories, reproducible Docker setups, and AI test evaluation scores that accurately predict on-the-job execution."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F5F3FF]">David Vance</p>
                  <p className="text-[11px] text-[#94A3B8]">VP Eng @ FinScale</p>
                </div>
                <Badge variant="default">14 Hires Made</Badge>
              </div>
            </Card>

            {/* Testimonial 3 */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#22C55E] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#E4E1EC] italic leading-relaxed">
                  "Coming from night shifts in warehousing, I doubted tech would look at me without a CS degree. The AI pathfinder matched my inventory logistics intuition with backend database engineering. I received two offers within 40 days."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F5F3FF]">Tariq Washington</p>
                  <p className="text-[11px] text-[#94A3B8]">Backend Eng @ ScaleTech</p>
                </div>
                <Badge variant="emerald">+210% Compensation</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-slate-100/80 dark:bg-gradient-to-b dark:from-[#0E0E15] dark:to-[#13131A] border-t border-slate-200 dark:border-[#232336] transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="default" className="mb-4">
            Start Your Transformation
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#F5F3FF] tracking-tight">
            Stop waiting for permission to build your future.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Enroll today, generate your custom AI roadmap, and start building verified production code that employers notice.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/student">
              <Button size="lg" variant="gradient" className="gap-2">
                <span>Enter UnlockED Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/student/ai-assistant">
              <Button size="lg" variant="secondary" className="gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                <span>Talk to AI Career Advisor</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
