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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back link */}
      <div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#151520] border border-[#232336] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge variant="default">{course.category}</Badge>
            <Badge variant="secondary" className="capitalize">{course.difficulty}</Badge>
            <span className="text-xs font-mono text-[#94A3B8] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration_weeks} Weeks
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded bg-[#1F1F26] text-xs text-[#CBC3D7] font-mono border border-[#2A2931]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action card */}
        <div className="w-full lg:w-72 p-5 rounded-2xl bg-[#101018] border border-[#232336] shrink-0 space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-bold block mb-1">
              Enrollment Status
            </span>
            {isEnrolled ? (
              <Badge variant="emerald" dot>
                Active Student
              </Badge>
            ) : (
              <Badge variant="secondary">Not Enrolled</Badge>
            )}
          </div>

          {isEnrolled ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Course Progress</span>
                <span className="font-bold text-[#22C55E]">{progressPct}%</span>
              </div>
              <Progress value={progressPct} indicatorColor="bg-[#22C55E]" />
              <Link
                href={`/student/courses/${course.id}/lessons/${lessons[0]?.id || "l1"}`}
                className="block pt-2"
              >
                <Button variant="gradient" className="w-full text-xs">
                  Continue Lesson 1
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
          <h2 className="text-lg font-bold text-[#F5F3FF]">Track Syllabus & Modules</h2>
          <span className="text-xs text-[#94A3B8]">
            {completedCount} of {lessons.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isDone = completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isDone
                    ? "bg-[#151520] border-[#22C55E]/30"
                    : "bg-[#101018] border-[#232336] hover:border-[#363654]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isDone
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-[#1F1F26] text-[#94A3B8]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F3FF]">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration_minutes} mins
                      </span>
                      <span>·</span>
                      <span>Interactive code sandbox & reading</span>
                    </div>
                  </div>
                </div>

                <Link href={`/student/courses/${course.id}/lessons/${lesson.id}`}>
                  <Button
                    size="sm"
                    variant={isDone ? "secondary" : "default"}
                    className="text-xs shrink-0 gap-1.5"
                  >
                    {isDone ? (
                      <>Review</>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Start
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
