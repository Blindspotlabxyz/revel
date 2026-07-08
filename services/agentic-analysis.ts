import {
  getAgentProvider,
  isGeminiAgentEnabled,
  isGeminiQuotaError,
  isRateLimitError,
  isGroqAgentEnabled,
  isOpenRouterEnabled,
  isRecoverableAgenticFailure,
} from "@/lib/analysis-provider";
import { generateAnalysis } from "@/lib/openrouter";
import type { AnalysisReport } from "@/types/analysis";
import { extractWebsiteContent } from "@/services/content-extractor";
import { runGeminiAgent } from "@/services/gemini-agent";
import { runGroqAgent } from "@/services/groq-agent";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

async function fetchContentForFallback(website: string): Promise<string> {
  try {
    return await extractWebsiteContent(website);
  } catch (error) {
    const detail = errorMessage(error);
    console.warn(
      `[Revel] Website fetch failed during OpenRouter fallback (${detail}) — continuing with URL-only context`
    );
    return [
      `[Live page fetch failed: ${detail}]`,
      `Website URL: ${website}`,
      "Analyze using the domain, URL structure, and typical product patterns for this category.",
      "Note in blindspots that live page content could not be verified.",
    ].join("\n\n");
  }
}

async function fallbackToOpenRouter(website: string): Promise<AnalysisReport> {
  const attempts = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const content = await fetchContentForFallback(website);
      return await generateAnalysis(website, content);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  throw new Error(
    `OpenRouter fallback failed after ${attempts} attempts: ${errorMessage(lastError)}`
  );
}

export async function generateAgenticAnalysis(
  website: string
): Promise<AnalysisReport> {
  const provider = getAgentProvider();

  if (!provider) {
    throw new Error(
      "Agentic analysis requires GROQ_API_KEY or GEMINI_API_KEY in .env.local"
    );
  }

  try {
    if (provider === "groq") {
      return await runGroqAgent(website);
    }
    return await runGeminiAgent(website);
  } catch (error) {
    if (isRecoverableAgenticFailure(error) && isOpenRouterEnabled()) {
      const label = getAgentProvider() ?? "agent";
      const reason = isRateLimitError(error) ? "rate limited" : "agent incomplete";
      console.warn(
        `[Revel] ${label} agent ${reason} — falling back to OpenRouter legacy analysis`
      );
      try {
        return await fallbackToOpenRouter(website);
      } catch (fallbackError) {
        throw new Error(
          `Gemini unavailable (${errorMessage(error)}). OpenRouter fallback also failed (${errorMessage(fallbackError)}). Retry in a few minutes or wait for Gemini quota reset.`
        );
      }
    }

    if (isGeminiQuotaError(error)) {
      throw new Error(
        "Gemini free quota exceeded. Quota resets daily (midnight Pacific). Add OPENROUTER_API_KEY for automatic fallback, or set ANALYSIS_MODE=legacy."
      );
    }

    throw error;
  }
}