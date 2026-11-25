import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getNormalizedSeedCurriculum,
  PRODUCTION_ASSESSMENTS,
  serializeLessonContent,
} from "./catalog";

/**
 * Idempotently synchronizes the normalized 4 courses, 16 structured lessons,
 * and 4 server-scored assessments into live Supabase PostgreSQL.
 */
export async function syncCurriculumToDatabase(admin: SupabaseClient) {
  const { courses, lessons } = getNormalizedSeedCurriculum();

  const courseRows = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    short_description: c.short_description,
    thumbnail_url: c.thumbnail_url,
    category: c.category,
    difficulty: c.difficulty,
    duration_weeks: c.duration_weeks,
    tags: c.tags,
    is_published: c.is_published,
  }));

  const { error: courseErr } = await admin
    .from("courses")
    .upsert(courseRows, { onConflict: "id" });

  if (courseErr) {
    throw new Error(`Course upsert failed: ${courseErr.message}`);
  }

  // Remove old legacy partial seed lessons that conflict on (course_id, order_index)
  const legacyIds = [
    "33333333-3333-3333-3333-333333333301",
    "33333333-3333-3333-3333-333333333302",
    "33333333-3333-3333-3333-333333333303",
  ];
  await admin.from("lessons").delete().in("id", legacyIds);

  const lessonRows = lessons.map((l) => ({
    id: l.id,
    course_id: l.course_id,
    title: l.title,
    content: serializeLessonContent(l),
    order_index: l.order_index,
    duration_minutes: l.duration_minutes,
    video_url: l.video_url,
    is_published: l.is_published,
  }));

  const { error: lessonErr } = await admin
    .from("lessons")
    .upsert(lessonRows, { onConflict: "id" });

  if (lessonErr) {
    throw new Error(`Lesson upsert failed: ${lessonErr.message}`);
  }

  const assessmentRows = PRODUCTION_ASSESSMENTS.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    course_id: a.course_id,
    skill_id: a.skill_id,
    time_limit_minutes: a.time_limit_minutes,
    passing_score: a.passing_score,
    total_questions: a.total_questions,
    questions: a.questions,
    is_published: a.is_published,
  }));

  const { error: assessErr } = await admin
    .from("assessments")
    .upsert(assessmentRows, { onConflict: "id" });

  if (assessErr) {
    throw new Error(`Assessment upsert failed: ${assessErr.message}`);
  }

  return {
    coursesSynced: courseRows.length,
    lessonsSynced: lessonRows.length,
    assessmentsSynced: assessmentRows.length,
  };
}
