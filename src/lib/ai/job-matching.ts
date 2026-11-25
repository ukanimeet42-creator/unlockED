import { z } from "zod";
import { generateAiContent, sanitizeAiInput } from "./gemini";
import { Job, Profile, Project } from "@/types";

export const JobMatchResultSchema = z.object({
  jobId: z.string(),
  matchScore: z.number().min(0).max(100),
  fitLevel: z.enum(["exceptional", "strong", "moderate", "growth_opportunity"]),
  matchSummary: z.string(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  relevantProjects: z.array(z.string()),
  interviewPreparationTip: z.string(),
  evaluationSource: z.enum(["ai", "skill_overlap"]).optional(),
});

export type JobMatchResult = z.infer<typeof JobMatchResultSchema>;

/**
 * Computes transparent, deterministic skill-overlap score without AI,
 * ensuring match scores always explain matched vs missing requirements honestly.
 */
export function computeDeterministicJobMatch({
  candidateSkills,
  candidateProjects,
  job,
}: {
  candidateSkills: string[];
  candidateProjects: Pick<Project, "title" | "technologies">[];
  job: Job;
}): JobMatchResult {
  const safeSkills = candidateSkills.map((s) => sanitizeAiInput(s)).filter(Boolean);
  const projectTech = candidateProjects.flatMap((p) => p.technologies || []);
  const combinedCandidateTerms = Array.from(new Set([...safeSkills, ...projectTech]));

  const reqs = job.skills_required || [];
  const matchingSkills = reqs.filter((req) =>
    combinedCandidateTerms.some(
      (term) =>
        term.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(term.toLowerCase())
    )
  );
  const missingSkills = reqs.filter((req) => !matchingSkills.includes(req));

  const score =
    reqs.length > 0 ? Math.round((matchingSkills.length / reqs.length) * 100) : 0;

  const fitLevel: JobMatchResult["fitLevel"] =
    score >= 85
      ? "exceptional"
      : score >= 65
      ? "strong"
      : score >= 40
      ? "moderate"
      : "growth_opportunity";

  const relevantProjects = candidateProjects
    .filter((p) =>
      p.technologies.some((t) =>
        reqs.some(
          (r) =>
            r.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(r.toLowerCase())
        )
      )
    )
    .map((p) => p.title);

  return {
    jobId: job.id,
    matchScore: score,
    fitLevel,
    matchSummary:
      reqs.length === 0
        ? "No mandatory technical skills listed on this requisition."
        : `Matches ${matchingSkills.length} of ${reqs.length} listed skills based on your recorded skills and project stack.`,
    matchingSkills,
    missingSkills,
    relevantProjects,
    interviewPreparationTip:
      missingSkills.length > 0
        ? `Review ${missingSkills.slice(0, 2).join(" and ")} alongside architecture decisions from your projects.`
        : `Highlight measurable technical outcomes from ${relevantProjects[0] || "your published projects"}.`,
    evaluationSource: "skill_overlap",
  };
}

export async function matchCandidateToJob({
  candidate,
  candidateSkills,
  candidateProjects,
  job,
}: {
  candidate: Pick<Profile, "full_name" | "bio">;
  candidateSkills: string[];
  candidateProjects: Pick<Project, "title" | "technologies" | "description">[];
  job: Job;
}): Promise<JobMatchResult> {
  const safeSkills = candidateSkills.map((s) => sanitizeAiInput(s)).filter(Boolean);
  const safeBio = sanitizeAiInput(candidate.bio || "");

  const prompt = `
Evaluate technical alignment between candidate and job opening using strictly explainable criteria:
Candidate Summary: ${safeBio || "Not provided"}
Candidate Skills: ${safeSkills.length > 0 ? safeSkills.join(", ") : "None recorded"}
Candidate Projects: ${
    candidateProjects.length > 0
      ? candidateProjects.map((p) => `${p.title} (${p.technologies.join(", ")})`).join("; ")
      : "None published yet"
  }

Job Title: ${job.title}
Company: ${job.company?.name || "Hiring Partner"}
Required Skills: ${job.skills_required.join(", ")}
Job Requirements: ${job.requirements.join("; ")}

IMPORTANT GUIDELINES:
1. Never use demographic or protected characteristics.
2. Score strictly on skill overlap and demonstrable project stack alignment.
3. Return pure JSON matching:
{
  "jobId": "${job.id}",
  "matchScore": 75,
  "fitLevel": "strong",
  "matchSummary": "...",
  "matchingSkills": ["Skill A"],
  "missingSkills": ["Skill B"],
  "relevantProjects": ["Project Title"],
  "interviewPreparationTip": "..."
}
`;

  try {
    const rawJson = await generateAiContent({
      systemInstruction:
        "You are the UnlockED Transparent Job Matching Engine. Compute merit-based, explainable skill alignment. Return pure JSON only.",
      prompt,
      responseMimeType: "application/json",
    });

    const parsed = JSON.parse(rawJson);
    const validated = JobMatchResultSchema.parse(parsed);
    return { ...validated, evaluationSource: "ai" };
  } catch {
    return computeDeterministicJobMatch({
      candidateSkills: safeSkills,
      candidateProjects,
      job,
    });
  }
}
