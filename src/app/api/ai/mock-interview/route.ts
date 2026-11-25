import { NextResponse } from "next/server";
import { z } from "zod";
import { generateInterviewQuestions, evaluateInterviewAnswer } from "@/lib/ai/mock-interview";
import { AiServiceUnavailableError, checkAiRateLimit } from "@/lib/ai/gemini";
import { getAuthenticatedContext } from "@/lib/api-auth";

const InterviewSchema = z.object({
  action: z.enum(["generate", "evaluate"]).optional().default("generate"),
  targetRole: z.string().min(2).max(120),
  experienceLevel: z.enum(["entry", "mid", "senior"]).optional().default("entry"),
  question: z.string().max(1500).optional(),
  expectedConcepts: z.array(z.string().max(120)).optional(),
  candidateAnswer: z.string().max(4000).optional(),
});

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { allowed } = checkAiRateLimit(`interview:${user.id}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const parsed = InterviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid interview request" },
        { status: 400 }
      );
    }

    const { action, targetRole, experienceLevel, question, expectedConcepts, candidateAnswer } =
      parsed.data;

    if (action === "evaluate") {
      if (!question || !candidateAnswer || candidateAnswer.trim().length < 5) {
        return NextResponse.json(
          { error: "Please provide both question and an answer before submitting." },
          { status: 400 }
        );
      }
      const evaluation = await evaluateInterviewAnswer({
        targetRole,
        question,
        expectedConcepts: expectedConcepts || [],
        candidateAnswer,
      });

      await admin.from("ai_conversations").insert({
        student_id: user.id,
        type: "mock_interview",
        title: `Mock Interview: ${targetRole}`,
        messages: [
          { id: `q-${Date.now()}`, role: "assistant", content: question, timestamp: new Date().toISOString() },
          { id: `a-${Date.now()}`, role: "user", content: candidateAnswer, timestamp: new Date().toISOString() },
        ],
        metadata: { targetRole, evaluation },
      });

      return NextResponse.json({ data: evaluation });
    }

    const questions = await generateInterviewQuestions({
      targetRole,
      experienceLevel,
      count: 3,
    });
    return NextResponse.json({ data: questions });
  } catch (err: unknown) {
    if (err instanceof AiServiceUnavailableError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process interview" },
      { status: 500 }
    );
  }
}
