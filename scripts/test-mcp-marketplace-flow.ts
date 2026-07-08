/**
 * Simulates the OKX marketplace agent flow and counts MCP tool calls.
 *
 * Usage:
 *   npx tsx scripts/test-mcp-marketplace-flow.ts
 *   npx tsx scripts/test-mcp-marketplace-flow.ts https://tryrevel.xyz/api/mcp
 *   npx tsx scripts/test-mcp-marketplace-flow.ts --dry-run   # health + usage only
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

config({ path: resolve(process.cwd(), ".env.local") });

const base =
  process.argv.find((arg) => arg.startsWith("http"))?.replace(/\/$/, "") ??
  process.env.MCP_TEST_URL?.replace(/\/$/, "") ??
  "http://localhost:3000/api/mcp";

const dryRun = process.argv.includes("--dry-run");
const apiKey = process.env.MCP_API_KEY?.trim();
const testUrl = process.env.MCP_TEST_WEBSITE ?? "https://linear.app";

type CallLog = { tool: string; ms: number };

async function timed<T>(tool: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const log: CallLog = { tool, ms: Date.now() - start };
  console.log(`  ✓ ${tool} (${log.ms}ms)`);
  return result;
}

function parseJsonToolResult(result: unknown) {
  const payload = result as { content?: Array<{ type: string; text?: string }> };
  const text = payload.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Tool returned no text content");
  return JSON.parse(text) as Record<string, unknown>;
}

async function main() {
  if (!apiKey && !base.includes("localhost")) {
    throw new Error("MCP_API_KEY required in .env.local for remote tests");
  }

  console.log("endpoint", base);
  console.log("mode", dryRun ? "dry-run (no analysis)" : "full marketplace flow");

  const transport = new StreamableHTTPClientTransport(new URL(base), {
    requestInit: apiKey
      ? { headers: { Authorization: `Bearer ${apiKey}` } }
      : undefined,
  });

  const client = new Client({ name: "revel-marketplace-test", version: "1.0.0" });
  await client.connect(transport);

  let mcpToolCalls = 0;

  const health = await timed("revel_health", () =>
    client.callTool({ name: "revel_health", arguments: {} })
  );
  mcpToolCalls++;

  const healthData = parseJsonToolResult(health);
  const usage = healthData.usage as Record<string, unknown> | undefined;
  console.log("\nBillable unit:", usage?.billableUnit ?? healthData.category);
  console.log("Recommended flow MCP calls:", (usage?.flows as Record<string, unknown>)?.recommended);

  if (dryRun) {
    await client.close();
    console.log("\nDry run complete. MCP tool calls:", mcpToolCalls);
    return;
  }

  const started = await timed("revel_analyze_website", () =>
    client.callTool({
      name: "revel_analyze_website",
      arguments: { url: testUrl },
    })
  );
  mcpToolCalls++;

  const startData = parseJsonToolResult(started);
  const analysisId = startData.analysisId as string;
  if (!analysisId) throw new Error("No analysisId returned");

  console.log("\nWaiting for analysis (up to 240s)...");
  const completed = await timed("revel_wait_for_analysis", () =>
    client.callTool({
      name: "revel_wait_for_analysis",
      arguments: { analysisId, timeoutSeconds: 240 },
    })
  );
  mcpToolCalls++;

  const report = parseJsonToolResult(completed);
  console.log("  score:", report.score);
  console.log("  status:", report.status);

  await timed("revel_export_blueprint", () =>
    client.callTool({
      name: "revel_export_blueprint",
      arguments: { analysisId, format: "markdown" },
    })
  );
  mcpToolCalls++;

  await client.close();

  console.log("\n--- Marketplace flow summary ---");
  console.log("MCP tool calls (client-side):", mcpToolCalls);
  console.log("Billable audits:", 1);
  console.log("Tools used: revel_health → revel_analyze_website → revel_wait_for_analysis → revel_export_blueprint");
  console.log("\nPrice per completed audit (not per MCP call):");
  console.log("  $0.10/audit × 1 = $0.10");
  console.log("  $0.20/audit × 1 = $0.20");
  console.log("ok");
}

void main().catch((error) => {
  console.error("marketplace flow test failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});