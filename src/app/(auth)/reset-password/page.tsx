"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setDone(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch {
      setErrorMsg("Failed to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#06100C]">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#0A1913] border-[#143326] shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#00DC82] border border-[#16382C] mx-auto flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-[#F0FDF4]">Set New Password</h1>
          <p className="text-xs text-[#8FA69B] mt-1">
            Choose a strong password of at least 8 characters
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {done ? (
          <div className="p-4 rounded-xl bg-[#07130E] border border-[#10B981]/40 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#00DC82] mx-auto" />
            <p className="text-sm font-semibold text-[#F0FDF4]">Password Updated</p>
            <p className="text-xs text-[#8FA69B]">Redirecting to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                New Password
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
            </div>
            <Button
              type="submit"
              disabled={isSaving}
              variant="gradient"
              className="w-full text-xs rounded-full"
            >
              {isSaving ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
