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

  const course = INITIAL_COURSES.find((c) => c.id === id);
  const lessons = id && INITIAL_LESSONS[id] ? INITIAL_LESSONS[id] : [];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : lessons[0];
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#232336]">
        <Link
          href={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Syllabus</span>
        </Link>
        <span className="text-xs font-mono text-[#94A3B8]">
          Lesson {currentIndex + 1} of {lessons.length}
        </span>
      </div>

      {/* Lesson Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">{course.title.split(":")[0]}</Badge>
            <span className="text-xs text-[#94A3B8] flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {currentLesson.duration_minutes} mins
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F3FF]">
            {currentLesson.title}
          </h1>
        </div>

        <div>
          {isCompleted ? (
            <Badge variant="emerald" dot>
              Completed
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

      {/* Main Lesson Body */}
      <Card className="p-6 sm:p-10 bg-[#151520] border-[#232336] shadow-xl text-sm leading-relaxed space-y-6">
        <div className="prose prose-invert max-w-none space-y-4 text-[#E4E1EC]">
          <div className="p-4 rounded-xl bg-[#101018] border border-[#232336] mb-6 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#8B5CF6] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#F5F3FF]">Learning Objective</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Understand core distributed architecture trade-offs, state management isolation, and high-concurrency request pipelining.
              </p>
            </div>
          </div>

          <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#E4E1EC] leading-relaxed">
            {currentLesson.content}
          </div>
        </div>

        {/* Interactive Code Playground Mock */}
        <div className="mt-8 rounded-2xl border border-[#232336] bg-[#0E0E15] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#101018] border-b border-[#232336] text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="font-mono text-[#D0BCFF]">server_test.go</span>
            </div>
            <span className="text-[11px] text-[#22C55E] font-mono">Sandbox Active</span>
          </div>
          <div className="p-4 font-mono text-xs text-[#E4E1EC] overflow-x-auto bg-[#0B0B12]/80">
            <p className="text-[#64748B]">// Run concurrency stress test with 1000 simulated client connections</p>
            <p className="mt-2 text-[#22C55E]">=== RUN   TestHighConcurrencyWorkers</p>
            <p className="text-[#D0BCFF]">--- PASS: TestHighConcurrencyWorkers (0.08s)</p>
            <p className="text-[#E4E1EC]">PASS: 1000 requests processed, 0 dropped, p99 latency 12ms</p>
          </div>
        </div>
      </Card>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-4">
        {currentIndex > 0 ? (
          <Link
            href={`/student/courses/${course.id}/lessons/${lessons[currentIndex - 1]?.id}`}
          >
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Previous Lesson
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {!isCompleted && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkComplete}
              className="gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Finished
            </Button>
          )}

          {nextLesson ? (
            <Link
              href={`/student/courses/${course.id}/lessons/${nextLesson.id}`}
            >
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                Next Lesson <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/student/certificates">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                <Award className="w-3.5 h-3.5" /> Claim Certificate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
