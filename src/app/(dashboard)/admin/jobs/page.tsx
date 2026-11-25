"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/types";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    const res = await fetch("/api/jobs", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setJobs(json.jobs || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/jobs", { cache: "no-store" })
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

  const toggleStatus = async (job: Job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !job.is_active }),
    });
    if (res.ok) loadJobs();
  };

  return (
    <div className="space-y-6 pb-20">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Job Moderation & Compliance
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Moderate employer job requisitions and toggle platform visibility.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-32 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <Briefcase className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No job listings posted yet</h3>
          </div>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={job.is_active ? "emerald" : "secondary"}>
                    {job.is_active ? "Active" : "Suspended"}
                  </Badge>
                  <span className="text-xs text-[#8FA69B]">{job.company?.name || "Partner"}</span>
                </div>
                <h3 className="text-base font-bold text-[#F0FDF4]">{job.title}</h3>
                <p className="text-xs text-[#8FA69B] mt-1">
                  {job.location} · {job.application_count || 0} Applicants
                </p>
              </div>

              <Button
                variant={job.is_active ? "secondary" : "gradient"}
                size="sm"
                onClick={() => toggleStatus(job)}
                className="text-xs shrink-0"
              >
                {job.is_active ? "Suspend Listing" : "Approve Listing"}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
