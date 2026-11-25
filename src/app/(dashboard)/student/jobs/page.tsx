"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Job } from "@/types";
import type { JobMatchResult } from "@/lib/ai/job-matching";
import { formatDate } from "@/lib/utils";

type EnrichedJob = Job & { match?: JobMatchResult | null };

function formatJobSalary(job: Job): string {
  if (!job.salary_min && !job.salary_max) return "Competitive";
  const sym = job.salary_currency === "INR" ? "₹" : "$";
  const fmt = (n: number) =>
    job.salary_currency === "INR"
      ? `${(n / 100000).toFixed(1)} LPA`
      : `${Math.round(n / 1000)}k`;
  if (job.salary_min && job.salary_max) {
    return `${sym}${fmt(job.salary_min)} - ${sym}${fmt(job.salary_max)}`;
  }
  return `${sym}${fmt(job.salary_min || job.salary_max || 0)}`;
}

export default function StudentJobsPage() {
  const { savedJobIds, toggleSaveJob, applications, applyToJob, resumes } = useAuth();

  const [jobs, setJobs] = useState<EnrichedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<EnrichedJob | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const activeResumeId = selectedResumeId || resumes[0]?.id || "";
  const [applyError, setApplyError] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    const loadJobs = () => {
      fetch("/api/jobs", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : { jobs: [] }))
        .then((json) => {
          const list = (json.jobs || []) as EnrichedJob[];
          setJobs(list);
          setSelectedJob((prev) =>
            prev ? list.find((j) => j.id === prev.id) || list[0] || null : list[0] || null
          );
        })
        .finally(() => setLoading(false));
    };

    loadJobs();
    window.addEventListener("unlocked:sync", loadJobs);
    return () => window.removeEventListener("unlocked:sync", loadJobs);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      (job.company?.name || "").toLowerCase().includes(q) ||
      job.skills_required.some((s) => s.toLowerCase().includes(q));
    const matchesRemote = !remoteOnly || job.is_remote;
    const matchesType = jobTypeFilter === "all" || job.job_type === jobTypeFilter;
    return matchesSearch && matchesRemote && matchesType;
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplyError(null);
    const result = await applyToJob(selectedJob.id, coverLetter, activeResumeId || null);
    if (result.ok) {
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setCoverLetter("");
        setIsApplyModalOpen(false);
      }, 1000);
    } else {
      setApplyError(result.error || "Unable to submit application.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="pb-4 border-b border-[#143326]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Jobs & Internships
          </h1>
          <Badge variant="emerald" dot>Live Requisitions</Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Discover published roles with transparent skill-overlap matching and live status tracking.
        </p>
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="explore">Explore Openings ({filteredJobs.length})</TabsTrigger>
          <TabsTrigger value="applied">My Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved Roles ({savedJobIds.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
              <Input
                placeholder="Search by role, company, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#143326] bg-[#0A1913] px-3 text-xs text-[#F0FDF4]"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-Time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
            </select>

            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold whitespace-nowrap cursor-pointer ${
                remoteOnly
                  ? "bg-[#10B981]/20 border-[#00DC82] text-[#00DC82]"
                  : "bg-[#0A1913] border-[#143326] text-[#8FA69B]"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Remote Only
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-3">
              {loading ? (
                <div className="h-40 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
              ) : filteredJobs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0A1913] border border-[#143326] text-center">
                  <Briefcase className="w-10 h-10 text-[#143326] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#F0FDF4]">No job openings published yet</p>
                  <p className="text-xs text-[#8FA69B] mt-1">
                    Active jobs published by verified recruiters will appear here immediately.
                  </p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = savedJobIds.includes(job.id);
                  const hasApplied = applications.some((a) => a.job_id === job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0F271D] border-[#00DC82] shadow-lg"
                          : "bg-[#0A1913] border-[#143326] hover:border-[#10B981]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-[#F0FDF4] line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-xs text-[#8FA69B]">{job.company?.name || "Partner"}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                          }}
                          className="text-[#8FA69B] hover:text-[#F0FDF4] p-1 cursor-pointer"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#00DC82]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-[11px] text-[#8FA69B]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span>·</span>
                        <span className="text-[#00DC82] font-semibold">
                          {formatJobSalary(job)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#143326]">
                        <div className="flex flex-wrap gap-1">
                          {job.skills_required.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-[#06100C] text-[10px] text-[#00DC82] font-mono"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        {hasApplied ? (
                          <Badge variant="emerald">Applied</Badge>
                        ) : job.match ? (
                          <Badge variant="outline">{job.match.matchScore}% Skill Match</Badge>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="lg:col-span-7 sticky top-20">
              {selectedJob ? (
                <Card className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
                    <div>
                      <h2 className="text-xl font-bold text-[#F0FDF4]">{selectedJob.title}</h2>
                      <p className="text-xs text-[#8FA69B] mt-0.5">
                        {selectedJob.company?.name} · {selectedJob.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleSaveJob(selectedJob.id)}
                        className="text-xs"
                      >
                        {savedJobIds.includes(selectedJob.id) ? "Saved" : "Save"}
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => {
                          setApplyError(null);
                          setIsApplyModalOpen(true);
                        }}
                        disabled={applications.some((a) => a.job_id === selectedJob.id)}
                        className="text-xs"
                      >
                        {applications.some((a) => a.job_id === selectedJob.id)
                          ? "Applied"
                          : "Apply Now"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#07130E] border border-[#143326] text-xs">
                    <div>
                      <span className="text-[#5D7A6E] block text-[10px] uppercase font-bold">
                        Compensation
                      </span>
                      <span className="font-bold text-[#00DC82]">{formatJobSalary(selectedJob)}</span>
                    </div>
                    <div>
                      <span className="text-[#5D7A6E] block text-[10px] uppercase font-bold">
                        Type
                      </span>
                      <span className="font-semibold text-[#F0FDF4] capitalize">{selectedJob.job_type}</span>
                    </div>
                    <div>
                      <span className="text-[#5D7A6E] block text-[10px] uppercase font-bold">
                        Workplace
                      </span>
                      <span className="font-semibold text-[#22D3EE]">
                        {selectedJob.is_remote ? "Remote" : "On-site / Hybrid"}
                      </span>
                    </div>
                  </div>

                  {selectedJob.match && (
                    <div className="p-4 rounded-xl bg-[#07130E] border border-[#16382C] text-xs space-y-1">
                      <span className="text-[#00DC82] font-semibold">
                        Explainable Skill Alignment ({selectedJob.match.matchScore}%):
                      </span>
                      <p className="text-[#8FA69B]">{selectedJob.match.matchSummary}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-xs sm:text-sm text-[#E6F4EA] leading-relaxed">
                    <h4 className="font-bold text-sm text-[#F0FDF4]">Role Description</h4>
                    <p className="whitespace-pre-line">{selectedJob.description}</p>
                  </div>

                  {selectedJob.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills_required.map((sk) => (
                        <Badge key={sk} variant="outline">{sk}</Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-16 text-center text-xs text-[#5D7A6E]">
                  Select an active listing to view full details and apply.
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applied" className="space-y-4">
          {applications.length === 0 ? (
            <Card className="p-12 text-center text-xs text-[#8FA69B]">
              You haven&apos;t submitted any job applications yet.
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#F0FDF4]">
                    {app.job?.title || "Position"}
                  </h3>
                  <p className="text-xs text-[#8FA69B]">
                    {app.job?.company?.name || "Hiring Partner"} · Applied {formatDate(app.applied_at)}
                  </p>
                </div>
                <Badge
                  variant={
                    app.status === "shortlisted" || app.status === "offered"
                      ? "emerald"
                      : app.status === "rejected"
                      ? "error"
                      : "default"
                  }
                  className="capitalize"
                >
                  {app.status}
                </Badge>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs
              .filter((j) => savedJobIds.includes(j.id))
              .map((job) => (
                <Card key={job.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#F0FDF4]">{job.title}</h3>
                    <p className="text-xs text-[#8FA69B] mt-1">
                      {job.company?.name} · {job.location}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#143326] flex items-center justify-between">
                    <span className="text-xs text-[#00DC82] font-semibold">
                      {formatJobSalary(job)}
                    </span>
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => {
                        setSelectedJob(job);
                        setIsApplyModalOpen(true);
                      }}
                      className="text-xs"
                    >
                      Apply Now
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#143326]">
              <div>
                <h3 className="text-base font-bold text-[#F0FDF4]">Submit Application</h3>
                <p className="text-xs text-[#8FA69B]">
                  {selectedJob.title} at {selectedJob.company?.name}
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-[#8FA69B] hover:text-[#F0FDF4] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {applyError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              {resumes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
                    Attach Saved Resume
                  </label>
                  <select
                    value={activeResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
                  Note to Hiring Manager
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Highlight relevant skills, completed coursework, and links to project work..."
                  className="w-full rounded-xl border border-[#143326] bg-[#06100C] p-3 text-xs text-[#F0FDF4] focus:border-[#10B981] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#143326]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  {appliedSuccess ? "Submitted!" : "Confirm & Apply"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
