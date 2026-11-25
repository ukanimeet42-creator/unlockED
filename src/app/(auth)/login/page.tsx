"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Lock, Mail, AlertCircle, ShieldCheck } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshWorkspace } = useAuth();
  const supabase = createClient();

  const redirectTo = searchParams.get("redirectTo");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(
    urlError === "suspended"
      ? "This account has been suspended by a platform administrator."
      : urlError === "auth_callback_failed"
      ? "Email confirmation link expired or is invalid. Please sign in or request a new link."
      : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (data.user.user_metadata?.account_status === "suspended") {
        await supabase.auth.signOut();
        setErrorMsg("Your account is currently suspended. Contact an administrator.");
        setIsLoading(false);
        return;
      }

      await refreshWorkspace();

      // Determine authorized landing route from server profile
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.ok) {
        const meJson = await meRes.json();
        const role = meJson.profile?.role;
        const onboarded = meJson.profile?.onboarding_completed;

        if (!onboarded) {
          router.push("/onboarding");
          router.refresh();
          return;
        }

        if (redirectTo && redirectTo.startsWith("/")) {
          router.push(redirectTo);
          router.refresh();
          return;
        }

        if (role === "admin") router.push("/admin");
        else if (role === "recruiter") router.push("/recruiter");
        else router.push("/student");
        router.refresh();
      } else {
        router.push("/student");
        router.refresh();
      }
    } catch {
      setErrorMsg("Unable to reach authentication service. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#06100C] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-gradient-to-tr from-[#10B981]/20 via-[#059669]/10 to-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#0A1913] border-[#143326] shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#22D3EE] flex items-center justify-center mb-3 shadow-lg shadow-[#10B981]/25">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-[#F0FDF4]">Sign in to UnlockED</h1>
          <p className="text-xs text-[#8FA69B] mt-1">
            Role-verified access to Student, Recruiter, or Admin workspaces
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#E6F4EA] block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3" />
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="pl-9 bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#E6F4EA]">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#00DC82] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3" />
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
            {isLoading ? "Verifying Session..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-5 p-3 rounded-xl bg-[#07130E] border border-[#143326] flex items-center gap-2 text-[11px] text-[#8FA69B]">
          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>
            Sessions are authenticated server-side with PostgreSQL role permissions.
          </span>
        </div>

        <p className="mt-6 text-center text-xs text-[#8FA69B]">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-[#00DC82] hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#06100C] text-xs text-[#8FA69B]">
          Loading sign-in portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
