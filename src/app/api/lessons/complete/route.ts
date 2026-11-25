import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { isUuid, resolveCourseUuid, resolveLessonUuid } from "@/lib/catalog";
import { evaluateAndIssueCertificate } from "@/lib/certificates";

const CompleteLessonSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = CompleteLessonSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const courseUuid = resolveCourseUuid(parsed.data.courseId);
    const lessonUuid = resolveLessonUuid(parsed.data.lessonId);

    if (!isUuid(courseUuid) || !isUuid(lessonUuid)) {
      return NextResponse.json({ error: "Invalid course or lesson identifier" }, { status: 404 });
    }

    const { data: lesson } = await admin
      .from("lessons")
      .select("id, course_id")
      .eq("id", lessonUuid)
      .eq("course_id", courseUuid)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Auto-create enrollment if user starts completing a lesson directly
    await admin.from("enrollments").upsert(
      {
        student_id: user.id,
        course_id: courseUuid,
        status: "active",
      },
      { onConflict: "student_id,course_id", ignoreDuplicates: true }
    );

    const { error: progErr } = await admin.from("lesson_progress").upsert(
      {
        student_id: user.id,
        lesson_id: lessonUuid,
        course_id: courseUuid,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" }
    );

    if (progErr) {
      return NextResponse.json({ error: progErr.message }, { status: 500 });
    }

    // Recompute exact progress percentage from DB
    const [allLessonsRes, doneLessonsRes] = await Promise.all([
      admin
        .from("lessons")
        .select("id")
        .eq("course_id", courseUuid)
        .eq("is_published", true),
      admin
        .from("lesson_progress")
        .select("lesson_id")
        .eq("student_id", user.id)
        .eq("course_id", courseUuid)
        .eq("completed", true),
    ]);

    const totalCount = Math.max(1, (allLessonsRes.data || []).length);
    const doneCount = (doneLessonsRes.data || []).length;
    const progressPct = Math.min(100, Math.round((doneCount / totalCount) * 100));

    await admin
      .from("enrollments")
      .update({
        progress_percentage: progressPct,
        status: progressPct === 100 ? "completed" : "active",
        completed_at: progressPct === 100 ? new Date().toISOString() : null,
      })
      .eq("student_id", user.id)
      .eq("course_id", courseUuid);

    const certResult = await evaluateAndIssueCertificate(admin, user.id, courseUuid);

    return NextResponse.json({
      completed: true,
      progressPercentage: progressPct,
      completedCount: doneCount,
      totalLessons: totalCount,
      certificateIssued: certResult.issued,
      certificateNumber: certResult.certificateNumber || null,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save lesson progress" },
      { status: 500 }
    );
  }
}
