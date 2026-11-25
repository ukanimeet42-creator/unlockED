import { NextResponse } from "next/server";
import { z } from "zod";
import { improveResumeContent } from "@/lib/ai/resume-assistant";
import { AiServiceUnavailableError, checkAiRateLimit } from "@/lib/ai/gemini";
import { getAuthenticatedContext } from "@/lib/api-auth";

const ResumeAssistSchema = z.object({
  targetRole: z.string().min(2).max(120),
  textToImprove: z.string().min(5, "Enter at least a short sentence to enhance").max(3000),
  type: z.enum(["summary", "bullet_point", "experience"]).optional().default("bullet_point"),
});

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { allowed } = checkAiRateLimit(`resume:${user.id}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const parsed = ResumeAssistSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid resume input" },
        { status: 400 }
      );
    }

    const improvement = await improveResumeContent(parsed.data);

    await admin.from("ai_conversations").insert({
      student_id: user.id,
      type: "resume_review",
      title: `Resume Enhancement: ${parsed.data.targetRole}`,
      messages: [
        { id: `u-${Date.now()}`, role: "user", content: parsed.data.textToImprove, timestamp: new Date().toISOString() },
        { id: `a-${Date.now()}`, role: "assistant", content: improvement.improvedText, timestamp: new Date().toISOString() },
      ],
      metadata: { improvement },
    });

    return NextResponse.json({ data: improvement });
  } catch (err: unknown) {
    if (err instanceof AiServiceUnavailableError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to improve resume" },
      { status: 500 }
    );
  }
}
