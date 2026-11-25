"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewJobPostingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<"full-time" | "part-time" | "contract" | "internship">("full-time");
  const [experienceLevel, setExperienceLevel] = useState<"entry" | "mid" | "senior">("entry");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [salaryMin, setSalaryMin] = useState("600000");
  const [salaryMax, setSalaryMax] = useState("1200000");
  const [isRemote, setIsRemote] = useState(false);
  const [skillsRequired, setSkillsRequired] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim() || "Remote",
          job_type: jobType,
          experience_level: experienceLevel,
          salary_currency: currency,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          is_remote: isRemote,
          skills_required: skillsRequired
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          requirements: requirementsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          description: description.trim(),
          application_deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to publish job.");
        setIsSaving(false);
        return;
      }

      router.push("/recruiter/jobs");
      router.refresh();
    } catch {
      setErrorMsg("Network error while publishing requisition.");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-20">
      <Link
        href="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Manage Jobs
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Publish New Job Requisition
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Published roles immediately become visible in the Student Opportunities feed.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
              Job Title
            </label>
            <Input
              required
              placeholder="e.g. Associate Full-Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Location</label>
              <Input
                required
                placeholder="Bengaluru / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Employment Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as typeof jobType)}
                className="w-full h-[42px] rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
              >
                <option value="full-time">Full-Time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Experience</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as typeof experienceLevel)}
                className="w-full h-[42px] rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                className="w-full h-[42px] rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
              >
                <option value="INR">INR (₹ Annual)</option>
                <option value="USD">USD ($ Annual)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Min Salary ({currency})
              </label>
              <Input
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Max Salary ({currency})
              </label>
              <Input
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Application Deadline (Optional)
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-[#E6F4EA] pt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
              />
              <span>Remote work eligible</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
              Required Skills (Comma Separated)
            </label>
            <Input
              required
              placeholder="TypeScript, Next.js, PostgreSQL, Docker"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
              Eligibility & Requirements (One per line)
            </label>
            <Textarea
              rows={3}
              placeholder="Experience building REST or GraphQL services&#10;Understanding of relational database indexing"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
              Role Overview & Responsibilities
            </label>
            <Textarea
              rows={5}
              required
              minLength={20}
              placeholder="Describe the engineering mission, technical scope, and team structure..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-[#143326] flex items-center justify-end gap-3">
            <Link href="/recruiter/jobs">
              <Button type="button" variant="secondary" size="sm" className="text-xs">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="gradient" size="sm" disabled={isSaving} className="text-xs">
              {isSaving ? "Publishing..." : "Publish Job"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
