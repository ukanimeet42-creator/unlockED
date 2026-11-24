"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, CheckCircle2, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_COURSES } from "@/lib/data/mock-data";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState(INITIAL_COURSES);

  const togglePublish = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_published: !c.is_published } : c))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
            Course & Curriculum Management
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Author and publish production technical tracks, sandboxes, and lesson curricula.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No courses created yet</h3>
            <p className="text-sm text-[#8FA69B] mt-1">Add curriculum tracks to make them available for students.</p>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="p-5 bg-[#0A1913] border-[#143326] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={course.is_published ? "emerald" : "secondary"}>
                    {course.is_published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-[#8FA69B] font-mono">{course.duration_weeks} Weeks</span>
                </div>
                <h3 className="text-base font-bold text-[#F0FDF4]">{course.title}</h3>
                <p className="text-xs text-[#8FA69B] mt-1">{course.category} · {course.enrolled_count} Active Enrolled</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant={course.is_published ? "secondary" : "gradient"}
                  size="sm"
                  onClick={() => togglePublish(course.id)}
                  className="text-xs"
                >
                  {course.is_published ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
