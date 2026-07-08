import { REVEL_MCP_TOOLS } from "@/lib/mcp/create-server";
import { isMcpHttpEnabled } from "@/lib/mcp/auth";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const endpoint = `${siteConfig.url}/api/mcp`;

  return Response.json({
    name: "revel-mcp",
    title: "Revel — AI Product Strategist",
    description:
      "Agent-to-MCP (A2MCP) server that audits websites and returns a Reveal Index, Blindspot Map, Blueprint, and Action Queue.",
    version: "1.0.0",
    category: "A2MCP",
    provider: {
      name: "BlindspotLab",
      url: siteConfig.organization.url,
      contact: siteConfig.organization.email,
    },
    website: siteConfig.url,
    documentation: `${siteConfig.url}/docs/mcp`,
    transport: {
      type: "streamable-http",
      endpoint,
      authentication: {
        type: "bearer",
        header: "Authorization",
        alternateHeader: "X-Revel-MCP-Key",
        envVar: "MCP_API_KEY",
      },
    },
    tools: REVEL_MCP_TOOLS.map((name) => ({ name })),
    enabled: isMcpHttpEnabled(),
    stdio: {
      command: "npx",
      args: ["tsx", "scripts/revel-mcp.ts"],
    },
  });
}