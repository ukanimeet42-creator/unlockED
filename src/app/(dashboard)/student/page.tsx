"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  FileText,
  FolderGit2,
  Clock,
  ExternalLink,
  Bot,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INITIAL_COURSES, INITIAL_ASSESSMENTS, INITIAL_JOBS, INITIAL_PROJECTS } from "@/lib/data/mock-data";

export default function StudentDashboardPage() {
  const { user, enrolledCourseIds, completedLessons, appliedJobs } = useAuth();

  const enrolledCourses = INITIAL_COURSES.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </h1>
            <Badge variant="emerald" dot>
              Active Learner
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Track your curriculum progress, skill benchmark assessments, and career opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student/ai-assistant">
            <Button variant="gradient" size="sm" className="gap-2 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              AI Career Advisor
            </Button>
          </Link>
          <Link href="/student/resume">
            <Button variant="secondary" size="sm" className="gap-2 text-xs">
              <FileText className="w-3.5 h-3.5 text-[#10B981]" />
              Resume Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Readiness Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
              <span className="text-xs text-[#8FA69B]">/ 100</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Take benchmarks to evaluate</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Active Courses
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {enrolledCourseIds.length}
              </span>
              <span className="text-xs text-[#8FA69B]">enrolled</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {completedLessons.length} lessons completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82]">
            <BookOpen className="w-6 h-6" />
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Portfolio Projects
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {INITIAL_PROJECTS.length}
              </span>
              <span className="text-xs text-[#8FA69B]">published</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Showcase production work</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-[#34D399]">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Job Applications
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {appliedJobs.length}
              </span>
              <span className="text-xs text-[#8FA69B]">active</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {appliedJobs.filter((a) => a.status === "shortlisted").length} Shortlisted
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24]">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Course In-Progress + Telemetry Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In-Progress Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Current Learning Focus</CardTitle>
                <p className="text-xs text-[#8FA69B] mt-1">
                  Pick up right where you left off in your technical track
                </p>
              </div>
              <Link href="/student/courses">
                <Button variant="ghost" size="sm" className="text-xs text-[#10B981]">
                  Browse Catalog
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="w-10 h-10 text-[#143326] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#F0FDF4]">No active courses enrolled</p>
                  <p className="text-xs text-[#8FA69B] mt-1">Explore our curriculum to start learning.</p>
                  <Link href="/student/courses" className="inline-block mt-4">
                    <Button size="sm" variant="gradient">Browse Courses</Button>
                  </Link>
                </div>
              ) : (
                enrolledCourses.map((course) => {
                  const progressPct = Math.round(
                    (completedLessons.length / (course.lesson_count || 6)) * 100
                  );

                  return (
                    <div
                      key={course.id}
                      className="p-5 rounded-2xl bg-[#07130E] border border-[#143326] flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="default">{course.category}</Badge>
                            <span className="text-xs font-mono text-[#8FA69B]">
                              {course.duration_weeks} WEEKS
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-[#F0FDF4]">
                            {course.title}
                          </h4>
                          <p className="text-xs text-[#8FA69B] mt-1 line-clamp-2">
                            {course.short_description}
                          </p>
                        </div>

                        <Link href={`/student/courses/${course.id}`}>
                          <Button size="sm" variant="gradient" className="shrink-0 text-xs">
                            Continue Track
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[#8FA69B]">
                            Progress: {completedLessons.length} of {course.lesson_count || 6} lessons
                          </span>
                          <span className="font-semibold text-[#00DC82]">{progressPct}%</span>
                        </div>
                        <Progress value={progressPct} indicatorColor="bg-[#00DC82]" />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recommended Assessments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Skill Benchmark Assessments</CardTitle>
                <p className="text-xs text-[#8FA69B] mt-1">
                  Prove production competency with AI-evaluated benchmarks
                </p>
              </div>
              <Link href="/student/assessments">
                <Button variant="ghost" size="sm" className="text-xs text-[#10B981]">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {INITIAL_ASSESSMENTS.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8FA69B]">
                  No benchmark assessments published yet.
                </div>
              ) : (
                INITIAL_ASSESSMENTS.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#F0FDF4]">
                          {assessment.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#8FA69B] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {assessment.time_limit_minutes} mins
                          </span>
                          <span>·</span>
                          <span>{assessment.total_questions} Questions</span>
                          <span>·</span>
                          <span className="text-[#00DC82]">Passing: {assessment.passing_score}%</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/student/assessments/${assessment.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs shrink-0">
                        Take Quiz
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: AI Career Telemetry & Opportunities */}
        <div className="space-y-6">
          {/* AI Skill Gap Callout */}
          <Card className="p-6 bg-[#0A1913] border-[#143326] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="default">
                <Sparkles className="w-3 h-3" />
                AI Skill Pathfinder
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-[#F0FDF4]">
              Personalized Career Trajectory
            </h4>
            <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">
              Complete your first course module or benchmark assessment to generate an AI-evaluated skill gap analysis and custom roadmap.
            </p>

            <Link href="/student/roadmap" className="block mt-5">
              <Button size="sm" variant="gradient" className="w-full text-xs">
                View Learning Roadmap
              </Button>
            </Link>
          </Card>

          {/* Matched Job Opportunities */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Top Matched Jobs</CardTitle>
                <Link
                  href="/student/jobs"
                  className="text-xs text-[#10B981] hover:underline"
                >
                  All Jobs
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {INITIAL_JOBS.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8FA69B]">
                  No job opportunities posted yet.
                </div>
              ) : (
                INITIAL_JOBS.slice(0, 2).map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-[#07130E] border border-[#143326] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F0FDF4] line-clamp-1">
                        {job.title}
                      </span>
                      <Badge variant="emerald">Active</Badge>
                    </div>
                    <p className="text-[11px] text-[#8FA69B]">
                      {job.company?.name} · {job.location}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-[#F0FDF4]">
                        ${(job.salary_min || 110000) / 1000}k - ${(job.salary_max || 135000) / 1000}k
                      </span>
                      <Link href={`/student/jobs`}>
                        <span className="text-xs text-[#10B981] hover:underline flex items-center gap-1">
                          Apply <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
