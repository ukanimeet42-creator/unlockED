"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Award, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_ASSESSMENTS, INITIAL_SKILLS } from "@/lib/data/mock-data";
import { formatDate } from "@/lib/utils";

export default function AssessmentsHubPage() {
  const { assessmentAttempts } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
          Skill Assessment Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Prove your engineering competency through rigorous, timed technical benchmarks evaluated by AI.
        </p>
      </div>

      {/* Top Attestation Callout */}
      <Card className="p-6 bg-gradient-to-r from-[#1C1C2B] to-[#151520] border-[#8B5CF6]/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#F5F3FF]">
                Tamper-Proof Verification Protocol
              </h3>
              <Badge variant="emerald" dot>Active</Badge>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
              Passed benchmarks produce cryptographic scorecards with immutable attestation hashes visible directly to partner recruiters.
            </p>
          </div>
        </div>

        <Link href="/student/portfolio">
          <Button variant="secondary" size="sm" className="text-xs shrink-0">
            View Public Badge
          </Button>
        </Link>
      </Card>

      {/* Benchmark Catalog */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F5F3FF]">Available Technical Benchmarks</h2>
        {INITIAL_ASSESSMENTS.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <Award className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No benchmarks available yet</h3>
            <p className="text-sm text-[#8FA69B] mt-1">Skill evaluations will appear here as curriculum tracks are published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_ASSESSMENTS.map((assessment) => (
              <Card
                key={assessment.id}
                hoverEffect
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default">Engineering Benchmark</Badge>
                    <span className="text-xs font-mono text-[#94A3B8] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {assessment.time_limit_minutes} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F3FF]">
                    {assessment.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                    {assessment.description}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-[#94A3B8]">
                    <span>{assessment.total_questions} Questions</span>
                    <span>·</span>
                    <span className="text-[#22C55E]">
                      Passing Threshold: {assessment.passing_score}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    Calculated server-side
                  </span>
                  <Link href={`/student/assessments/${assessment.id}`}>
                    <Button size="sm" variant="gradient" className="gap-1.5 text-xs">
                      Start Assessment <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Attempt History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F5F3FF]">Attempt History</h2>
        {assessmentAttempts.length === 0 ? (
          <p className="text-xs text-[#64748B] py-4">No completed attempts yet.</p>
        ) : (
          <div className="space-y-3">
            {assessmentAttempts.map((attempt) => {
              const matchedAssessment = INITIAL_ASSESSMENTS.find(
                (a) => a.id === attempt.assessment_id
              );

              return (
                <div
                  key={attempt.id}
                  className="p-4 rounded-2xl bg-[#101018] border border-[#232336] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        attempt.passed
                          ? "bg-[#22C55E]/15 text-[#22C55E]"
                          : "bg-[#EF4444]/15 text-[#EF4444]"
                      }`}
                    >
                      {attempt.passed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F3FF]">
                        {matchedAssessment?.title || "Technical Benchmark"}
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        Attempted on {formatDate(attempt.completed_at || attempt.started_at)} · Time spent: {attempt.time_spent_seconds}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#F5F3FF]">
                        {attempt.percentage}%
                      </span>
                      <span className="block text-[10px] text-[#94A3B8]">
                        Score: {attempt.score}/{attempt.total_points} pts
                      </span>
                    </div>

                    <Badge variant={attempt.passed ? "emerald" : "error"}>
                      {attempt.passed ? "PASSED" : "FAILED"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
