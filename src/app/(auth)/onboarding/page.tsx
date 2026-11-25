"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";

type OnboardingRole = "student" | "recruiter";

export default function OnboardingPage() {
  const { user, role, refreshWorkspace } = useAuth();
  return <OnboardingForm key={`${user?.id || "guest"}-${role || "student"}`} user={user} initialRole={role} refreshWorkspace={refreshWorkspace} />;
}

function OnboardingForm({
  user,
  initialRole,
  refreshWorkspace,
}: {
  user: ReturnType<typeof useAuth>["user"];
  initialRole: ReturnType<typeof useAuth>["role"];
  refreshWorkspace: () => Promise<void>;
}) {
  const router = useRouter();
  const role = initialRole;
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>(
    role === "recruiter" ? "recruiter" : "student"
  );
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const interestOptions = [
    "Full-Stack TypeScript / Next.js",
    "Go Microservices",
    "AI & RAG Engineering",
    "Kubernetes & Cloud SRE",
    "PostgreSQL & Redis",
    "Cybersecurity",
    "Product Engineering",
    "DevOps Automation",
  ];

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg("Full name must be at least 2 characters.");
      return;
    }

    if (selectedRole === "recruiter" && companyName.trim().length < 2) {
      setErrorMsg("Please enter your organization / company name.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          full_name: fullName.trim(),
          location: location.trim() || undefined,
          bio: bio.trim() || undefined,
          interests: selectedInterests,
          company_name: selectedRole === "recruiter" ? companyName.trim() : undefined,
          company_industry:
            selectedRole === "recruiter" ? companyIndustry.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to complete onboarding.");
        setIsSaving(false);
        return;
      }

      await refreshWorkspace();
      const targetRole = json.profile?.role || selectedRole;
      router.push(
        targetRole === "admin"
          ? "/admin"
          : targetRole === "recruiter"
          ? "/recruiter"
          : "/student"
      );
      router.refresh();
    } catch {
      setErrorMsg("Network error while saving onboarding profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#06100C]">
      <Card className="w-full max-w-xl p-6 sm:p-8 bg-[#0A1913] border-[#143326] shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#143326]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#22D3EE] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F0FDF4]">Complete Your Profile</h1>
            <p className="text-xs text-[#8FA69B]">
              Save your account details to initialize your UnlockED workspace
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFinish} className="space-y-5">
          {role !== "admin" && (
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRole === "student"
                      ? "bg-[#0F271D] border-[#00DC82] text-[#F0FDF4]"
                      : "bg-[#06100C] border-[#143326] text-[#8FA69B]"
                  }`}
                >
                  <span className="font-semibold block">Student / Learner</span>
                  <span className="text-[11px] text-[#8FA69B]">
                    Learn, build projects & apply to roles
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("recruiter")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRole === "recruiter"
                      ? "bg-[#0F271D] border-[#22D3EE] text-[#F0FDF4]"
                      : "bg-[#06100C] border-[#143326] text-[#8FA69B]"
                  }`}
                >
                  <span className="font-semibold block">Recruiter / Employer</span>
                  <span className="text-[11px] text-[#8FA69B]">
                    Post jobs & evaluate candidate proof
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
                Full Name
              </label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country (or Remote)"
                className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          {selectedRole === "recruiter" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#07130E] border border-[#143326]">
              <div>
                <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
                  Company Name
                </label>
                <Input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Systems"
                  className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
                  Industry
                </label>
                <Input
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  placeholder="e.g. FinTech, Cloud SaaS"
                  className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#E6F4EA] block mb-1.5">
              Background & Goals
            </label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                selectedRole === "recruiter"
                  ? "Describe your team and the roles you hire for..."
                  : "Share your background, current experience, and target engineering roles..."
              }
              className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
            />
          </div>

          {selectedRole === "student" && (
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-2">
                Technical Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#10B981]/20 border-[#00DC82] text-[#00DC82]"
                          : "bg-[#06100C] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSaving}
            variant="gradient"
            className="w-full gap-2 rounded-full"
          >
            {isSaving ? "Saving Workspace..." : "Save & Open Workspace"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
