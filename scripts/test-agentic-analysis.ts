/**
 * Local smoke test for Phase 2 agentic analysis.
 *
 * Usage:
 *   npx tsx scripts/test-agentic-analysis.ts [url]
 *
 * Requires GEMINI_API_KEY in .env.local (from https://aistudio.google.com/apikey)
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { getAgentProvider } from "../lib/analysis-provider";
import { generateAgenticAnalysis } from "../services/agentic-analysis";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.argv[2] ?? "https://vercel.com";

if (!process.env.GROQ_API_KEY?.trim() && !process.env.GEMINI_API_KEY?.trim()) {
  console.error(
    "Missing GROQ_API_KEY or GEMINI_API_KEY. Get Groq at https://console.groq.com/keys"
  );
  process.exit(1);
}

process.env.ANALYSIS_MODE ??= "agentic";

const provider = getAgentProvider();
console.log(`[test-agentic] mode=agentic provider=${provider ?? "none"} url=${url}`);
if (provider === "groq") {
  console.log(`[test-agentic] model=${process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"}`);
} else {
  console.log(`[test-agentic] model=${process.env.GEMINI_MODEL ?? "gemini-2.5-flash"}`);
}

async function main() {
  const started = Date.now();

  try {
    const report = await generateAgenticAnalysis(url);
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);

    console.log(`[test-agentic] completed in ${elapsed}s`);
    console.log(`[test-agentic] score=${report.score}`);
    console.log(`[test-agentic] summary=${report.summary.slice(0, 160)}...`);
    console.log(
      `[test-agentic] blindspots=${report.blindspots.length} blueprint=${report.blueprint.length} actions=${report.actions.length}`
    );
  } catch (error) {
    console.error(
      "[test-agentic] failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

void main();