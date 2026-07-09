import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/seo/indexnow";

function authorizeRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const indexNowSecret = process.env.INDEXNOW_SECRET;
  const auth = request.headers.get("authorization");

  if (cronSecret && auth === `Bearer ${cronSecret}`) {
    return true;
  }

  if (indexNowSecret && auth === `Bearer ${indexNowSecret}`) {
    return true;
  }

  if (!cronSecret && !indexNowSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return false;
}

async function handleIndexNow(request: Request) {
  if (!authorizeRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      urls?: string[];
    };
    const result = await submitToIndexNow(body.urls);

    return NextResponse.json({
      ok: true,
      count: result.submitted.length,
      results: result.results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IndexNow failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST: manual or external deploy hook (Bearer INDEXNOW_SECRET).
 * GET: Vercel Cron daily re-index (Bearer CRON_SECRET).
 */
export async function POST(request: Request) {
  return handleIndexNow(request);
}

export async function GET(request: Request) {
  return handleIndexNow(request);
}