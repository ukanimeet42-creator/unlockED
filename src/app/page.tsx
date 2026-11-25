import React from "react";
import { UniverseHomepage } from "@/components/home/universe-homepage";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { hydrateCourse } from "@/lib/catalog";
import { syncCurriculumToDatabase } from "@/lib/seed-catalog";
import { REAL_COURSES, REAL_LESSONS } from "@/lib/data/course-data";
import type { Course } from "@/types";

export const revalidate = 60;

async function loadPublicCourses(): Promise<Course[]> {
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        const { data: lessonRows } = await admin.from("lessons").select("course_id");
        return data.map((row) =>
          hydrateCourse(
            row,
            (lessonRows || []).filter((l) => l.course_id === row.id).length
          )
        );
      }

      await syncCurriculumToDatabase(admin);
    } catch {
      // Fallback safely to static curriculum catalog definitions if DB read is transiently unavailable
    }
  }

  return REAL_COURSES.map((c) => ({
    ...c,
    slug: c.id,
    lesson_count: (REAL_LESSONS[c.id] || []).length,
  }));
}

export default async function HomePage() {
  const courses = await loadPublicCourses();
  return <UniverseHomepage initialCourses={courses} />;
}
