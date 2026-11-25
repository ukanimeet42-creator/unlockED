import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSkillGap } from "@/lib/ai/skill-gap";
import { AiServiceUnavailableError, checkAiRateLimit } from "@/lib/ai/gemini";
import { getAuthenticatedContext } from "@/lib/api-auth";

const SkillGapSchema = z.object({
  candidateSkills: z.array(z.string().max(80)).optional(),
  targetRole: z.string().min(2).max(120),
  jobRequirements: z.array(z.string().max(200)).optional().default([]),
});

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { allowed } = checkAiRateLimit(`skillgap:${user.id}`);
  if (!allowed) {
    return NextResponse.json({ error: "AI rate limit reached." }, { status: 429 });
  }

  try {
    const parsed = SkillGapSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid skill-gap parameters" }, { status: 400 });
    }

    const { data: userSkills } = await admin
      .from("user_skills")
      .select("skill:skills(name)")
      .eq("user_id", user.id);

    const dbSkills = (userSkills || [])
      .map((r: Record<string, unknown>) => (r.skill as { name?: string } | null)?.name)
      .filter((x): x is string => Boolean(x));

    const analysis = await analyzeSkillGap({
      candidateSkills:
        parsed.data.candidateSkills && parsed.data.candidateSkills.length > 0
          ? parsed.data.candidateSkills
          : dbSkills,
      targetRole: parsed.data.targetRole,
      jobRequirements: parsed.data.jobRequirements,
    });

    await admin.from("ai_conversations").insert({
      student_id: user.id,
      type: "skill_gap",
      title: `Skill Gap Analysis: ${parsed.data.targetRole}`,
      messages: [
        { id: `u-${Date.now()}`, role: "user", content: parsed.data.targetRole, timestamp: new Date().toISOString() },
        { id: `a-${Date.now()}`, role: "assistant", content: `Coverage score: ${analysis.coverageScore}%`, timestamp: new Date().toISOString() },
      ],
      metadata: { analysis },
    });

    return NextResponse.json({ data: analysis });
  } catch (err: unknown) {
    if (err instanceof AiServiceUnavailableError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to analyze skill gap" },
      { status: 500 }
    );
  }
}
