"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, ArrowRight, BookmarkCheck, MapPin, GitCompare, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CandidateRow {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  skills: Array<{ name: string; verified: boolean; proficiency: string }>;
  projects: Array<{ id: string; title: string; technologies: string[] }>;
  averageAssessmentScore: number | null;
  passedBenchmarks: number;
  certificatesCount: number;
}

export default function CandidateSearchPage() {
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("unlocked_recruiter_bookmarks");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          window.setTimeout(() => setShortlisted(parsed), 0);
        }
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (skillFilter.trim()) params.set("q", skillFilter.trim());
    if (locationFilter.trim()) params.set("location", locationFilter.trim());
    fetch(`/api/candidates?${params.toString()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.candidates) setCandidates(json.candidates);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [skillFilter, locationFilter]);

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        window.localStorage.setItem("unlocked_recruiter_bookmarks", JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const comparedCandidates = candidates.filter((c) => compareIds.includes(c.id));

  return (
    <div className="space-y-8 pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Candidate Discovery
          </h1>
          <Badge variant="emerald" dot>Registered Learners</Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Discover learners using transparent project portfolios, benchmark results, and recorded skills.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
            <Input
              placeholder="Filter by skill, technology, project, or name..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative w-full sm:w-52">
            <MapPin className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
            <Input
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {["All", "TypeScript", "Go", "Kubernetes", "AI", "PostgreSQL"].map((s) => (
            <button
              key={s}
              onClick={() => setSkillFilter(s === "All" ? "" : s)}
              className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                (s === "All" && !skillFilter) || skillFilter.toLowerCase() === s.toLowerCase()
                  ? "bg-[#10B981] text-slate-950 font-bold border-[#10B981]"
                  : "bg-[#0A1913] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {comparedCandidates.length > 0 && (
        <Card className="p-6 glass-panel-elevated space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#143326]">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#22D3EE]" />
              <h2 className="text-sm font-bold text-[#F0FDF4]">
                Side-by-Side Candidate Comparison ({comparedCandidates.length}/3)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-xs text-[#8FA69B] hover:text-[#F0FDF4] inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Comparison
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#143326] text-[#5D7A6E] uppercase text-[10px]">
                  <th className="py-2 pr-4">Candidate</th>
                  <th className="py-2 px-4">Location</th>
                  <th className="py-2 px-4">Benchmark Avg</th>
                  <th className="py-2 px-4">Certificates</th>
                  <th className="py-2 px-4">Projects</th>
                  <th className="py-2 px-4">Recorded Skills</th>
                  <th className="py-2 pl-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#143326]">
                {comparedCandidates.map((c) => (
                  <tr key={c.id} className="text-[#E6F4EA]">
                    <td className="py-3 pr-4 font-semibold text-[#F0FDF4]">{c.full_name}</td>
                    <td className="py-3 px-4 text-[#8FA69B]">{c.location}</td>
                    <td className="py-3 px-4 font-mono text-[#00DC82]">
                      {c.averageAssessmentScore !== null ? `${c.averageAssessmentScore}%` : "—"}
                    </td>
                    <td className="py-3 px-4">{c.certificatesCount}</td>
                    <td className="py-3 px-4">{c.projects.length}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.skills.slice(0, 4).map((sk) => (
                          <span
                            key={sk.name}
                            className="px-1.5 py-0.5 rounded bg-[#06110C] border border-[#143326] text-[10px] text-[#A7F3D0]"
                          >
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link href={`/recruiter/candidates/${c.id}`}>
                        <Button size="sm" variant="secondary" className="text-[11px] h-7">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <Users className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No candidates match these criteria</h3>
          <p className="text-sm text-[#8FA69B] mt-1">
            Candidates appear automatically after completing student registration & onboarding.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => {
            const isShortlisted = shortlisted.includes(cand.id);
            return (
              <Card key={cand.id} hoverEffect className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center text-[#00DC82] font-bold">
                        {cand.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#F0FDF4]">{cand.full_name}</h3>
                        <p className="text-[11px] text-[#8FA69B]">{cand.location}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#00DC82] block">
                        {cand.averageAssessmentScore !== null
                          ? `${cand.averageAssessmentScore}%`
                          : "—"}
                      </span>
                      <span className="text-[10px] text-[#8FA69B]">Avg Score</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#8FA69B] leading-relaxed line-clamp-2">
                    {cand.bio || "No bio added yet."}
                  </p>

                  {cand.projects[0] && (
                    <div className="p-3 rounded-xl bg-[#07130E] border border-[#143326] text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#10B981] block">
                        Featured Project ({cand.projects.length} total)
                      </span>
                      <p className="font-medium text-[#F0FDF4] line-clamp-1">
                        {cand.projects[0].title}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {cand.skills.slice(0, 5).map((s) => (
                      <span
                        key={s.name}
                        className="px-2 py-0.5 rounded bg-[#0F271D] text-[10px] text-[#A7F3D0] font-mono border border-[#16382C]"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#143326] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleShortlist(cand.id)}
                      className={`flex items-center gap-1.5 cursor-pointer ${
                        isShortlisted ? "text-[#00DC82] font-bold" : "text-[#8FA69B] hover:text-[#F0FDF4]"
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      {isShortlisted ? "Saved" : "Bookmark"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCompare(cand.id)}
                      className={`flex items-center gap-1 cursor-pointer ${
                        compareIds.includes(cand.id)
                          ? "text-[#22D3EE] font-bold"
                          : "text-[#8FA69B] hover:text-[#F0FDF4]"
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {compareIds.includes(cand.id) ? "Comparing" : "Compare"}
                    </button>
                  </div>

                  <Link href={`/recruiter/candidates/${cand.id}`}>
                    <Button size="sm" variant="gradient" className="text-xs gap-1">
                      Inspect Profile <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
