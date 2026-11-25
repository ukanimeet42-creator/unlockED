import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hydrateCourse, hydrateLesson, isUuid, resolveCourseUuid } from "@/lib/catalog";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const courseUuid = resolveCourseUuid(id);
    if (!isUuid(courseUuid)) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: courseRow, error } = await admin
      .from("courses")
      .select("*")
      .eq("id", courseUuid)
      .single();

    if (error || !courseRow) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: lessonRows } = await admin
      .from("lessons")
      .select("*")
      .eq("course_id", courseUuid)
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    const lessons = (lessonRows || []).map((r) => hydrateLesson(r));
    const course = hydrateCourse(courseRow, lessons.length);

    return NextResponse.json({ course, lessons });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load course" },
      { status: 500 }
    );
  }
}
