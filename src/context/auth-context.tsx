"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, UserRole, Course, Job, Application, AssessmentAttempt, Resume } from "@/types";
import { INITIAL_STUDENT_PROFILE, INITIAL_RESUME, INITIAL_COURSES, INITIAL_JOBS } from "@/lib/data/mock-data";

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  enrolledCourseIds: string[];
  enrollInCourse: (courseId: string) => void;
  completedLessons: string[];
  markLessonComplete: (lessonId: string) => void;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  appliedJobs: { jobId: string; appliedAt: string; status: string }[];
  applyToJob: (jobId: string, resumeId?: string, coverLetter?: string) => boolean;
  assessmentAttempts: AssessmentAttempt[];
  recordAssessmentAttempt: (attempt: AssessmentAttempt) => void;
  resume: Resume;
  updateResume: (newResume: Resume) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("student");
  const [user, setUser] = useState<Profile | null>(INITIAL_STUDENT_PROFILE);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(["c1"]);
  const [completedLessons, setCompletedLessons] = useState<string[]>(["l1"]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(["j1"]);
  const [appliedJobs, setAppliedJobs] = useState<{ jobId: string; appliedAt: string; status: string }[]>([
    { jobId: "j1", appliedAt: "2024-11-18T10:00:00.000Z", status: "shortlisted" },
  ]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttempt[]>([
    {
      id: "att-1",
      student_id: INITIAL_STUDENT_PROFILE.id,
      assessment_id: "a1",
      score: 4,
      total_points: 4,
      percentage: 100,
      answers: { q1: 1, q2: 1, q3: 2, q4: 1 },
      started_at: "2024-11-19T09:00:00.000Z",
      completed_at: "2024-11-19T09:10:00.000Z",
      time_spent_seconds: 540,
      passed: true,
    },
  ]);
  const [resume, setResume] = useState<Resume>(INITIAL_RESUME);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `unlocked_demo_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof document !== "undefined") {
      document.cookie = `unlocked_demo_role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    }
    if (newRole === "student") {
      setUser({
        ...INITIAL_STUDENT_PROFILE,
        role: "student",
      });
    } else if (newRole === "recruiter") {
      setUser({
        id: "rec1",
        email: "david.vance@finscale.example.com",
        full_name: "David Vance",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        role: "recruiter",
        bio: "VP of Engineering at FinScale Technologies. Hiring high-aptitude distributed systems and cloud infrastructure engineers.",
        phone: "+1 (555) 987-6543",
        location: "San Francisco, CA",
        website: "https://finscale.example.com",
        github_url: null,
        linkedin_url: "https://linkedin.com/in/david-vance-vp",
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      setUser({
        id: "admin1",
        email: "admin@unlocked.edu",
        full_name: "UnlockED Admin",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        role: "admin",
        bio: "Platform Administrator & Curriculum Lead at UnlockED.",
        phone: "+1 (555) 000-0000",
        location: "Headquarters",
        website: "https://unlocked.edu",
        github_url: null,
        linkedin_url: null,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const enrollInCourse = (courseId: string) => {
    if (!enrolledCourseIds.includes(courseId)) {
      setEnrolledCourseIds((prev) => [...prev, courseId]);
    }
  };

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const applyToJob = (jobId: string, resumeId?: string, coverLetter?: string): boolean => {
    // Prevent duplicate applications
    if (appliedJobs.some((a) => a.jobId === jobId)) {
      return false;
    }
    setAppliedJobs((prev) => [
      ...prev,
      { jobId, appliedAt: new Date().toISOString(), status: "pending" },
    ]);
    return true;
  };

  const recordAssessmentAttempt = (attempt: AssessmentAttempt) => {
    setAssessmentAttempts((prev) => [attempt, ...prev]);
  };

  const updateResume = (newResume: Resume) => {
    setResume(newResume);
  };

  const logout = () => {
    // Reset to student demo
    setRole("student");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        enrolledCourseIds,
        enrollInCourse,
        completedLessons,
        markLessonComplete,
        savedJobIds,
        toggleSaveJob,
        appliedJobs,
        applyToJob,
        assessmentAttempts,
        recordAssessmentAttempt,
        resume,
        updateResume,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
