"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#06100C]">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-[#0A1913] border-[#143326] shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#00DC82] mx-auto flex items-center justify-center">
          <MailCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#F0FDF4]">Verify Your Email</h1>
        <p className="text-xs text-[#8FA69B] leading-relaxed">
          We sent a verification link{" "}
          {email ? (
            <>
              to <span className="text-[#F0FDF4] font-semibold">{email}</span>
            </>
          ) : (
            "to your email address"
          )}
          . Click the link to confirm your account and launch onboarding.
        </p>

        <div className="pt-4 border-t border-[#143326]">
          <Link href="/login">
            <Button variant="gradient" className="w-full text-xs gap-1.5 rounded-full">
              Return to Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#06100C] text-xs text-[#8FA69B]">
          Loading verification...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
