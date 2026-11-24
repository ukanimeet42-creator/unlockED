"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Mail } from "lucide-react";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [email, setEmail] = useState("alex.chen@unlocked.edu");
  const [password, setPassword] = useState("••••••••••••");
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
      if (selectedRole === "student") router.push("/student");
      else if (selectedRole === "recruiter") router.push("/recruiter");
      else router.push("/admin");
    }, 300);
  };

  const handleDemoFill = (roleChoice: UserRole) => {
    setSelectedRole(roleChoice);
    if (roleChoice === "student") {
      setEmail("alex.chen@unlocked.edu");
    } else if (roleChoice === "recruiter") {
      setEmail("david.vance@finscale.example.com");
    } else {
      setEmail("admin@unlocked.edu");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0B0B12] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#151520] border-[#232336] shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mb-3 shadow-lg shadow-[#8B5CF6]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F3FF]">Welcome to UnlockED</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Access your verified learning & career dashboard
          </p>
        </div>

        {/* Demo Fast Login Switcher */}
        <div className="mb-6 p-3 rounded-xl bg-[#101018] border border-[#232336]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-2 text-center">
            Instant Demo Account Sign-In
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill("student")}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                selectedRole === "student"
                  ? "bg-[#8B5CF6] text-white shadow-sm"
                  : "bg-[#151520] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("recruiter")}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                selectedRole === "recruiter"
                  ? "bg-[#6366F1] text-white shadow-sm"
                  : "bg-[#151520] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("admin")}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                selectedRole === "admin"
                  ? "bg-[#22C55E] text-slate-950 font-bold shadow-sm"
                  : "bg-[#151520] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#E4E1EC] block mb-1.5">
              Work or Student Email
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#E4E1EC]">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#8B5CF6] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
            {isLoading ? "Authenticating..." : `Sign In as ${selectedRole.toUpperCase()}`}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#232336]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#151520] px-2 text-[#64748B]">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2 text-xs"
          onClick={() => {
            setRole("student");
            router.push("/student");
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.96 0 12s.45 3.83 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Continue with Google</span>
        </Button>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Don't have an account yet?{" "}
          <Link href="/register" className="text-[#8B5CF6] hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
