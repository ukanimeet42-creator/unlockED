"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, FileText, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ApplicationItem {
  id: string;
  student_id: string;
  status: string;
  cover_letter: string | null;
  applied_at: string;
  interviewAt?: string | null;
  recruiterNote?: string | null;
  job?: { id: string; title: string; location: string };
  student?: { id: string; full_name: string };
  candidateMetrics?: {
    averageAssessmentScore: number | null;
    publicProjectsCount: number;
    skills: string[];
  };
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [interviewDraft, setInterviewDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadApps = () => {
      fetch("/api/applications", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (active && json?.applications) setApplications(json.applications);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    loadApps();
    window.addEventListener("unlocked:sync", loadApps);
    return () => {
      active = false;
      window.removeEventListener("unlocked:sync", loadApps);
    };
  }, []);

  const updateStatus = async (
    id: string,
    newStatus: string,
    extras?: { interviewAt?: string | null; recruiterNote?: string | null }
  ) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...(extras || {}),
        }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: newStatus,
                  interviewAt:
                    extras?.interviewAt !== undefined ? extras.interviewAt : app.interviewAt,
                  recruiterNote:
                    extras?.recruiterNote !== undefined ? extras.recruiterNote : app.recruiterNote,
                }
              : app
          )
        );
        if (extras) setEditingId(null);
      }
    } finally {
      setSavingId(null);
    }
  };

  const openNoteEditor = (app: ApplicationItem) => {
    if (editingId === app.id) {
      setEditingId(null);
      return;
    }
    setEditingId(app.id);
    setInterviewDraft(app.interviewAt || "");
    setNoteDraft(app.recruiterNote || "");
  };

  const filteredApplications = useMemo(
    () =>
      stageFilter === "all"
        ? applications
        : applications.filter((a) => a.status === stageFilter),
    [applications, stageFilter]
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Application Management Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Review incoming candidate applications, schedule interviews, and update hiring stages in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {(["all", "pending", "reviewed", "shortlisted", "interviewed", "offered", "rejected"] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 rounded-lg border capitalize cursor-pointer transition-colors ${
                  stageFilter === st
                    ? "bg-[#10B981] text-slate-950 font-bold border-[#10B981]"
                    : "bg-[#0A1913] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-36 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
        ) : filteredApplications.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <FileText className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">
              {applications.length === 0 ? "No applications received yet" : `No applications in "${stageFilter}" stage`}
            </h3>
            <p className="text-sm text-[#8FA69B] mt-1">
              Student applications submitted to your job postings will appear here live.
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center text-[#00DC82] font-bold shrink-0">
                  {(app.student?.full_name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/recruiter/candidates/${app.student_id}`}
                      className="text-base font-bold text-[#F0FDF4] hover:text-[#00DC82]"
                    >
                      {app.student?.full_name || "Applicant"}
                    </Link>
                    {app.candidateMetrics?.averageAssessmentScore != null && (
                      <Badge variant="emerald">
                        {app.candidateMetrics.averageAssessmentScore}% Benchmark Avg
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {app.candidateMetrics?.publicProjectsCount || 0} Projects
                    </Badge>
                  </div>
                  <p className="text-xs text-[#10B981] font-medium">
                    Applied for: {app.job?.title || "Position"}
                  </p>
                  {app.cover_letter && (
                    <p className="text-xs text-[#8FA69B] max-w-xl leading-relaxed mt-1">
                      &ldquo;{app.cover_letter}&rdquo;
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-[11px] text-[#5D7A6E]">
                      Received {formatDate(app.applied_at)}
                    </span>
                    {app.interviewAt && (
                      <Badge variant="cyan" className="text-[10px]">
                        <Calendar className="w-3 h-3" /> Interview: {app.interviewAt}
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => openNoteEditor(app)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#22D3EE] hover:underline cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {editingId === app.id ? "Close Schedule & Note" : "Schedule Interview / Note"}
                    </button>
                  </div>
                  {app.recruiterNote && (
                    <p className="text-[11px] text-[#A7F3D0] bg-[#07130E] border border-[#143326] rounded-lg px-3 py-1.5 mt-1.5 max-w-xl">
                      Note: {app.recruiterNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#07130E] border border-[#143326] text-xs shrink-0">
                {(["reviewed", "shortlisted", "interviewed", "offered", "rejected"] as const).map(
                  (stage) => (
                    <button
                      key={stage}
                      disabled={savingId === app.id}
                      onClick={() => updateStatus(app.id, stage)}
                      className={`px-2.5 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                        app.status === stage
                          ? stage === "rejected"
                            ? "bg-rose-500 text-white font-semibold"
                            : "bg-[#10B981] text-slate-950 font-bold"
                          : "text-[#8FA69B] hover:text-[#F0FDF4]"
                      }`}
                    >
                      {stage}
                    </button>
                  )
                )}
              </div>
              </div>

              {editingId === app.id && (
                <div className="pt-4 border-t border-[#143326] grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[11px] font-medium text-[#8FA69B] block">
                      Interview Date / Slot
                    </label>
                    <Input
                      value={interviewDraft}
                      onChange={(e) => setInterviewDraft(e.target.value)}
                      placeholder="e.g. Fri 15:00 IST (Meet)"
                    />
                  </div>
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[11px] font-medium text-[#8FA69B] block">
                      Evaluation / Scheduling Note
                    </label>
                    <Input
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="System design round + technical Q&A..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="gradient"
                      disabled={savingId === app.id}
                      onClick={() =>
                        updateStatus(
                          app.id,
                          interviewDraft.trim() ? "interviewed" : app.status,
                          {
                            interviewAt: interviewDraft.trim() || null,
                            recruiterNote: noteDraft.trim() || null,
                          }
                        )
                      }
                      className="w-full text-xs"
                    >
                      {savingId === app.id ? "Saving..." : "Save Update"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
