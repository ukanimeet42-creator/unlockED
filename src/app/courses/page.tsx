"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { COURSE_CATEGORIES } from "@/lib/constants";
import type { Course } from "@/types";
import { Search, Clock, Layers, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PublicCoursesPage() {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  useEffect(() => {
    let active = true;
    fetch("/api/courses")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.courses) setCourses(json.courses);
        else setError(json.error || "Unable to load catalog");
      })
      .catch(() => {
        if (active) setError("Network error while loading courses.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || c.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[#06100C] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#143326] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A1913] border border-[#16382C] text-[#00DC82] text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Knowledge Explorer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F0FDF4]">
              Engineering Curriculum Tracks
            </h1>
            <p className="text-sm text-[#8FA69B] mt-1.5 max-w-2xl">
              Explore structured engineering curricula with theory, production code examples, quizzes, and hands-on challenges.
            </p>
          </div>
          {!isAuthenticated ? (
            <Link href="/register">
              <Button variant="gradient" size="sm" className="rounded-full gap-1.5 text-xs">
                Register to Enroll <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : role === "student" ? (
            <Link href="/student/courses">
              <Button variant="gradient" size="sm" className="rounded-full gap-1.5 text-xs">
                Open Student Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : null}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
            <Input
              placeholder="Search Next.js, Go, RAG, Kubernetes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0A1913] border-[#143326] text-[#F0FDF4]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              className="h-9 rounded-lg border border-[#143326] bg-[#0A1913] px-3 text-xs text-[#E6F4EA] focus:border-[#10B981] focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                selectedCategory === "All"
                  ? "bg-[#00DC82] text-slate-950 font-bold"
                  : "bg-[#0A1913] text-[#8FA69B] border border-[#143326] hover:text-[#F0FDF4]"
              }`}
            >
              All ({courses.length})
            </button>
            {COURSE_CATEGORIES.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-[#00DC82] text-slate-950 font-bold"
                    : "bg-[#0A1913] text-[#8FA69B] border border-[#143326] hover:text-[#F0FDF4]"
                }`}
              >
                {cat}
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
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0A1913] border border-rose-500/40 text-center text-sm text-rose-300">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0A1913] border border-[#143326]">
            <BookOpen className="w-10 h-10 text-[#143326] mx-auto mb-3" />
            <p className="text-base font-semibold text-[#F0FDF4]">No tracks match these filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((course) => (
              <Card key={course.id} hoverEffect className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="emerald">{course.category}</Badge>
                    <div className="flex items-center gap-2 text-xs text-[#8FA69B]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                        {course.duration_weeks} Weeks
                      </span>
                      <Badge variant="secondary" className="capitalize text-[11px]">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-[#F0FDF4]">{course.title}</h2>
                  <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">{course.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#06100C] border border-[#143326] text-[11px] font-mono text-[#00DC82]"
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
                  <Link href={role === "student" ? `/student/courses/${course.id}` : `/courses/${course.slug || course.id}`}>
                    <Button size="sm" variant="gradient" className="text-xs gap-1.5 rounded-full">
                      View Syllabus <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
