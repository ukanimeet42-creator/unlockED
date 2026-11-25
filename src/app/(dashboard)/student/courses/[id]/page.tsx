"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Layers,
  HelpCircle,
  Code2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course, Lesson } from "@/types";

export const dynamic = "force-dynamic";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { enrolledCourseIds, enrollInCourse, completedLessons } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

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
    return (
      <div className="p-10 text-center text-xs text-[#8FA69B]">
        Loading track syllabus...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Courses
        </Link>
        <div className="p-12 rounded-3xl bg-[#0A1913] border border-[#143326] text-center">
          <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0FDF4]">Course not found</h2>
        </div>
      </div>
    );
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  const completedCount = lessons.filter(
    (l) => completedLessons.includes(l.id) || (l.slug && completedLessons.includes(l.slug))
  ).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const handleEnroll = async () => {
    setEnrolling(true);
    await enrollInCourse(course.id);
    setEnrolling(false);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#0A1913] border border-[#143326] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{course.category}</Badge>
            <Badge variant="secondary" className="capitalize text-[11px]">
              {course.difficulty}
            </Badge>
            <span className="text-xs font-mono text-[#8FA69B] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#10B981]" />
              {course.duration_weeks} Weeks
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">{course.title}</h1>
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
              {lessons[0] && (
                <Link
                  href={`/student/courses/${course.id}/lessons/${lessons[0].id}`}
                  className="block pt-1"
                >
                  <Button variant="gradient" className="w-full text-xs">
                    Continue Modules
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Button
              variant="gradient"
              disabled={enrolling}
              onClick={handleEnroll}
              className="w-full text-xs"
            >
              {enrolling ? "Enrolling..." : "Enroll in Track"}
            </Button>
          )}
        </div>
      </div>

      {(course.learning_outcomes?.length || course.prerequisites?.length) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {course.learning_outcomes && course.learning_outcomes.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#F0FDF4]">Learning Outcomes</h3>
              <ul className="space-y-2 text-xs text-[#8FA69B]">
                {course.learning_outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00DC82] shrink-0" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#F0FDF4]">Prerequisites</h3>
              <ul className="space-y-2 text-xs text-[#8FA69B]">
                {course.prerequisites.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">›</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      ) : null}

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
            const isDone =
              completedLessons.includes(lesson.id) ||
              (lesson.slug ? completedLessons.includes(lesson.slug) : false);

            return (
              <div
                key={lesson.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-[#0A1913] border-[#10B981]/50"
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
                    <h3 className="text-sm font-semibold text-[#F0FDF4]">{lesson.title}</h3>
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
                      <span className="inline-flex items-center gap-1 text-[#22D3EE]">
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
