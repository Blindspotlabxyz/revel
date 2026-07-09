import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trackActivity } from "@/lib/activity";
import { REVEL_MCP_TOOL_CATALOG } from "@/lib/mcp/tool-catalog";
import { siteConfig } from "@/lib/site-config";
import {
  analyzeWebsiteAndWait,
  exportBlueprint,
  fetchUrlContent,
  getAnalysisStatus,
  getRevelMcpHealth,
  startWebsiteAnalysis,
  waitForAnalysis,
} from "@/lib/mcp/handlers";

function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function trackMcpTool<T extends Record<string, unknown>>(
  toolName: string,
  handler: (args: T) => Promise<ReturnType<typeof textResult>>
) {
  return async (args: T) => {
    trackActivity({
      eventType: "mcp_tool_call",
      toolName,
      status: "started",
    });

    try {
      const result = await handler(args);
      trackActivity({
        eventType: "mcp_tool_call",
        toolName,
        status: "completed",
      });
      return result;
    } catch (error) {
      trackActivity({
        eventType: "mcp_tool_call",
        toolName,
        status: "failed",
        metadata: {
          error: error instanceof Error ? error.message : "Tool failed",
        },
      });
      throw error;
    }
  };
}

export function createRevelMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "revel-mcp",
      title: "Revel — AI Product Strategist",
      version: "1.0.0",
      websiteUrl: siteConfig.url,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.tool(
    "revel_health",
    "Check Revel MCP availability, version, and export integration capabilities.",
    trackMcpTool("revel_health", async () => textResult(getRevelMcpHealth()))
  );

  server.tool(
    "revel_analyze_website",
    "Start an async product audit for a public website URL. Returns an analysisId to poll.",
    {
      url: z
        .string()
        .min(1)
        .describe("Public website URL (https://example.com or example.com)"),
    },
    trackMcpTool("revel_analyze_website", async ({ url }) =>
      textResult(await startWebsiteAnalysis(url))
    )
  );

  server.tool(
    "revel_get_analysis",
    "Fetch analysis status and report JSON when completed.",
    {
      analysisId: z
        .string()
        .uuid()
        .describe("Analysis ID from revel_analyze_website"),
    },
    trackMcpTool("revel_get_analysis", async ({ analysisId }) =>
      textResult(await getAnalysisStatus(analysisId))
    )
  );

  server.tool(
    "revel_wait_for_analysis",
    "Poll until an analysis completes or fails. Default timeout 180 seconds.",
    {
      analysisId: z.string().uuid(),
      timeoutSeconds: z
        .number()
        .int()
        .min(30)
        .max(300)
        .optional()
        .describe("Max wait time in seconds (default 180)"),
    },
    trackMcpTool("revel_wait_for_analysis", async ({ analysisId, timeoutSeconds }) =>
      textResult(
        await waitForAnalysis(analysisId, (timeoutSeconds ?? 180) * 1000)
      )
    )
  );

  server.tool(
    "revel_analyze_website_and_wait",
    "Run a full product audit and block until the Blueprint is ready. May take 1–3 minutes on slow networks.",
    {
      url: z.string().min(1),
      timeoutSeconds: z.number().int().min(60).max(300).optional(),
    },
    trackMcpTool(
      "revel_analyze_website_and_wait",
      async ({ url, timeoutSeconds }) =>
        textResult(
          await analyzeWebsiteAndWait(url, (timeoutSeconds ?? 180) * 1000)
        )
    )
  );

  server.tool(
    "revel_export_blueprint",
    "Export a completed report as Markdown or JSON.",
    {
      analysisId: z.string().uuid(),
      format: z.enum(["markdown", "json"]).optional(),
    },
    trackMcpTool("revel_export_blueprint", async ({ analysisId, format }) =>
      textResult(await exportBlueprint(analysisId, format ?? "markdown"))
    )
  );

  server.tool(
    "revel_fetch_url",
    "Fetch and extract readable text from a public webpage (homepage, pricing, about).",
    { url: z.string().min(1) },
    trackMcpTool("revel_fetch_url", async ({ url }) =>
      textResult(await fetchUrlContent(url))
    )
  );

  return server;
}

export const REVEL_MCP_TOOLS = REVEL_MCP_TOOL_CATALOG.map((tool) => tool.name);