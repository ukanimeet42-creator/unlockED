"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/context/auth-context";
import {
  Sparkles,
  Download,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ResumeData } from "@/types";

function makeBlankResume(name = "", email = "", location = "", github = "", linkedin = "", bio = ""): ResumeData {
  return {
    personal: {
      name,
      email,
      phone: "",
      location,
      website: "",
      linkedin,
      github,
      summary: bio,
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

export default function ResumeBuilderPage() {
  const { user, resumes, certificates, projects, refreshWorkspace } = useAuth();
  const primaryResume = resumes[0] || null;
  const builderKey = `${primaryResume?.id || "new"}-${primaryResume?.updated_at || user?.id || "guest"}`;

  return (
    <ResumeBuilderEditor
      key={builderKey}
      user={user}
      primaryResume={primaryResume}
      certificates={certificates}
      projects={projects}
      refreshWorkspace={refreshWorkspace}
    />
  );
}

function ResumeBuilderEditor({
  user,
  primaryResume,
  certificates,
  projects,
  refreshWorkspace,
}: {
  user: ReturnType<typeof useAuth>["user"];
  primaryResume: ReturnType<typeof useAuth>["resumes"][number] | null;
  certificates: ReturnType<typeof useAuth>["certificates"];
  projects: ReturnType<typeof useAuth>["projects"];
  refreshWorkspace: () => Promise<void>;
}) {
  const [resumeTitle, setResumeTitle] = useState(
    primaryResume?.title || "Primary Technical Resume"
  );
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [resumeData, setResumeData] = useState<ResumeData>(() =>
    primaryResume
      ? primaryResume.data
      : makeBlankResume(
          user?.full_name || "",
          user?.email || "",
          user?.location || "",
          user?.github_url || "",
          user?.linkedin_url || "",
          user?.bio || ""
        )
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    "modern-obsidian" | "clean-light" | "executive"
  >(
    (primaryResume?.template as "modern-obsidian" | "clean-light" | "executive") ||
      "modern-obsidian"
  );

  const [isPolishing, setIsPolishing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{
    targetExpIdx: number;
    original: string;
    improved: string;
    verbs: string[];
    scoreBefore: number;
    scoreAfter: number;
    reasoning: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: primaryResume?.id,
          title: resumeTitle,
          template: selectedTemplate,
          data: resumeData,
        }),
      });
      if (res.ok) {
        await refreshWorkspace();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiPolish = async (textToImprove: string, expIdx = 0) => {
    if (!textToImprove.trim()) {
      setAiError("Enter text in a bullet point or summary before enhancing.");
      return;
    }
    setAiError(null);
    setIsPolishing(true);
    try {
      const res = await fetch("/api/ai/resume-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: targetRole || "Software Engineer",
          textToImprove,
          type: "bullet_point",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error || "AI resume enhancement unavailable.");
      } else {
        setAiSuggestions({
          targetExpIdx: expIdx,
          original: json.data.originalText,
          improved: json.data.improvedText,
          verbs: json.data.actionVerbsAdded,
          scoreBefore: json.data.impactScoreBefore,
          scoreAfter: json.data.impactScoreAfter,
          reasoning: json.data.reasoning,
        });
      }
    } catch {
      setAiError("Network error while contacting AI resume assistant.");
    } finally {
      setIsPolishing(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestions) return;
    if (aiSuggestions.targetExpIdx === -1) {
      setResumeData((prev) => ({
        ...prev,
        personal: { ...prev.personal, summary: aiSuggestions.improved },
      }));
    } else {
      const nextExp = [...resumeData.experience];
      if (nextExp[aiSuggestions.targetExpIdx]) {
        nextExp[aiSuggestions.targetExpIdx].highlights[0] = aiSuggestions.improved;
        setResumeData({ ...resumeData, experience: nextExp });
      }
    }
    setAiSuggestions(null);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 48;
    const lineHeight = 14;
    const margin = 44;
    const maxWidth = 507;

    const addWrappedText = (text: string, fontSize = 10, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > 780) {
          doc.addPage();
          y = 48;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
    };

    addWrappedText(resumeData.personal.name || user?.full_name || "Resume", 18, true);
    y += 2;
    addWrappedText(
      [
        resumeData.personal.location,
        resumeData.personal.email,
        resumeData.personal.phone,
        resumeData.personal.github,
      ]
        .filter(Boolean)
        .join("  |  "),
      9
    );
    y += 10;

    if (resumeData.personal.summary) {
      addWrappedText("SUMMARY", 11, true);
      addWrappedText(resumeData.personal.summary, 10);
      y += 8;
    }

    if (resumeData.experience.length > 0) {
      addWrappedText("EXPERIENCE", 11, true);
      for (const exp of resumeData.experience) {
        addWrappedText(`${exp.title} - ${exp.company} (${exp.start_date} - ${exp.end_date || "Present"})`, 10, true);
        for (const h of exp.highlights.filter(Boolean)) {
          addWrappedText(`• ${h}`, 9);
        }
        y += 4;
      }
    }

    if (resumeData.projects.length > 0) {
      addWrappedText("PROJECTS", 11, true);
      for (const proj of resumeData.projects) {
        addWrappedText(`${proj.name}${proj.technologies.length ? ` (${proj.technologies.join(", ")})` : ""}`, 10, true);
        if (proj.description) addWrappedText(proj.description, 9);
        y += 4;
      }
    }

    if (resumeData.education.length > 0) {
      addWrappedText("EDUCATION", 11, true);
      for (const edu of resumeData.education) {
        addWrappedText(`${edu.degree} — ${edu.institution} (${edu.gpa || ""})`, 10, true);
        y += 2;
      }
    }

    if (resumeData.skills.length > 0) {
      addWrappedText("SKILLS", 11, true);
      for (const grp of resumeData.skills) {
        addWrappedText(`${grp.category}: ${grp.items.join(", ")}`, 9);
      }
    }

    if (resumeData.certifications.length > 0) {
      y += 6;
      addWrappedText("CERTIFICATIONS", 11, true);
      for (const cert of resumeData.certifications) {
        addWrappedText(`• ${cert.name} — ${cert.issuer} (${cert.date})`, 9);
      }
    }

    const safeName = (resumeData.personal.name || "unlockED-resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    doc.save(`${safeName}.pdf`);
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          title: "",
          company: "",
          location: "",
          start_date: "",
          end_date: "Present",
          current: true,
          description: "",
          highlights: [""],
        },
      ],
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          degree: "",
          institution: "",
          location: "",
          start_date: "",
          end_date: "",
          gpa: "",
          highlights: [],
        },
      ],
    }));
  };

  const addProject = () => {
    const firstUnadded = projects.find(
      (p) => !resumeData.projects.some((rp) => rp.name === p.title)
    );
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `proj-${Date.now()}`,
          name: firstUnadded?.title || "",
          description: firstUnadded?.description || "",
          technologies: firstUnadded?.technologies || [],
          url: firstUnadded?.github_url || firstUnadded?.live_url || "",
        },
      ],
    }));
  };

  const addSkillGroup = () => {
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, { category: "Core Stack", items: [] }],
    }));
  };

  const importVerifiedCerts = () => {
    const mapped = certificates.map((c) => ({
      id: c.id,
      name: c.course?.title || "UnlockED Certificate",
      issuer: `UnlockED (${c.certificate_number})`,
      date: c.issued_at.slice(0, 10),
      url: `/verify/${c.certificate_number}`,
    }));
    setResumeData((prev) => ({
      ...prev,
      certifications: mapped,
    }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Resume Builder
            </h1>
            <Badge variant="default">
              <Sparkles className="w-3 h-3" /> Saved & PDF Export
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Build, persist, AI-refine, and download clean engineering PDF resumes from your real profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={exportPdf} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
          <Button
            variant="gradient"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Resume"}
          </Button>
        </div>
      </div>

      {aiError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Target role + template */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 bg-[#0A1913] rounded-xl border border-[#143326] max-w-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B] px-2">
            Template:
          </span>
          {(["modern-obsidian", "clean-light", "executive"] as const).map((tpl) => (
            <button
              key={tpl}
              onClick={() => setSelectedTemplate(tpl)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer capitalize transition-all ${
                selectedTemplate === tpl
                  ? "bg-[#10B981] text-slate-950 font-bold"
                  : "text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              {tpl.replace("modern-", "")}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8FA69B] whitespace-nowrap">Resume Name:</span>
            <Input
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="Primary Resume"
              className="h-9 text-xs w-44"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8FA69B] whitespace-nowrap">Target Role:</span>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="h-9 text-xs w-48"
            />
          </div>
        </div>
      </div>

      {aiSuggestions && (
        <Card className="p-5 border-[#10B981] space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="emerald">
              AI Action-Verb Refinement (+{Math.max(0, aiSuggestions.scoreAfter - aiSuggestions.scoreBefore)}% clarity)
            </Badge>
            <button onClick={() => setAiSuggestions(null)} className="text-xs text-[#8FA69B] cursor-pointer">
              ✕ Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#07130E] border border-[#143326] text-[#8FA69B]">
              <span className="text-[10px] uppercase font-bold block mb-1">Original</span>
              &ldquo;{aiSuggestions.original}&rdquo;
            </div>
            <div className="p-3 rounded-xl bg-[#0F271D] border border-[#10B981]/40 text-[#F0FDF4]">
              <span className="text-[10px] uppercase font-bold text-[#00DC82] block mb-1">
                Enhanced Version
              </span>
              &ldquo;{aiSuggestions.improved}&rdquo;
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#8FA69B]">
              Verbs: <strong className="text-[#00DC82]">{aiSuggestions.verbs.join(", ")}</strong>
            </span>
            <Button size="sm" variant="gradient" onClick={applyAiSuggestion} className="text-xs gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Apply
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Editor */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#F0FDF4] border-b border-[#143326] pb-2">
              1. Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Full Name"
                value={resumeData.personal.name}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, name: e.target.value } })
                }
              />
              <Input
                placeholder="Email"
                value={resumeData.personal.email}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, email: e.target.value } })
                }
              />
              <Input
                placeholder="Phone"
                value={resumeData.personal.phone}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, phone: e.target.value } })
                }
              />
              <Input
                placeholder="Location"
                value={resumeData.personal.location}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, location: e.target.value } })
                }
              />
              <Input
                placeholder="GitHub URL"
                value={resumeData.personal.github}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, github: e.target.value } })
                }
              />
              <Input
                placeholder="LinkedIn URL"
                value={resumeData.personal.linkedin}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, linkedin: e.target.value } })
                }
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-[#8FA69B]">Professional Summary</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPolishing}
                  onClick={() => handleAiPolish(resumeData.personal.summary, -1)}
                  className="text-xs text-[#00DC82] h-7 gap-1"
                >
                  <Sparkles className="w-3 h-3" /> AI Enhance
                </Button>
              </div>
              <Textarea
                rows={3}
                placeholder="Concise summary of engineering strengths..."
                value={resumeData.personal.summary}
                onChange={(e) =>
                  setResumeData({ ...resumeData, personal: { ...resumeData.personal, summary: e.target.value } })
                }
              />
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#143326] pb-2">
              <h3 className="text-sm font-bold text-[#F0FDF4]">2. Experience ({resumeData.experience.length})</h3>
              <Button variant="secondary" size="sm" onClick={addExperience} className="text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Role
              </Button>
            </div>
            {resumeData.experience.map((exp, idx) => (
              <div key={exp.id} className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Role Title"
                    value={exp.title}
                    onChange={(e) => {
                      const next = [...resumeData.experience];
                      next[idx].title = e.target.value;
                      setResumeData({ ...resumeData, experience: next });
                    }}
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...resumeData.experience];
                      next[idx].company = e.target.value;
                      setResumeData({ ...resumeData, experience: next });
                    }}
                  />
                  <Input
                    placeholder="Start Date (e.g. Jan 2025)"
                    value={exp.start_date}
                    onChange={(e) => {
                      const next = [...resumeData.experience];
                      next[idx].start_date = e.target.value;
                      setResumeData({ ...resumeData, experience: next });
                    }}
                  />
                  <Input
                    placeholder="End Date"
                    value={exp.end_date || ""}
                    onChange={(e) => {
                      const next = [...resumeData.experience];
                      next[idx].end_date = e.target.value;
                      setResumeData({ ...resumeData, experience: next });
                    }}
                  />
                </div>
                <Textarea
                  rows={2}
                  placeholder="Key engineering accomplishment..."
                  value={exp.highlights[0] || ""}
                  onChange={(e) => {
                    const next = [...resumeData.experience];
                    next[idx].highlights[0] = e.target.value;
                    setResumeData({ ...resumeData, experience: next });
                  }}
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPolishing}
                    onClick={() => handleAiPolish(exp.highlights[0] || "", idx)}
                    className="text-xs text-[#00DC82] gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> AI Polish Bullet
                  </Button>
                  <button
                    onClick={() =>
                      setResumeData({
                        ...resumeData,
                        experience: resumeData.experience.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-[#8FA69B] hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#143326] pb-2">
              <h3 className="text-sm font-bold text-[#F0FDF4]">3. Projects ({resumeData.projects.length})</h3>
              <Button variant="secondary" size="sm" onClick={addProject} className="text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Project
              </Button>
            </div>
            {resumeData.projects.map((proj, idx) => (
              <div key={proj.id} className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Project Name"
                    value={proj.name}
                    onChange={(e) => {
                      const next = [...resumeData.projects];
                      next[idx].name = e.target.value;
                      setResumeData({ ...resumeData, projects: next });
                    }}
                  />
                  <button
                    onClick={() =>
                      setResumeData({
                        ...resumeData,
                        projects: resumeData.projects.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-[#8FA69B] hover:text-rose-400 px-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  placeholder="Tech stack (comma separated)"
                  value={proj.technologies.join(", ")}
                  onChange={(e) => {
                    const next = [...resumeData.projects];
                    next[idx].technologies = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setResumeData({ ...resumeData, projects: next });
                  }}
                />
                <Textarea
                  rows={2}
                  placeholder="Project architecture & impact"
                  value={proj.description}
                  onChange={(e) => {
                    const next = [...resumeData.projects];
                    next[idx].description = e.target.value;
                    setResumeData({ ...resumeData, projects: next });
                  }}
                />
              </div>
            ))}
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#143326] pb-2">
              <h3 className="text-sm font-bold text-[#F0FDF4]">4. Education & Skills</h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={addEducation} className="text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Edu
                </Button>
                <Button variant="secondary" size="sm" onClick={addSkillGroup} className="text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Skill Group
                </Button>
                {certificates.length > 0 && (
                  <Button variant="outline" size="sm" onClick={importVerifiedCerts} className="text-xs">
                    Sync Certs ({certificates.length})
                  </Button>
                )}
              </div>
            </div>

            {resumeData.education.map((edu, idx) => (
              <div key={edu.id} className="p-3 rounded-xl bg-[#07130E] border border-[#143326] grid grid-cols-3 gap-2">
                <Input
                  placeholder="Degree / Track"
                  value={edu.degree}
                  onChange={(e) => {
                    const next = [...resumeData.education];
                    next[idx].degree = e.target.value;
                    setResumeData({ ...resumeData, education: next });
                  }}
                />
                <Input
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => {
                    const next = [...resumeData.education];
                    next[idx].institution = e.target.value;
                    setResumeData({ ...resumeData, education: next });
                  }}
                />
                <Input
                  placeholder="Year / GPA"
                  value={edu.gpa}
                  onChange={(e) => {
                    const next = [...resumeData.education];
                    next[idx].gpa = e.target.value;
                    setResumeData({ ...resumeData, education: next });
                  }}
                />
              </div>
            ))}

            {resumeData.skills.map((sk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#07130E] border border-[#143326] grid grid-cols-3 gap-2">
                <Input
                  placeholder="Category"
                  value={sk.category}
                  onChange={(e) => {
                    const next = [...resumeData.skills];
                    next[idx].category = e.target.value;
                    setResumeData({ ...resumeData, skills: next });
                  }}
                />
                <Input
                  className="col-span-2"
                  placeholder="Comma-separated skills (TypeScript, PostgreSQL...)"
                  value={sk.items.join(", ")}
                  onChange={(e) => {
                    const next = [...resumeData.skills];
                    next[idx].items = e.target.value.split(",").map((x) => x.trim()).filter(Boolean);
                    setResumeData({ ...resumeData, skills: next });
                  }}
                />
              </div>
            ))}
          </Card>
        </div>

        {/* Live Preview */}
        <div className="sticky top-20">
          <div
            className={`p-8 rounded-2xl shadow-2xl border transition-all ${
              selectedTemplate === "clean-light"
                ? "bg-white text-slate-900 border-slate-200"
                : selectedTemplate === "executive"
                ? "bg-[#06100C] text-[#F0FDF4] border-[#16382C]"
                : "bg-[#0A1913] text-[#E6F4EA] border-[#143326]"
            }`}
          >
            <div className="border-b pb-4 mb-5 border-current/20">
              <h2 className="text-2xl font-bold">{resumeData.personal.name || "Your Name"}</h2>
              <p className="text-xs opacity-80 mt-1">
                {[resumeData.personal.location, resumeData.personal.email, resumeData.personal.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-mono mt-2 opacity-90">
                {resumeData.personal.github && <span>{resumeData.personal.github}</span>}
                {resumeData.personal.linkedin && <span>{resumeData.personal.linkedin}</span>}
              </div>
            </div>

            {resumeData.personal.summary && (
              <div className="mb-5 space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60">Summary</h4>
                <p className="text-xs leading-relaxed">{resumeData.personal.summary}</p>
              </div>
            )}

            {resumeData.experience.length > 0 && (
              <div className="mb-5 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60">Experience</h4>
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{exp.title} — {exp.company}</span>
                      <span className="opacity-70 font-mono">{exp.start_date} - {exp.end_date}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs opacity-90">
                      {exp.highlights.filter(Boolean).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {resumeData.projects.length > 0 && (
              <div className="mb-5 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60">Projects</h4>
                {resumeData.projects.map((p) => (
                  <div key={p.id} className="text-xs space-y-0.5">
                    <div className="font-semibold">{p.name}</div>
                    <p className="opacity-85">{p.description}</p>
                    {p.technologies.length > 0 && (
                      <p className="opacity-70 font-mono text-[11px]">{p.technologies.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {resumeData.education.length > 0 && (
              <div className="mb-5 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60">Education</h4>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="text-xs flex justify-between">
                    <span><strong>{edu.degree}</strong> · {edu.institution}</span>
                    <span className="font-mono opacity-75">{edu.gpa}</span>
                  </div>
                ))}
              </div>
            )}

            {resumeData.certifications.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60">Certifications</h4>
                {resumeData.certifications.map((c) => (
                  <div key={c.id} className="text-xs">
                    {c.name} — <span className="font-mono opacity-80">{c.issuer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
