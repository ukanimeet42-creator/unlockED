import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeCareerGuidance } from "@/lib/ai/career-assistant";
import { AiServiceUnavailableError, checkAiRateLimit } from "@/lib/ai/gemini";
import { getAuthenticatedContext } from "@/lib/api-auth";

const CareerPromptSchema = z.object({
  interests: z.string().min(2).max(2000),
  background: z.string().max(2000).optional(),
  skills: z.array(z.string().max(80)).max(30).optional(),
});

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { data } = await admin
    .from("ai_conversations")
    .select("*")
    .eq("student_id", user.id)
    .eq("type", "career_assistant")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ conversation: data || null });
}

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  const { allowed } = checkAiRateLimit(`career:${user.id}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Please wait a minute before sending another request." },
      { status: 429 }
    );
  }

  try {
    const parsed = CareerPromptSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please enter a valid career question" },
        { status: 400 }
      );
    }

    // Hydrate real context from the student's DB profile, skills, and enrolled tracks
    const [skillsRes, enrollRes] = await Promise.all([
      admin.from("user_skills").select("skill:skills(name)").eq("user_id", user.id),
      admin.from("enrollments").select("course:courses(title)").eq("student_id", user.id),
    ]);

    const dbSkills = (skillsRes.data || [])
      .map((r: Record<string, unknown>) => {
        const s = r.skill as { name?: string } | null;
        return s?.name;
      })
      .filter((x): x is string => Boolean(x));

    const dbCourses = (enrollRes.data || [])
      .map((r: Record<string, unknown>) => {
        const c = r.course as { title?: string } | null;
        return c?.title;
      })
      .filter((x): x is string => Boolean(x));

    const guidance = await analyzeCareerGuidance({
      interests: parsed.data.interests,
      background: parsed.data.background || profile.bio || "",
      skills:
        parsed.data.skills && parsed.data.skills.length > 0
          ? parsed.data.skills
          : dbSkills,
      completedCourses: dbCourses,
    });

    // Persist conversation history
    const { data: existingConv } = await admin
      .from("ai_conversations")
      .select("*")
      .eq("student_id", user.id)
      .eq("type", "career_assistant")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();
    const appendedMessages = [
      ...(Array.isArray(existingConv?.messages) ? existingConv.messages : []),
      {
        id: `u-${Date.now()}`,
        role: "user",
        content: parsed.data.interests,
        timestamp: now,
      },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: guidance.summary,
        timestamp: now,
        metadata: { guidance },
      },
    ];

    if (existingConv) {
      await admin
        .from("ai_conversations")
        .update({ messages: appendedMessages.slice(-40) })
        .eq("id", existingConv.id);
    } else {
      await admin.from("ai_conversations").insert({
        student_id: user.id,
        type: "career_assistant",
        title: "Career Advisor Session",
        messages: appendedMessages,
      });
    }

    return NextResponse.json({ data: guidance });
  } catch (err: unknown) {
    if (err instanceof AiServiceUnavailableError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate AI career guidance" },
      { status: 500 }
    );
  }
}
