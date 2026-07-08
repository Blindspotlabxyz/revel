import { z } from "zod";
import type { AnalysisReport } from "@/types/analysis";

const priority = z.enum(["critical", "high", "medium", "low"]);
const category = z.enum(["product", "ux", "messaging", "competition"]);
const impact = z.enum(["high", "medium", "low"]);

export const analysisReportSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(20),
  blindspots: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        priority,
        category,
        description: z.string(),
        suggestedFix: z.string(),
      })
    )
    .min(4),
  blueprint: z
    .array(
      z.object({
        id: z.string(),
        step: z.number(),
        title: z.string(),
        estimatedEffort: z.string(),
        expectedImpact: impact,
        description: z.string(),
      })
    )
    .min(3),
  actions: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        priority,
        estimatedEffort: z.string(),
        expectedOutcome: z.string(),
      })
    )
    .min(5),
});

export function parseAnalysisReport(raw: unknown): AnalysisReport {
  return analysisReportSchema.parse(raw);
}