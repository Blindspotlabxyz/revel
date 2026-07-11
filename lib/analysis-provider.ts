import { isNetworkFetchError } from "@/lib/resilient-fetch";

export type AnalysisMode = "agentic" | "legacy";
/** Ordered backends — Groq and OpenRouter first; Gemini last (tight free quota). */
export type AnalysisBackend = "groq" | "openrouter" | "gemini";
/** @deprecated Use AnalysisBackend — kept for older call sites */
export type AgentProvider = "groq" | "gemini";

/**
 * Default analysis order when ANALYSIS_PROVIDER=auto:
 * 1. Groq — agentic tool calling, strong free tier
 * 2. OpenRouter — single-shot grounded JSON (paid/reliable models)
 * 3. Gemini — last resort (small free quota)
 */
export function getAnalysisMode(): AnalysisMode {
  const raw = process.env.ANALYSIS_MODE?.toLowerCase();
  if (raw === "legacy") return "legacy";
  if (raw === "agentic") return "agentic";
  if (
    isGroqAgentEnabled() ||
    isGeminiAgentEnabled() ||
    isOpenRouterEnabled()
  ) {
    // OpenRouter-only → still use cascade via generateAgenticAnalysis when agentic keys exist
    if (isGroqAgentEnabled() || isGeminiAgentEnabled()) return "agentic";
    return "legacy";
  }
  return "legacy";
}

export function isGroqAgentEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function isGeminiAgentEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function isOpenRouterEnabled(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

/**
 * Preferred single agent provider for logging / explicit override.
 * Does not include openrouter (handled in the cascade).
 */
export function getAgentProvider(): AgentProvider | null {
  const preferred = process.env.ANALYSIS_PROVIDER?.toLowerCase();

  if (preferred === "groq" && isGroqAgentEnabled()) return "groq";
  if (preferred === "gemini" && isGeminiAgentEnabled()) return "gemini";

  if (isGroqAgentEnabled()) return "groq";
  if (isGeminiAgentEnabled()) return "gemini";
  return null;
}

/**
 * Full provider chain for analysis. Order is always tried until one succeeds.
 * ANALYSIS_PROVIDER can pin the first backend: groq | openrouter | gemini | auto
 */
export function getAnalysisProviderChain(): AnalysisBackend[] {
  const preferred = process.env.ANALYSIS_PROVIDER?.toLowerCase() ?? "auto";
  const chain: AnalysisBackend[] = [];

  const push = (backend: AnalysisBackend) => {
    if (chain.includes(backend)) return;
    if (backend === "groq" && !isGroqAgentEnabled()) return;
    if (backend === "openrouter" && !isOpenRouterEnabled()) return;
    if (backend === "gemini" && !isGeminiAgentEnabled()) return;
    chain.push(backend);
  };

  if (
    preferred === "groq" ||
    preferred === "openrouter" ||
    preferred === "gemini"
  ) {
    push(preferred);
  }

  // Default order: Groq → OpenRouter → Gemini (Gemini last)
  push("groq");
  push("openrouter");
  push("gemini");

  return chain;
}

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const BUILTIN_GROQ_FALLBACKS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
];

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

export function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    /quota/i.test(message) ||
    /rate limit/i.test(message) ||
    /resource.exhausted/i.test(message)
  );
}

/** @deprecated Use isRateLimitError */
export function isGeminiQuotaError(error: unknown): boolean {
  return isRateLimitError(error);
}

/** Failures where trying the next provider/model is the right move. */
export function isRecoverableAgenticFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    isRateLimitError(error) ||
    isNetworkFetchError(error) ||
    message.includes("did not submit a report") ||
    message.includes("returned no tool calls") ||
    message.includes("All Groq models failed") ||
    message.includes("All analysis models failed") ||
    message.includes("All analysis providers failed") ||
    message.includes("Groq API") ||
    message.includes("Gemini API") ||
    message.includes("OpenRouter") ||
    message.includes("Incomplete") ||
    message.includes("generic audit") ||
    message.includes("Incomplete or generic") ||
    message.includes("Incomplete audit")
  );
}
