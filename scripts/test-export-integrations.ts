import { config } from "dotenv";
import { resolve } from "node:path";
import { getExportCapabilities } from "../lib/mission-control-config";
import {
  pushToLinear,
  pushToNotion,
} from "../services/export-integrations";
import type { AnalysisReport } from "../types/analysis";

config({ path: resolve(process.cwd(), ".env.local") });

const sampleReport: AnalysisReport = {
  score: 72,
  summary: "Test export from Revel local smoke script.",
  blindspots: [
    {
      id: "bs-1",
      title: "Test blindspot",
      priority: "high",
      category: "ux",
      description: "Sample issue for export test.",
      suggestedFix: "Sample fix.",
    },
    {
      id: "bs-2",
      title: "Second blindspot",
      priority: "medium",
      category: "messaging",
      description: "Another issue.",
      suggestedFix: "Another fix.",
    },
    {
      id: "bs-3",
      title: "Third blindspot",
      priority: "low",
      category: "product",
      description: "Third issue.",
      suggestedFix: "Third fix.",
    },
    {
      id: "bs-4",
      title: "Fourth blindspot",
      priority: "low",
      category: "competition",
      description: "Fourth issue.",
      suggestedFix: "Fourth fix.",
    },
  ],
  blueprint: [
    {
      id: "bp-1",
      step: 1,
      title: "First step",
      estimatedEffort: "30 minutes",
      expectedImpact: "high",
      description: "Do the first thing.",
    },
    {
      id: "bp-2",
      step: 2,
      title: "Second step",
      estimatedEffort: "1 hour",
      expectedImpact: "medium",
      description: "Do the second thing.",
    },
    {
      id: "bp-3",
      step: 3,
      title: "Third step",
      estimatedEffort: "2 hours",
      expectedImpact: "medium",
      description: "Do the third thing.",
    },
  ],
  actions: [
    {
      id: "a-1",
      title: "Action one",
      description: "First action detail.",
      priority: "high",
      estimatedEffort: "20 minutes",
      expectedOutcome: "Better clarity",
    },
    {
      id: "a-2",
      title: "Action two",
      description: "Second action detail.",
      priority: "medium",
      estimatedEffort: "45 minutes",
      expectedOutcome: "More trust",
    },
    {
      id: "a-3",
      title: "Action three",
      description: "Third action detail.",
      priority: "medium",
      estimatedEffort: "1 hour",
      expectedOutcome: "Higher conversion",
    },
    {
      id: "a-4",
      title: "Action four",
      description: "Fourth action detail.",
      priority: "low",
      estimatedEffort: "30 minutes",
      expectedOutcome: "Cleaner UX",
    },
    {
      id: "a-5",
      title: "Action five",
      description: "Fifth action detail.",
      priority: "low",
      estimatedEffort: "15 minutes",
      expectedOutcome: "Polish",
    },
  ],
};

async function main() {
  const format = process.argv[2] ?? "capabilities";
  const website = "https://whate.app";
  const analysisId = "export-smoke-test";

  console.log("capabilities", getExportCapabilities());

  if (format === "linear") {
    const token = process.env.LINEAR_API_KEY;
    const teamId = process.env.LINEAR_TEAM_ID;
    if (!token || !teamId) {
      throw new Error("Set LINEAR_API_KEY and LINEAR_TEAM_ID for this smoke test");
    }
    const result = await pushToLinear(sampleReport, website, token, teamId);
    console.log("linear ok", result);
    return;
  }

  if (format === "notion") {
    const token = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!token || !databaseId) {
      throw new Error("Set NOTION_API_KEY and NOTION_DATABASE_ID for this smoke test");
    }
    const result = await pushToNotion(sampleReport, website, analysisId, token, {
      databaseId,
    });
    console.log("notion ok", result);
    return;
  }

  console.log("Usage: npx tsx scripts/test-export-integrations.ts [linear|notion]");
}

void main().catch((error) => {
  console.error("export test failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});