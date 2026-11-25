"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/types";
import { ArrowLeft, Save, Users, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface JobApplicantRow {
  id: string;
  student_id: string;
  status: string;
  cover_letter: string | null;
  applied_at: string;
  student?: { id: string; full_name: string; location: string | null; bio: string | null };
}

export default function RecruiterJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  const loadDetail = useCallback(async () => {
    const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setJob(json.job);
      setApplications(json.applications || []);
      setTitle(json.job.title || "");
      setLocation(json.job.location || "");
      setDescription(json.job.description || "");
      setSkillsText((json.job.skills_required || []).join(", "));
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    fetch(`/api/jobs/${id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.job) return;
        setJob(json.job);
        setApplications(json.applications || []);
        setTitle(json.job.title || "");
        setLocation(json.job.location || "");
        setDescription(json.job.description || "");
        setSkillsText((json.job.skills_required || []).join(", "));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        skills_required: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    if (res.ok) {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      loadDetail();
    }
  };

  const updateAppStatus = async (appId: string, status: string) => {
    const res = await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadDetail();
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-[#8FA69B]">Loading requisition details...</div>;
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Link href="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B]">
          <ArrowLeft className="w-4 h-4" /> Back to Manage Jobs
        </Link>
        <Card className="p-10 text-center text-sm text-[#8FA69B]">Job not found.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <Link href="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Manage Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <h1 className="text-xl font-bold text-[#F0FDF4]">Edit Job Details</h1>
            <Badge variant={job.is_active ? "emerald" : "secondary"}>
              {job.is_active ? "Active" : "Closed"}
            </Badge>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Required Skills</label>
              <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Description</label>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <Button type="submit" variant="gradient" size="sm" className="gap-1.5 text-xs">
              {savedOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedOk ? "Saved!" : "Update Requisition"}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <h2 className="text-base font-bold text-[#F0FDF4] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#10B981]" />
              Applicants ({applications.length})
            </h2>
          </div>

          {applications.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#8FA69B]">
              No applications received for this role yet.
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/recruiter/candidates/${app.student_id}`}
                      className="text-sm font-bold text-[#00DC82] hover:underline"
                    >
                      {app.student?.full_name || "Candidate"}
                    </Link>
                    <Badge variant="outline" className="capitalize">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#8FA69B] line-clamp-2">{app.cover_letter}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#143326]">
                    <span className="text-[10px] text-[#5D7A6E]">{formatDate(app.applied_at)}</span>
                    <select
                      value={app.status}
                      onChange={(e) => updateAppStatus(app.id, e.target.value)}
                      className="rounded-lg border border-[#143326] bg-[#06100C] px-2 py-1 text-[11px] text-[#F0FDF4]"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
