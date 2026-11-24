"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { INITIAL_STUDENT_PROFILE } from "@/lib/data/mock-data";

export default function CandidateSearchPage() {
  const [skillFilter, setSkillFilter] = useState("Go");
  const [shortlisted, setShortlisted] = useState<string[]>([]);

  const candidates: {
    id: string;
    name: string;
    title: string;
    location: string;
    readinessIndex: number;
    verifiedHash: string;
    avatar: string | null;
    skills: string[];
    featuredProject: string;
    bio: string;
  }[] = [];

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
            Candidate Search & Discovery
          </h1>
          <Badge variant="emerald" dot>
            Attested Talent Pool
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Explore candidates with cryptographically attested projects and verified scores.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
          <Input
            placeholder="Search by verified skill (Go, Kubernetes, React, Python)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#94A3B8]">Quick Filters:</span>
          {["All", "Go", "Kubernetes", "React", "Python"].map((s) => (
            <button
              key={s}
              onClick={() => setSkillFilter(s === "All" ? "" : s)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                (s === "All" && !skillFilter) || skillFilter.toLowerCase() === s.toLowerCase()
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-[#151520] border-[#232336] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <Users className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No candidates found</h3>
          <p className="text-sm text-[#8FA69B] mt-1">Verified candidates will appear here as learners complete technical benchmarks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => {
            const isShortlisted = shortlisted.includes(cand.id);

            return (
              <Card
                key={cand.id}
                hoverEffect
                className="p-6 flex flex-col justify-between bg-[#0A1913] border-[#143326]"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {cand.avatar ? (
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#143326]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center text-[#10B981] font-bold">
                          {cand.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-[#F0FDF4]">
                          {cand.name}
                        </h3>
                        <p className="text-[11px] text-[#8FA69B]">{cand.location}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#00DC82] block">
                        {cand.readinessIndex}/100
                      </span>
                      <span className="text-[10px] text-[#8FA69B]">Readiness</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07130E] border border-[#143326] text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#10B981] block">
                      Verified Capstone Proof
                    </span>
                    <p className="font-medium text-[#F0FDF4] line-clamp-1">
                      {cand.featuredProject}
                    </p>
                  </div>

                  <p className="text-xs text-[#8FA69B] leading-relaxed line-clamp-2">
                    {cand.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {cand.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-[#0F271D] text-[10px] text-[#A7F3D0] font-mono border border-[#16382C]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#143326] flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleShortlist(cand.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isShortlisted ? "text-[#00DC82] font-bold" : "text-[#8FA69B] hover:text-[#F0FDF4]"
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    {isShortlisted ? "Shortlisted" : "Shortlist"}
                  </button>

                  <Link href={`/portfolio/${cand.id}`} target="_blank">
                    <Button size="sm" variant="gradient" className="text-xs gap-1">
                      Inspect Proof <ArrowRight className="w-3 h-3" />
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
