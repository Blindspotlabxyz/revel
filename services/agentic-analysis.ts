import {
  getAnalysisProviderChain,
  isRateLimitError,
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
      `[Revel] Website fetch failed during OpenRouter path (${detail}) — continuing with URL-only context`
    );
    return [
      `[Live page fetch failed: ${detail}]`,
      `Website URL: ${website}`,
      "Only use the domain and URL structure. Mark every blindspot as unverified live content.",
    ].join("\n\n");
  }
}

async function runOpenRouterAnalysis(website: string): Promise<AnalysisReport> {
  const attempts = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const content = await fetchContentForFallback(website);
      return await generateAnalysis(website, content);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  throw new Error(
    `OpenRouter analysis failed after ${attempts} attempts: ${errorMessage(lastError)}`
  );
}

/**
 * Run analysis with cascade:
 *   Groq (agentic) → OpenRouter (grounded single-shot) → Gemini (agentic, last)
 * On recoverable errors (quota, incomplete report, API failure), try the next backend.
 */
export async function generateAgenticAnalysis(
  website: string
): Promise<AnalysisReport> {
  const chain = getAnalysisProviderChain();

  if (chain.length === 0) {
    throw new Error(
      "Analysis requires GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY"
    );
  }

  const errors: string[] = [];

  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];
    const isLast = i === chain.length - 1;

    try {
      console.info(
        `[Revel] Analysis provider: ${provider} (${i + 1}/${chain.length})`
      );

      if (provider === "groq") {
        return await runGroqAgent(website);
      }
      if (provider === "openrouter") {
        return await runOpenRouterAnalysis(website);
      }
      return await runGeminiAgent(website);
    } catch (error) {
      const detail = errorMessage(error);
      errors.push(`${provider}: ${detail}`);

      const canFallback =
        !isLast &&
        (isRecoverableAgenticFailure(error) || isRateLimitError(error));

      if (canFallback) {
        console.warn(
          `[Revel] ${provider} failed (${detail.slice(0, 160)}) — falling back to next provider`
        );
        continue;
      }

      if (isLast) {
        break;
      }

      // Non-recoverable on a non-last provider still try next so one bad key doesn't block
      console.warn(
        `[Revel] ${provider} error (${detail.slice(0, 160)}) — trying next provider anyway`
      );
    }
  }

  throw new Error(
    `All analysis providers failed (${chain.join(" → ")}). ${errors.slice(-3).join(" | ")}`
  );
}
