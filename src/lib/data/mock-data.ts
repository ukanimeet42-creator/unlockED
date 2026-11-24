import { Course, Job, Assessment, Skill, Profile, Project, Resume, Company, Notification, Lesson } from "@/types";
import { REAL_COURSES, REAL_LESSONS, REAL_SKILLS } from "./course-data";

export const INITIAL_SKILLS: Skill[] = REAL_SKILLS;

export const INITIAL_COURSES: Course[] = REAL_COURSES;

export const INITIAL_LESSONS: Record<string, Lesson[]> = REAL_LESSONS;

export const INITIAL_ASSESSMENTS: Assessment[] = [];

export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_JOBS: Job[] = [];

export const INITIAL_STUDENT_PROFILE: Profile = {
  id: "student-user",
  email: "student@unlocked.edu",
  full_name: "Student",
  avatar_url: null,
  role: "student",
  bio: "",
  phone: "",
  location: "",
  website: "",
  github_url: "",
  linkedin_url: "",
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_RESUME: Resume = {
  id: "res-1",
  student_id: "student-user",
  title: "My Resume",
  template: "modern-obsidian",
  is_primary: true,
  file_url: null,
  data: {
    personal: {
      name: "Student",
      email: "student@unlocked.edu",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_NOTIFICATIONS: Notification[] = [];
