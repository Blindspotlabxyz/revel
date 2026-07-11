export const REVEL_BILLABLE_MCP_TOOLS = [
  "revel_analyze_website",
  "revel_analyze_website_and_wait",
] as const;

export type RevelBillableMcpTool = (typeof REVEL_BILLABLE_MCP_TOOLS)[number];

const BILLABLE_TOOL_SET = new Set<string>(REVEL_BILLABLE_MCP_TOOLS);

const FREE_MCP_METHODS = new Set([
  "initialize",
  "notifications/initialized",
  "notifications/cancelled",
  "ping",
  "tools/list",
  "resources/list",
  "resources/templates/list",
  "resources/read",
  "prompts/list",
  "prompts/get",
  "logging/setLevel",
  "completion/complete",
]);

type JsonRpcMessage = {
  method?: unknown;
  params?: {
    name?: unknown;
    arguments?: unknown;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function messageRequiresPayment(message: unknown): boolean {
  if (!isRecord(message)) {
    return true;
  }

  const method =
    typeof message.method === "string" ? message.method : undefined;

  if (!method) {
    return false;
  }

  if (FREE_MCP_METHODS.has(method) || method.startsWith("notifications/")) {
    return false;
  }

  if (method !== "tools/call") {
    return false;
  }

  const params = isRecord(message.params) ? message.params : undefined;
  const toolName = typeof params?.name === "string" ? params.name : undefined;

  if (!toolName) {
    return true;
  }

  return BILLABLE_TOOL_SET.has(toolName);
}

export function mcpBodyRequiresPayment(bodyText: string): boolean {
  const trimmed = bodyText.trim();
  if (!trimmed) {
    return false;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return true;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return false;
    return parsed.some((item) => messageRequiresPayment(item));
  }

  return messageRequiresPayment(parsed as JsonRpcMessage);
}

export function isBillableMcpTool(toolName: string): boolean {
  return BILLABLE_TOOL_SET.has(toolName);
}
