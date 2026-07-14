import {
  getAnalysisProviderChain,
  isRateLimitError,
  isRecoverableAgenticFailure,
} from "@/lib/analysis-provider";
import { generateAnalysis } from "@/lib/openrouter";
import {
  clientAiGatewayError,
  logServerError,
  rawErrorMessage,
} from "@/lib/safe-client-error";
import type { AnalysisReport } from "@/types/analysis";
import { extractWebsiteContent } from "@/services/content-extractor";
import { runGeminiAgent } from "@/services/gemini-agent";
import { runGroqAgent } from "@/services/groq-agent";

async function fetchContentForFallback(website: string): Promise<string> {
  try {
    return await extractWebsiteContent(website);
  } catch (error) {
    logServerError("openrouter_fetch_failed", error, { website });
    return [
      `[Live page fetch failed]`,
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

  logServerError("openrouter_analysis_failed", lastError, {
    website,
    attempts,
  });
  throw new Error(clientAiGatewayError());
}

/**
 * Run analysis with cascade:
 *   Groq (agentic) → OpenRouter (grounded single-shot) → Gemini (agentic, last)
 * On recoverable errors, try the next backend. Client only ever sees a generic message.
 */
export async function generateAgenticAnalysis(
  website: string
): Promise<AnalysisReport> {
  const chain = getAnalysisProviderChain();

  if (chain.length === 0) {
    logServerError(
      "analysis_no_providers",
      new Error("No analysis API keys configured"),
      { website }
    );
    throw new Error(clientAiGatewayError());
  }

  const errors: Array<{ provider: string; detail: string }> = [];

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
      const detail = rawErrorMessage(error);
      errors.push({ provider, detail });

      const canFallback =
        !isLast &&
        (isRecoverableAgenticFailure(error) || isRateLimitError(error));

      if (canFallback) {
        console.warn(
          `[Revel] ${provider} failed — falling back to next provider`
        );
        logServerError("analysis_provider_fallback", error, {
          website,
          provider,
          next: chain[i + 1],
        });
        continue;
      }

      if (isLast) {
        break;
      }

      console.warn(
        `[Revel] ${provider} error — trying next provider anyway`
      );
      logServerError("analysis_provider_error", error, {
        website,
        provider,
        next: chain[i + 1],
      });
    }
  }

  logServerError(
    "analysis_all_providers_failed",
    new Error("All analysis providers failed"),
    { website, chain, errors }
  );
  throw new Error(clientAiGatewayError());
}
