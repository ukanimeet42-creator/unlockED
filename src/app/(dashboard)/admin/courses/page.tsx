"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_CATEGORIES } from "@/lib/constants";
import type { Course } from "@/types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(COURSE_CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/admin/courses", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setCourses(json.courses || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/courses", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.courses) setCourses(json.courses);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const togglePublish = async (course: Course) => {
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, is_published: !course.is_published }),
    });
    if (res.ok) loadCourses();
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        category,
        difficulty,
        duration_weeks: Number(durationWeeks) || 6,
        description: description.trim(),
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setTagsText("");
      setShowCreate(false);
      loadCourses();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Course & Curriculum Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Publish, draft, or create curriculum tracks persisted in Supabase.
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="gap-1.5 text-xs rounded-full"
        >
          <Plus className="w-3.5 h-3.5" /> New Track
        </Button>
      </div>

      {showCreate && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F0FDF4]">Create Curriculum Track</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <Input
              required
              placeholder="Track Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
              >
                {COURSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                className="h-10 rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                placeholder="Duration weeks"
              />
            </div>
            <Input
              placeholder="Tags (comma separated)"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
            <Textarea
              required
              minLength={20}
              rows={3}
              placeholder="Course overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm">Create & Publish</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="h-32 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
        ) : courses.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No courses available</h3>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={course.is_published ? "emerald" : "secondary"}>
                    {course.is_published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-[#8FA69B] font-mono">
                    {course.duration_weeks} Weeks · {course.lesson_count || 0} Modules
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F0FDF4]">{course.title}</h3>
                <p className="text-xs text-[#8FA69B] mt-1">
                  {course.category} · {course.enrolled_count || 0} Enrolled Students
                </p>
              </div>

              <Button
                variant={course.is_published ? "secondary" : "gradient"}
                size="sm"
                onClick={() => togglePublish(course)}
                className="text-xs shrink-0"
              >
                {course.is_published ? "Unpublish" : "Publish"}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
