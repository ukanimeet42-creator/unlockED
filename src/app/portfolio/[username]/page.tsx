"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Code2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_STUDENT_PROFILE, INITIAL_PROJECTS } from "@/lib/data/mock-data";

export const dynamic = "force-dynamic";

export default function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const profile = INITIAL_STUDENT_PROFILE;

  return (
    <div className="min-h-screen bg-[#06100C] text-[#E6F4EA] pb-20">
      {/* Top Attestation Bar */}
      <div className="bg-[#0A1913] border-b border-[#143326] py-2 px-4 text-center text-xs text-[#8FA69B] flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
        <span>
          Cryptographically Verified Attestation on UnlockED Platform
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Candidate Hero Card */}
        <Card className="p-6 sm:p-10 bg-[#0A1913] border-[#143326] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#10B981]/40 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#0F271D] border-2 border-[#16382C] flex items-center justify-center text-2xl font-bold text-[#10B981] shadow-lg">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
                    {username || profile.full_name}
                  </h1>
                  <Badge variant="emerald" dot>
                    Candidate
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
                  Technical Portfolio & Project Attestations
                </p>
              </div>
            </div>

            <Link href="/register">
              <Button size="sm" variant="gradient" className="gap-2">
                Join UnlockED
              </Button>
            </Link>
          </div>
        </Card>

        {/* Projects Showcase */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#F0FDF4]">Attested Production Projects</h2>
          {INITIAL_PROJECTS.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
              <Code2 className="w-12 h-12 text-[#143326] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#F0FDF4]">No verified projects published yet</h3>
              <p className="text-sm text-[#8FA69B] mt-1">Projects published by this candidate will appear here with automated code proofs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INITIAL_PROJECTS.map((project) => (
                <Card key={project.id} className="p-6 bg-[#0A1913] border-[#143326] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="emerald">Codebase Traced & Tested</Badge>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#F0FDF4] leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-[#07130E] text-[11px] text-[#A7F3D0] font-mono border border-[#143326]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#143326] flex items-center gap-4 text-xs">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#34D399] hover:underline"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Inspect Repo</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#00DC82] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Sandbox</span>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
