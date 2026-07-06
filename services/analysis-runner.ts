import { logEvent } from "@/lib/logger";
import { generateAnalysis } from "@/lib/openrouter";
import { extractWebsiteContent } from "@/services/content-extractor";
import { getAnalysis, saveAnalysis } from "@/services/store";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Analysis failed unexpectedly";
}

export async function markAnalysisFailed(
  id: string,
  error: unknown,
  context?: { website?: string; userId?: string | null }
): Promise<void> {
  const failed = await getAnalysis(id);
  if (!failed) return;

  const message = errorMessage(error);

  await saveAnalysis({
    ...failed,
    status: "failed",
    error: message,
  });

  logEvent("analysis_failed", {
    id,
    website: context?.website ?? failed.website,
    userId: context?.userId,
    error: message,
  });
}

export async function runAnalysis(
  id: string,
  website: string,
  userId?: string | null
): Promise<void> {
  const content = await extractWebsiteContent(website);
  const report = await generateAnalysis(website, content);

  const analysis = await getAnalysis(id);
  if (!analysis) {
    throw new Error("Analysis record was not found after processing started");
  }

  await saveAnalysis({
    ...analysis,
    status: "completed",
    score: report.score,
    report,
  });

  logEvent("analysis_completed", { id, website, userId, score: report.score });
}