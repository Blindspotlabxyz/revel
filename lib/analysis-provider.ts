import { isNetworkFetchError } from "@/lib/resilient-fetch";

export type AnalysisMode = "agentic" | "legacy";
export type AgentProvider = "groq" | "gemini";

/**
 * Agentic provider priority:
 * 1. Groq (GROQ_API_KEY) — fast local tool calling, generous free tier
 * 2. Google AI Studio (GEMINI_API_KEY) — Gemini function calling
 * 3. OpenRouter — legacy single-shot or agent failure fallback
 */
export function getAnalysisMode(): AnalysisMode {
  const raw = process.env.ANALYSIS_MODE?.toLowerCase();
  if (raw === "legacy") return "legacy";
  if (raw === "agentic") return "agentic";
  if (isGroqAgentEnabled() || isGeminiAgentEnabled()) return "agentic";
  return "legacy";
}

export function isGroqAgentEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function isGeminiAgentEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getAgentProvider(): AgentProvider | null {
  const preferred = process.env.ANALYSIS_PROVIDER?.toLowerCase();

  if (preferred === "groq" && isGroqAgentEnabled()) return "groq";
  if (preferred === "gemini" && isGeminiAgentEnabled()) return "gemini";

  if (isGroqAgentEnabled()) return "groq";
  if (isGeminiAgentEnabled()) return "gemini";
  return null;
}

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const BUILTIN_GROQ_FALLBACKS = ["meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.1-8b-instant"];

export function getGroqModel(): string {
  return getGroqModels()[0];
}

export function getGroqModels(): string[] {
  const primary = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const extra = (process.env.GROQ_MODEL_FALLBACK ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return [
    ...new Set([
      primary,
      ...extra,
      ...BUILTIN_GROQ_FALLBACKS.filter((model) => model !== primary),
    ]),
  ];
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const BUILTIN_GEMINI_FALLBACKS = ["gemini-2.5-flash-lite"];

export function getGeminiModel(): string {
  return getGeminiModels()[0];
}

export function getGeminiModels(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const extra = (process.env.GEMINI_MODEL_FALLBACK ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return [
    ...new Set([
      primary,
      ...extra,
      ...BUILTIN_GEMINI_FALLBACKS.filter((model) => model !== primary),
    ]),
  ];
}

export function getAgentMaxSteps(): number {
  const n = Number(process.env.AGENT_MAX_STEPS ?? "10");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : 10;
}

export function isOpenRouterEnabled(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || /quota/i.test(message) || /rate limit/i.test(message);
}

/** @deprecated Use isRateLimitError */
export function isGeminiQuotaError(error: unknown): boolean {
  return isRateLimitError(error);
}

export function isRecoverableAgenticFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    isGeminiQuotaError(error) ||
    isNetworkFetchError(error) ||
    message.includes("did not submit a report") ||
    message.includes("returned no tool calls") ||
    message.includes("All Groq models failed") ||
    message.includes("Groq API") ||
    message.includes("Gemini API")
  );
}