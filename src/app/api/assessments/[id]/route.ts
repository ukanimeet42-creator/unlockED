import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";
import type { AssessmentQuestion } from "@/types";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { admin } = auth.ctx;

  try {
    const { data, error } = await admin
      .from("assessments")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Security guarantee: NEVER send answer keys or explanations to the client before submission
    const rawQuestions = Array.isArray(data.questions)
      ? (data.questions as AssessmentQuestion[])
      : [];
    const safeQuestions = rawQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({
      assessment: {
        id: data.id,
        title: data.title,
        description: data.description,
        course_id: data.course_id,
        skill_id: data.skill_id,
        time_limit_minutes: data.time_limit_minutes,
        passing_score: data.passing_score,
        total_questions: safeQuestions.length,
        is_published: data.is_published,
        questions: safeQuestions,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load assessment" },
      { status: 500 }
    );
  }
}
