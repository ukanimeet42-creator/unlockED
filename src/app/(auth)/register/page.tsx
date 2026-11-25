"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Mail, Lock, User, AlertCircle } from "lucide-react";

type PublicSignupRole = "student" | "recruiter";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshWorkspace } = useAuth();
  const supabase = createClient();

  const initialRole: PublicSignupRole =
    searchParams.get("role") === "recruiter" ? "recruiter" : "student";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<PublicSignupRole>(initialRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback?next=/onboarding`,
          data: {
            full_name: fullName.trim(),
            requested_role: selectedRole,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        await refreshWorkspace();
        router.push("/onboarding");
        router.refresh();
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }
    } catch {
      setErrorMsg("Registration failed due to a network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#06100C] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-gradient-to-tr from-[#059669]/20 via-[#10B981]/10 to-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#0A1913] border-[#143326] shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#22D3EE] flex items-center justify-center mb-3 shadow-lg shadow-[#10B981]/25">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-[#F0FDF4]">Create your account</h1>
          <p className="text-xs text-[#8FA69B] mt-1">
            Learn technical skills, prove projects, and connect with hiring partners
          </p>
        </div>

        {/* Public Account Role Selector (Student or Recruiter ONLY — Admin never selectable publicly) */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-[#8FA69B] uppercase tracking-wider block mb-2 text-center">
            I am joining as a
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === "student"
                  ? "bg-[#0F271D] border-[#00DC82] text-[#F0FDF4]"
                  : "bg-[#06100C] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              <span className="font-bold block text-sm">Learner / Student</span>
              <span className="text-[11px] text-[#8FA69B] mt-0.5 block">
                Learn, build projects & get hired
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("recruiter")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === "recruiter"
                  ? "bg-[#0F271D] border-[#22D3EE] text-[#F0FDF4]"
                  : "bg-[#06100C] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              <span className="font-bold block text-sm">Hiring Partner</span>
              <span className="text-[11px] text-[#8FA69B] mt-0.5 block">
                Post roles & hire talent
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#E6F4EA] block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3" />
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="pl-9 bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E6F4EA] block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="pl-9 bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E6F4EA] block mb-1.5">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3" />
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="pl-9 bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E6F4EA] block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3" />
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="pl-9 bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="gradient"
            className="w-full mt-2 rounded-full"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#8FA69B]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00DC82] hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#06100C] text-xs text-[#8FA69B]">
          Loading registration...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
