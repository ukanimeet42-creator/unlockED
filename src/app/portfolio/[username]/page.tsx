"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Code2, ExternalLink, CheckCircle2, Award, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PublicPortfolioPayload {
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    github_url: string | null;
    linkedin_url: string | null;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    github_url: string | null;
    live_url: string | null;
    thumbnail_url?: string | null;
  }>;
  skills: Array<{
    proficiency: string;
    verified: boolean;
    skill?: { name: string; category: string };
  }>;
  certificates: Array<{
    id: string;
    certificate_number: string;
    issued_at: string;
    course?: { title: string; category: string };
  }>;
}

export default function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [data, setData] = useState<PublicPortfolioPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portfolio/${encodeURIComponent(username)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error || "Portfolio unavailable");
        } else {
          setData(json);
        }
      })
      .catch(() => setErrorMsg("Failed to load portfolio."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06100C] flex items-center justify-center text-xs text-[#8FA69B]">
        Loading public portfolio...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#06100C] flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-[#143326] mx-auto" />
          <h1 className="text-lg font-bold text-[#F0FDF4]">Portfolio Not Available</h1>
          <p className="text-xs text-[#8FA69B]">{errorMsg}</p>
          <Link href="/">
            <Button size="sm" variant="gradient">Return to UnlockED</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { profile, projects, skills, certificates } = data;

  return (
    <div className="min-h-screen bg-[#06100C] text-[#E6F4EA] pb-20">
      <div className="bg-[#0A1913] border-b border-[#143326] py-2 px-4 text-center text-xs text-[#8FA69B] flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
        <span>UnlockED Verified Student Portfolio & Credential Record</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <Card className="p-6 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#0F271D] border-2 border-[#16382C] flex items-center justify-center text-2xl font-bold text-[#00DC82]">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
                    {profile.full_name}
                  </h1>
                  <Badge variant="emerald" dot>Candidate</Badge>
                </div>
                {profile.location && (
                  <p className="text-xs text-[#8FA69B] mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                    {profile.location}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-xs sm:text-sm text-[#8FA69B] mt-2 max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#07130E] border border-[#143326] text-[#00DC82]"
                >
                  GitHub
                </a>
              )}
              <Link href="/register">
                <Button size="sm" variant="gradient">Join UnlockED</Button>
              </Link>
            </div>
          </div>
        </Card>

        {skills.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#F0FDF4]">Recorded Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <Badge key={idx} variant={s.verified ? "emerald" : "outline"} dot={s.verified}>
                  {s.skill?.name} · {s.proficiency}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#F0FDF4]">Issued Track Certificates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <Card key={cert.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F0FDF4]">{cert.course?.title}</h3>
                    <p className="text-xs text-[#8FA69B] mt-0.5">
                      {cert.certificate_number} · Issued {formatDate(cert.issued_at)}
                    </p>
                  </div>
                  <Link href={`/verify/${cert.certificate_number}`}>
                    <Badge variant="emerald">
                      <Award className="w-3 h-3" /> Verify
                    </Badge>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#F0FDF4]">Published Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
              <Code2 className="w-12 h-12 text-[#143326] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#F0FDF4]">No public projects published yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="emerald">Published Project</Badge>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    </div>
                    {project.thumbnail_url && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-[#143326] bg-[#06100C] aspect-video relative">
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-[#F0FDF4]">{project.title}</h3>
                    <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">{project.description}</p>
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
                        className="inline-flex items-center gap-1 text-[#00DC82] hover:underline"
                      >
                        <Code2 className="w-3.5 h-3.5" /> Inspect Repo
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#22D3EE] hover:underline"
                      >
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
    </div>
  );
}
