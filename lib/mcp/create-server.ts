import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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
    async () => textResult(getRevelMcpHealth())
  );

  server.tool(
    "revel_analyze_website",
    "Start an async product audit for a public website URL. Returns an analysisId to poll.",
    { url: z.string().url().describe("Public website URL to analyze") },
    async ({ url }) => textResult(await startWebsiteAnalysis(url))
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
    async ({ analysisId }) => textResult(await getAnalysisStatus(analysisId))
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
    async ({ analysisId, timeoutSeconds }) =>
      textResult(
        await waitForAnalysis(analysisId, (timeoutSeconds ?? 180) * 1000)
      )
  );

  server.tool(
    "revel_analyze_website_and_wait",
    "Run a full product audit and block until the Blueprint is ready. May take 1–3 minutes on slow networks.",
    {
      url: z.string().url(),
      timeoutSeconds: z.number().int().min(60).max(300).optional(),
    },
    async ({ url, timeoutSeconds }) =>
      textResult(
        await analyzeWebsiteAndWait(url, (timeoutSeconds ?? 180) * 1000)
      )
  );

  server.tool(
    "revel_export_blueprint",
    "Export a completed report as Markdown or JSON.",
    {
      analysisId: z.string().uuid(),
      format: z.enum(["markdown", "json"]).optional(),
    },
    async ({ analysisId, format }) =>
      textResult(await exportBlueprint(analysisId, format ?? "markdown"))
  );

  server.tool(
    "revel_fetch_url",
    "Fetch and extract readable text from a public webpage (homepage, pricing, about).",
    { url: z.string().url() },
    async ({ url }) => textResult(await fetchUrlContent(url))
  );

  return server;
}

export const REVEL_MCP_TOOLS = [
  "revel_health",
  "revel_analyze_website",
  "revel_get_analysis",
  "revel_wait_for_analysis",
  "revel_analyze_website_and_wait",
  "revel_export_blueprint",
  "revel_fetch_url",
] as const;