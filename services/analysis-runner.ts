import { getAnalysisMode } from "@/lib/analysis-provider";
import { trackActivity } from "@/lib/activity";
import { logEvent } from "@/lib/logger";
import { generateAnalysis } from "@/lib/openrouter";
import {
  clientAiGatewayError,
  logServerError,
  serverErrorDetail,
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

  const website = context?.website ?? failed.website;
  // Real reason for Vercel logs (never the generic client string alone)
  const detail = serverErrorDetail(error);

  logServerError("analysis_failed", detail, {
    id,
    website,
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

  // Production: single JSON line via logEvent — include full server detail
  logEvent("analysis_failed", {
    id,
    website,
    userId: context?.userId,
    error: clientMessage,
    errorDetail: detail.slice(0, 2000),
  });
  trackActivity({
    eventType: "analysis_failed",
    analysisId: id,
    website,
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