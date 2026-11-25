export type UserRole = "student" | "recruiter" | "admin";
export type AccountStatus = "active" | "suspended";

export interface NotificationPreferences {
  email_updates: boolean;
  job_alerts: boolean;
  course_reminders: boolean;
}

export interface PrivacySettings {
  public_portfolio: boolean;
  show_email_to_recruiters: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  status?: AccountStatus;
  suspended_at?: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  onboarding_completed: boolean;
  notification_preferences?: NotificationPreferences;
  privacy_settings?: PrivacySettings;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Company {
  id: string;
  recruiter_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  thumbnail_url: string | null;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  tags: string[];
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  slug?: string;
  lesson_count?: number;
  enrolled_count?: number;
  prerequisites?: string[];
  learning_outcomes?: string[];
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonExample {
  title: string;
  language: string;
  code: string;
  explanation: string;
  output?: string;
}

export interface LessonTheorySection {
  heading: string;
  body: string;
  key_points?: string[];
}

export interface LessonChallenge {
  prompt: string;
  starter_code?: string;
  solution_code?: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  slug?: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  duration_minutes: number | null;
  video_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  summary?: string;
  learning_objectives?: string[];
  theory_sections?: LessonTheorySection[];
  examples?: LessonExample[];
  quiz?: LessonQuizQuestion[];
  challenge?: LessonChallenge;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: "active" | "completed" | "dropped";
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  skill?: Skill;
}

export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  skill_id: string | null;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  questions: AssessmentQuestion[];
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // Server-only, never sent to client
  explanation: string | null;
  points: number;
}

export interface AssessmentAttempt {
  id: string;
  student_id: string;
  assessment_id: string;
  score: number;
  total_points: number;
  percentage: number;
  answers: Record<string, number>;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
  passed: boolean;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string;
  short_description: string | null;
  thumbnail_url: string | null;
  images: string[];
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  is_public: boolean;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  // Computed
  student?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course?: Pick<Course, "id" | "title" | "category">;
}

export interface Resume {
  id: string;
  student_id: string;
  title: string;
  template: string;
  data: ResumeData;
  file_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
  };
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string | null;
    current: boolean;
    description: string;
    highlights: string[];
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    location: string;
    start_date: string;
    end_date: string | null;
    gpa: string;
    highlights: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url: string;
  }[];
}

export interface Job {
  id: string;
  company_id: string;
  recruiter_id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  location: string;
  job_type: "full-time" | "part-time" | "contract" | "internship";
  experience_level: "entry" | "mid" | "senior";
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  is_remote: boolean;
  is_active: boolean;
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  company?: Company;
  application_count?: number;
}

export interface Application {
  id: string;
  student_id: string;
  job_id: string;
  resume_id: string | null;
  cover_letter: string | null;
  status: "pending" | "reviewed" | "shortlisted" | "interviewed" | "offered" | "rejected" | "withdrawn";
  applied_at: string;
  updated_at: string;
  // Computed
  job?: Job;
  student?: Profile;
}

export interface SavedJob {
  id: string;
  student_id: string;
  job_id: string;
  saved_at: string;
  job?: Job;
}

export interface AIConversation {
  id: string;
  student_id: string;
  type: "career_assistant" | "mock_interview" | "resume_review" | "skill_gap";
  title: string;
  messages: AIMessage[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface CareerRoadmap {
  id: string;
  student_id: string;
  title: string;
  target_role: string;
  current_level: string;
  roadmap_data: RoadmapData;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoadmapData {
  phases: {
    id: string;
    title: string;
    description: string;
    duration_weeks: number;
    skills: string[];
    projects: string[];
    milestones: string[];
    status: "not_started" | "in_progress" | "completed";
    order: number;
  }[];
  estimated_completion: string;
  target_skills: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: "application_update" | "course_achievement" | "assessment_result" | "job_alert" | "system" | "ai_recommendation";
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

export interface OnboardingForm {
  role: UserRole;
  full_name: string;
  bio: string;
  interests: string[];
}
