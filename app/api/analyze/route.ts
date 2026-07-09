import { after } from "next/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runWithActivityContext } from "@/lib/activity-context";
import { trackActivity } from "@/lib/activity";
import { getCurrentUserId } from "@/lib/auth";
import { checkWeeklyAuditLimit } from "@/lib/weekly-audit-limit";
import { logEvent } from "@/lib/logger";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { normalizeUrl } from "@/lib/validation";
import { markAnalysisFailed, runAnalysis } from "@/services/analysis-runner";
import { saveAnalysis } from "@/services/store";

/** Agentic runs (Groq + fallback) often need 2–3 min on slow networks. */
export const maxDuration = 300;

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  return runWithActivityContext({ source: "website", userId }, async () => {
  try {
    const rateLimitKey = getRateLimitKey(request, userId);
    const { success } = rateLimit(rateLimitKey, 5, 60_000);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const weekly = await checkWeeklyAuditLimit(userId);
    if (!weekly.allowed) {
      return NextResponse.json(
        {
          error: `Weekly limit reached (${weekly.limit} audits per week). Resets Monday 00:00 UTC. Need more? Use Revel on OKX.AI marketplace ($0.35 per successful audit).`,
          used: weekly.used,
          limit: weekly.limit,
          resetsAt: weekly.resetsAt,
        },
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
    trackActivity({
      eventType: "analysis_started",
      analysisId: id,
      website,
      userId,
      status: "started",
    });

    after(async () => {
      try {
        await runAnalysis(id, website, userId);
      } catch (error) {
        await markAnalysisFailed(id, error, { website, userId });
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
  });
}