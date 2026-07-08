#!/usr/bin/env node
/**
 * Revel MCP server (stdio) — for Cursor, Claude Desktop, and local A2MCP dev.
 *
 * Usage:
 *   npm run mcp
 *   npx tsx scripts/revel-mcp.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRevelMcpServer } from "../lib/mcp/create-server";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const server = createRevelMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[revel-mcp] stdio transport ready");
}

void main().catch((error) => {
  console.error(
    "[revel-mcp] failed:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});