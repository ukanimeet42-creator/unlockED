import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification, requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";
import { evaluateAndIssueCertificate } from "@/lib/certificates";
import type { AssessmentQuestion } from "@/types";

const SubmitSchema = z.object({
  assessmentId: z.string().min(1),
  answers: z.record(z.string(), z.number().int().min(0).max(10)),
  timeSpentSeconds: z.number().int().min(0).max(7200).optional(),
});

export async function POST(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const raw = await req.json();
    const parsed = SubmitSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid assessment submission" },
        { status: 400 }
      );
    }

    const { assessmentId, answers, timeSpentSeconds = 0 } = parsed.data;
    if (!isUuid(assessmentId)) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const { data: assessment, error } = await admin
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("is_published", true)
      .single();

    if (error || !assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const questions = Array.isArray(assessment.questions)
      ? (assessment.questions as AssessmentQuestion[])
      : [];

    if (questions.length === 0) {
      return NextResponse.json({ error: "Assessment has no configured questions" }, { status: 400 });
    }

    let earnedPoints = 0;
    let totalPoints = 0;
    const breakdown: {
      questionId: string;
      isCorrect: boolean;
      correctOption: number;
      pointsEarned: number;
      pointsPossible: number;
      explanation: string;
    }[] = [];

    for (const q of questions) {
      const pts = Number(q.points) || 25;
      totalPoints += pts;
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correct_answer;

      if (isCorrect) {
        earnedPoints += pts;
      }

      breakdown.push({
        questionId: q.id,
        isCorrect,
        correctOption: q.correct_answer,
        pointsEarned: isCorrect ? pts : 0,
        pointsPossible: pts,
        explanation: q.explanation || "Evaluated against benchmark answer key.",
      });
    }

    const percentage = Math.round((earnedPoints / Math.max(1, totalPoints)) * 100);
    const passed = percentage >= assessment.passing_score;

    const { data: attempt, error: attemptErr } = await admin
      .from("assessment_attempts")
      .insert({
        student_id: user.id,
        assessment_id: assessment.id,
        score: earnedPoints,
        total_points: totalPoints,
        percentage,
        answers,
        time_spent_seconds: timeSpentSeconds,
        passed,
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (attemptErr || !attempt) {
      return NextResponse.json(
        { error: attemptErr?.message || "Failed to record assessment attempt" },
        { status: 500 }
      );
    }

    // Update skill proficiency record when student passes
    if (passed && assessment.skill_id) {
      const proficiency = percentage >= 90 ? "expert" : percentage >= 80 ? "advanced" : "intermediate";
      await admin.from("user_skills").upsert(
        {
          user_id: user.id,
          skill_id: assessment.skill_id,
          proficiency,
          verified: true,
          verified_at: new Date().toISOString(),
        },
        { onConflict: "user_id,skill_id" }
      );
    }

    // Issue track certificate if all course lessons are also complete
    let certResult: { issued: boolean; certificateNumber?: string } = { issued: false };
    if (passed && assessment.course_id) {
      certResult = await evaluateAndIssueCertificate(admin, user.id, assessment.course_id);
    }

    await createNotification(admin, {
      userId: user.id,
      type: "assessment_result",
      title: passed
        ? `Benchmark Passed (${percentage}%)`
        : `Benchmark Completed (${percentage}%)`,
      message: `${assessment.title}: scored ${earnedPoints}/${totalPoints} pts.`,
      data: {
        attemptId: attempt.id,
        assessmentId: assessment.id,
        percentage,
        passed,
      },
    });

    return NextResponse.json({
      attempt,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed,
      timeSpentSeconds,
      breakdown,
      certificateIssued: certResult.issued,
      certificateNumber: certResult.certificateNumber || null,
      message: passed
        ? "Passed! Score recorded to your profile."
        : `Scored ${percentage}%. Passing score is ${assessment.passing_score}%. Review the explanations and retry.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to evaluate assessment submission",
      },
      { status: 500 }
    );
  }
}
