"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Search, Filter, BookOpen, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
          Explore Production Tracks
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Industry-calibrated curricula engineered to prepare you for actual engineering roles.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
          <Input
            placeholder="Search tracks, languages, tools (e.g. Go, Kubernetes, Gemini)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === "All"
                ? "bg-[#8B5CF6] text-white"
                : "bg-[#151520] text-[#94A3B8] border border-[#232336] hover:text-[#F5F3FF]"
            }`}
          >
            All Tracks
          </button>
          {COURSE_CATEGORIES.slice(0, 5).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-[#8B5CF6] text-white"
                  : "bg-[#151520] text-[#94A3B8] border border-[#232336] hover:text-[#F5F3FF]"
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
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No courses available yet</h3>
          <p className="text-sm text-[#8FA69B] mt-1">Check back soon for upcoming curriculum tracks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <Card
                key={course.id}
                hoverEffect
                className="p-6 flex flex-col justify-between overflow-hidden relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default">{course.category}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#94A3B8] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_weeks} Weeks
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#F5F3FF] leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#1F1F26] text-[11px] text-[#CBC3D7] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#232336] flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">
                    {course.enrolled_count} active students
                  </span>

                  <div className="flex items-center gap-2">
                    {isEnrolled ? (
                      <Link href={`/student/courses/${course.id}`}>
                        <Button size="sm" variant="gradient" className="gap-1.5 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Go to Course
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => enrollInCourse(course.id)}
                        className="gap-1.5 text-xs"
                      >
                        Enroll Now
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
