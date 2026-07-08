import {
  isMcpHttpEnabled,
  mcpUnauthorizedResponse,
  validateMcpRequest,
} from "@/lib/mcp/auth";
import { handleMcpHttpRequest } from "@/lib/mcp/http-transport";

export const runtime = "nodejs";
export const maxDuration = 300;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Revel-MCP-Key, Mcp-Session-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  if (!isMcpHttpEnabled()) {
    return Response.json(
      { error: "MCP HTTP is disabled. Set MCP_API_KEY." },
      { status: 503 }
    );
  }

  return Response.json(
    {
      service: "revel-mcp",
      transport: "streamable-http",
      methods: ["POST", "DELETE", "GET", "OPTIONS"],
      manifest: "/api/mcp/manifest",
      docs: "/docs/mcp",
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: Request) {
  if (!isMcpHttpEnabled()) {
    return Response.json(
      { error: "MCP HTTP is disabled. Set MCP_API_KEY." },
      { status: 503 }
    );
  }

  if (!validateMcpRequest(request)) {
    return mcpUnauthorizedResponse();
  }

  try {
    return await handleMcpHttpRequest(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MCP request failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!validateMcpRequest(request)) {
    return mcpUnauthorizedResponse();
  }

  return handleMcpHttpRequest(request);
}