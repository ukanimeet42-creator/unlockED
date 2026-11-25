"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Code2,
  HelpCircle,
  Zap,
  Check,
  X,
  Copy,
} from "lucide-react";
import { ChallengeSandbox } from "@/components/student/challenge-sandbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course, Lesson } from "@/types";

export const dynamic = "force-dynamic";

export default function LessonViewerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = use(params);
  const { completedLessons, markLessonComplete } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [certBanner, setCertBanner] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"theory" | "examples" | "quiz" | "challenge">("theory");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.course) {
          setCourse(json.course);
          setLessons(json.lessons || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center text-xs text-[#8FA69B]">Loading lesson module...</div>;
  }

  const currentIndex = lessons.findIndex(
    (l) => l.id === lessonId || l.slug === lessonId
  );
  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : lessons[0];
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;

  if (!course || !currentLesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <div className="p-12 rounded-3xl bg-[#0A1913] border border-[#143326] text-center">
          <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0FDF4]">Lesson not found</h2>
        </div>
      </div>
    );
  }

  const isCompleted =
    completedLessons.includes(currentLesson.id) ||
    (currentLesson.slug ? completedLessons.includes(currentLesson.slug) : false);

  const handleMarkComplete = async () => {
    setSavingProgress(true);
    const res = await markLessonComplete(course.id, currentLesson.id);
    if (res.certificateNumber) {
      setCertBanner(res.certificateNumber);
    }
    setSavingProgress(false);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleCheckQuestion = (questionId: string) => {
    setCheckedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quizCount = currentLesson.quiz?.length || 0;
  const correctQuizAnswers =
    currentLesson.quiz?.filter(
      (q) => checkedQuestions[q.id] && selectedAnswers[q.id] === q.correctIndex
    ).length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between pb-4 border-b border-[#143326]">
        <Link
          href={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#00DC82]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Syllabus</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8FA69B]">
            Module {(currentIndex >= 0 ? currentIndex : 0) + 1} of {lessons.length}
          </span>
          <span className="text-[#143326]">|</span>
          <span className="text-xs font-mono text-[#00DC82]">{course.title.split(":")[0]}</span>
        </div>
      </div>

      {certBanner && (
        <div className="p-4 rounded-2xl bg-[#0F271D] border border-[#00DC82] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#00DC82]" />
            <span className="text-xs font-semibold text-[#F0FDF4]">
              Track complete! Certificate issued: <span className="font-mono text-[#00DC82]">{certBanner}</span>
            </span>
          </div>
          <Link href="/student/certificates">
            <Button size="sm" variant="gradient" className="text-xs">View Certificate</Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A1913] border border-[#143326] p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">{course.category}</Badge>
            <span className="text-xs text-[#8FA69B] flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#10B981]" />
              {currentLesson.duration_minutes} mins
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F0FDF4]">
            {currentLesson.title}
          </h1>
          {currentLesson.summary && (
            <p className="text-xs text-[#8FA69B] leading-relaxed">{currentLesson.summary}</p>
          )}
        </div>

        <div className="shrink-0">
          {isCompleted ? (
            <Badge variant="emerald" dot>
              Lesson Completed
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="gradient"
              disabled={savingProgress}
              onClick={handleMarkComplete}
              className="gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {savingProgress ? "Saving..." : "Mark as Complete"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#143326] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("theory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "theory"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
              : "text-[#8FA69B] hover:text-[#F0FDF4]"
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#10B981]" />
          <span>1. Theory & Core Concepts</span>
        </button>

        <button
          onClick={() => setActiveTab("examples")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "examples"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
              : "text-[#8FA69B] hover:text-[#F0FDF4]"
          }`}
        >
          <Code2 className="w-4 h-4 text-[#10B981]" />
          <span>2. Code Examples ({currentLesson.examples?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "quiz"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
              : "text-[#8FA69B] hover:text-[#F0FDF4]"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#10B981]" />
          <span>3. MCQ Quiz ({quizCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("challenge")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "challenge"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
              : "text-[#8FA69B] hover:text-[#F0FDF4]"
          }`}
        >
          <Zap className="w-4 h-4 text-[#10B981]" />
          <span>4. Hands-on Challenge</span>
        </button>
      </div>

      {activeTab === "theory" && (
        <div className="space-y-6">
          {currentLesson.learning_objectives && currentLesson.learning_objectives.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#00DC82] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span>Learning Objectives</span>
              </div>
              <ul className="space-y-2">
                {currentLesson.learning_objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#F0FDF4]">
                    <CheckCircle2 className="w-4 h-4 text-[#00DC82] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {currentLesson.theory_sections?.map((sec, i) => (
            <Card key={i} className="p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-[#F0FDF4] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00DC82]" />
                {sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-[#8FA69B] leading-relaxed whitespace-pre-line">
                {sec.body}
              </p>

              {sec.key_points && sec.key_points.length > 0 && (
                <div className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-2 mt-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#00DC82] font-mono font-bold block">
                    Key Architectural Takeaways:
                  </span>
                  <ul className="space-y-1.5">
                    {sec.key_points.map((pt, pIdx) => (
                      <li key={pIdx} className="text-xs text-[#F0FDF4] flex items-start gap-2">
                        <span className="text-[#10B981] font-bold">›</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              variant="gradient"
              onClick={() => setActiveTab("examples")}
              className="gap-2 text-xs"
            >
              Continue to Code Examples <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {activeTab === "examples" && (
        <div className="space-y-6">
          {!currentLesson.examples || currentLesson.examples.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
              <Code2 className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm text-[#8FA69B]">No standalone examples for this module.</p>
            </div>
          ) : (
            currentLesson.examples.map((ex, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#143326] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#F0FDF4]">{ex.title}</h3>
                    <p className="text-xs text-[#8FA69B] mt-0.5">{ex.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" className="uppercase font-mono text-[10px]">
                      {ex.language}
                    </Badge>
                    <button
                      onClick={() => handleCopyCode(ex.code, idx)}
                      className="px-2.5 py-1 rounded-lg bg-[#07130E] border border-[#143326] text-xs text-[#8FA69B] hover:text-[#00DC82] flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00DC82]" />
                          <span className="text-[#00DC82]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#143326] bg-[#06100C] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#07130E] border-b border-[#143326] text-xs">
                    <span className="font-mono text-[#8FA69B]">
                      {ex.title.toLowerCase().replace(/\s+/g, "_")}.{ex.language}
                    </span>
                  </div>
                  <pre className="p-4 font-mono text-xs sm:text-sm text-[#F0FDF4] overflow-x-auto leading-relaxed">
                    <code>{ex.code}</code>
                  </pre>
                </div>

                {ex.output && (
                  <div className="rounded-xl border border-[#143326] bg-[#07130E] p-4 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#10B981] font-mono font-bold block">
                      Expected Console / API Output:
                    </span>
                    <pre className="font-mono text-xs text-[#00DC82] whitespace-pre-wrap">
                      {ex.output}
                    </pre>
                  </div>
                )}
              </Card>
            ))
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setActiveTab("theory")} className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Theory
            </Button>
            <Button variant="gradient" onClick={() => setActiveTab("quiz")} className="gap-2 text-xs">
              Test Knowledge with MCQs <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0A1913] border border-[#143326]">
            <div>
              <h2 className="text-base font-bold text-[#F0FDF4]">Knowledge Checkpoint</h2>
              <p className="text-xs text-[#8FA69B] mt-0.5">
                Answer each question and select &ldquo;Verify Answer&rdquo; for immediate feedback.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#8FA69B] block">Score</span>
              <span className="text-lg font-bold font-mono text-[#00DC82]">
                {correctQuizAnswers} / {quizCount}
              </span>
            </div>
          </div>

          {!currentLesson.quiz || currentLesson.quiz.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
              <HelpCircle className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm text-[#8FA69B]">No quiz questions for this module.</p>
            </div>
          ) : (
            currentLesson.quiz.map((q, qIndex) => {
              const selected = selectedAnswers[q.id];
              const isChecked = checkedQuestions[q.id];
              const isCorrect = isChecked && selected === q.correctIndex;

              return (
                <Card
                  key={q.id}
                  className={`p-6 space-y-4 ${
                    isChecked
                      ? isCorrect
                        ? "border-[#10B981]/60"
                        : "border-rose-500/60"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-[#00DC82] block">
                        Question {qIndex + 1} of {quizCount}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#F0FDF4]">{q.question}</h3>
                    </div>
                    {isChecked && (
                      <Badge variant={isCorrect ? "emerald" : "error"} className="gap-1">
                        {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, optIndex) => {
                      const isOptionSelected = selected === optIndex;
                      const isOptionCorrect = optIndex === q.correctIndex;

                      let optionStyle =
                        "bg-[#07130E] border-[#143326] text-[#8FA69B] hover:border-[#10B981]/50";
                      if (isChecked) {
                        if (isOptionCorrect) {
                          optionStyle = "bg-[#0F271D] border-[#10B981] text-[#00DC82] font-semibold";
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = "bg-rose-950/40 border-rose-500 text-rose-200";
                        }
                      } else if (isOptionSelected) {
                        optionStyle = "bg-[#0F271D] border-[#00DC82] text-[#F0FDF4] font-semibold";
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          disabled={isChecked}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#06100C] border border-[#143326] flex items-center justify-center font-mono text-xs text-[#00DC82] shrink-0 font-bold">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isChecked && isOptionCorrect && <Check className="w-4 h-4 text-[#00DC82] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    {!isChecked ? (
                      <Button
                        size="sm"
                        variant="gradient"
                        disabled={selected === undefined}
                        onClick={() => handleCheckQuestion(q.id)}
                        className="text-xs"
                      >
                        Verify Answer
                      </Button>
                    ) : (
                      <div className="w-full p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-[#00DC82] font-mono font-bold block">
                          Explanation:
                        </span>
                        <p className="text-xs text-[#F0FDF4] leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setActiveTab("examples")} className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Examples
            </Button>
            <Button variant="gradient" onClick={() => setActiveTab("challenge")} className="gap-2 text-xs">
              Proceed to Hands-on Challenge <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {activeTab === "challenge" && (
        <div className="space-y-6">
          {!currentLesson.challenge ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
              <Zap className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm text-[#8FA69B]">No practical coding challenge for this module.</p>
            </div>
          ) : (
            <Card className="p-6 sm:p-8">
              <ChallengeSandbox
                key={currentLesson.id}
                challenge={currentLesson.challenge}
                courseCategory={course.category}
              />
            </Card>
          )}

          <div className="p-6 rounded-2xl bg-[#0F271D] border border-[#16382C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#F0FDF4]">Finished this Module?</h3>
              <p className="text-xs text-[#8FA69B] mt-0.5">
                Completing all modules alongside the track benchmark qualifies you for a certificate.
              </p>
            </div>
            {!isCompleted ? (
              <Button
                variant="gradient"
                disabled={savingProgress}
                onClick={handleMarkComplete}
                className="gap-1.5 text-xs shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                {savingProgress ? "Saving..." : "Mark Module Complete"}
              </Button>
            ) : (
              <Badge variant="emerald" dot>
                Completed & Saved
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-[#143326]">
        {prevLesson ? (
          <Link href={`/student/courses/${course.id}/lessons/${prevLesson.id}`}>
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Previous Module
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {nextLesson ? (
            <Link href={`/student/courses/${course.id}/lessons/${nextLesson.id}`}>
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                Next Module <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/student/assessments">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                <Award className="w-3.5 h-3.5" /> Take Track Benchmark
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
