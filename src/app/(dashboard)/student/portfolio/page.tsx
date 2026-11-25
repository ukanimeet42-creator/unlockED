"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  Code2,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

export default function PortfolioPage() {
  const { user, projects, refreshWorkspace } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [aiReviewingId, setAiReviewingId] = useState<string | null>(null);
  const [aiFeedbackById, setAiFeedbackById] = useState<Record<string, string>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTechnologies("");
    setGithubUrl("");
    setLiveUrl("");
    setThumbnailUrl("");
    setUploadError(null);
    setIsPublic(true);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setTechnologies(project.technologies.join(", "));
    setGithubUrl(project.github_url || "");
    setLiveUrl(project.live_url || "");
    setThumbnailUrl(project.thumbnail_url || "");
    setUploadError(null);
    setIsPublic(project.is_public);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || "Failed to upload project thumbnail.");
      } else if (json.url) {
        setThumbnailUrl(json.url);
      }
    } catch {
      setUploadError("Network error uploading thumbnail.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRequestAiFeedback = async (project: Project) => {
    setAiReviewingId(project.id);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/career-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: `Provide concise technical portfolio critique and recruiter impact framing for project "${project.title}": ${project.description}`,
          skills: project.technologies,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error || "AI project critique unavailable.");
      } else {
        setAiFeedbackById((prev) => ({
          ...prev,
          [project.id]:
            json.data?.summaryAdvice ||
            json.data?.suggestedPaths?.[0]?.reasoning ||
            "Reviewed.",
        }));
      }
    } catch {
      setAiError("Network error contacting AI assistant.");
    } finally {
      setAiReviewingId(null);
    }
  };

  const handleCopyPortfolioLink = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/${user.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        is_public: isPublic,
        status: "published",
      };

      const res = await fetch(
        editingId ? `/api/projects/${editingId}` : "/api/projects",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        await refreshWorkspace();
        setIsModalOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (project: Project) => {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !project.is_public }),
    });
    if (res.ok) await refreshWorkspace();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) await refreshWorkspace();
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Project Portfolio
            </h1>
            <Badge variant="emerald" dot>{projects.length} Saved</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Publish software repositories and live deployments visible to recruiters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.id && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPortfolioLink}
                className="gap-1.5 text-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00DC82]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied Link" : "Share URL"}
              </Button>
              <Link href={`/portfolio/${user.id}`} target="_blank">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Public Portfolio
                </Button>
              </Link>
            </>
          )}
          <Button
            variant="gradient"
            size="sm"
            onClick={openCreateModal}
            className="gap-1.5 text-xs rounded-full"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </Button>
        </div>
      </div>

      {aiError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <FolderGit2 className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No projects published yet</h3>
          <p className="text-sm text-[#8FA69B] mt-1">
            Add engineering projects with repositories and live links to showcase your work.
          </p>
          <Button onClick={openCreateModal} size="sm" variant="gradient" className="mt-4">
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={project.is_public ? "emerald" : "secondary"}>
                    {project.is_public ? "Public" : "Private"}
                  </Badge>
                  <button
                    onClick={() => toggleVisibility(project)}
                    className="text-xs text-[#8FA69B] hover:text-[#F0FDF4] inline-flex items-center gap-1 cursor-pointer"
                  >
                    {project.is_public ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{project.is_public ? "Visible" : "Hidden"}</span>
                  </button>
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

                <h3 className="text-lg font-bold text-[#F0FDF4] leading-snug">{project.title}</h3>
                <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">{project.description}</p>

                {aiFeedbackById[project.id] && (
                  <div className="mt-3 p-3 rounded-xl bg-[#07130E] border border-[#16382C] text-[11px] text-[#A7F3D0] leading-relaxed">
                    <span className="font-semibold text-[#00DC82] block mb-0.5">
                      AI Portfolio Critique:
                    </span>
                    {aiFeedbackById[project.id]}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-[#07130E] text-[11px] text-[#00DC82] font-mono border border-[#143326]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#143326] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#00DC82] hover:underline"
                    >
                      <Code2 className="w-3.5 h-3.5" /> GitHub
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={aiReviewingId === project.id}
                    onClick={() => handleRequestAiFeedback(project)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#07130E] border border-[#143326] text-[11px] text-[#22D3EE] hover:border-[#22D3EE]/50 cursor-pointer"
                    title="AI critique"
                  >
                    <Sparkles className={`w-3 h-3 ${aiReviewingId === project.id ? "animate-spin" : ""}`} />
                    {aiReviewingId === project.id ? "Reviewing..." : "AI Review"}
                  </button>
                  <button
                    onClick={() => openEditModal(project)}
                    className="text-[#8FA69B] hover:text-[#00DC82] p-1 cursor-pointer"
                    title="Edit project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-[#8FA69B] hover:text-rose-400 p-1 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#143326]">
              <h3 className="text-base font-bold text-[#F0FDF4]">
                {editingId ? "Edit Project" : "Add Portfolio Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8FA69B] hover:text-[#F0FDF4] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Title</label>
                <Input
                  required
                  placeholder="e.g. Distributed Task Queue Service"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                  Architecture & Outcomes
                </label>
                <Textarea
                  required
                  rows={3}
                  minLength={10}
                  placeholder="Describe problem solved, architecture, and key technologies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                  Technologies (Comma Separated)
                </label>
                <Input
                  placeholder="Next.js, TypeScript, PostgreSQL, Docker"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">GitHub URL</label>
                  <Input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Live URL</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#E6F4EA] block">
                  Project Cover Image (Supabase Storage)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#07130E] border border-[#143326] text-xs text-[#00DC82] hover:border-[#10B981] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {thumbnailUrl && (
                    <span className="text-[11px] text-[#8FA69B] truncate max-w-[220px]">
                      Image uploaded
                    </span>
                  )}
                </div>
                {uploadError && <p className="text-[11px] text-[#F87171]">{uploadError}</p>}
              </div>

              <label className="flex items-center gap-2 text-xs text-[#E6F4EA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>Make visible on public portfolio and recruiter search</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#143326]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Updates" : "Save Project"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
