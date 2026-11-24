"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, UserRole, Course, Job, Application, AssessmentAttempt, Resume } from "@/types";
import { INITIAL_STUDENT_PROFILE, INITIAL_RESUME } from "@/lib/data/mock-data";

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
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<{ jobId: string; appliedAt: string; status: string }[]>([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttempt[]>([]);
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
      setUser(INITIAL_STUDENT_PROFILE);
    } else if (newRole === "recruiter") {
      setUser({
        id: "recruiter-user",
        email: "recruiter@unlocked.edu",
        full_name: "Recruiter",
        avatar_url: null,
        role: "recruiter",
        bio: "",
        phone: "",
        location: "",
        website: "",
        github_url: null,
        linkedin_url: null,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      setUser({
        id: "admin-user",
        email: "admin@unlocked.edu",
        full_name: "Admin",
        avatar_url: null,
        role: "admin",
        bio: "",
        phone: "",
        location: "",
        website: "",
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
    setUser(null);
    setRoleState("student");
    if (typeof document !== "undefined") {
      document.cookie = `unlocked_demo_role=student; path=/; max-age=86400; SameSite=Lax`;
    }
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
