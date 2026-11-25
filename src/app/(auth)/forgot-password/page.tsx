"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSending(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMsg("Unable to send reset link right now. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#06100C]">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#0A1913] border-[#143326] shadow-2xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#00DC82] border border-[#16382C] mx-auto flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-[#F0FDF4]">Password Recovery</h1>
          <p className="text-xs text-[#8FA69B] mt-1">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#07130E] border border-[#10B981]/40 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#00DC82] mx-auto" />
            <h3 className="text-sm font-semibold text-[#F0FDF4]">Reset Link Sent</h3>
            <p className="text-xs text-[#8FA69B]">
              If an account exists for <span className="text-[#F0FDF4]">{email}</span>, a recovery email has been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Account Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
            <Button
              type="submit"
              disabled={isSending}
              variant="gradient"
              className="w-full text-xs rounded-full"
            >
              {isSending ? "Sending..." : "Send Password Reset Link"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
