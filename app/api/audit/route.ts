import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@okxweb3/app-x402-next";
import {
  ensureOkxResourceServerReady,
  getAuditRouteConfig,
  getOkxBillingManifest,
  getOkxResourceServer,
  isOkxBillingEnabled,
} from "@/lib/billing/okx-x402";
import { runWithActivityContext } from "@/lib/activity-context";
import { trackActivity } from "@/lib/activity";
import { startWebsiteAnalysis } from "@/lib/mcp/handlers";
import { normalizeUrlSafe } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 300;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, PAYMENT-SIGNATURE, X-PAYMENT",
  "Access-Control-Expose-Headers": "PAYMENT-REQUIRED, PAYMENT-RESPONSE",
};

function applyCors(response: Response): NextResponse {
  const next = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  for (const [key, value] of Object.entries(corsHeaders)) {
    next.headers.set(key, value);
  }
  return next;
}

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
    const website = await normalizeUrlSafe(url);
    const result = await runWithActivityContext(
      { source: "api_audit", paid: true },
      async () => startWebsiteAnalysis(website)
    );
    trackActivity({
      eventType: "analysis_started",
      source: "api_audit",
      analysisId: result.analysisId,
      website: result.website,
      status: "started",
      metadata: { paid: true },
    });
    return NextResponse.json({
      ...result,
      billing: {
        unit: "completed_audit",
        price: getOkxBillingManifest().priceDisplay,
        poll: `/api/report/${result.analysisId}`,
      },
    });
  } catch (error) {
    const { logServerError, toClientErrorMessage } = await import(
      "@/lib/safe-client-error"
    );
    logServerError("audit_start_failed", error);
    return NextResponse.json(
      {
        error: toClientErrorMessage(error, "Could not start audit"),
      },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      service: "revel-audit",
      billing: getOkxBillingManifest(),
      method: "POST",
      body: { url: "https://example.com" },
      docs: "/docs/mcp",
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: NextRequest) {
  if (!isOkxBillingEnabled()) {
    return NextResponse.json(
      {
        error: "OKX billing is not configured",
        hint: "Set OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE, and OKX_PAY_TO. Free website access: /mission-control (3/day).",
        billing: getOkxBillingManifest(),
      },
      { status: 503, headers: corsHeaders }
    );
  }

  const paidPost = withX402(
    auditHandler,
    getAuditRouteConfig(),
    getOkxResourceServer(),
    {
      appName: "Revel",
      appLogo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tryrevel.xyz"}/brand/revel-icon-256.png`,
    }
  );

  // The x402 wrapper generates an unpaid 402 itself, before auditHandler is
  // reached. Wrap its output so browser clients can receive the challenge.
  return applyCors(await paidPost(request));
}
