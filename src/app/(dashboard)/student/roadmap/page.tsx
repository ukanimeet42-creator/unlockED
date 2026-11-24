"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Terminal,
  ArrowRight,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PersonalizedRoadmap } from "@/lib/ai/roadmap";

export default function CareerRoadmapPage() {
  const { user } = useAuth();
  const [targetRoleInput, setTargetRoleInput] = useState("Full-Stack Cloud Engineer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(null);

  const handleGenerate = async (roleName?: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: roleName || targetRoleInput || "Cloud Infrastructure SRE",
          currentLevel: "Beginner / Career Switcher",
          timeCommitmentHoursPerWeek: 15,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setRoadmap(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Personalized Career Roadmap
            </h1>
            <Badge variant="emerald" dot>
              AI Calibrated
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            {roadmap
              ? `Targeting: ${roadmap.targetRole} · Timeline: ${roadmap.estimatedWeeksTotal} Weeks`
              : "Generate an AI-curated milestone plan customized to your target engineering discipline."}
          </p>
        </div>

        {roadmap && (
          <Button
            variant="secondary"
            size="sm"
            disabled={isGenerating}
            onClick={() => handleGenerate(roadmap.targetRole)}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Recalibrating..." : "Recalibrate Plan"}
          </Button>
        )}
      </div>

      {!roadmap ? (
        <Card className="p-8 sm:p-12 bg-[#0A1913] border-[#143326] max-w-xl mx-auto text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center mx-auto text-[#10B981]">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#F0FDF4]">
              Generate Your AI Career Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-[#8FA69B] mt-2 leading-relaxed">
              Our AI engine maps out step-by-step phases, required competencies, sandbox capstone projects, and benchmark verification milestones.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-xs font-semibold text-[#8FA69B] block">
              What engineering role are you aiming for?
            </label>
            <Input
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              placeholder="e.g. Cloud SRE, Backend Go Engineer, Full-Stack Developer..."
              className="bg-[#07130E] border-[#143326] text-[#F0FDF4]"
            />
          </div>

          <Button
            variant="gradient"
            size="lg"
            disabled={isGenerating}
            onClick={() => handleGenerate()}
            className="w-full gap-2 rounded-full"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Generating Custom Curriculum..." : "Generate Custom Roadmap"}</span>
          </Button>
        </Card>
      ) : (
        <>
          {/* Badges Strip */}
          <Card className="p-5 bg-[#0A1913] border-[#143326] flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold text-[#8FA69B]">Target Attestation Badges:</span>
            <div className="flex flex-wrap gap-2">
              {roadmap.milestoneBadges.map((badge, idx) => (
                <Badge key={idx} variant={idx === 0 ? "emerald" : "outline"} dot={idx === 0}>
                  <Award className="w-3 h-3" />
                  {badge}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Step by Step Phases */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[#143326] before:z-0">
            {roadmap.phases.map((phase, idx) => {
              const isInProgress = phase.status === "in_progress";
              const isDone = phase.status === "completed";

              return (
                <div key={phase.id} className="relative z-10 flex items-start gap-4">
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                      isDone
                        ? "bg-[#00DC82] border-[#00DC82] text-slate-950"
                        : isInProgress
                        ? "bg-[#10B981] border-[#10B981] text-slate-950 shadow-lg shadow-[#10B981]/30 ring-4 ring-[#10B981]/20"
                        : "bg-[#07130E] border-[#143326] text-[#8FA69B]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  {/* Phase Card */}
                  <Card
                    className={`flex-1 p-6 ${
                      isInProgress
                        ? "bg-[#0D221A] border-[#10B981]/50 shadow-xl"
                        : "bg-[#0A1913] border-[#143326]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#F0FDF4]">
                          {phase.title}
                        </h3>
                        <Badge
                          variant={
                            isDone ? "emerald" : isInProgress ? "default" : "secondary"
                          }
                        >
                          {isDone ? "Completed" : isInProgress ? "In Progress" : "Upcoming"}
                        </Badge>
                      </div>
                      <span className="text-xs font-mono text-[#8FA69B]">
                        {phase.duration_weeks} Weeks
                      </span>
                    </div>

                    <p className="text-xs text-[#8FA69B] leading-relaxed">
                      {phase.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#143326] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-[#8FA69B] block mb-1.5">
                          Target Competencies:
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
                          Hands-on Project Capstone:
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
                          Attestation Milestone:
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
