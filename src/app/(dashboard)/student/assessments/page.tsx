"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Award, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface AssessmentSummary {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  skill_id: string | null;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
}

export default function AssessmentsHubPage() {
  const { assessmentAttempts } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assessments")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.assessments) setAssessments(json.assessments);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Skill Assessment Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Complete timed engineering benchmarks graded server-side and stored against your student record.
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-[#0F271D] to-[#0A1913] border-[#16382C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#00DC82] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#F0FDF4]">
                Server-Side Evaluation Engine
              </h3>
              <Badge variant="emerald" dot>Database Persisted</Badge>
            </div>
            <p className="text-xs text-[#8FA69B] mt-1 max-w-xl leading-relaxed">
              Answer keys never leave the server. Passing a track benchmark updates your skill profile and unlocks track certificate eligibility.
            </p>
          </div>
        </div>

        <Link href="/student/certificates">
          <Button variant="secondary" size="sm" className="text-xs shrink-0">
            View Certificates
          </Button>
        </Link>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F0FDF4]">Available Technical Benchmarks</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <Award className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No benchmarks published yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id} hoverEffect className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default">Server-Evaluated Benchmark</Badge>
                    <span className="text-xs font-mono text-[#8FA69B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                      {assessment.time_limit_minutes} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F0FDF4]">{assessment.title}</h3>
                  <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">
                    {assessment.description}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-[#8FA69B]">
                    <span>{assessment.total_questions} Questions</span>
                    <span>·</span>
                    <span className="text-[#00DC82]">
                      Passing Score: {assessment.passing_score}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#143326] flex items-center justify-between">
                  <span className="text-[11px] text-[#5D7A6E]">Recorded to profile</span>
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

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F0FDF4]">Attempt History</h2>
        {assessmentAttempts.length === 0 ? (
          <p className="text-xs text-[#5D7A6E] py-4">No completed benchmark attempts yet.</p>
        ) : (
          <div className="space-y-3">
            {assessmentAttempts.map((attempt) => {
              const matchedAssessment = assessments.find(
                (a) => a.id === attempt.assessment_id
              );

              return (
                <div
                  key={attempt.id}
                  className="p-4 rounded-2xl bg-[#0A1913] border border-[#143326] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        attempt.passed
                          ? "bg-[#10B981]/15 text-[#00DC82]"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {attempt.passed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F0FDF4]">
                        {matchedAssessment?.title || "Technical Benchmark"}
                      </h4>
                      <p className="text-[11px] text-[#8FA69B] mt-0.5">
                        Attempted {formatDate(attempt.completed_at || attempt.started_at)} ·{" "}
                        Time spent: {attempt.time_spent_seconds}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#F0FDF4]">
                        {attempt.percentage}%
                      </span>
                      <span className="block text-[10px] text-[#8FA69B]">
                        {attempt.score}/{attempt.total_points} pts
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
