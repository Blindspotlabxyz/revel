import { getOkxBillingManifest } from "@/lib/billing/okx-x402";
import { isMcpHttpEnabled } from "@/lib/mcp/auth";
import { REVEL_MCP_USAGE } from "@/lib/mcp/usage-model";
import {
  REVEL_MCP_RECOMMENDED_FLOW,
  REVEL_MCP_TOOL_CATALOG,
} from "@/lib/mcp/tool-catalog";
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
    protocolVersion: "2024-11-05",
    billingUnit: REVEL_MCP_USAGE.billableUnit,
    billing: getOkxBillingManifest(),
    usage: REVEL_MCP_USAGE,
    recommendedFlow: REVEL_MCP_RECOMMENDED_FLOW,
    tools: REVEL_MCP_TOOL_CATALOG.map((tool) => ({
      name: tool.name,
      description: tool.description,
      ...("readOnly" in tool ? { readOnly: tool.readOnly } : { readOnly: false }),
      ...("input" in tool ? { input: tool.input } : {}),
    })),
    enabled: isMcpHttpEnabled(),
    stdio: {
      command: "npx",
      args: ["tsx", "scripts/revel-mcp.ts"],
    },
  });
}