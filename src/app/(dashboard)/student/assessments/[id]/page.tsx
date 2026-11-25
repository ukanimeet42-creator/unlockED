"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface SafeQuestion {
  id: string;
  question: string;
  options: string[];
  points: number;
}

interface SafeAssessment {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  questions: SafeQuestion[];
}

interface SubmitResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  breakdown: {
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    pointsPossible: number;
    explanation: string;
  }[];
  certificateNumber: string | null;
  message: string;
}

export default function AssessmentTakingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { refreshWorkspace } = useAuth();

  const [assessment, setAssessment] = useState<SafeAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    fetch(`/api/assessments/${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.assessment) {
          setAssessment(json.assessment);
          setTimeLeftSeconds((json.assessment.time_limit_minutes || 15) * 60);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (!assessment || isSubmitting || result) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const elapsed = Math.max(
        0,
        assessment.time_limit_minutes * 60 - timeLeftSeconds
      );
      const res = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          answers: selectedAnswers,
          timeSpentSeconds: elapsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Evaluation error.");
      } else {
        setResult(data);
        await refreshWorkspace();
      }
    } catch {
      setSubmitError("Submission error. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }, [assessment, isSubmitting, result, selectedAnswers, timeLeftSeconds, refreshWorkspace]);

  const submitRef = React.useRef(handleSubmit);
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Countdown effect MUST always be called before conditional returns
  useEffect(() => {
    if (!assessment || result) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assessment, result]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-xs text-[#8FA69B]">
        Preparing server-scored benchmark...
      </div>
    );
  }

  if (!assessment || assessment.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/student/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Skill Benchmark
        </Link>
        <div className="p-12 rounded-3xl bg-[#0A1913] border border-[#143326] text-center">
          <Award className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0FDF4]">Assessment not found</h2>
        </div>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-[#143326]">
        <Link
          href="/student/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Assessment
        </Link>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs font-bold ${
            timeLeftSeconds < 120
              ? "bg-rose-950/50 border-rose-500 text-rose-400 animate-pulse"
              : "bg-[#0A1913] border-[#143326] text-[#F0FDF4]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {submitError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
          {submitError}
        </div>
      )}

      {!result ? (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#143326]">
            <div>
              <span className="text-xs font-semibold text-[#00DC82] uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </span>
              <h2 className="text-base font-bold text-[#F0FDF4] mt-1">{assessment.title}</h2>
            </div>
            <Badge variant="secondary">{currentQ.points} Points</Badge>
          </div>

          <div className="text-sm sm:text-base font-medium text-[#F0FDF4] leading-relaxed">
            {currentQ.question}
          </div>

          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() =>
                    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }))
                  }
                  className={`flex items-start gap-3 w-full p-4 rounded-xl text-left text-xs sm:text-sm transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#0F271D] border-[#00DC82] text-[#F0FDF4]"
                      : "bg-[#07130E] border-[#143326] text-[#8FA69B] hover:border-[#10B981]/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isSelected
                        ? "border-[#00DC82] bg-[#00DC82] text-slate-950"
                        : "border-[#16382C] text-[#8FA69B]"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="flex-1 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[#143326]">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((p) => p - 1)}
              className="text-xs"
            >
              Previous
            </Button>

            {currentQuestionIndex < assessment.questions.length - 1 ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setCurrentQuestionIndex((p) => p + 1)}
                className="text-xs"
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="text-xs"
              >
                {isSubmitting ? "Scoring On Server..." : "Submit Assessment"}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 sm:p-10 text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              result.passed
                ? "bg-[#10B981]/15 text-[#00DC82]"
                : "bg-rose-500/15 text-rose-400"
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <AlertCircle className="w-8 h-8" />
            )}
          </div>

          <div>
            <Badge variant={result.passed ? "emerald" : "error"} className="mb-2">
              {result.passed ? "BENCHMARK PASSED" : "NEEDS IMPROVEMENT"}
            </Badge>
            <h2 className="text-2xl font-bold text-[#F0FDF4]">Assessment Complete</h2>
            <p className="text-xs text-[#8FA69B] mt-1 max-w-md mx-auto">{result.message}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#07130E] border border-[#143326] grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div>
              <span className="text-3xl font-bold text-[#F0FDF4]">{result.percentage}%</span>
              <span className="block text-[11px] text-[#8FA69B]">Final Score</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-[#00DC82]">
                {result.score}/{result.totalPoints}
              </span>
              <span className="block text-[11px] text-[#8FA69B]">Points Earned</span>
            </div>
          </div>

          {result.certificateNumber && (
            <div className="p-3 rounded-xl bg-[#0F271D] border border-[#10B981]/40 max-w-md mx-auto flex items-center justify-between text-xs">
              <span className="text-[#8FA69B]">Track Certificate Issued:</span>
              <Link
                href={`/verify/${result.certificateNumber}`}
                className="font-mono text-[#00DC82] font-bold hover:underline"
              >
                {result.certificateNumber}
              </Link>
            </div>
          )}

          <div className="text-left space-y-3 pt-4 border-t border-[#143326]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8FA69B]">
              Server Evaluation Breakdown
            </h4>
            {result.breakdown.map((item, idx) => (
              <div
                key={item.questionId}
                className="p-3 rounded-xl bg-[#07130E] border border-[#143326] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F0FDF4]">Question {idx + 1}</span>
                  <Badge variant={item.isCorrect ? "emerald" : "error"}>
                    {item.isCorrect ? `+${item.pointsEarned} pts` : "0 pts"}
                  </Badge>
                </div>
                <p className="text-[#8FA69B] leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Link href="/student/assessments">
              <Button variant="secondary" size="sm" className="text-xs">
                Back to Assessments
              </Button>
            </Link>
            <Link href="/student/roadmap">
              <Button variant="gradient" size="sm" className="text-xs">
                Update Career Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
