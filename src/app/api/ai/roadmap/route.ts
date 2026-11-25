import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePersonalizedRoadmap } from "@/lib/ai/roadmap";
import { AiServiceUnavailableError, checkAiRateLimit } from "@/lib/ai/gemini";
import { getAuthenticatedContext } from "@/lib/api-auth";

const GenerateRoadmapSchema = z.object({
  targetRole: z.string().min(2).max(120),
  currentLevel: z.string().max(60).optional().default("Beginner"),
  timeCommitmentHoursPerWeek: z.number().min(2).max(80).optional().default(15),
  focusAreas: z.array(z.string().max(80)).max(15).optional().default([]),
});

const UpdateMilestoneSchema = z.object({
  roadmapId: z.string().uuid(),
  phaseId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { data, error } = await admin
    .from("career_roadmaps")
    .select("*")
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roadmaps: data || [] });
}

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { allowed } = checkAiRateLimit(`roadmap:${user.id}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const parsed = GenerateRoadmapSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid roadmap parameters" },
        { status: 400 }
      );
    }

    const { data: userSkills } = await admin
      .from("user_skills")
      .select("skill:skills(name)")
      .eq("user_id", user.id);

    const existingSkills = (userSkills || [])
      .map((r: Record<string, unknown>) => (r.skill as { name?: string } | null)?.name)
      .filter((x): x is string => Boolean(x));

    const roadmap = await generatePersonalizedRoadmap({
      ...parsed.data,
      existingSkills,
    });

    const { data: saved, error: saveErr } = await admin
      .from("career_roadmaps")
      .insert({
        student_id: user.id,
        title: `${roadmap.targetRole} Roadmap`,
        target_role: roadmap.targetRole,
        current_level: parsed.data.currentLevel,
        roadmap_data: {
          phases: roadmap.phases,
          estimated_completion: `${roadmap.estimatedWeeksTotal} Weeks`,
          target_skills: roadmap.milestoneBadges,
        },
        generated_by_ai: true,
      })
      .select("*")
      .single();

    if (saveErr) {
      return NextResponse.json({ error: saveErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: roadmap, record: saved });
  } catch (err: unknown) {
    if (err instanceof AiServiceUnavailableError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = UpdateMilestoneSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid milestone update" }, { status: 400 });
    }

    const { data: existing } = await admin
      .from("career_roadmaps")
      .select("*")
      .eq("id", parsed.data.roadmapId)
      .eq("student_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const roadmapData = existing.roadmap_data as {
      phases: Array<{ id: string; status: string } & Record<string, unknown>>;
      estimated_completion: string;
      target_skills: string[];
    };

    const updatedPhases = (roadmapData.phases || []).map((p) =>
      p.id === parsed.data.phaseId ? { ...p, status: parsed.data.status } : p
    );

    const { data: updated, error } = await admin
      .from("career_roadmaps")
      .update({
        roadmap_data: {
          ...roadmapData,
          phases: updatedPhases,
        },
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ record: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update milestone" },
      { status: 500 }
    );
  }
}
