import { config } from "dotenv";
import { resolve } from "node:path";
import { getRevelMcpHealth, startWebsiteAnalysis } from "../lib/mcp/handlers";
import {
  REVEL_MCP_TOOLS,
  createRevelMcpServer,
} from "../lib/mcp/create-server";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("health", getRevelMcpHealth());

  createRevelMcpServer();
  console.log("registered tools", REVEL_MCP_TOOLS);

  if (process.argv.includes("--start")) {
    const result = await startWebsiteAnalysis("https://linear.app");
    console.log("started", result);
  }

  console.log("ok — run with --start to fire a sample analysis");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});