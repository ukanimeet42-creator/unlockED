"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  Briefcase,
  TrendingUp,
  FileText,
  FolderGit2,
  Clock,
  CheckCircle2,
  Flame,
  Bell,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  buildStudentConstellation,
  type ConstellationNode,
} from "@/components/3d/skill-constellation-scene";
import type { Course, Job } from "@/types";

const LazySkillConstellation = dynamic(
  () =>
    import("@/components/3d/skill-constellation-scene").then(
      (mod) => mod.SkillConstellationView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[360px] rounded-2xl border border-[#143326] bg-[#07130E] flex items-center justify-center text-xs text-[#8FA69B]">
        Loading 3D Skill Constellation...
      </div>
    ),
  }
);

export default function StudentDashboardPage() {
  const {
    user,
    enrollments,
    completedLessons,
    projects,
    applications,
    assessmentAttempts,
    certificates,
    userSkills,
    notifications,
  } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assessments, setAssessments] = useState<
    Array<{ id: string; title: string; time_limit_minutes: number; passing_score: number; total_questions: number }>
  >([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("learner-core");

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => (r.ok ? r.json() : { courses: [] })),
      fetch("/api/jobs").then((r) => (r.ok ? r.json() : { jobs: [] })),
      fetch("/api/assessments").then((r) => (r.ok ? r.json() : { assessments: [] })),
    ]).then(([cJson, jJson, aJson]) => {
      setCourses(cJson.courses || []);
      setJobs(jJson.jobs || []);
      setAssessments(aJson.assessments || []);
    });
  }, []);

  const enrolledCourseMap = new Map(enrollments.map((e) => [e.course_id, e]));
  const enrolledCourses = courses.filter((c) => enrolledCourseMap.has(c.id));
  const recommendedCourses = courses.filter((c) => !enrolledCourseMap.has(c.id)).slice(0, 2);

  // Real readiness score strictly computed from passed/completed assessment scores (0 if none taken)
  const avgBenchmarkScore =
    assessmentAttempts.length > 0
      ? Math.round(
          assessmentAttempts.reduce((acc, a) => acc + Number(a.percentage), 0) /
            assessmentAttempts.length
        )
      : 0;

  // Real active learning days calculated strictly from DB enrollment & assessment timestamps
  const activeLearningDays = useMemo(() => {
    const daySet = new Set<string>();
    for (const en of enrollments) {
      if (en.enrolled_at) daySet.add(en.enrolled_at.slice(0, 10));
      if (en.completed_at) daySet.add(en.completed_at.slice(0, 10));
    }
    for (const at of assessmentAttempts) {
      if (at.completed_at) daySet.add(at.completed_at.slice(0, 10));
    }
    return daySet.size;
  }, [enrollments, assessmentAttempts]);

  const constellationNodes = useMemo(
    () =>
      buildStudentConstellation(
        user?.full_name?.split(" ")[0] || "Learner",
        courses,
        enrollments,
        userSkills
      ),
    [user?.full_name, courses, enrollments, userSkills]
  );

  const selectedNode: ConstellationNode =
    constellationNodes.find((n) => n.id === selectedNodeId) || constellationNodes[0];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </h1>
            <Badge variant="emerald" dot>
              Student Workspace
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Track enrolled courses, benchmark evaluations, portfolio projects, and live applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A1913] border border-[#16382C] text-xs text-[#F59E0B]">
            <Flame className="w-3.5 h-3.5" />
            <span>
              {activeLearningDays} Active Study {activeLearningDays === 1 ? "Day" : "Days"}
            </span>
          </div>
          <Link href="/student/ai-assistant">
            <Button variant="gradient" size="sm" className="gap-2 text-xs rounded-full">
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

      {/* Interactive 3D Skill & Track Constellation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 relative">
          <LazySkillConstellation
            learnerName={user?.full_name?.split(" ")[0] || "Learner"}
            courses={courses}
            enrollments={enrollments}
            userSkills={userSkills}
            selectedNodeId={selectedNodeId}
            onSelectNode={(n) => setSelectedNodeId(n.id)}
          />
          <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#06100C]/85 border border-[#143326] text-[10px] text-[#A7F3D0]">
            Interactive 3D Skill Constellation &middot; Click any node
          </div>
        </div>

        <Card className="lg:col-span-5 p-6 glass-panel-elevated flex flex-col justify-between gap-5">
          {selectedNode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="cyan" className="capitalize text-[10px]">
                  {selectedNode.category} Node
                </Badge>
                <span className="text-xs font-mono text-[#00DC82]">
                  {selectedNode.statusLabel}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#F0FDF4]">{selectedNode.label}</h2>
                <p className="text-xs text-[#8FA69B] mt-1.5 leading-relaxed">
                  {selectedNode.detail}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#8FA69B]">
                  <span>Telemetry / Completion</span>
                  <span className="font-mono text-[#00DC82]">{selectedNode.metricValue}%</span>
                </div>
                <Progress value={selectedNode.metricValue} indicatorColor="bg-[#22D3EE]" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {constellationNodes.slice(0, 6).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setSelectedNodeId(n.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] border transition-colors cursor-pointer ${
                      n.id === selectedNodeId
                        ? "bg-[#0F271D] text-[#00DC82] border-[#00DC82]"
                        : "bg-[#06110C] text-[#8FA69B] border-[#143326] hover:text-[#F0FDF4]"
                    }`}
                  >
                    {n.label.length > 18 ? `${n.label.slice(0, 16)}...` : n.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#143326]">
            <Link href={selectedNode?.href || "/student/courses"} className="w-full">
              <Button variant="gradient" size="sm" className="w-full gap-1.5 text-xs">
                Open Selected Node <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Real Database Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Avg Benchmark Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {assessmentAttempts.length > 0 ? avgBenchmarkScore : "—"}
              </span>
              {assessmentAttempts.length > 0 && <span className="text-xs text-[#8FA69B]">%</span>}
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {assessmentAttempts.length > 0
                ? `${assessmentAttempts.filter((a) => a.passed).length} passed benchmarks`
                : "Take benchmarks to evaluate"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Active Courses
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {enrollments.length}
              </span>
              <span className="text-xs text-[#8FA69B]">enrolled</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {completedLessons.length} module records completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82]">
            <BookOpen className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Portfolio Projects
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {projects.length}
              </span>
              <span className="text-xs text-[#8FA69B]">saved</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {certificates.length} track certificates issued
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE]">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Job Applications
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {applications.length}
              </span>
              <span className="text-xs text-[#8FA69B]">submitted</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {applications.filter((a) => a.status === "shortlisted" || a.status === "interviewed").length} in review / interview
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#FBBF24]">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Enrolled Engineering Tracks</CardTitle>
                <p className="text-xs text-[#8FA69B] mt-1">
                  Resume active modules saved to your learning record
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
                  <p className="text-xs text-[#8FA69B] mt-1">
                    Explore the curriculum catalog to start tracking modules.
                  </p>
                  <Link href="/student/courses" className="inline-block mt-4">
                    <Button size="sm" variant="gradient">Browse Courses</Button>
                  </Link>
                </div>
              ) : (
                enrolledCourses.map((course) => {
                  const enrollment = enrolledCourseMap.get(course.id);
                  const progressPct = enrollment?.progress_percentage ?? 0;

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
                            Continue <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[#8FA69B]">Completion Progress</span>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Available Skill Benchmarks</CardTitle>
                <p className="text-xs text-[#8FA69B] mt-1">
                  Server-evaluated quizzes to verify track competencies
                </p>
              </div>
              <Link href="/student/assessments">
                <Button variant="ghost" size="sm" className="text-xs text-[#10B981]">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {assessments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8FA69B]">
                  Loading available benchmarks...
                </div>
              ) : (
                assessments.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#F0FDF4]">{a.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#8FA69B] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {a.time_limit_minutes} mins
                          </span>
                          <span>·</span>
                          <span>{a.total_questions} Questions</span>
                          <span>·</span>
                          <span className="text-[#00DC82]">Pass: {a.passing_score}%</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/student/assessments/${a.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs shrink-0">
                        Attempt
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <Badge variant="default">
              <Sparkles className="w-3 h-3" /> Verified Skills ({userSkills.length})
            </Badge>
            {userSkills.length === 0 ? (
              <p className="text-xs text-[#8FA69B] leading-relaxed">
                Pass benchmark assessments to record verified technical skills on your profile.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userSkills.map((us) => (
                  <Badge key={us.id} variant="emerald" dot>
                    <CheckCircle2 className="w-3 h-3" />
                    {us.skill?.name || "Skill"} ({us.proficiency})
                  </Badge>
                ))}
              </div>
            )}
            <Link href="/student/roadmap" className="block pt-1">
              <Button size="sm" variant="gradient" className="w-full text-xs">
                Open Career Roadmap
              </Button>
            </Link>
          </Card>

          {recommendedCourses.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F0FDF4]">Recommended Next Tracks</span>
                <Link href="/student/courses" className="text-[11px] text-[#00DC82] hover:underline">
                  Catalog
                </Link>
              </div>
              <div className="space-y-2.5">
                {recommendedCourses.map((rc) => (
                  <Link
                    key={rc.id}
                    href={`/student/courses/${rc.id}`}
                    className="block p-3 rounded-xl bg-[#07130E] border border-[#143326] hover:border-[#1F4D3A] transition-colors"
                  >
                    <p className="text-xs font-semibold text-[#F0FDF4] truncate">{rc.title}</p>
                    <p className="text-[11px] text-[#8FA69B] mt-0.5 capitalize">
                      {rc.difficulty} &middot; {rc.duration_weeks}w &middot; {rc.lesson_count ?? 4} modules
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {notifications.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0FDF4]">
                  <Bell className="w-3.5 h-3.5 text-[#22D3EE]" /> Recent Updates
                </span>
                <Link href="/student/notifications" className="text-[11px] text-[#00DC82] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-[#07130E] border border-[#143326] text-[11px]"
                  >
                    <p className="font-semibold text-[#F0FDF4] truncate">{n.title}</p>
                    <p className="text-[#8FA69B] line-clamp-2 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Open Opportunities</CardTitle>
                <Link href="/student/jobs" className="text-xs text-[#10B981] hover:underline">
                  All Jobs
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8FA69B]">
                  No active jobs published by hiring partners yet.
                </div>
              ) : (
                jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-[#07130E] border border-[#143326] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#F0FDF4] line-clamp-1">
                        {job.title}
                      </span>
                      <Badge variant="emerald">Active</Badge>
                    </div>
                    <p className="text-[11px] text-[#8FA69B]">
                      {job.company?.name || "Hiring Partner"} · {job.location}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono text-[#00DC82] capitalize">
                        {job.job_type}
                      </span>
                      <Link href="/student/jobs">
                        <span className="text-xs text-[#10B981] hover:underline flex items-center gap-1">
                          View & Apply <ArrowRight className="w-3 h-3" />
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
