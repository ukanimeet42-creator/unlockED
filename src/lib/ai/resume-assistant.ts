import { z } from "zod";
import { AiServiceUnavailableError, generateAiContent, sanitizeAiInput } from "./gemini";

export const ResumeImprovementSchema = z.object({
  originalText: z.string(),
  improvedText: z.string(),
  actionVerbsAdded: z.array(z.string()),
  impactScoreBefore: z.number().min(0).max(100),
  impactScoreAfter: z.number().min(0).max(100),
  reasoning: z.string(),
  missingSectionsOrKeywords: z.array(z.string()),
});

export type ResumeImprovement = z.infer<typeof ResumeImprovementSchema>;

export async function improveResumeContent({
  targetRole,
  textToImprove,
  type = "bullet_point",
}: {
  targetRole: string;
  textToImprove: string;
  type?: "summary" | "bullet_point" | "experience";
}): Promise<ResumeImprovement> {
  const safeRole = sanitizeAiInput(targetRole) || "Software Engineer";
  const safeText = sanitizeAiInput(textToImprove);

  if (!safeText) {
    throw new AiServiceUnavailableError("Please provide existing resume text or summary to enhance.");
  }

  const prompt = `
Analyze and improve this candidate's resume ${type} targeting ${safeRole}:
Original Text: "${safeText}"

STRICT RULES:
1. Never invent degrees, employers, dates, or fake metrics not implied by the original text (use placeholders like "[X%]" where real numbers aren't known).
2. Strengthen phrasing using crisp technical action verbs and clear architectural context.
3. Output strictly JSON matching:
{
  "originalText": "${safeText.replace(/"/g, '\\"')}",
  "improvedText": "Refined version",
  "actionVerbsAdded": ["Engineered", "Architected"],
  "impactScoreBefore": 45,
  "impactScoreAfter": 85,
  "reasoning": "Why this phrasing improves clarity for engineering reviewers",
  "missingSectionsOrKeywords": ["Suggested quantifiable outcome", "Relevant keyword"]
}
`;

  const rawJson = await generateAiContent({
    systemInstruction:
      "You are the UnlockED Senior Technical Resume Specialist. Refine wording for clarity and impact without fabricating unverified claims or fake metrics. Return pure JSON only.",
    prompt,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(rawJson);
    return ResumeImprovementSchema.parse(parsed);
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) throw err;
    throw new AiServiceUnavailableError("Failed to parse resume enhancement from AI model.");
  }
}
