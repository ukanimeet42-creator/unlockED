"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import type { Course, Lesson } from "@/types";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Layers, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, role } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-[#06100C] p-12 text-center text-xs text-[#8FA69B]">
        Loading syllabus...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#06100C] p-12 max-w-3xl mx-auto space-y-4">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#00DC82]">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <Card className="p-12 text-center">
          <BookOpen className="w-10 h-10 text-[#143326] mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#F0FDF4]">Course not found</h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06100C] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#00DC82]">
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Explorer
        </Link>

        <Card className="p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
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
            <p className="text-sm text-[#8FA69B] leading-relaxed">{course.description}</p>
          </div>

          <div className="lg:w-72 p-5 rounded-2xl bg-[#07130E] border border-[#143326] shrink-0 space-y-4 self-start">
            <span className="text-xs font-mono text-[#00DC82] block">Start Learning</span>
            <p className="text-xs text-[#8FA69B]">
              Sign in as a student to enroll, complete interactive labs, and track progress.
            </p>
            {isAuthenticated && role === "student" ? (
              <Link href={`/student/courses/${course.id}`}>
                <Button variant="gradient" className="w-full text-xs gap-1.5 rounded-full">
                  Open in Student Portal <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href={`/login?redirectTo=/student/courses/${course.id}`}>
                <Button variant="gradient" className="w-full text-xs gap-1.5 rounded-full">
                  Sign In to Enroll <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {(course.learning_outcomes?.length || course.prerequisites?.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <Card className="p-6 space-y-3">
                <h2 className="text-sm font-bold text-[#F0FDF4]">Learning Outcomes</h2>
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
              <Card className="p-6 space-y-3">
                <h2 className="text-sm font-bold text-[#F0FDF4]">Prerequisites</h2>
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

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-[#F0FDF4]">Curriculum Modules ({lessons.length})</h2>
          </div>
          {lessons.map((lesson, idx) => (
            <Card key={lesson.id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-center text-xs font-mono text-[#00DC82]">
                  0{idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F0FDF4]">{lesson.title}</h3>
                  <p className="text-xs text-[#8FA69B] mt-0.5">{lesson.summary}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#5D7A6E] shrink-0">
                {lesson.duration_minutes} min
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
