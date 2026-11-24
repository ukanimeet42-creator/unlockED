"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Star,
  Trash2,
  Edit3,
  Sparkles,
  Code2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { INITIAL_PROJECTS } from "@/lib/data/mock-data";
import { Project } from "@/types";

export default function PortfolioPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProject: Project = {
      id: `p-${Date.now()}`,
      student_id: user?.id || "student-demo-id",
      title,
      description,
      short_description: description.slice(0, 100) + "...",
      thumbnail_url:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      images: [],
      technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
      github_url: githubUrl || null,
      live_url: liveUrl || null,
      is_public: true,
      is_featured: false,
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setGithubUrl("");
    setLiveUrl("");
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
              Project Portfolio & Proof
            </h1>
            <Badge variant="emerald" dot>
              AI Verified Code
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Real software systems with verifiable repository history and production tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/portfolio/alexchen" target="_blank">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Portfolio View
            </Button>
          </Link>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <FolderGit2 className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No projects published yet</h3>
          <p className="text-sm text-[#8FA69B] mt-1">Add capstone projects and production repositories to showcase your abilities.</p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" variant="gradient" className="mt-4">
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              hoverEffect
              className="p-6 flex flex-col justify-between overflow-hidden relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={project.is_featured ? "emerald" : "default"}>
                    {project.is_featured ? "Featured Capstone" : "Production System"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#22C55E] flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Attestation
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#F5F3FF] leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-[#1F1F26] text-[11px] text-[#CBC3D7] font-mono border border-[#2A2931]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#D0BCFF] hover:underline"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#22C55E] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 bg-[#151520] border-[#232336] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232336]">
              <h3 className="text-base font-bold text-[#F5F3FF]">Add Production Project</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F5F3FF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                  Project Title
                </label>
                <Input
                  required
                  placeholder="e.g. Distributed Consensus Engine"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                  Technical Architecture & Description
                </label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Explain architectural decisions, concurrency safety, telemetry, and metrics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                  Technologies (Comma Separated)
                </label>
                <Input
                  placeholder="Go, Kubernetes, Prometheus, Redis, PostgreSQL"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                    GitHub URL
                  </label>
                  <Input
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                    Live Demo URL
                  </label>
                  <Input
                    placeholder="https://demo..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232336]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  Publish to Portfolio
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
