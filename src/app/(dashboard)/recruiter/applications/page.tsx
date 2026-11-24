"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Mail,
  User,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_STUDENT_PROFILE } from "@/lib/data/mock-data";

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<{
    id: string;
    candidateName: string;
    candidateAvatar: string | null;
    jobTitle: string;
    readinessScore: number;
    status: string;
    appliedAt: string;
    note: string;
  }[]>([]);

  const updateStatus = (id: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Application Management Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Review candidate submissions, inspect verified code attestations, and update pipeline stages.
        </p>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <FileText className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No applications received yet</h3>
            <p className="text-sm text-[#8FA69B] mt-1">Candidate applications will appear here once candidates apply to your requisitions.</p>
          </div>
        ) : (
          applications.map((app) => (
            <Card
              key={app.id}
              className="p-6 bg-[#0A1913] border-[#143326] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {app.candidateAvatar ? (
                  <img
                    src={app.candidateAvatar}
                    alt={app.candidateName}
                    className="w-12 h-12 rounded-xl object-cover border border-[#143326]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center text-[#10B981] font-bold">
                    {app.candidateName.charAt(0)}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#F0FDF4]">
                      {app.candidateName}
                    </h3>
                    <Badge variant="emerald">{app.readinessScore}/100 Readiness</Badge>
                  </div>
                  <p className="text-xs text-[#10B981] font-medium">
                    Applied for: {app.jobTitle}
                  </p>
                  <p className="text-xs text-[#8FA69B] max-w-xl leading-relaxed mt-1">
                    "{app.note}"
                  </p>
                  <span className="text-[11px] text-[#5D7A6E] block pt-1">
                    Received {app.appliedAt}
                  </span>
                </div>
              </div>

              {/* Pipeline Stage Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#07130E] border border-[#143326] text-xs">
                  <button
                    onClick={() => updateStatus(app.id, "reviewed")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      app.status === "reviewed"
                        ? "bg-[#059669] text-white"
                        : "text-[#8FA69B] hover:text-[#F0FDF4]"
                    }`}
                  >
                    Reviewed
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, "shortlisted")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      app.status === "shortlisted"
                        ? "bg-[#10B981] text-slate-950 font-bold"
                        : "text-[#8FA69B] hover:text-[#F0FDF4]"
                    }`}
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, "interviewed")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      app.status === "interviewed"
                        ? "bg-[#00DC82] text-slate-950 font-bold"
                        : "text-[#8FA69B] hover:text-[#F0FDF4]"
                    }`}
                  >
                    Interview
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
