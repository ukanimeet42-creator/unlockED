import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;

  const { admin } = auth.ctx;

  try {
    const { data, error } = await admin
      .from("assessments")
      .select(
        "id, title, description, course_id, skill_id, time_limit_minutes, passing_score, total_questions, is_published, created_at"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assessments: data || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load assessments" },
      { status: 500 }
    );
  }
}
