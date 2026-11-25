"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Code2, ExternalLink, MapPin, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CandidateDetail {
  id: string;
  full_name: string;
  email: string | null;
  bio: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    github_url: string | null;
    live_url: string | null;
  }>;
  skills: Array<{
    proficiency: string;
    verified: boolean;
    skill?: { name: string; category: string };
  }>;
  attempts: Array<{
    id: string;
    percentage: number;
    passed: boolean;
    completed_at: string;
  }>;
  certificates: Array<{
    id: string;
    certificate_number: string;
    issued_at: string;
    course?: { title: string; category: string };
  }>;
}

export default function CandidateProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/candidates/${id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.candidate) setCandidate(json.candidate);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-xs text-[#8FA69B]">Loading candidate dossier...</div>;

  if (!candidate) {
    return (
      <div className="space-y-4">
        <Link href="/recruiter/candidates" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B]">
          <ArrowLeft className="w-4 h-4" /> Back to Candidate Search
        </Link>
        <Card className="p-10 text-center text-sm text-[#8FA69B]">Candidate profile not found.</Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      <Link href="/recruiter/candidates" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Candidate Search
      </Link>

      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/15 border border-[#16382C] flex items-center justify-center text-2xl font-bold text-[#00DC82]">
            {candidate.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F0FDF4]">{candidate.full_name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8FA69B] mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                {candidate.location || "Remote"}
              </span>
              {candidate.email && <span>· {candidate.email}</span>}
            </div>
            <p className="text-xs text-[#8FA69B] mt-2 max-w-2xl">{candidate.bio || "No bio provided."}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 text-xs">
          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#07130E] border border-[#143326] text-[#00DC82] hover:border-[#10B981]"
            >
              GitHub
            </a>
          )}
          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#07130E] border border-[#143326] text-[#22D3EE] hover:border-[#22D3EE]"
            >
              LinkedIn
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <h2 className="text-sm font-bold text-[#F0FDF4]">Evaluated Skills</h2>
          {candidate.skills.length === 0 ? (
            <p className="text-xs text-[#5D7A6E]">No skill records recorded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s, idx) => (
                <Badge key={idx} variant={s.verified ? "emerald" : "outline"} dot={s.verified}>
                  {s.skill?.name} ({s.proficiency})
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-sm font-bold text-[#F0FDF4]">Certificates & Benchmarks</h2>
          {candidate.certificates.length === 0 && candidate.attempts.length === 0 ? (
            <p className="text-xs text-[#5D7A6E]">No completed certificates or benchmark attempts yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {candidate.certificates.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F0FDF4] block">{c.course?.title}</span>
                    <span className="font-mono text-[10px] text-[#00DC82]">{c.certificate_number}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#00DC82]" />
                </div>
              ))}
              {candidate.attempts.slice(0, 4).map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between">
                  <span className="text-[#8FA69B]">
                    <Award className="w-3.5 h-3.5 inline mr-1.5 text-[#10B981]" />
                    Benchmark Attempt ({formatDate(a.completed_at)})
                  </span>
                  <Badge variant={a.passed ? "emerald" : "amber"}>{a.percentage}%</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#F0FDF4]">Public Project Portfolio ({candidate.projects.length})</h2>
        {candidate.projects.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#5D7A6E]">No public projects published.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidate.projects.map((p) => (
              <Card key={p.id} className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-[#F0FDF4]">{p.title}</h3>
                <p className="text-xs text-[#8FA69B]">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-[#06100C] border border-[#143326] text-[10px] font-mono text-[#00DC82]">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 pt-2 border-t border-[#143326] text-xs">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-[#00DC82] flex items-center gap-1 hover:underline">
                      <Code2 className="w-3.5 h-3.5" /> Code
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer" className="text-[#22D3EE] flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
