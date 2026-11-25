import { GoogleGenAI } from "@google/genai";
import { AI_RATE_LIMIT } from "@/lib/constants";

export class AiServiceUnavailableError extends Error {
  public readonly statusCode = 503;
  public readonly code = "AI_SERVICE_UNAVAILABLE";

  constructor(message = "AI service is currently unavailable. Please verify configuration or retry shortly.") {
    super(message);
    this.name = "AiServiceUnavailableError";
  }
}

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1beta" },
    });
  }
  return aiClient;
}

// Ordered active Gemini v1beta models verified live
const LIVE_GEMINI_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemma-4-26b-a4b-it",
] as const;

// In-memory rate limiting map (User ID or IP -> timestamp[])
const rateLimitMap = new Map<string, number[]>();

export function checkAiRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const timestamps = rateLimitMap.get(identifier) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= AI_RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    rateLimitMap.set(identifier, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  rateLimitMap.set(identifier, recent);
  return {
    allowed: true,
    remaining: AI_RATE_LIMIT.MAX_REQUESTS_PER_MINUTE - recent.length,
  };
}

export function sanitizeAiInput(input: unknown, maxLength = AI_RATE_LIMIT.MAX_INPUT_LENGTH): string {
  if (!input) return "";
  if (Array.isArray(input)) return input.join(", ").slice(0, maxLength).trim();
  if (typeof input !== "string") return String(input).slice(0, maxLength).trim();
  return input.replace(/\0/g, "").slice(0, maxLength).trim();
}

function stripJsonFences(raw: string): string {
  let clean = raw.trim();
  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    clean = fenceMatch[1].trim();
  }
  const firstBrace = clean.indexOf("{");
  const firstBracket = clean.indexOf("[");
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const lastBracket = clean.lastIndexOf("]");
    if (lastBracket > firstBracket) {
      return clean.slice(firstBracket, lastBracket + 1);
    }
  }
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return clean.slice(firstBrace, lastBrace + 1);
  }
  return clean.trim();
}

/**
 * Generates structured or text AI content using active server-side Gemini models.
 * Throws AiServiceUnavailableError when keys are missing or all upstream providers fail.
 */
export async function generateAiContent({
  systemInstruction,
  prompt,
  model,
  responseMimeType,
}: {
  systemInstruction: string;
  prompt: string;
  model?: string;
  responseMimeType?: string;
}): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new AiServiceUnavailableError("Server AI engine is not configured (GEMINI_API_KEY missing).");
  }

  const candidateModels = model
    ? [model, ...LIVE_GEMINI_MODELS.filter((m) => m !== model)]
    : [...LIVE_GEMINI_MODELS];

  const isJson = responseMimeType === "application/json";
  let lastError: string | null = null;

  for (const activeModel of candidateModels) {
    try {
      const isGemma = activeModel.startsWith("gemma");
      const config: Record<string, unknown> = {
        temperature: 0.3,
      };

      let finalPrompt = prompt;
      if (isGemma) {
        finalPrompt = `${systemInstruction}\n\n${
          isJson
            ? "CRITICAL: Respond strictly with valid RFC-8259 JSON matching the requested schema. Do not wrap in markdown code fences.\n\n"
            : ""
        }${prompt}`;
      } else {
        config.systemInstruction = systemInstruction;
        if (responseMimeType) {
          config.responseMimeType = responseMimeType;
        }
      }

      const response = await client.models.generateContent({
        model: activeModel,
        contents: finalPrompt,
        config,
      });

      const text = response.text;
      if (text && text.trim().length > 0) {
        return isJson ? stripJsonFences(text) : text.trim();
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`AI model ${activeModel} failed, trying next model:`, lastError.slice(0, 180));
    }
  }

  throw new AiServiceUnavailableError(
    lastError
      ? "All configured AI providers are temporarily unavailable. Please retry in a few moments."
      : "AI provider returned an empty response."
  );
}
