import { z } from "zod";
import { AiServiceUnavailableError, generateAiContent, sanitizeAiInput } from "./gemini";

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  topic: z.string(),
  difficulty: z.enum(["entry", "mid", "senior"]),
  expectedKeyConcepts: z.array(z.string()),
});

export const InterviewEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  detailedFeedback: z.string(),
  idealAnswerSample: z.string(),
  passedCriteria: z.boolean(),
});

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewEvaluation = z.infer<typeof InterviewEvaluationSchema>;

export async function generateInterviewQuestions({
  targetRole,
  experienceLevel = "entry",
  count = 3,
}: {
  targetRole: string;
  experienceLevel?: "entry" | "mid" | "senior";
  count?: number;
}): Promise<InterviewQuestion[]> {
  const safeRole = sanitizeAiInput(targetRole) || "Full-Stack Software Engineer";

  const prompt = `
Generate ${count} realistic technical interview questions for a ${experienceLevel}-level ${safeRole}.
Focus on practical architecture, debugging scenarios, trade-offs, and system resilience relevant to ${safeRole}.
Return a pure JSON array matching:
[
  {
    "id": "q1",
    "question": "Question text...",
    "topic": "System Design / Debugging",
    "difficulty": "${experienceLevel}",
    "expectedKeyConcepts": ["Concept 1", "Concept 2"]
  }
]
`;

  const rawJson = await generateAiContent({
    systemInstruction:
      "You are a Principal Engineering Director conducting a live technical interview. Ask practical, role-calibrated questions. Return pure JSON array only.",
    prompt,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(rawJson);
    return z.array(InterviewQuestionSchema).parse(parsed);
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) throw err;
    throw new AiServiceUnavailableError("Failed to parse interview questions from AI model.");
  }
}

export async function evaluateInterviewAnswer({
  targetRole,
  question,
  expectedConcepts,
  candidateAnswer,
}: {
  targetRole: string;
  question: string;
  expectedConcepts: string[];
  candidateAnswer: string;
}): Promise<InterviewEvaluation> {
  const safeRole = sanitizeAiInput(targetRole) || "Software Engineer";
  const safeQuestion = sanitizeAiInput(question);
  const safeAnswer = sanitizeAiInput(candidateAnswer);

  const prompt = `
Evaluate this candidate's technical interview answer strictly and objectively:
Target Role: ${safeRole}
Interview Question: "${safeQuestion}"
Expected Key Concepts: ${expectedConcepts.join(", ")}
Candidate Answer: "${safeAnswer}"

Grade on a 0-100 scale based on actual technical accuracy in the answer above (score low if off-topic, incomplete, or superficial):
- 85-100: Accurate technical depth, mentions trade-offs & concrete details
- 70-84: Sound core concept, minor omissions
- <70: Incomplete, inaccurate, or misses core concepts

Return pure JSON matching:
{
  "score": 78,
  "strengths": ["..."],
  "areasForImprovement": ["..."],
  "detailedFeedback": "Objective 3-4 sentence evaluation...",
  "idealAnswerSample": "Concise model answer...",
  "passedCriteria": true
}
`;

  const rawJson = await generateAiContent({
    systemInstruction:
      "You are the UnlockED Technical Interview Evaluator. Provide honest, rigorous feedback calibrated strictly to the candidate's submitted text. Do not flatter inaccurate answers. Return pure JSON only.",
    prompt,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(rawJson);
    return InterviewEvaluationSchema.parse(parsed);
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) throw err;
    throw new AiServiceUnavailableError("Failed to parse interview evaluation from AI model.");
  }
}
