import { getAnalysisMode } from "@/lib/analysis-provider";
import { trackActivity } from "@/lib/activity";
import { logEvent } from "@/lib/logger";
import { generateAnalysis } from "@/lib/openrouter";
import {
  clientAiGatewayError,
  logServerError,
  rawErrorMessage,
  toClientErrorMessage,
} from "@/lib/safe-client-error";
import {
  isCompleteReport,
  normalizeAnalysisReport,
  reportCompletenessError,
} from "@/lib/report-schema";
import { generateAgenticAnalysis } from "@/services/agentic-analysis";
import { extractWebsiteContent } from "@/services/content-extractor";
import { getAnalysis, saveAnalysis } from "@/services/store";

export async function markAnalysisFailed(
  id: string,
  error: unknown,
  context?: { website?: string; userId?: string | null }
): Promise<void> {
  const failed = await getAnalysis(id);
  if (!failed) return;

  // Full detail stays server-side only
  logServerError("analysis_failed", error, {
    id,
    website: context?.website ?? failed.website,
    userId: context?.userId,
  });

  const clientMessage = toClientErrorMessage(
    error,
    clientAiGatewayError()
  );

  await saveAnalysis({
    ...failed,
    status: "failed",
    error: clientMessage,
  });

  logEvent("analysis_failed", {
    id,
    website: context?.website ?? failed.website,
    userId: context?.userId,
    error: clientMessage,
    errorDetail: rawErrorMessage(error).slice(0, 500),
  });
  trackActivity({
    eventType: "analysis_failed",
    analysisId: id,
    website: context?.website ?? failed.website,
    userId: context?.userId,
    status: "failed",
    metadata: { error: clientMessage },
  });
}

export async function runAnalysis(
  id: string,
  website: string,
  userId?: string | null
): Promise<void> {
  const mode = getAnalysisMode();
  const rawReport =
    mode === "agentic"
      ? await generateAgenticAnalysis(website)
      : await generateAnalysis(
          website,
          await extractWebsiteContent(website)
        );
  const report = normalizeAnalysisReport(rawReport);

  if (!isCompleteReport(report)) {
    throw new Error(reportCompletenessError(report));
  }

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
  trackActivity({
    eventType: "analysis_completed",
    analysisId: id,
    website,
    userId,
    status: "completed",
    metadata: { score: report.score },
  });
}