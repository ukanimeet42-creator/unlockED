"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  Code2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INITIAL_COURSES, INITIAL_LESSONS } from "@/lib/data/mock-data";

export const dynamic = "force-dynamic";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { enrolledCourseIds, enrollInCourse, completedLessons } = useAuth();

  const course = INITIAL_COURSES.find((c) => c.id === id);
  const lessons = id && INITIAL_LESSONS[id] ? INITIAL_LESSONS[id] : [];

  if (!course) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <Link
            href="/student/courses"
            className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </Link>
        </div>
        <div className="p-12 rounded-3xl bg-[#0A1913] border border-[#143326] text-center">
          <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0FDF4]">Course not found</h2>
          <p className="text-sm text-[#8FA69B] mt-2">No course is available at this link.</p>
        </div>
      </div>
    );
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  const completedCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Back link */}
      <div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0A1913] border border-[#143326] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{course.category}</Badge>
            <Badge variant="secondary" className="capitalize text-[11px] bg-[#07130E] border-[#143326] text-[#8FA69B]">
              {course.difficulty}
            </Badge>
            <span className="text-xs font-mono text-[#8FA69B] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#10B981]" />
              {course.duration_weeks} Weeks
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#8FA69B] leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-[#07130E] text-xs text-[#00DC82] font-mono border border-[#143326]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action card */}
        <div className="w-full lg:w-72 p-5 rounded-2xl bg-[#07130E] border border-[#143326] shrink-0 space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#5D7A6E] font-bold block mb-1">
              Enrollment Status
            </span>
            {isEnrolled ? (
              <Badge variant="emerald" dot>
                Active Student
              </Badge>
            ) : (
              <span className="text-xs text-[#8FA69B]">Not Enrolled</span>
            )}
          </div>

          {isEnrolled ? (
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#8FA69B]">Progress</span>
                <span className="font-bold font-mono text-[#00DC82]">{progressPct}%</span>
              </div>
              <Progress value={progressPct} indicatorColor="bg-[#00DC82]" />
              <Link
                href={`/student/courses/${course.id}/lessons/${lessons[0]?.id || "l1"}`}
                className="block pt-1"
              >
                <Button variant="gradient" className="w-full text-xs">
                  Continue Modules
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="gradient"
              onClick={() => enrollInCourse(course.id)}
              className="w-full text-xs"
            >
              Enroll in Track
            </Button>
          )}
        </div>
      </div>

      {/* Curriculum Syllabus */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-[#F0FDF4]">Track Syllabus & Modules</h2>
          </div>
          <span className="text-xs font-mono text-[#8FA69B]">
            {completedCount} of {lessons.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isDone = completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-[#0A1913] border-[#10B981]/40"
                    : "bg-[#0A1913] border-[#143326] hover:border-[#10B981]/50"
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                      isDone
                        ? "bg-[#10B981]/20 text-[#00DC82] border border-[#10B981]/40"
                        : "bg-[#07130E] text-[#8FA69B] border border-[#143326]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-[#00DC82]" /> : `0${idx + 1}`}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#F0FDF4]">
                      {lesson.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8FA69B]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#10B981]" />
                        {lesson.duration_minutes} mins
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-[#00DC82]">
                        <BookOpen className="w-3 h-3" /> Theory
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-[#10B981]">
                        <Code2 className="w-3 h-3" /> Examples
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-[#38BDF8]">
                        <HelpCircle className="w-3 h-3" /> MCQs
                      </span>
                    </div>
                  </div>
                </div>

                <Link href={`/student/courses/${course.id}/lessons/${lesson.id}`}>
                  <Button
                    size="sm"
                    variant={isDone ? "secondary" : "gradient"}
                    className="text-xs shrink-0 gap-1.5"
                  >
                    {isDone ? (
                      <>Review</>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Start Lesson
                      </>
                    )}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
