export const REVEL_MCP_TOOL_CATALOG = [
  {
    name: "revel_health",
    description:
      "Check Revel MCP availability, version, and export integration capabilities.",
    readOnly: true,
  },
  {
    name: "revel_analyze_website",
    description:
      "Start an async product audit for a public website. Returns analysisId to poll.",
    input: { url: "string" },
  },
  {
    name: "revel_get_analysis",
    description: "Fetch analysis status and full report JSON when completed.",
    input: { analysisId: "uuid" },
    readOnly: true,
  },
  {
    name: "revel_wait_for_analysis",
    description:
      "Poll until analysis completes or fails (default 180s). Use after revel_analyze_website.",
    input: { analysisId: "uuid", timeoutSeconds: "number?" },
  },
  {
    name: "revel_analyze_website_and_wait",
    description:
      "One-shot audit — blocks until Blueprint is ready (1–3 min). Best for simple agents.",
    input: { url: "string", timeoutSeconds: "number?" },
  },
  {
    name: "revel_export_blueprint",
    description: "Export completed report as markdown or json.",
    input: { analysisId: "uuid", format: "markdown|json" },
    readOnly: true,
  },
  {
    name: "revel_fetch_url",
    description: "Fetch readable text from a public webpage.",
    input: { url: "string" },
    readOnly: true,
  },
] as const;

export const REVEL_MCP_RECOMMENDED_FLOW = [
  "revel_health",
  "revel_analyze_website",
  "revel_wait_for_analysis",
  "revel_export_blueprint",
] as const;