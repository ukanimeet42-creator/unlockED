"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Search, BookOpen, Clock, ArrowRight, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COURSE_CATEGORIES } from "@/lib/constants";
import type { Course } from "@/types";

export default function CoursesCatalogPage() {
  const { enrolledCourseIds, enrollInCourse } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((json) => {
        if (json.courses) setCourses(json.courses);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    await enrollInCourse(courseId);
    setEnrollingId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F271D] border border-[#16382C] text-[#00DC82] text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Knowledge Explorer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Explore Engineering Tracks
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1 max-w-2xl">
          Production-calibrated curricula with architectural theory, executable code examples, MCQ checkpoints, and hands-on challenges.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8FA69B] absolute left-3 top-3.5" />
          <Input
            placeholder="Search tracks, tools (Next.js, Go, RAG, Kubernetes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0A1913] border-[#143326] text-[#F0FDF4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            aria-label="Difficulty filter"
            className="h-9 rounded-lg border border-[#143326] bg-[#0A1913] px-3 text-xs text-[#E6F4EA] focus:border-[#10B981] focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-[#00DC82] text-slate-950 font-bold"
                : "bg-[#0A1913] text-[#8FA69B] border border-[#143326] hover:text-[#F0FDF4]"
            }`}
          >
            All ({courses.length})
          </button>
          {COURSE_CATEGORIES.slice(0, 5).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? "bg-[#00DC82] text-slate-950 font-bold"
                  : "bg-[#0A1913] text-[#8FA69B] border border-[#143326] hover:text-[#F0FDF4]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No courses match your filter</h3>
          <p className="text-sm text-[#8FA69B] mt-1">Try resetting the category or difficulty filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <Card
                key={course.id}
                hoverEffect
                className="p-6 bg-[#0A1913] border-[#143326] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="emerald">{course.category}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8FA69B] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                        {course.duration_weeks} Weeks
                      </span>
                      <Badge variant="secondary" className="capitalize text-[11px]">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#F0FDF4] leading-snug group-hover:text-[#00DC82] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-[#07130E] text-[11px] text-[#00DC82] font-mono border border-[#143326]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#143326] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#5D7A6E] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                    {course.lesson_count || 4} Modules
                  </span>

                  <div className="flex items-center gap-2">
                    {isEnrolled ? (
                      <Link href={`/student/courses/${course.id}`}>
                        <Button size="sm" variant="gradient" className="gap-1.5 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Continue
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="gradient"
                        disabled={enrollingId === course.id}
                        onClick={() => handleEnroll(course.id)}
                        className="gap-1.5 text-xs"
                      >
                        {enrollingId === course.id ? "Enrolling..." : "Enroll Track"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Link href={`/student/courses/${course.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs">
                        Syllabus
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
