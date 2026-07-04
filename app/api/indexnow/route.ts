import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/seo/indexnow";

/**
 * Ping Bing and IndexNow partners after deploy or content updates.
 * Requires INDEXNOW_SECRET header when set in production.
 */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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