"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (typeof document !== "undefined") {
      document.cookie = `unlocked_demo_role=${selectedRole}; path=/; max-age=86400; SameSite=Lax`;
    }
    setRole(selectedRole);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding");
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0B0B12] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6366F1]/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#151520] border-[#232336] shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mb-3 shadow-lg shadow-[#8B5CF6]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F3FF]">Create your account</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Join 18,500+ ambitious learners and top employers
          </p>
        </div>

        {/* Role selection tab */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2 text-center">
            I am joining as a
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedRole === "student"
                  ? "bg-[#1F1F26] border-[#8B5CF6] text-white"
                  : "bg-[#101018] border-[#232336] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              <span className="font-bold block text-sm">Learner / Student</span>
              <span className="text-[11px] text-[#94A3B8] mt-0.5 block">
                Learn, build projects & get hired
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("recruiter")}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedRole === "recruiter"
                  ? "bg-[#1F1F26] border-[#6366F1] text-white"
                  : "bg-[#101018] border-[#232336] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              <span className="font-bold block text-sm">Hiring Partner</span>
              <span className="text-[11px] text-[#94A3B8] mt-0.5 block">
                Discover verified technical talent
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#E4E1EC] block mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E4E1EC] block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E4E1EC] block mb-1.5">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="pl-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="gradient"
            className="w-full mt-2"
          >
            {isLoading ? "Creating Account..." : "Continue to Onboarding"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#8B5CF6] hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}
