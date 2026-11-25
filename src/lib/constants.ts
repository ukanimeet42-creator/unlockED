export const APP_NAME = "UnlockED";
export const APP_TAGLINE = "Learn skills. Build projects. Prove your potential. Unlock opportunities.";
export const APP_DESCRIPTION = "AI-powered education and career platform that helps learners master in-demand skills, build production-grade projects, and connect with hiring partners.";

export const ROUTES = {
  // Public
  HOME: "/",
  COURSES: "/courses",
  COURSE_PUBLIC: (id: string) => `/courses/${id}`,
  PORTFOLIO: (username: string) => `/portfolio/${username}`,
  VERIFY_CERTIFICATE: (code: string) => `/verify/${code}`,

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  ONBOARDING: "/onboarding",
  AUTH_CALLBACK: "/api/auth/callback",

  // Student
  STUDENT_DASHBOARD: "/student",
  STUDENT_COURSES: "/student/courses",
  STUDENT_COURSE: (id: string) => `/student/courses/${id}`,
  STUDENT_LESSON: (courseId: string, lessonId: string) => `/student/courses/${courseId}/lessons/${lessonId}`,
  STUDENT_ASSESSMENTS: "/student/assessments",
  STUDENT_ASSESSMENT: (id: string) => `/student/assessments/${id}`,
  STUDENT_PORTFOLIO: "/student/portfolio",
  STUDENT_PROJECT: (id: string) => `/student/portfolio/${id}`,
  STUDENT_RESUME: "/student/resume",
  STUDENT_JOBS: "/student/jobs",
  STUDENT_JOB: (id: string) => `/student/jobs/${id}`,
  STUDENT_AI_ASSISTANT: "/student/ai-assistant",
  STUDENT_ROADMAP: "/student/roadmap",
  STUDENT_CERTIFICATES: "/student/certificates",
  STUDENT_NOTIFICATIONS: "/student/notifications",
  STUDENT_SETTINGS: "/student/settings",

  // Recruiter
  RECRUITER_DASHBOARD: "/recruiter",
  RECRUITER_COMPANY: "/recruiter/company",
  RECRUITER_JOBS: "/recruiter/jobs",
  RECRUITER_JOB: (id: string) => `/recruiter/jobs/${id}`,
  RECRUITER_NEW_JOB: "/recruiter/jobs/new",
  RECRUITER_CANDIDATES: "/recruiter/candidates",
  RECRUITER_CANDIDATE: (id: string) => `/recruiter/candidates/${id}`,
  RECRUITER_APPLICATIONS: "/recruiter/applications",
  RECRUITER_SETTINGS: "/recruiter/settings",

  // Admin
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_COURSES: "/admin/courses",
  ADMIN_JOBS: "/admin/jobs",
  ADMIN_RECRUITERS: "/admin/recruiters",
  ADMIN_PROJECTS: "/admin/projects",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
} as const;

export const ROLE_ROUTES: Record<string, string> = {
  student: ROUTES.STUDENT_DASHBOARD,
  recruiter: ROUTES.RECRUITER_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
};

export const COURSE_CATEGORIES = [
  "Full-Stack Development",
  "Frontend Development",
  "Backend Development",
  "DevOps & Cloud",
  "AI & Machine Learning",
  "Data Science",
  "Mobile Development",
  "Cybersecurity",
  "Blockchain",
  "UI/UX Design",
] as const;

export const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "AI/ML",
  "Cloud",
  "Mobile",
  "Tools",
  "Soft Skills",
] as const;

export const JOB_TYPES = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
] as const;

export const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending", color: "text-amber" },
  { value: "reviewed", label: "Reviewed", color: "text-secondary" },
  { value: "shortlisted", label: "Shortlisted", color: "text-primary" },
  { value: "interviewed", label: "Interviewed", color: "text-primary-container" },
  { value: "offered", label: "Offered", color: "text-tertiary" },
  { value: "rejected", label: "Rejected", color: "text-error" },
  { value: "withdrawn", label: "Withdrawn", color: "text-text-muted" },
] as const;

export const AI_RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 10,
  MAX_INPUT_LENGTH: 5000,
  MAX_CONVERSATIONS_PER_DAY: 50,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],
} as const;
