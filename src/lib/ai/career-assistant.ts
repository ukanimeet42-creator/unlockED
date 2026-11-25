import { z } from "zod";
import { AiServiceUnavailableError, generateAiContent, sanitizeAiInput } from "./gemini";

export const CareerPathSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),
  reasoning: z.string(),
  salaryRange: z.string(),
  keySkillsRequired: z.array(z.string()),
  recommendedFirstStep: z.string(),
});

export const CareerGuidanceResponseSchema = z.object({
  summary: z.string(),
  suggestedPaths: z.array(CareerPathSchema),
  transferableStrengths: z.array(z.string()),
  actionablePlan: z.array(z.string()),
});

export type CareerGuidanceResponse = z.infer<typeof CareerGuidanceResponseSchema>;

export async function analyzeCareerGuidance({
  interests,
  background,
  skills,
  completedCourses = [],
}: {
  interests: string;
  background: string;
  skills: string[];
  completedCourses?: string[];
}): Promise<CareerGuidanceResponse> {
  const safeInterests = sanitizeAiInput(interests);
  const safeBackground = sanitizeAiInput(background);
  const safeSkills = skills.map((s) => sanitizeAiInput(s)).filter(Boolean);
  const safeCourses = completedCourses.map((c) => sanitizeAiInput(c)).filter(Boolean);

  const prompt = `
Analyze this candidate for career pathways in technical engineering roles based strictly on their real profile:
- Current Background & Bio: ${safeBackground || "Early-career learner exploring technology roles"}
- Question / Expressed Goals: ${safeInterests || "Identify realistic technical career paths"}
- Verified / Self-Reported Skills: ${safeSkills.length > 0 ? safeSkills.join(", ") : "None recorded yet"}
- Courses Engaged: ${safeCourses.length > 0 ? safeCourses.join(", ") : "None enrolled yet"}

Respond strictly in JSON matching this schema:
{
  "summary": "Direct, transparent answer referencing the learner's real background and question",
  "suggestedPaths": [
    {
      "title": "Role title",
      "matchScore": 82,
      "reasoning": "Explanation based strictly on provided profile/skills",
      "salaryRange": "$75,000 - $115,000 / ₹8L - ₹18L",
      "keySkillsRequired": ["TypeScript", "PostgreSQL"],
      "recommendedFirstStep": "Concrete course or portfolio project milestone"
    }
  ],
  "transferableStrengths": ["Identified strength 1", "Identified strength 2"],
  "actionablePlan": ["Week 1-4...", "Week 5-8...", "Week 9-12..."]
}
`;

  const rawJson = await generateAiContent({
    systemInstruction:
      "You are the UnlockED Senior Career Guidance Director. Provide transparent, realistic, merit-based career advice tailored strictly to the candidate's real input. Never invent fake employers, degrees, or past performance. Clearly distinguish guidance from verified achievements. Return pure JSON only.",
    prompt,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(rawJson);
    return CareerGuidanceResponseSchema.parse(parsed);
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) throw err;
    throw new AiServiceUnavailableError("AI response format validation failed. Please try rephrasing your question.");
  }
}
