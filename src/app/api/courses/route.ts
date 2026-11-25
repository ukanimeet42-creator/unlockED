import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hydrateCourse } from "@/lib/catalog";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data: courses, error } = await admin
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const [lessonsRes, enrollRes] = await Promise.all([
      admin.from("lessons").select("id, course_id").eq("is_published", true),
      admin.from("enrollments").select("course_id"),
    ]);

    const lessonCounts = new Map<string, number>();
    for (const l of lessonsRes.data || []) {
      lessonCounts.set(l.course_id, (lessonCounts.get(l.course_id) || 0) + 1);
    }

    const enrollCounts = new Map<string, number>();
    for (const e of enrollRes.data || []) {
      enrollCounts.set(e.course_id, (enrollCounts.get(e.course_id) || 0) + 1);
    }

    const hydrated = (courses || []).map((row) => {
      const course = hydrateCourse(row, lessonCounts.get(row.id) || 0);
      course.enrolled_count = enrollCounts.get(row.id) || 0;
      return course;
    });

    return NextResponse.json({ courses: hydrated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load catalog" },
      { status: 500 }
    );
  }
}
