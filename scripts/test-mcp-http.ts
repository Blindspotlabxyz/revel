/**
 * End-to-end MCP Streamable HTTP test (any MCP-compatible client uses this protocol).
 *
 * Usage:
 *   npx tsx scripts/test-mcp-http.ts
 *   npx tsx scripts/test-mcp-http.ts https://tryrevel.xyz/api/mcp
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

config({ path: resolve(process.cwd(), ".env.local") });

const base =
  process.argv[2]?.replace(/\/$/, "") ??
  process.env.MCP_TEST_URL?.replace(/\/$/, "") ??
  "http://localhost:3000/api/mcp";

const apiKey = process.env.MCP_API_KEY?.trim();

async function main() {
  if (!apiKey && !base.includes("localhost")) {
    throw new Error("MCP_API_KEY required in .env.local for remote tests");
  }

  console.log("endpoint", base);

  const transport = new StreamableHTTPClientTransport(new URL(base), {
    requestInit: apiKey
      ? { headers: { Authorization: `Bearer ${apiKey}` } }
      : undefined,
  });

  const client = new Client({ name: "revel-mcp-test", version: "1.0.0" });

  await client.connect(transport);
  console.log("connected");

  const { tools } = await client.listTools();
  console.log(
    "tools",
    tools.map((t) => t.name)
  );

  const health = await client.callTool({
    name: "revel_health",
    arguments: {},
  });
  console.log("revel_health", JSON.stringify(health, null, 2));

  await client.close();
  console.log("ok");
}

void main().catch((error) => {
  console.error("mcp http test failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});