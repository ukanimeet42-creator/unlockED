"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Award, ShieldCheck, Printer, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_COURSES } from "@/lib/data/mock-data";

export default function CertificatesPage() {
  const { user, completedLessons } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const hasCertificate = completedLessons.length >= 5;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Verified Platform Attestations
            </h1>
            <Badge variant="emerald" dot>
              Tamper-Proof
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Official cryptographic credentials awarded upon benchmark validation and code verification.
          </p>
        </div>

        {hasCertificate && (
          <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2 text-xs">
            <Printer className="w-4 h-4" />
            Print Verified Certificate
          </Button>
        )}
      </div>

      {!hasCertificate ? (
        <div className="max-w-xl mx-auto py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <Award className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No certificates earned yet</h3>
          <p className="text-sm text-[#8FA69B] mt-1">
            Complete a full technical curriculum track and pass the final AI benchmark evaluation to earn cryptographically verifiable attestations.
          </p>
          <div className="mt-5">
            <Button asChild size="sm" variant="gradient">
              <a href="/student/courses">Explore Curriculum</a>
            </Button>
          </div>
        </div>
      ) : (
        /* Main Certificate Card (Printable) */
        <div className="max-w-3xl mx-auto">
          <Card
            id="printable-certificate"
            className="p-8 sm:p-12 bg-[#0A1913] border-2 border-[#10B981]/50 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="border border-[#143326] p-8 sm:p-10 rounded-2xl relative z-10 text-center space-y-6">
              <div className="flex items-center justify-between border-b border-[#143326] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-[#F0FDF4]">
                    UnlockED
                  </span>
                </div>
                <Badge variant="emerald" dot>
                  Attestation Verified
                </Badge>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
                  Certificate of Technical Mastery
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F0FDF4] mt-2 tracking-tight">
                  {user?.full_name || "Learner"}
                </h2>
                <p className="text-xs text-[#8FA69B] mt-2 max-w-md mx-auto leading-relaxed">
                  has successfully completed all rigorous curricula, hands-on production code sandboxes, and AI-evaluated benchmark assessments.
                </p>
              </div>

              <div className="pt-8 border-t border-[#143326] flex items-center justify-between text-xs text-[#8FA69B]">
                <div className="text-left">
                  <p className="font-bold text-[#F0FDF4]">Evaluation Engine</p>
                  <p className="text-[10px]">Autonomous Code Verification</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#F0FDF4]">Issued: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                  <p className="text-[10px] font-mono text-[#00DC82]">STATUS: ACTIVE & VERIFIED</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
