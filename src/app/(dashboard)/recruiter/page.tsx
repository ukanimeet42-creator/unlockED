"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Users, Briefcase, TrendingUp, Award, Plus, ArrowRight, Search } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FunnelStageItem } from "@/components/3d/talent-funnel-scene";
import type { Job } from "@/types";

const LazyTalentFunnel = dynamic(
  () => import("@/components/3d/talent-funnel-scene").then((mod) => mod.TalentFunnelView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[330px] sm:h-[360px] rounded-2xl border border-[#143326] bg-[#07130E] flex items-center justify-center text-xs text-[#8FA69B]">
        Loading 3D Talent Pipeline...
      </div>
    ),
  }
);

interface RecruiterAppRow {
  id: string;
  status: string;
  student_id: string;
  job?: { id: string; title: string };
  student?: { full_name: string };
  candidateMetrics?: { averageAssessmentScore: number | null };
}

interface CandidateSummary {
  id: string;
  full_name: string;
  location: string;
  averageAssessmentScore: number | null;
  projects: Array<{ id: string; title: string }>;
}

export default function RecruiterDashboardPage() {
  const { company } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<RecruiterAppRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [selectedStage, setSelectedStage] = useState<FunnelStageItem["key"]>("shortlisted");

  useEffect(() => {
    const loadHub = () => {
      Promise.all([
        fetch("/api/jobs?mine=true", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { jobs: [] })),
        fetch("/api/applications", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { applications: [] })),
        fetch("/api/candidates", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { candidates: [] })),
      ]).then(([jJson, aJson, cJson]) => {
        setJobs(jJson.jobs || []);
        setApps(aJson.applications || []);
        setCandidates(cJson.candidates || []);
      });
    };

    loadHub();
    window.addEventListener("unlocked:sync", loadHub);
    return () => window.removeEventListener("unlocked:sync", loadHub);
  }, []);

  const activeJobs = jobs.filter((j) => j.is_active);
  const shortlistedCount = apps.filter(
    (a) => a.status === "shortlisted" || a.status === "interviewed"
  ).length;
  const offeredCount = apps.filter((a) => a.status === "offered").length;
  const evaluatedScores = apps
    .map((a) => a.candidateMetrics?.averageAssessmentScore)
    .filter((n): n is number => typeof n === "number");
  const avgScore =
    evaluatedScores.length > 0
      ? Math.round(evaluatedScores.reduce((s, n) => s + n, 0) / evaluatedScores.length)
      : null;

  const funnelStages: FunnelStageItem[] = useMemo(
    () => [
      {
        key: "pool",
        label: "Talent Pool",
        count: candidates.length,
        color: "#8FA69B",
        description: "Onboarded student builders visible in candidate search.",
      },
      {
        key: "pending",
        label: "Applied / Reviewed",
        count: apps.filter((a) => a.status === "pending" || a.status === "reviewed").length,
        color: "#22D3EE",
        description: "Incoming applicants awaiting shortlisting decision.",
      },
      {
        key: "shortlisted",
        label: "Shortlisted",
        count: apps.filter((a) => a.status === "shortlisted").length,
        color: "#10B981",
        description: "High-fit candidates selected for technical outreach.",
      },
      {
        key: "interviewed",
        label: "Interviewed",
        count: apps.filter((a) => a.status === "interviewed").length,
        color: "#00DC82",
        description: "Candidates in active or completed technical interview loops.",
      },
      {
        key: "offered",
        label: "Offered",
        count: offeredCount,
        color: "#F59E0B",
        description: "Final employment or internship offers extended.",
      },
    ],
    [candidates.length, apps, offeredCount]
  );

  const stageApps = useMemo(() => {
    if (selectedStage === "pending") {
      return apps.filter((a) => a.status === "pending" || a.status === "reviewed");
    }
    if (selectedStage === "shortlisted" || selectedStage === "interviewed" || selectedStage === "offered") {
      return apps.filter((a) => a.status === selectedStage);
    }
    return [];
  }, [apps, selectedStage]);

  const activeStageMeta = funnelStages.find((f) => f.key === selectedStage) || funnelStages[0];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Recruiter Talent Hub
            </h1>
            <Badge variant={company?.verified ? "emerald" : "amber"} dot>
              {company?.verified ? "Verified Partner" : "Pending Verification"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Publish open roles, evaluate candidate portfolios, and manage hiring pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/recruiter/jobs/new">
            <Button variant="gradient" size="sm" className="gap-2 text-xs rounded-full">
              <Plus className="w-3.5 h-3.5" /> Post Opportunity
            </Button>
          </Link>
          <Link href="/recruiter/candidates">
            <Button variant="secondary" size="sm" className="gap-2 text-xs">
              <Search className="w-3.5 h-3.5 text-[#10B981]" /> Candidate Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 relative">
          <LazyTalentFunnel
            stages={funnelStages}
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
          />
          <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#06100C]/85 border border-[#143326] text-[10px] text-[#22D3EE]">
            Interactive 3D Hiring Funnel &middot; Click any ring to filter
          </div>
        </div>

        <Card className="lg:col-span-5 p-6 glass-panel-elevated flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="cyan" className="text-[10px]">
                Selected Stage
              </Badge>
              <span className="text-xs font-mono font-bold text-[#00DC82]">
                {activeStageMeta.count} Records
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0FDF4]">{activeStageMeta.label}</h2>
              <p className="text-xs text-[#8FA69B] mt-1">{activeStageMeta.description}</p>
            </div>

            <div className="space-y-2 pt-2 max-h-44 overflow-y-auto">
              {selectedStage === "pool" ? (
                candidates.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    href={`/recruiter/candidates/${c.id}`}
                    className="block p-2.5 rounded-xl bg-[#07130E] border border-[#143326] hover:border-[#22D3EE]/40 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F0FDF4]">{c.full_name}</span>
                      <span className="text-[#00DC82]">
                        {c.averageAssessmentScore != null ? `${c.averageAssessmentScore}%` : "No score"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : stageApps.length === 0 ? (
                <p className="text-xs text-[#5D7A6E] py-4 text-center">
                  No applicants currently in the {activeStageMeta.label.toLowerCase()} stage.
                </p>
              ) : (
                stageApps.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    href={`/recruiter/candidates/${a.student_id}`}
                    className="block p-2.5 rounded-xl bg-[#07130E] border border-[#143326] hover:border-[#22D3EE]/40 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F0FDF4]">
                        {a.student?.full_name || "Applicant"}
                      </span>
                      <span className="text-[#22D3EE]">{a.job?.title || "Role"}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link href={selectedStage === "pool" ? "/recruiter/candidates" : "/recruiter/applications"}>
            <Button variant="gradient" size="sm" className="w-full text-xs gap-1.5">
              Open {selectedStage === "pool" ? "Candidate Search" : "Pipeline Queue"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Active Postings
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">{activeJobs.length}</span>
              <span className="text-xs text-[#00DC82]">live</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">{apps.length} total applications</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#10B981]">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              In Pipeline
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">{shortlistedCount}</span>
              <span className="text-xs text-[#8FA69B]">shortlisted / interview</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Live applicant stages</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Avg Applicant Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {avgScore !== null ? `${avgScore}%` : "—"}
              </span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Evaluated applicants</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82]">
            <Award className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Offers Extended
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">{offeredCount}</span>
              <span className="text-xs text-[#8FA69B]">offers</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Completed stages</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#FBBF24]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <CardTitle>Your Active Requisitions</CardTitle>
            <Link href="/recruiter/jobs">
              <Button size="sm" variant="ghost" className="text-xs text-[#10B981]">
                Manage All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="py-12 text-center">
                <Briefcase className="w-10 h-10 text-[#143326] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#F0FDF4]">No job postings yet</p>
                <p className="text-xs text-[#8FA69B] mt-1">
                  Publish an opening to appear immediately in the student marketplace.
                </p>
                <Link href="/recruiter/jobs/new" className="inline-block mt-4">
                  <Button size="sm" variant="gradient">Post an Opportunity</Button>
                </Link>
              </div>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#F0FDF4]">{job.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#8FA69B] mt-1">
                      <span className="capitalize">{job.job_type}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">{job.application_count || 0} Applicants</Badge>
                    <Link href={`/recruiter/jobs/${job.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <CardTitle>Registered Talent Pool ({candidates.length})</CardTitle>
            <Link href="/recruiter/candidates">
              <Button size="sm" variant="ghost" className="text-xs text-[#10B981]">
                Search All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {candidates.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-[#143326] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#F0FDF4]">No student profiles registered yet</p>
                <p className="text-xs text-[#8FA69B] mt-1">
                  Registered students completing onboarding appear here automatically.
                </p>
              </div>
            ) : (
              candidates.slice(0, 4).map((cand) => (
                <div
                  key={cand.id}
                  className="p-4 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#F0FDF4]">{cand.full_name}</h4>
                    <p className="text-xs text-[#8FA69B]">
                      {cand.location} · {cand.projects.length} public projects
                    </p>
                  </div>
                  <Link href={`/recruiter/candidates/${cand.id}`}>
                    <Button size="sm" variant="secondary" className="text-xs gap-1">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
