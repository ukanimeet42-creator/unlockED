"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderGit2, Star, Archive, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModeratedProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  is_public: boolean;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  student?: { id: string; full_name: string; email: string };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ModeratedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    const res = await fetch("/api/admin/projects", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setProjects(json.projects || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/projects", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.projects) setProjects(json.projects);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateProject = async (
    projectId: string,
    patch: Partial<Pick<ModeratedProject, "is_featured" | "status" | "is_public">>
  ) => {
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, ...patch }),
    });
    if (res.ok) loadProjects();
  };

  return (
    <div className="space-y-6 pb-20">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">Project Moderation</h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Feature standout learner projects or archive policy-violating submissions.
        </p>
      </div>

      {loading ? (
        <div className="h-40 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
      ) : projects.length === 0 ? (
        <Card className="p-16 text-center">
          <FolderGit2 className="w-12 h-12 text-[#143326] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#F0FDF4]">No student projects submitted yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={p.status === "published" ? "emerald" : "secondary"}>
                    {p.status}
                  </Badge>
                  {p.is_featured && <Badge variant="amber">Featured</Badge>}
                  <span className="text-xs text-[#8FA69B]">by {p.student?.full_name || "Learner"}</span>
                </div>
                <h2 className="text-base font-bold text-[#F0FDF4]">{p.title}</h2>
                <p className="text-xs text-[#8FA69B] line-clamp-2 max-w-2xl">{p.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={p.is_featured ? "amber" : "secondary"}
                  onClick={() => updateProject(p.id, { is_featured: !p.is_featured })}
                  className="gap-1.5 text-xs"
                >
                  <Star className="w-3.5 h-3.5" />
                  {p.is_featured ? "Unfeature" : "Feature"}
                </Button>
                <Button
                  size="sm"
                  variant={p.status === "published" ? "outline" : "gradient"}
                  onClick={() =>
                    updateProject(p.id, {
                      status: p.status === "published" ? "archived" : "published",
                    })
                  }
                  className="gap-1.5 text-xs"
                >
                  {p.status === "published" ? (
                    <>
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Restore
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
