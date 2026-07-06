import { after } from "next/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUserId } from "@/lib/auth";
import { logEvent } from "@/lib/logger";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { normalizeUrl } from "@/lib/validation";
import { markAnalysisFailed, runAnalysis } from "@/services/analysis-runner";
import { saveAnalysis } from "@/services/store";

export const maxDuration = 60;

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
}