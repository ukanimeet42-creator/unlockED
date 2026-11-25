import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "./api-auth";

/**
 * Evaluates valid completion criteria for a course and issues a DB-backed certificate
 * strictly on the server once all lessons (and linked assessment, if present) are completed.
 */
export async function evaluateAndIssueCertificate(
  admin: SupabaseClient,
  studentId: string,
  courseId: string
): Promise<{ issued: boolean; certificateNumber?: string }> {
  // 1. Already issued?
  const { data: existing } = await admin
    .from("certificates")
    .select("certificate_number")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return { issued: true, certificateNumber: existing.certificate_number };
  }

  // 2. Check all published lessons for this course
  const { data: lessons } = await admin
    .from("lessons")
    .select("id")
    .eq("course_id", courseId)
    .eq("is_published", true);

  if (!lessons || lessons.length === 0) {
    return { issued: false };
  }

  const { data: progressRows } = await admin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("completed", true);

  const completedSet = new Set((progressRows || []).map((r) => r.lesson_id));
  const allLessonsDone = lessons.every((l) => completedSet.has(l.id));
  if (!allLessonsDone) {
    return { issued: false };
  }

  // 3. Check linked published assessment if one exists
  const { data: linkedAssessments } = await admin
    .from("assessments")
    .select("id")
    .eq("course_id", courseId)
    .eq("is_published", true);

  if (linkedAssessments && linkedAssessments.length > 0) {
    const assessmentIds = linkedAssessments.map((a) => a.id);
    const { data: passedAttempts } = await admin
      .from("assessment_attempts")
      .select("id")
      .eq("student_id", studentId)
      .in("assessment_id", assessmentIds)
      .eq("passed", true)
      .limit(1);

    if (!passedAttempts || passedAttempts.length === 0) {
      return { issued: false };
    }
  }

  // 4. Generate unique verifiable certificate code and store
  const code = `UED-${new Date().getFullYear()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  const { data: inserted, error } = await admin
    .from("certificates")
    .insert({
      student_id: studentId,
      course_id: courseId,
      certificate_number: code,
    })
    .select("certificate_number")
    .single();

  if (error || !inserted) {
    return { issued: false };
  }

  await admin
    .from("enrollments")
    .update({
      status: "completed",
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
    })
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  const { data: course } = await admin
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();

  await createNotification(admin, {
    userId: studentId,
    type: "course_achievement",
    title: "Track Certificate Issued",
    message: `Earned verified certificate ${inserted.certificate_number} for "${course?.title || "Engineering Track"}".`,
    data: { courseId, certificateNumber: inserted.certificate_number },
  });

  return { issued: true, certificateNumber: inserted.certificate_number };
}
