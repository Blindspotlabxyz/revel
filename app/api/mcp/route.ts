import {
  isMcpHttpEnabled,
  mcpUnauthorizedResponse,
  validateMcpRequest,
} from "@/lib/mcp/auth";
import { handleMcpHttpRequest } from "@/lib/mcp/http-transport";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  if (!isMcpHttpEnabled()) {
    return Response.json(
      { error: "MCP HTTP is disabled. Set MCP_API_KEY." },
      { status: 503 }
    );
  }

  return Response.json({
    service: "revel-mcp",
    transport: "streamable-http",
    methods: ["POST", "DELETE", "GET"],
    manifest: "/api/mcp/manifest",
    docs: "/docs/mcp",
  });
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