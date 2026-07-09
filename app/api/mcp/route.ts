import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@okxweb3/app-x402-next";
import {
  ensureOkxResourceServerReady,
  getMcpRouteConfig,
  getOkxBillingManifest,
  getOkxPaywallConfig,
  getOkxResourceServer,
  isOkxBillingEnabled,
} from "@/lib/billing/okx-x402";
import {
  isMcpHttpEnabled,
  mcpUnauthorizedResponse,
  validateMcpRequest,
} from "@/lib/mcp/auth";
import { handleMcpHttpRequest } from "@/lib/mcp/http-transport";

export const runtime = "nodejs";
export const maxDuration = 300;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Revel-MCP-Key, Mcp-Session-Id, PAYMENT-SIGNATURE, X-PAYMENT, payment-signature, x-payment",
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

async function mcpPostHandler(request: NextRequest): Promise<NextResponse> {
  return applyCors(
    await handleMcpHttpRequest(request, { source: "mcp_okx", paid: true })
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  if (!isMcpHttpEnabled()) {
    return Response.json(
      {
        error: "MCP HTTP is disabled. Set MCP_API_KEY or OKX billing env vars.",
      },
      { status: 503, headers: corsHeaders }
    );
  }

  return Response.json(
    {
      service: "revel-mcp",
      transport: "streamable-http",
      methods: ["POST", "DELETE", "GET", "OPTIONS"],
      manifest: "/api/mcp/manifest",
      docs: "/docs/mcp",
      billing: getOkxBillingManifest(),
      payments:
        isOkxBillingEnabled()
          ? {
              protocol: "x402",
              requiredOn: "POST",
              headers: ["PAYMENT-SIGNATURE", "X-PAYMENT"],
            }
          : null,
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: NextRequest) {
  if (!isMcpHttpEnabled()) {
    return Response.json(
      {
        error: "MCP HTTP is disabled. Set MCP_API_KEY or OKX billing env vars.",
        billing: getOkxBillingManifest(),
      },
      { status: 503, headers: corsHeaders }
    );
  }

  if (validateMcpRequest(request)) {
    return applyCors(
      await handleMcpHttpRequest(request, { source: "mcp_dev", paid: false })
    );
  }

  if (isOkxBillingEnabled()) {
    await ensureOkxResourceServerReady();
    const paidPost = withX402(
      mcpPostHandler,
      getMcpRouteConfig(),
      getOkxResourceServer(),
      getOkxPaywallConfig()
    );
    return paidPost(request);
  }

  return applyCors(mcpUnauthorizedResponse());
}

export async function DELETE(request: Request) {
  if (!validateMcpRequest(request)) {
    return applyCors(mcpUnauthorizedResponse());
  }

  return applyCors(
    await handleMcpHttpRequest(request, { source: "mcp_dev", paid: false })
  );
}