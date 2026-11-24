import { GoogleGenAI } from "@google/genai";
import { AI_RATE_LIMIT } from "@/lib/constants";

// Lazy-initialize GoogleGenAI client if API key exists
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// In-memory rate limiting map (IP / User -> timestamp[])
const rateLimitMap = new Map<string, number[]>();

export function checkAiRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const timestamps = rateLimitMap.get(identifier) || [];

  // Filter timestamps within the current 1-minute window
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= AI_RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    rateLimitMap.set(identifier, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  rateLimitMap.set(identifier, recent);
  return { allowed: true, remaining: AI_RATE_LIMIT.MAX_REQUESTS_PER_MINUTE - recent.length };
}

export function sanitizeAiInput(input: unknown, maxLength = AI_RATE_LIMIT.MAX_INPUT_LENGTH): string {
  if (!input) return "";
  if (Array.isArray(input)) return input.join(", ").slice(0, maxLength).trim();
  if (typeof input !== "string") return String(input).slice(0, maxLength).trim();
  // Strip null bytes and truncate safely
  return input.replace(/\0/g, "").slice(0, maxLength).trim();
}

/**
 * High-reliability generative call with dual-engine support:
 * 1. NVIDIA NIM (Google Gemma 4 31B Instruct)
 * 2. Google Gemini API (@google/genai)
 */
export async function generateAiContent({
  systemInstruction,
  prompt,
  model = "gemini-2.5-flash",
  responseMimeType,
}: {
  systemInstruction: string;
  prompt: string;
  model?: string;
  responseMimeType?: string;
}): Promise<string> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try NVIDIA NIM Endpoint (Google Gemma 4 31B IT)
  if (nvidiaKey && !nvidiaKey.includes("your_")) {
    try {
      const isJson = responseMimeType === "application/json";
      const sysPrompt = isJson
        ? `${systemInstruction}\n\nIMPORTANT: Return ONLY valid, RFC-compliant JSON. Do not wrap in markdown or conversational explanations.`
        : systemInstruction;

      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nvidiaKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL || "google/gemma-4-31b-it",
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let content: string = data.choices?.[0]?.message?.content || "";
        if (content) {
          if (isJson) {
            content = content.trim();
            if (content.startsWith("```json")) content = content.slice(7);
            else if (content.startsWith("```")) content = content.slice(3);
            if (content.endsWith("```")) content = content.slice(0, -3);
            content = content.trim();
          }
          return content;
        }
      } else {
        console.warn("NVIDIA NIM returned error status:", res.status, await res.text());
      }
    } catch (nvidiaErr) {
      console.warn("NVIDIA NIM fetch error, attempting fallback:", nvidiaErr);
    }
  }

  // 2. Try Google Gemini Client
  const client = getGeminiClient();
  if (client) {
    try {
      const config: Record<string, unknown> = {
        systemInstruction,
        temperature: 0.3,
      };

      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response.text;
      if (text) {
        return text;
      }
    } catch (err: unknown) {
      console.error("Gemini API Error:", err);
    }
  }

  // If no keys configured or both failed, signal caller to use structured fallback
  throw new Error("NO_API_KEY");
}
