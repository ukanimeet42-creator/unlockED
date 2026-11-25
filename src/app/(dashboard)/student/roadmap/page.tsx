"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Sparkles, CheckCircle2, Award, Terminal, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { CareerRoadmap } from "@/types";

export default function CareerRoadmapPage() {
  const { roadmaps, refreshWorkspace } = useAuth();
  const [targetRoleInput, setTargetRoleInput] = useState("Full-Stack Cloud Engineer");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null);
  const activeRoadmap = selectedRoadmap || roadmaps[0] || null;

  const handleGenerate = async (roleName?: string) => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: roleName || targetRoleInput || "Software Engineer",
          currentLevel: "Intermediate",
          timeCommitmentHoursPerWeek: weeklyHours,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Unable to generate AI roadmap right now.");
      } else if (json.record) {
        setSelectedRoadmap(json.record);
        await refreshWorkspace();
      }
    } catch {
      setErrorMsg("Network error generating roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePhaseStatus = async (
    phaseId: string,
    currentStatus: "not_started" | "in_progress" | "completed"
  ) => {
    if (!activeRoadmap) return;
    const nextStatus =
      currentStatus === "not_started"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "completed"
        : "not_started";

    const res = await fetch("/api/ai/roadmap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadmapId: activeRoadmap.id,
        phaseId,
        status: nextStatus,
      }),
    });
    const json = await res.json();
    if (res.ok && json.record) {
      setSelectedRoadmap(json.record);
      await refreshWorkspace();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Interactive Career Roadmap
            </h1>
            <Badge variant="emerald" dot>Saved to Profile</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            {activeRoadmap
              ? `Targeting: ${activeRoadmap.target_role} · Timeline: ${activeRoadmap.roadmap_data.estimated_completion}`
              : "Generate an AI-curated milestone plan persisted to your account."}
          </p>
        </div>

        {activeRoadmap && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={isGenerating}
              onClick={() => handleGenerate(activeRoadmap.target_role)}
              className="gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Recalibrating..." : "Regenerate Plan"}
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!activeRoadmap ? (
        <Card className="p-8 sm:p-12 max-w-xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center mx-auto text-[#10B981]">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#F0FDF4]">Generate Your Career Roadmap</h2>
            <p className="text-xs sm:text-sm text-[#8FA69B] mt-2 leading-relaxed">
              Specify your target role and weekly study hours to generate interactive learning phases and milestone projects.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div>
              <label className="text-xs font-semibold text-[#8FA69B] block mb-1">
                Target Engineering Role
              </label>
              <Input
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                placeholder="e.g. Cloud SRE, Full-Stack Developer, AI Engineer"
                className="bg-[#07130E] border-[#143326] text-[#F0FDF4]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8FA69B] block mb-1">
                Weekly Study Hours ({weeklyHours} hrs/week)
              </label>
              <Input
                type="number"
                min={2}
                max={60}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value) || 10)}
                className="bg-[#07130E] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            disabled={isGenerating}
            onClick={() => handleGenerate()}
            className="w-full gap-2 rounded-full"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Generating Roadmap..." : "Generate & Save Roadmap"}</span>
          </Button>
        </Card>
      ) : (
        <>
          <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-[#8FA69B]">Target Milestones:</span>
              {(activeRoadmap.roadmap_data.target_skills || []).map((badge, idx) => (
                <Badge key={idx} variant={idx === 0 ? "emerald" : "outline"} dot={idx === 0}>
                  <Award className="w-3 h-3" />
                  {badge}
                </Badge>
              ))}
            </div>
            <span className="text-[11px] text-[#5D7A6E]">Click phase badge to cycle status</span>
          </Card>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[#143326] before:z-0">
            {(activeRoadmap.roadmap_data.phases || []).map((phase, idx) => {
              const isInProgress = phase.status === "in_progress";
              const isDone = phase.status === "completed";

              return (
                <div key={phase.id} className="relative z-10 flex items-start gap-4">
                  <button
                    onClick={() => togglePhaseStatus(phase.id, phase.status)}
                    title="Click to update phase progress"
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold cursor-pointer transition-all ${
                      isDone
                        ? "bg-[#00DC82] border-[#00DC82] text-slate-950"
                        : isInProgress
                        ? "bg-[#10B981] border-[#10B981] text-slate-950 ring-4 ring-[#10B981]/20"
                        : "bg-[#07130E] border-[#143326] text-[#8FA69B] hover:border-[#10B981]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </button>

                  <Card
                    className={`flex-1 p-6 ${
                      isInProgress ? "bg-[#0D221A] border-[#10B981]/50" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#F0FDF4]">{phase.title}</h3>
                        <button
                          onClick={() => togglePhaseStatus(phase.id, phase.status)}
                          className="cursor-pointer"
                        >
                          <Badge
                            variant={isDone ? "emerald" : isInProgress ? "default" : "secondary"}
                          >
                            {isDone ? "Completed" : isInProgress ? "In Progress" : "Not Started"}
                          </Badge>
                        </button>
                      </div>
                      <span className="text-xs font-mono text-[#8FA69B]">
                        {phase.duration_weeks} Weeks
                      </span>
                    </div>

                    <p className="text-xs text-[#8FA69B] leading-relaxed">{phase.description}</p>

                    <div className="mt-4 pt-4 border-t border-[#143326] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-[#8FA69B] block mb-1.5">
                          Target Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {phase.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-[#07130E] text-[10px] text-[#A7F3D0] font-mono border border-[#143326]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-[#8FA69B] block mb-1.5">
                          Project Suggestions:
                        </span>
                        <ul className="space-y-1 text-[#E6F4EA]">
                          {phase.projects.map((p, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Terminal className="w-3 h-3 text-[#10B981]" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-semibold text-[#8FA69B] block mb-1.5">
                          Milestones:
                        </span>
                        <ul className="space-y-1 text-[#E6F4EA]">
                          {phase.milestones.map((m, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-[#00DC82]" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
