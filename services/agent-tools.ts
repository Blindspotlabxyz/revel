import { ZodError } from "zod";
import {
  isCompleteReport,
  normalizeAnalysisReport,
  parseAnalysisReport,
  reportCompletenessError,
} from "@/lib/report-schema";
import type { AnalysisReport } from "@/types/analysis";
import {
  discoverInternalLinks,
  extractWebsiteContent,
} from "@/services/content-extractor";

export type AgentToolName =
  | "fetch_url"
  | "discover_internal_links"
  | "submit_analysis_report";

export const AGENT_TOOL_DECLARATIONS = [
  {
    name: "fetch_url",
    description:
      "Fetch and extract readable text from a public webpage. Use for the homepage and key pages like pricing, about, or features.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Absolute URL to fetch",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "discover_internal_links",
    description:
      "List same-origin internal links from a page. Prioritizes pricing, about, features, and similar paths.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Base URL to scan for internal links",
        },
        limit: {
          type: "number",
          description: "Maximum links to return (default 12)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "submit_analysis_report",
    description:
      "Submit the final structured product audit as JSON. Call once you have reviewed enough pages.",
    parameters: {
      type: "object",
      properties: {
        report_json: {
          type: "string",
          description:
            "Stringified JSON with score, summary, blindspots (6-10), blueprint (5-8), actions (8-15)",
        },
      },
      required: ["report_json"],
    },
  },
];

export function getOpenAIAgentTools() {
  return AGENT_TOOL_DECLARATIONS.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export interface AgentToolResult {
  response: Record<string, unknown>;
  report?: AnalysisReport;
}

function parseSubmitPayload(args: Record<string, unknown>): unknown {
  if (typeof args.report_json === "string") {
    try {
      return JSON.parse(args.report_json);
    } catch {
      throw new Error("report_json is not valid JSON");
    }
  }

  if (typeof args.score === "number") {
    return args;
  }

  throw new Error("submit_analysis_report requires report_json");
}

export function isAgentToolName(name: string): name is AgentToolName {
  return (
    name === "fetch_url" ||
    name === "discover_internal_links" ||
    name === "submit_analysis_report"
  );
}

export async function executeAgentTool(
  name: AgentToolName,
  args: Record<string, unknown>
): Promise<AgentToolResult> {
  switch (name) {
    case "fetch_url": {
      const url = String(args.url ?? "").trim();
      if (!url) {
        return { response: { error: "url is required" } };
      }

      try {
        const content = await extractWebsiteContent(url);
        return {
          response: {
            url,
            content: content.slice(0, 12000),
            truncated: content.length > 12000,
          },
        };
      } catch (error) {
        return {
          response: {
            url,
            error: error instanceof Error ? error.message : "Fetch failed",
          },
        };
      }
    }

    case "discover_internal_links": {
      const url = String(args.url ?? "").trim();
      if (!url) {
        return { response: { error: "url is required" } };
      }

      const limit =
        typeof args.limit === "number" && args.limit > 0
          ? Math.min(args.limit, 20)
          : 12;

      try {
        const links = await discoverInternalLinks(url, limit);
        return { response: { url, links, count: links.length } };
      } catch (error) {
        return {
          response: {
            url,
            error: error instanceof Error ? error.message : "Discovery failed",
          },
        };
      }
    }

    case "submit_analysis_report": {
      try {
        const payload = parseSubmitPayload(args);
        try {
          const report = parseAnalysisReport(payload);
          if (!isCompleteReport(report)) {
            return {
              response: {
                accepted: false,
                error: reportCompletenessError(report),
              },
            };
          }
          return { response: { accepted: true, score: report.score }, report };
        } catch (strictError) {
          // Accept repaired reports only when still complete enough for users
          const repaired = normalizeAnalysisReport(payload);
          if (isCompleteReport(repaired)) {
            return {
              response: {
                accepted: true,
                score: repaired.score,
                repaired: true,
                note:
                  strictError instanceof ZodError
                    ? "Report repaired from partial schema"
                    : "Report normalized",
              },
              report: repaired,
            };
          }
          return {
            response: {
              accepted: false,
              error:
                reportCompletenessError(repaired) +
                (strictError instanceof ZodError
                  ? ` Schema: ${strictError.issues
                      .slice(0, 3)
                      .map((i) => i.message)
                      .join("; ")}`
                  : ""),
            },
          };
        }
      } catch (error) {
        const validationError =
          error instanceof ZodError
            ? error.issues
                .slice(0, 4)
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ")
            : error instanceof Error
              ? error.message
              : "Report failed schema validation";

        return {
          response: {
            accepted: false,
            error: validationError,
          },
        };
      }
    }

    default:
      return { response: { error: `Unknown tool: ${name}` } };
  }
}