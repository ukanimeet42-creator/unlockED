import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification, requireApiRole } from "@/lib/api-auth";
import { isUuid, resolveCourseUuid } from "@/lib/catalog";

const EnrollSchema = z.object({
  courseId: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = EnrollSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const courseUuid = resolveCourseUuid(parsed.data.courseId);
    if (!isUuid(courseUuid)) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: course } = await admin
      .from("courses")
      .select("id, title")
      .eq("id", courseUuid)
      .eq("is_published", true)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found or unpublished" }, { status: 404 });
    }

    const { data: existing } = await admin
      .from("enrollments")
      .select("*")
      .eq("student_id", user.id)
      .eq("course_id", courseUuid)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ enrollment: existing, alreadyEnrolled: true });
    }

    const { data: inserted, error } = await admin
      .from("enrollments")
      .insert({
        student_id: user.id,
        course_id: courseUuid,
        status: "active",
        progress_percentage: 0,
      })
      .select("*")
      .single();

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message || "Enrollment failed" }, { status: 500 });
    }

    await createNotification(admin, {
      userId: user.id,
      type: "course_achievement",
      title: "Enrolled in Engineering Track",
      message: `Started "${course.title}". Complete all modules and the benchmark to earn your certificate.`,
      data: { courseId: courseUuid },
    });

    return NextResponse.json({ enrollment: inserted });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to enroll" },
      { status: 500 }
    );
  }
}
