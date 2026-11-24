"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { UserRole } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, role, setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role || "student");
  const [bio, setBio] = useState(
    "Transitioning from operations into Cloud SRE and Backend Systems. Highly motivated by distributed concurrency and automated cluster resilience."
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Cloud Architecture",
    "Go Microservices",
    "Kubernetes & Docker",
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const interestOptions = [
    "Cloud Architecture",
    "Go Microservices",
    "Kubernetes & Docker",
    "AI & Vector Databases",
    "React & Next.js",
    "PostgreSQL & Caching",
    "Site Reliability & Telemetry",
    "Cybersecurity",
  ];

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (typeof document !== "undefined") {
      document.cookie = `unlocked_demo_role=${selectedRole}; path=/; max-age=86400; SameSite=Lax`;
    }
    setRole(selectedRole);
    setTimeout(() => {
      setIsSaving(false);
      if (selectedRole === "student") router.push("/student");
      else if (selectedRole === "recruiter") router.push("/recruiter");
      else router.push("/admin");
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0B0B12]">
      <Card className="w-full max-w-xl p-6 sm:p-8 bg-[#151520] border-[#232336] shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#232336]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F3FF]">Profile Onboarding</h1>
            <p className="text-xs text-[#94A3B8]">
              Personalize your AI career pathfinder and matching recommendations
            </p>
          </div>
        </div>

        <form onSubmit={handleFinish} className="space-y-6">
          {/* Workspace Role */}
          <div>
            <label className="text-xs font-semibold text-[#E4E1EC] block mb-2">
              Confirm Primary Role
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRole("student")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === "student"
                    ? "bg-[#1F1F26] border-[#8B5CF6] text-white"
                    : "bg-[#101018] border-[#232336] text-[#94A3B8]"
                }`}
              >
                <span className="font-semibold block">Student / Learner</span>
                <span className="text-[11px] text-[#94A3B8]">
                  Learn, build projects & unlock jobs
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("recruiter")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === "recruiter"
                    ? "bg-[#1F1F26] border-[#6366F1] text-white"
                    : "bg-[#101018] border-[#232336] text-[#94A3B8]"
                }`}
              >
                <span className="font-semibold block">Recruiter / Employer</span>
                <span className="text-[11px] text-[#94A3B8]">
                  Hire pre-assessed technical candidates
                </span>
              </button>
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="text-xs font-semibold text-[#E4E1EC] block mb-1.5">
              Professional Bio & Ambition
            </label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your background, career goals, or technical focus..."
            />
            <p className="text-[11px] text-[#64748B] mt-1">
              Used by the AI Pathfinder to calculate transferable engineering strengths.
            </p>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="text-xs font-semibold text-[#E4E1EC] block mb-2">
              Primary Technical Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#D0BCFF]"
                        : "bg-[#101018] border-[#232336] text-[#94A3B8] hover:text-[#F5F3FF]"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            variant="gradient"
            className="w-full gap-2"
          >
            {isSaving ? "Setting Up Workspace..." : "Complete Setup & Launch Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
