"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Terminal,
  Code2,
  HelpCircle,
  Zap,
  Check,
  X,
  Copy,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_COURSES, INITIAL_LESSONS } from "@/lib/data/mock-data";

export const dynamic = "force-dynamic";

export default function LessonViewerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const router = useRouter();
  const { id, lessonId } = use(params);
  const { completedLessons, markLessonComplete } = useAuth();

  const [activeTab, setActiveTab] = useState<"theory" | "examples" | "quiz" | "challenge">("theory");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const course = INITIAL_COURSES.find((c) => c.id === id);
  const lessons = id && INITIAL_LESSONS[id] ? INITIAL_LESSONS[id] : [];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : lessons[0];
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;

  if (!course || !currentLesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
        <div>
          <Link
            href="/student/courses"
            className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
        <div className="p-12 rounded-3xl bg-[#0A1913] border border-[#143326] text-center">
          <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0FDF4]">Lesson not found</h2>
          <p className="text-sm text-[#8FA69B] mt-2">No lesson is available at this link.</p>
        </div>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(currentLesson.id);

  const handleMarkComplete = () => {
    markLessonComplete(currentLesson.id);
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
  const correctQuizAnswers = currentLesson.quiz?.filter(
    (q) => checkedQuestions[q.id] && selectedAnswers[q.id] === q.correctIndex
  ).length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#143326]">
        <Link
          href={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#00DC82] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Syllabus</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8FA69B]">
            Module {currentIndex + 1} of {lessons.length}
          </span>
          <span className="text-[#143326]">|</span>
          <span className="text-xs font-mono text-[#00DC82]">{course.title.split(":")[0]}</span>
        </div>
      </div>

      {/* Lesson Header */}
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
            <p className="text-xs text-[#8FA69B] leading-relaxed">
              {currentLesson.summary}
            </p>
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
              onClick={handleMarkComplete}
              className="gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Complete
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 border-b border-[#143326] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("theory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "theory"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C] shadow-[0_0_12px_rgba(0,220,130,0.2)]"
              : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#10B981]" />
          <span>1. Theory & Core Concepts</span>
        </button>

        <button
          onClick={() => setActiveTab("examples")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "examples"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C] shadow-[0_0_12px_rgba(0,220,130,0.2)]"
              : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
          }`}
        >
          <Code2 className="w-4 h-4 text-[#10B981]" />
          <span>2. Code Examples ({currentLesson.examples?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "quiz"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C] shadow-[0_0_12px_rgba(0,220,130,0.2)]"
              : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#10B981]" />
          <span>3. MCQ Quiz ({quizCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("challenge")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "challenge"
              ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C] shadow-[0_0_12px_rgba(0,220,130,0.2)]"
              : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
          }`}
        >
          <Zap className="w-4 h-4 text-[#10B981]" />
          <span>4. Hands-on Challenge</span>
        </button>
      </div>

      {/* TAB 1: THEORY */}
      {activeTab === "theory" && (
        <div className="space-y-6">
          {/* Learning Objectives */}
          {currentLesson.learning_objectives && currentLesson.learning_objectives.length > 0 && (
            <Card className="p-5 bg-[#0A1913] border-[#143326] space-y-3">
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

          {/* Theory Sections */}
          {currentLesson.theory_sections?.map((sec, i) => (
            <Card key={i} className="p-6 sm:p-8 bg-[#0A1913] border-[#143326] space-y-4">
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

          {/* Next Step CTA */}
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

      {/* TAB 2: CODE EXAMPLES */}
      {activeTab === "examples" && (
        <div className="space-y-6">
          {(!currentLesson.examples || currentLesson.examples.length === 0) ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
              <Code2 className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm text-[#8FA69B]">No standalone examples for this module.</p>
            </div>
          ) : (
            currentLesson.examples.map((ex, idx) => (
              <Card key={idx} className="p-6 bg-[#0A1913] border-[#143326] space-y-4">
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
                      className="px-2.5 py-1 rounded-lg bg-[#07130E] border border-[#143326] text-xs text-[#8FA69B] hover:text-[#00DC82] flex items-center gap-1.5 transition-colors"
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

                {/* Code Block Container */}
                <div className="rounded-xl border border-[#143326] bg-[#06100C] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#07130E] border-b border-[#143326] text-xs">
                    <span className="font-mono text-[#8FA69B]">{ex.title.toLowerCase().replace(/\s+/g, "_")}.{ex.language === "tsx" ? "tsx" : ex.language === "go" ? "go" : ex.language === "sql" ? "sql" : "ts"}</span>
                    <span className="text-[11px] text-[#00DC82] font-mono">Production Tested</span>
                  </div>
                  <pre className="p-4 font-mono text-xs sm:text-sm text-[#F0FDF4] overflow-x-auto leading-relaxed">
                    <code>{ex.code}</code>
                  </pre>
                </div>

                {/* Expected Output Box */}
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

          {/* Next Step CTA */}
          <div className="flex justify-between pt-2">
            <Button
              variant="secondary"
              onClick={() => setActiveTab("theory")}
              className="gap-2 text-xs bg-[#07130E] border-[#143326] text-[#8FA69B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Theory
            </Button>
            <Button
              variant="gradient"
              onClick={() => setActiveTab("quiz")}
              className="gap-2 text-xs"
            >
              Test Knowledge with MCQs <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: MCQ QUIZ */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0A1913] border border-[#143326]">
            <div>
              <h2 className="text-base font-bold text-[#F0FDF4]">Knowledge Benchmark Evaluation</h2>
              <p className="text-xs text-[#8FA69B] mt-0.5">
                Answer each question and click "Verify Answer" for immediate automated grading and concept breakdown.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#8FA69B] block">Score</span>
              <span className="text-lg font-bold font-mono text-[#00DC82]">
                {correctQuizAnswers} / {quizCount}
              </span>
            </div>
          </div>

          {(!currentLesson.quiz || currentLesson.quiz.length === 0) ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
              <HelpCircle className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm text-[#8FA69B]">No quiz questions available for this module.</p>
            </div>
          ) : (
            currentLesson.quiz.map((q, qIndex) => {
              const selected = selectedAnswers[q.id];
              const isChecked = checkedQuestions[q.id];
              const isCorrect = isChecked && selected === q.correctIndex;
              const isWrong = isChecked && selected !== q.correctIndex;

              return (
                <Card
                  key={q.id}
                  className={`p-6 bg-[#0A1913] border space-y-4 transition-all ${
                    isChecked
                      ? isCorrect
                        ? "border-[#10B981]/60 shadow-[0_0_16px_rgba(16,185,129,0.15)]"
                        : "border-[#EF4444]/60"
                      : "border-[#143326]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-[#00DC82] block">
                        Question {qIndex + 1} of {quizCount}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#F0FDF4]">
                        {q.question}
                      </h3>
                    </div>
                    {isChecked && (
                      <div>
                        {isCorrect ? (
                          <Badge variant="emerald" className="gap-1">
                            <Check className="w-3 h-3" /> Correct
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-red-950/60 text-red-400 border-red-800/40">
                            <X className="w-3 h-3" /> Incorrect
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, optIndex) => {
                      const isOptionSelected = selected === optIndex;
                      const isOptionCorrect = optIndex === q.correctIndex;

                      let optionStyle = "bg-[#07130E] border-[#143326] text-[#8FA69B] hover:border-[#10B981]/50";
                      if (isChecked) {
                        if (isOptionCorrect) {
                          optionStyle = "bg-[#0F271D] border-[#10B981] text-[#00DC82] font-semibold";
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = "bg-red-950/40 border-red-800 text-red-300";
                        }
                      } else if (isOptionSelected) {
                        optionStyle = "bg-[#0F271D] border-[#00DC82] text-[#F0FDF4] font-semibold";
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          disabled={isChecked}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#06100C] border border-[#143326] flex items-center justify-center font-mono text-xs text-[#00DC82] shrink-0 font-bold">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isChecked && isOptionCorrect && (
                            <Check className="w-4 h-4 text-[#00DC82] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Verification & Explanation */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                          Concept Explanation:
                        </span>
                        <p className="text-xs text-[#F0FDF4] leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}

          {/* Next Step CTA */}
          <div className="flex justify-between pt-2">
            <Button
              variant="secondary"
              onClick={() => setActiveTab("examples")}
              className="gap-2 text-xs bg-[#07130E] border-[#143326] text-[#8FA69B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Examples
            </Button>
            <Button
              variant="gradient"
              onClick={() => setActiveTab("challenge")}
              className="gap-2 text-xs"
            >
              Proceed to Hands-on Challenge <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: HANDS-ON CHALLENGE */}
      {activeTab === "challenge" && (
        <div className="space-y-6">
          {(!currentLesson.challenge) ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
              <Zap className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm text-[#8FA69B]">No practical coding challenge for this module.</p>
            </div>
          ) : (
            <Card className="p-6 sm:p-8 bg-[#0A1913] border-[#143326] space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F271D] border border-[#16382C] text-[#00DC82] text-xs font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Capstone Engineering Challenge</span>
                </div>
                <h2 className="text-xl font-bold text-[#F0FDF4]">Practical Exercise</h2>
                <p className="text-xs sm:text-sm text-[#F0FDF4] leading-relaxed p-4 rounded-xl bg-[#07130E] border border-[#143326]">
                  {currentLesson.challenge.prompt}
                </p>
              </div>

              {/* Starter Code */}
              {currentLesson.challenge.starter_code && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8FA69B]">
                    <span className="font-mono text-[#00DC82]">Starter Code Template</span>
                    <button
                      onClick={() => handleCopyCode(currentLesson.challenge?.starter_code || "", 999)}
                      className="flex items-center gap-1 hover:text-[#F0FDF4] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Template
                    </button>
                  </div>
                  <div className="rounded-xl border border-[#143326] bg-[#06100C] p-4 font-mono text-xs text-[#F0FDF4] overflow-x-auto">
                    <code>{currentLesson.challenge.starter_code}</code>
                  </div>
                </div>
              )}

              {/* Toggle Solution */}
              <div className="pt-2 border-t border-[#143326] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#F0FDF4]">Reference Solution & Architecture Walkthrough</h4>
                    <p className="text-xs text-[#8FA69B]">Try implementing it yourself first before revealing the production reference.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowSolution(!showSolution)}
                    className="gap-2 text-xs bg-[#07130E] border-[#143326] text-[#00DC82] hover:bg-[#0F271D]"
                  >
                    {showSolution ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Solution
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Reveal Solution
                      </>
                    )}
                  </Button>
                </div>

                {showSolution && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="rounded-xl border border-[#10B981]/40 bg-[#06100C] p-4 font-mono text-xs text-[#00DC82] overflow-x-auto">
                      <code>{currentLesson.challenge.solution_code}</code>
                    </div>
                    {currentLesson.challenge.explanation && (
                      <div className="p-4 rounded-xl bg-[#07130E] border border-[#143326]">
                        <span className="text-[11px] uppercase tracking-wider text-[#00DC82] font-mono font-bold block mb-1">
                          Implementation Rationale:
                        </span>
                        <p className="text-xs text-[#F0FDF4] leading-relaxed">
                          {currentLesson.challenge.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Module Complete Action */}
          <div className="p-6 rounded-2xl bg-[#0F271D] border border-[#16382C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#F0FDF4]">Finished this Module?</h3>
              <p className="text-xs text-[#8FA69B] mt-0.5">
                Marking this module complete updates your curriculum progress and unlocks subsequent track modules.
              </p>
            </div>
            {!isCompleted ? (
              <Button
                variant="gradient"
                onClick={handleMarkComplete}
                className="gap-1.5 text-xs shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Module Complete
              </Button>
            ) : (
              <Badge variant="emerald" dot>
                Completed & Verified
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Bottom Course Flow Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-[#143326]">
        {prevLesson ? (
          <Link href={`/student/courses/${course.id}/lessons/${prevLesson.id}`}>
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs bg-[#0A1913] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]">
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
            <Link href="/student/certificates">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                <Award className="w-3.5 h-3.5" /> Claim Track Certificate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
