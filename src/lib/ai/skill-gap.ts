import { z } from "zod";
import { AiServiceUnavailableError, generateAiContent, sanitizeAiInput } from "./gemini";

const NormalizedStatusSchema = z.preprocess((v) => {
  const s = String(v || "").toLowerCase().trim();
  if (s.includes("match") && !s.includes("partial")) return "matched";
  if (s.includes("partial")) return "partial";
  return "missing";
}, z.enum(["matched", "partial", "missing"]));

const NormalizedImportanceSchema = z.preprocess((v) => {
  const s = String(v || "").toLowerCase().trim();
  if (s.includes("crit") || s.includes("high") || s.includes("req") || s.includes("must")) return "critical";
  if (s.includes("opt") || s.includes("low") || s.includes("nice")) return "optional";
  return "recommended";
}, z.enum(["critical", "recommended", "optional"]));

export const SkillComparisonSchema = z.object({
  skill: z.string(),
  status: NormalizedStatusSchema,
  importance: NormalizedImportanceSchema,
  recommendation: z.string(),
});

export const SkillGapAnalysisSchema = z.object({
  targetRole: z.string(),
  coverageScore: z.coerce.number().min(0).max(100),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  skillBreakdown: z.array(SkillComparisonSchema).default([]),
  estimatedWeeksToBridge: z.coerce.number().default(4),
  curriculumSuggestions: z.array(z.string()).default([]),
});

export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>;

export async function analyzeSkillGap({
  candidateSkills,
  targetRole,
  jobRequirements,
}: {
  candidateSkills: string[];
  targetRole: string;
  jobRequirements: string[];
}): Promise<SkillGapAnalysis> {
  const safeTargetRole = sanitizeAiInput(targetRole) || "Software Engineer";
  const safeSkills = candidateSkills.map((s) => sanitizeAiInput(s)).filter(Boolean);
  const safeReqs = jobRequirements.map((r) => sanitizeAiInput(r)).filter(Boolean);

  const prompt = `
Compare candidate skills objectively against target role requirements:
Target Role: ${safeTargetRole}
Candidate Skills: ${safeSkills.length > 0 ? safeSkills.join(", ") : "None recorded yet"}
Role Requirements: ${safeReqs.length > 0 ? safeReqs.join("; ") : "General engineering competencies for " + safeTargetRole}

Return strictly JSON matching:
{
  "targetRole": "${safeTargetRole.replace(/"/g, '\\"')}",
  "coverageScore": 65,
  "matchedSkills": ["Skill 1"],
  "missingSkills": ["Missing Skill 1"],
  "skillBreakdown": [
    {
      "skill": "TypeScript",
      "status": "matched",
      "importance": "critical",
      "recommendation": "Actionable next step"
    }
  ],
  "estimatedWeeksToBridge": 6,
  "curriculumSuggestions": ["Course or module recommendation"]
}
`;

  const rawJson = await generateAiContent({
    systemInstruction:
      "You are the UnlockED Skill Gap Diagnostics Engine. Compute transparent, unbiased skill-gap analysis from the provided skill list and role requirements. Return pure JSON only.",
    prompt,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(rawJson);
    return SkillGapAnalysisSchema.parse(parsed);
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) throw err;
    throw new AiServiceUnavailableError("Failed to parse skill gap analysis from AI model.");
  }
}
