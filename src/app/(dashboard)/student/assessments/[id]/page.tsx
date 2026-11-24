"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_ASSESSMENTS } from "@/lib/data/mock-data";

export const dynamic = "force-dynamic";

export default function AssessmentTakingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { recordAssessmentAttempt } = useAuth();

  const assessment = INITIAL_ASSESSMENTS.find((a) => a.id === id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((assessment?.time_limit_minutes || 15) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    breakdown: { questionId: string; isCorrect: boolean; explanation: string }[];
    verifiedHash: string | null;
    message: string;
  } | null>(null);

  if (!assessment) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <Link
            href="/student/assessments"
            className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Skill Benchmark</span>
          </Link>
        </div>
        <div className="p-12 rounded-3xl bg-[#0A1913] border border-[#143326] text-center">
          <Award className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0FDF4]">Assessment not found</h2>
          <p className="text-sm text-[#8FA69B] mt-2">No assessment is currently available at this link.</p>
        </div>
      </div>
    );
  }

  // Active countdown
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const currentQ = assessment.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  const handleSelectOption = (qId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          answers: selectedAnswers,
          timeSpentSeconds: assessment.time_limit_minutes * 60 - timeLeftSeconds,
        }),
      });
      const data = await res.json();
      setResult(data);

      // Record in auth state
      recordAssessmentAttempt({
        id: `att-${Date.now()}`,
        student_id: "student-demo-id",
        assessment_id: assessment.id,
        score: data.score,
        total_points: data.totalPoints,
        percentage: data.percentage,
        answers: selectedAnswers,
        started_at: new Date(Date.now() - (assessment.time_limit_minutes * 60 - timeLeftSeconds) * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        time_spent_seconds: assessment.time_limit_minutes * 60 - timeLeftSeconds,
        passed: data.passed,
      });
    } catch {
      alert("Submission error. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#232336]">
        <Link
          href="/student/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Assessment</span>
        </Link>

        {/* Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs font-bold ${
            timeLeftSeconds < 120
              ? "bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444] animate-pulse"
              : "bg-[#101018] border-[#232336] text-[#F5F3FF]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      {!result ? (
        <Card className="p-6 sm:p-8 bg-[#151520] border-[#232336] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#232336]">
            <div>
              <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </span>
              <h2 className="text-base font-bold text-[#F5F3FF] mt-1">
                {assessment.title}
              </h2>
            </div>
            <Badge variant="secondary">
              {currentQ.points} Points
            </Badge>
          </div>

          {/* Question Text */}
          <div className="text-sm sm:text-base font-medium text-[#F5F3FF] leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`flex items-start gap-3 w-full p-4 rounded-xl text-left text-xs sm:text-sm transition-all border ${
                    isSelected
                      ? "bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#F5F3FF] shadow-sm"
                      : "bg-[#101018] border-[#232336] text-[#CBC3D7] hover:border-[#363654] hover:bg-[#1A1A26]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isSelected
                        ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                        : "border-[#494454] text-[#94A3B8]"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="flex-1 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#232336]">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="text-xs"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < assessment.questions.length - 1 ? (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
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
          </div>
        </Card>
      ) : (
        /* Result Modal / Screen */
        <Card className="p-6 sm:p-10 bg-[#151520] border-[#232336] shadow-2xl text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              result.passed
                ? "bg-[#22C55E]/15 text-[#22C55E]"
                : "bg-[#EF4444]/15 text-[#EF4444]"
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
            <h2 className="text-2xl font-bold text-[#F5F3FF]">
              Assessment Complete
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-md mx-auto">
              {result.message}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101018] border border-[#232336] grid grid-cols-2 gap-4 max-w-sm mx-auto text-center">
            <div>
              <span className="text-3xl font-bold text-[#F5F3FF]">
                {result.percentage}%
              </span>
              <span className="block text-[11px] text-[#94A3B8]">Final Score</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-[#8B5CF6]">
                {result.score}/{result.totalPoints}
              </span>
              <span className="block text-[11px] text-[#94A3B8]">Points Earned</span>
            </div>
          </div>

          {result.verifiedHash && (
            <div className="p-3 rounded-xl bg-[#1F1F26] border border-[#2A2931] max-w-md mx-auto flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Verification Hash:</span>
              <span className="font-mono text-[#22C55E] font-bold">
                #{result.verifiedHash}
              </span>
            </div>
          )}

          {/* Breakdown Accordion */}
          <div className="text-left space-y-3 pt-4 border-t border-[#232336]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Server Evaluation Breakdown
            </h4>
            {result.breakdown.map((item, idx) => (
              <div
                key={item.questionId}
                className="p-3 rounded-xl bg-[#101018] border border-[#232336] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F3FF]">
                    Question {idx + 1}
                  </span>
                  <Badge variant={item.isCorrect ? "emerald" : "error"}>
                    {item.isCorrect ? "Correct (+25 pts)" : "Incorrect"}
                  </Badge>
                </div>
                <p className="text-[#94A3B8] leading-relaxed">
                  {item.explanation}
                </p>
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
                View Updated Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
