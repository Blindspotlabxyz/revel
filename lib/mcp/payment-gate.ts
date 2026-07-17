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

  // Non-MCP / probe payloads (bare POST {}, marketplace curl) → require 402
  if (!method) {
    return true;
  }

  if (FREE_MCP_METHODS.has(method) || method.startsWith("notifications/")) {
    return false;
  }

  if (method !== "tools/call") {
    // Unknown MCP methods stay free so handshake does not break
    return false;
  }

  const params = isRecord(message.params) ? message.params : undefined;
  const toolName = typeof params?.name === "string" ? params.name : undefined;

  if (!toolName) {
    return true;
  }

  return BILLABLE_TOOL_SET.has(toolName);
}

/**
 * OKX A2MCP self-check for paid endpoints:
 *   curl -i -X POST https://endpoint  → expect HTTP 402 + PAYMENT-REQUIRED
 *
 * Empty body / non-MCP JSON must 402. Only known free MCP methods skip paywall.
 */
export function mcpBodyRequiresPayment(bodyText: string): boolean {
  const trimmed = bodyText.trim();
  // Bare POST (marketplace validator) → paid
  if (!trimmed) {
    return true;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return true;
  }

  if (Array.isArray(parsed)) {
    // Empty batch is not a free discovery call
    if (parsed.length === 0) return true;
    return parsed.some((item) => messageRequiresPayment(item));
  }

  return messageRequiresPayment(parsed as JsonRpcMessage);
}

export function isBillableMcpTool(toolName: string): boolean {
  return BILLABLE_TOOL_SET.has(toolName);
}
