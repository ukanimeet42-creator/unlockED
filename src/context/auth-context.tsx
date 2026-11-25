"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  Application,
  AssessmentAttempt,
  CareerRoadmap,
  Certificate,
  Company,
  Enrollment,
  Notification,
  Profile,
  Project,
  Resume,
  UserRole,
  UserSkill,
} from "@/types";

export type RealtimeStatus = "connected" | "polling" | "offline";

interface WorkspaceState {
  user: Profile | null;
  role: UserRole | null;
  interests: string[];
  enrollments: Enrollment[];
  enrolledCourseIds: string[];
  completedLessons: string[];
  savedJobIds: string[];
  applications: Application[];
  assessmentAttempts: AssessmentAttempt[];
  resumes: Resume[];
  projects: Project[];
  certificates: Certificate[];
  notifications: Notification[];
  userSkills: UserSkill[];
  roadmaps: CareerRoadmap[];
  company: Company | null;
}

const EMPTY_STATE: WorkspaceState = {
  user: null,
  role: null,
  interests: [],
  enrollments: [],
  enrolledCourseIds: [],
  completedLessons: [],
  savedJobIds: [],
  applications: [],
  assessmentAttempts: [],
  resumes: [],
  projects: [],
  certificates: [],
  notifications: [],
  userSkills: [],
  roadmaps: [],
  company: null,
};

interface AuthContextType extends WorkspaceState {
  isLoading: boolean;
  isAuthenticated: boolean;
  realtimeStatus: RealtimeStatus;
  refreshWorkspace: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<{ ok: boolean; error?: string }>;
  markLessonComplete: (
    courseId: string,
    lessonId: string
  ) => Promise<{ ok: boolean; certificateNumber?: string | null; error?: string }>;
  toggleSaveJob: (jobId: string) => Promise<void>;
  applyToJob: (
    jobId: string,
    coverLetter: string,
    resumeId?: string | null
  ) => Promise<{ ok: boolean; error?: string }>;
  recordAssessmentAttempt: (attempt: AssessmentAttempt) => void;
  updateResumeLocal: (updated: Resume) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<WorkspaceState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(() => isSupabaseConfigured());
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("offline");

  const supabase = useMemo(() => createClient(), []);

  const refreshWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        setState(EMPTY_STATE);
        setRealtimeStatus("offline");
        return;
      }
      if (!res.ok) return;

      const json = await res.json();
      setState({
        user: json.profile || null,
        role: json.profile?.role || null,
        interests: json.interests || [],
        enrollments: json.enrollments || [],
        enrolledCourseIds: json.enrolledCourseIds || [],
        completedLessons: json.completedLessons || [],
        savedJobIds: json.savedJobIds || [],
        applications: json.applications || [],
        assessmentAttempts: json.assessmentAttempts || [],
        resumes: json.resumes || [],
        projects: json.projects || [],
        certificates: json.certificates || [],
        notifications: json.notifications || [],
        userSkills: json.userSkills || [],
        roadmaps: json.roadmaps || [],
        company: json.company || null,
      });
    } catch {
      // Keep prior state cleanly on transient network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) {
        refreshWorkspace();
      } else {
        setState(EMPTY_STATE);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        refreshWorkspace();
      } else {
        setState(EMPTY_STATE);
        setRealtimeStatus("offline");
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, refreshWorkspace]);

  // Scoped Realtime subscription + SSE event stream + reliable fallback reconciliation
  useEffect(() => {
    const userId = state.user?.id;
    if (!userId || !isSupabaseConfigured()) return;

    const triggerSync = () => {
      refreshWorkspace();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("unlocked:sync"));
      }
    };

    const channel = supabase
      .channel(`user-sync-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        triggerSync
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        triggerSync
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        triggerSync
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "certificates", filter: `student_id=eq.${userId}` },
        triggerSync
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
        }
      });

    let eventSource: EventSource | null = null;
    if (typeof EventSource !== "undefined") {
      eventSource = new EventSource("/api/realtime/events");
      eventSource.addEventListener("connected", () => {
        setRealtimeStatus("connected");
      });
      eventSource.addEventListener("sync", () => {
        triggerSync();
      });
      eventSource.addEventListener("revoked", () => {
        setState(EMPTY_STATE);
        setRealtimeStatus("offline");
        supabase.auth.signOut().catch(() => {});
        router.push("/login?suspended=1");
      });
      eventSource.onerror = () => {
        setRealtimeStatus((prev) => (prev === "offline" ? "offline" : "polling"));
      };
    }

    // Reliable fallback reconciliation interval (20s)
    const fallbackTimer = setInterval(() => {
      triggerSync();
    }, 20000);

    return () => {
      clearInterval(fallbackTimer);
      eventSource?.close();
      supabase.removeChannel(channel);
    };
  }, [state.user?.id, supabase, refreshWorkspace, router]);

  const enrollInCourse = useCallback(
    async (courseId: string) => {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || "Enrollment failed" };
      }
      await refreshWorkspace();
      return { ok: true };
    },
    [refreshWorkspace]
  );

  const markLessonComplete = useCallback(
    async (courseId: string, lessonId: string) => {
      const res = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || "Failed to save lesson progress" };
      }
      await refreshWorkspace();
      return { ok: true, certificateNumber: json.certificateNumber || null };
    },
    [refreshWorkspace]
  );

  const toggleSaveJob = useCallback(
    async (jobId: string) => {
      const res = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        await refreshWorkspace();
      }
    },
    [refreshWorkspace]
  );

  const applyToJob = useCallback(
    async (jobId: string, coverLetter: string, resumeId?: string | null) => {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter, resumeId }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || "Application failed" };
      }
      await refreshWorkspace();
      return { ok: true };
    },
    [refreshWorkspace]
  );

  const recordAssessmentAttempt = useCallback((attempt: AssessmentAttempt) => {
    setState((prev) => ({
      ...prev,
      assessmentAttempts: [attempt, ...prev.assessmentAttempts],
    }));
  }, []);

  const updateResumeLocal = useCallback((updated: Resume) => {
    setState((prev) => ({
      ...prev,
      resumes: [updated, ...prev.resumes.filter((r) => r.id !== updated.id)],
    }));
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState(EMPTY_STATE);
    setRealtimeStatus("offline");
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isLoading,
        isAuthenticated: Boolean(state.user),
        realtimeStatus,
        refreshWorkspace,
        enrollInCourse,
        markLessonComplete,
        toggleSaveJob,
        applyToJob,
        recordAssessmentAttempt,
        updateResumeLocal,
        markNotificationRead,
        markAllNotificationsRead,
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
