import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@okxweb3/app-x402-next";
import {
  ensureOkxResourceServerReady,
  getAuditRouteConfig,
  getOkxBillingManifest,
  getOkxResourceServer,
  isOkxBillingEnabled,
} from "@/lib/billing/okx-x402";
import { startWebsiteAnalysis } from "@/lib/mcp/handlers";
import { normalizeUrl } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 300;

async function auditHandler(request: NextRequest): Promise<NextResponse> {
  await ensureOkxResourceServerReady();

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const website = normalizeUrl(url);
    const result = await startWebsiteAnalysis(website);
    return NextResponse.json({
      ...result,
      billing: {
        unit: "completed_audit",
        price: getOkxBillingManifest().priceDisplay,
        poll: `/api/report/${result.analysisId}`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start audit";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: "revel-audit",
    billing: getOkxBillingManifest(),
    method: "POST",
    body: { url: "https://example.com" },
    docs: "/docs/mcp",
  });
}

export async function POST(request: NextRequest) {
  if (!isOkxBillingEnabled()) {
    return NextResponse.json(
      {
        error: "OKX billing is not configured",
        hint: "Set OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE, and OKX_PAY_TO. Free website access: /mission-control (3/day).",
        billing: getOkxBillingManifest(),
      },
      { status: 503 }
    );
  }

  const paidPost = withX402(
    auditHandler,
    getAuditRouteConfig(),
    getOkxResourceServer(),
    {
      appName: "Revel",
      appLogo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tryrevel.xyz"}/icon.png`,
    }
  );

  return paidPost(request);
}