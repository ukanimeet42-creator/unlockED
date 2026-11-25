"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/types";
import { Briefcase, Plus, MapPin, Users, Eye, Power, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

function formatSalary(job: Job): string {
  if (!job.salary_min && !job.salary_max) return "Competitive";
  const prefix = job.salary_currency === "INR" ? "₹" : "$";
  const minStr = job.salary_min
    ? job.salary_currency === "INR"
      ? `${(job.salary_min / 100000).toFixed(1)}L`
      : `${Math.round(job.salary_min / 1000)}k`
    : "";
  const maxStr = job.salary_max
    ? job.salary_currency === "INR"
      ? `${(job.salary_max / 100000).toFixed(1)}L`
      : `${Math.round(job.salary_max / 1000)}k`
    : "";
  return `${prefix}${minStr}${minStr && maxStr ? " - " : ""}${maxStr ? prefix + maxStr : ""}`;
}

export default function RecruiterJobsManagePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshJobs = useCallback(async () => {
    const res = await fetch("/api/jobs?mine=true", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setJobs(json.jobs || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/jobs?mine=true", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.jobs) setJobs(json.jobs);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleActive = async (job: Job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !job.is_active }),
    });
    if (res.ok) {
      refreshJobs();
    }
  };

  const deleteJob = async (id: string) => {
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#143326] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Manage Job Requisitions
          </h1>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Publish, edit, pause, or close open engineering positions.
          </p>
        </div>

        <Link href="/recruiter/jobs/new">
          <Button variant="gradient" size="sm" className="gap-1.5 text-xs rounded-full">
            <Plus className="w-3.5 h-3.5" />
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-16 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-[#143326] mx-auto" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No job postings published yet</h3>
          <p className="text-xs text-[#8FA69B] max-w-md mx-auto">
            Create your first requisition to appear immediately in the student opportunity feed.
          </p>
          <Link href="/recruiter/jobs/new" className="inline-block pt-2">
            <Button variant="gradient" size="sm" className="text-xs rounded-full">
              Create Job Requisition
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={job.is_active ? "emerald" : "secondary"} dot={job.is_active}>
                    {job.is_active ? "Published & Active" : "Closed"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {job.job_type}
                  </Badge>
                  <span className="text-xs font-mono text-[#00DC82]">
                    {formatSalary(job)}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#F0FDF4]">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8FA69B]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                    {job.location} {job.is_remote ? "(Remote)" : ""}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#22D3EE]">
                    <Users className="w-3.5 h-3.5" />
                    {job.application_count || 0} Applicants
                  </span>
                  <span>·</span>
                  <span>Posted {formatDate(job.created_at)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link href={`/recruiter/jobs/${job.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5" /> Edit & Applicants
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(job)}
                  className="gap-1.5 text-xs"
                >
                  <Power className="w-3.5 h-3.5" />
                  {job.is_active ? "Close Job" : "Reopen"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteJob(job.id)}
                  title="Delete requisition"
                  className="text-[#8FA69B] hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
