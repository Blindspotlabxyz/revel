import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUserId } from "@/lib/auth";
import { logEvent } from "@/lib/logger";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { normalizeUrl } from "@/lib/validation";
import { extractWebsiteContent } from "@/services/content-extractor";
import { generateAnalysis } from "@/lib/openrouter";
import { getAnalysis, saveAnalysis } from "@/services/store";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const rateLimitKey = getRateLimitKey(request, userId);
    const { success } = rateLimit(rateLimitKey);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const website = normalizeUrl(body.url);
    const id = uuidv4();

    const analysis = {
      id,
      userId: userId ?? undefined,
      website,
      status: "processing" as const,
      createdAt: new Date().toISOString(),
    };

    await saveAnalysis(analysis);
    logEvent("analysis_started", { id, website, userId });

    processAnalysis(id, website).catch(async (error) => {
      const failed = await getAnalysis(id);
      if (failed) {
        await saveAnalysis({
          ...failed,
          status: "failed",
          error:
            error instanceof Error
              ? error.message
              : "Analysis failed unexpectedly",
        });
        logEvent("analysis_failed", { id, website, userId });
      }
    });

    return NextResponse.json({ id });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't start the analysis. Please try again.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function processAnalysis(id: string, website: string) {
  const content = await extractWebsiteContent(website);
  const report = await generateAnalysis(website, content);

  const analysis = await getAnalysis(id);
  if (!analysis) return;

  await saveAnalysis({
    ...analysis,
    status: "completed",
    score: report.score,
    report,
  });

  logEvent("analysis_completed", { id, website, score: report.score });
}