"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { INITIAL_JOBS } from "@/lib/data/mock-data";
import { Job } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StudentJobsPage() {
  const { savedJobIds, toggleSaveJob, appliedJobs, applyToJob } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(INITIAL_JOBS[0] || null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState(
    "I am an UnlockED candidate with verified project proof in Go, Kubernetes, and PostgreSQL. I would love to bring my production discipline to your engineering team."
  );
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const filteredJobs = INITIAL_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills_required.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRemote = !remoteOnly || job.is_remote;

    return matchesSearch && matchesRemote;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const ok = applyToJob(selectedJob.id, undefined, coverLetter);
    if (ok) {
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setIsApplyModalOpen(false);
      }, 1200);
    } else {
      alert("You have already submitted an application for this position.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
              Direct Engineering Opportunities
            </h1>
            <Badge variant="emerald" dot>
              Active Requisitions
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Apply with your verified project portfolio and bypass traditional resume screens.
          </p>
        </div>
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="explore">Explore Openings ({filteredJobs.length})</TabsTrigger>
          <TabsTrigger value="applied">
            My Applications ({appliedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            Saved Roles ({savedJobIds.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Explore Jobs */}
        <TabsContent value="explore" className="space-y-6">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
              <Input
                placeholder="Search by title, skill, or company (e.g. SRE, Go, FinScale)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                remoteOnly
                  ? "bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#D0BCFF]"
                  : "bg-[#101018] border-[#232336] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${remoteOnly ? "text-[#8B5CF6]" : "text-[#64748B]"}`} />
              Remote Roles Only
            </button>
          </div>

          {/* 2-Column Job List & Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left list (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {filteredJobs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0A1913] border border-[#143326] text-center">
                  <Briefcase className="w-10 h-10 text-[#143326] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#F0FDF4]">No job openings found</p>
                  <p className="text-xs text-[#8FA69B] mt-1">Check back soon for hiring partner listings.</p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isSaved = savedJobIds.includes(job.id);
                const hasApplied = appliedJobs.some((a) => a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1C1C2B] border-[#8B5CF6] shadow-lg"
                        : "bg-[#151520] border-[#232336] hover:border-[#363654]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.company?.logo_url || ""}
                          alt={job.company?.name || ""}
                          className="w-10 h-10 rounded-xl object-cover border border-[#232336]"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-[#F5F3FF] line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-xs text-[#94A3B8]">
                            {job.company?.name}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.id);
                        }}
                        className="text-[#94A3B8] hover:text-[#F5F3FF] p-1"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-[#8B5CF6]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[#CBC3D7]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#64748B]" />
                        {job.location}
                      </span>
                      <span>·</span>
                      <span className="text-[#22C55E] font-semibold">
                        ${(job.salary_min || 100000) / 1000}k - ${(job.salary_max || 130000) / 1000}k
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#232336]">
                      <div className="flex flex-wrap gap-1">
                        {job.skills_required.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-[#101018] text-[10px] text-[#D0BCFF] font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {hasApplied ? (
                        <Badge variant="emerald">Applied</Badge>
                      ) : (
                        <Badge variant="default">94% Fit</Badge>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Right Selected Job Detail (7 cols) */}
            <div className="lg:col-span-7 sticky top-20">
              {selectedJob ? (
                <Card className="p-6 sm:p-8 bg-[#151520] border-[#232336] shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232336]">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedJob.company?.logo_url || ""}
                        alt={selectedJob.company?.name || ""}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#232336]"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-[#F5F3FF]">
                          {selectedJob.title}
                        </h2>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          {selectedJob.company?.name} · {selectedJob.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleSaveJob(selectedJob.id)}
                        className="text-xs"
                      >
                        {savedJobIds.includes(selectedJob.id) ? "Saved" : "Save Role"}
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => setIsApplyModalOpen(true)}
                        disabled={appliedJobs.some((a) => a.jobId === selectedJob.id)}
                        className="text-xs"
                      >
                        {appliedJobs.some((a) => a.jobId === selectedJob.id)
                          ? "Already Applied"
                          : "Apply Now"}
                      </Button>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#101018] border border-[#232336] text-xs">
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">
                        Compensation
                      </span>
                      <span className="font-bold text-[#22C55E]">
                        ${(selectedJob.salary_min || 100000) / 1000}k - ${(selectedJob.salary_max || 130000) / 1000}k
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">
                        Work Type
                      </span>
                      <span className="font-semibold text-[#F5F3FF] capitalize">
                        {selectedJob.job_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">
                        Workplace
                      </span>
                      <span className="font-semibold text-[#8B5CF6]">
                        {selectedJob.is_remote ? "100% Remote" : "Hybrid"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 text-xs sm:text-sm text-[#E4E1EC] leading-relaxed">
                    <h4 className="font-bold text-sm text-[#F5F3FF]">Role Description</h4>
                    <p>{selectedJob.description}</p>
                  </div>

                  {/* Responsibilities */}
                  <div className="space-y-2 text-xs sm:text-sm text-[#E4E1EC] leading-relaxed">
                    <h4 className="font-bold text-sm text-[#F5F3FF]">Key Responsibilities</h4>
                    <ul className="space-y-1.5 list-disc list-inside">
                      {selectedJob.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2 text-xs sm:text-sm text-[#E4E1EC] leading-relaxed">
                    <h4 className="font-bold text-sm text-[#F5F3FF]">Qualifications & Skills</h4>
                    <ul className="space-y-1.5 list-disc list-inside">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ) : (
                <div className="py-20 text-center text-[#64748B]">Select a role to view details.</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: My Applications */}
        <TabsContent value="applied" className="space-y-4">
          <div className="space-y-3">
            {appliedJobs.map((app) => {
              const matchedJob = INITIAL_JOBS.find((j) => j.id === app.jobId);
              if (!matchedJob) return null;

              return (
                <Card key={app.jobId} className="p-5 bg-[#151520] border-[#232336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={matchedJob.company?.logo_url || ""}
                      alt={matchedJob.company?.name || ""}
                      className="w-12 h-12 rounded-xl object-cover border border-[#232336]"
                    />
                    <div>
                      <h3 className="text-base font-bold text-[#F5F3FF]">
                        {matchedJob.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        {matchedJob.company?.name} · Applied on {formatDate(app.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        app.status === "shortlisted"
                          ? "emerald"
                          : app.status === "interviewed"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                      dot={app.status === "shortlisted"}
                    >
                      Status: {app.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 3: Saved Roles */}
        <TabsContent value="saved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_JOBS.filter((j) => savedJobIds.includes(j.id)).map((job) => (
              <Card key={job.id} className="p-5 bg-[#151520] border-[#232336] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#F5F3FF]">{job.title}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">{job.company?.name} · {job.location}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#232336] flex items-center justify-between">
                  <span className="text-xs text-[#22C55E] font-semibold">
                    ${(job.salary_min || 100000) / 1000}k - ${(job.salary_max || 130000) / 1000}k
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

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 bg-[#151520] border-[#232336] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232336]">
              <div>
                <h3 className="text-base font-bold text-[#F5F3FF]">
                  Submit Application
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {selectedJob.title} at {selectedJob.company?.name}
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F5F3FF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#101018] border border-[#232336] flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Attached Verified Resume:</span>
                <span className="font-semibold text-[#8B5CF6]">
                  Alex Chen — SRE & Cloud Systems.pdf
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E4E1EC] block mb-1.5">
                  Direct Note to Hiring Manager
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full rounded-xl border border-[#232336] bg-[#101018] p-3 text-xs text-[#F5F3FF] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232336]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  {appliedSuccess ? "Application Submitted!" : "Confirm & Send"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
