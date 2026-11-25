import { z } from "zod";
import { AiServiceUnavailableError, generateAiContent, sanitizeAiInput } from "./gemini";

const NormalizedPhaseStatusSchema = z.preprocess((v) => {
  const s = String(v || "").toLowerCase().trim();
  if (s.includes("comp") || s.includes("done")) return "completed";
  if (s.includes("prog") || s.includes("active")) return "in_progress";
  return "not_started";
}, z.enum(["not_started", "in_progress", "completed"]));

export const RoadmapPhaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration_weeks: z.coerce.number(),
  skills: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  milestones: z.array(z.string()).default([]),
  status: NormalizedPhaseStatusSchema,
  order: z.coerce.number(),
});

export const PersonalizedRoadmapSchema = z.object({
  targetRole: z.string(),
  estimatedWeeksTotal: z.coerce.number(),
  phases: z.array(RoadmapPhaseSchema),
  milestoneBadges: z.array(z.string()).default([]),
});

export type PersonalizedRoadmap = z.infer<typeof PersonalizedRoadmapSchema>;

export async function generatePersonalizedRoadmap({
  targetRole,
  currentLevel,
  timeCommitmentHoursPerWeek,
  focusAreas,
  existingSkills = [],
}: {
  targetRole: string;
  currentLevel: string;
  timeCommitmentHoursPerWeek: number;
  focusAreas: string[];
  existingSkills?: string[];
}): Promise<PersonalizedRoadmap> {
  const safeRole = sanitizeAiInput(targetRole) || "Full-Stack Software Engineer";
  const safeLevel = sanitizeAiInput(currentLevel) || "Beginner";
  const safeFocus = focusAreas.map((f) => sanitizeAiInput(f)).filter(Boolean);
  const safeSkills = existingSkills.map((s) => sanitizeAiInput(s)).filter(Boolean);

  const prompt = `
Create a step-by-step career engineering roadmap customized for:
- Target Role: ${safeRole}
- Current Experience Level: ${safeLevel}
- Weekly Study Availability: ${timeCommitmentHoursPerWeek || 15} hours/week
- Already Acquired Skills: ${safeSkills.length > 0 ? safeSkills.join(", ") : "Starting fresh"}
- Focus Areas: ${safeFocus.length > 0 ? safeFocus.join(", ") : "Core Systems, Practical Projects, Testing"}

Generate 4 distinct, sequential phases calibrated realistically to ${timeCommitmentHoursPerWeek || 15} hrs/week.
Return pure JSON matching:
{
  "targetRole": "${safeRole.replace(/"/g, '\\"')}",
  "estimatedWeeksTotal": 16,
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase 1: ...",
      "description": "...",
      "duration_weeks": 4,
      "skills": ["Skill A", "Skill B"],
      "projects": ["Concrete portfolio project"],
      "milestones": ["Measurable verification target"],
      "status": "in_progress",
      "order": 1
    }
  ],
  "milestoneBadges": ["Target Milestone 1", "Target Milestone 2"]
}
`;

  const rawJson = await generateAiContent({
    systemInstruction:
      "You are the UnlockED Curriculum Architect. Build practical, project-centered engineering roadmaps calibrated to the student's actual weekly capacity and starting level. Return pure JSON only.",
    prompt,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(rawJson);
    return PersonalizedRoadmapSchema.parse(parsed);
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) throw err;
    throw new AiServiceUnavailableError("Failed to parse roadmap structure from AI model.");
  }
}
