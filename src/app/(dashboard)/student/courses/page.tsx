"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Search, BookOpen, Clock, ArrowRight, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { INITIAL_COURSES } from "@/lib/data/mock-data";
import { COURSE_CATEGORIES } from "@/lib/constants";

export default function CoursesCatalogPage() {
  const { enrolledCourseIds, enrollInCourse } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredCourses = INITIAL_COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F271D] border border-[#16382C] text-[#00DC82] text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Calibrated Curricula</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Explore Engineering Tracks
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1 max-w-2xl">
          Deep-dive curricula engineered to prepare you for actual engineering roles with theory, code examples, interactive MCQs, and hands-on coding challenges.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8FA69B] absolute left-3 top-3.5" />
          <Input
            placeholder="Search tracks, languages, tools (e.g. Next.js, Go, AI, Kubernetes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0A1913] border-[#143326] text-[#F0FDF4] placeholder:text-[#5D7A6E] focus:border-[#10B981]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === "All"
                ? "bg-[#00DC82] text-slate-950 font-bold shadow-[0_0_12px_rgba(0,220,130,0.3)]"
                : "bg-[#0A1913] text-[#8FA69B] border border-[#143326] hover:text-[#F0FDF4] hover:border-[#10B981]/50"
            }`}
          >
            All Tracks ({INITIAL_COURSES.length})
          </button>
          {COURSE_CATEGORIES.slice(0, 5).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-[#00DC82] text-slate-950 font-bold shadow-[0_0_12px_rgba(0,220,130,0.3)]"
                  : "bg-[#0A1913] text-[#8FA69B] border border-[#143326] hover:text-[#F0FDF4] hover:border-[#10B981]/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
          <BookOpen className="w-12 h-12 text-[#143326] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No courses match your filter</h3>
          <p className="text-sm text-[#8FA69B] mt-1">Try resetting the category filter or searching with different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <Card
                key={course.id}
                hoverEffect
                className="p-6 bg-[#0A1913] border-[#143326] flex flex-col justify-between overflow-hidden relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="emerald">{course.category}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8FA69B] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                        {course.duration_weeks} Weeks
                      </span>
                      <Badge variant="secondary" className="capitalize text-[11px] bg-[#07130E] border-[#143326] text-[#8FA69B]">
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
                    {course.lesson_count || 4} Comprehensive Modules
                  </span>

                  <div className="flex items-center gap-2">
                    {isEnrolled ? (
                      <Link href={`/student/courses/${course.id}`}>
                        <Button size="sm" variant="gradient" className="gap-1.5 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Continue Track
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => enrollInCourse(course.id)}
                        className="gap-1.5 text-xs"
                      >
                        Enroll Track
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Link href={`/student/courses/${course.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs bg-[#07130E] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]">
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
