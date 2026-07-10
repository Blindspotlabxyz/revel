/**
 * A2MCP payment gate — OKX Agent Payments Protocol (x402) should protect
 * billable work only. MCP handshake + discovery must stay free so marketplace
 * probes and agent clients can integrate without paying for initialize/tools/list.
 *
 * Billable unit = starting a website audit (LLM-backed analysis).
 */

/** Tools that start a paid audit (one charge per call). */
export const REVEL_BILLABLE_MCP_TOOLS = [
  "revel_analyze_website",
  "revel_analyze_website_and_wait",
] as const;

export type RevelBillableMcpTool = (typeof REVEL_BILLABLE_MCP_TOOLS)[number];

const BILLABLE_TOOL_SET = new Set<string>(REVEL_BILLABLE_MCP_TOOLS);

/** JSON-RPC methods that never require payment. */
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
    // Unparseable / non-JSON-RPC → keep paywall (safe default).
    return true;
  }

  const method =
    typeof message.method === "string" ? message.method : undefined;

  if (!method) {
    // Responses or malformed — do not charge.
    return false;
  }

  if (FREE_MCP_METHODS.has(method) || method.startsWith("notifications/")) {
    return false;
  }

  if (method !== "tools/call") {
    // Unknown methods default to free protocol surface (safer for probes).
    return false;
  }

  const params = isRecord(message.params) ? message.params : undefined;
  const toolName = typeof params?.name === "string" ? params.name : undefined;

  if (!toolName) {
    // tools/call without a name — charge to avoid free abuse of incomplete payloads.
    return true;
  }

  return BILLABLE_TOOL_SET.has(toolName);
}

/**
 * Returns true when this MCP HTTP body should go through x402 (402 if unpaid).
 * Accepts raw request body text (JSON object or JSON-RPC batch array).
 */
export function mcpBodyRequiresPayment(bodyText: string): boolean {
  const trimmed = bodyText.trim();
  if (!trimmed) {
    // Empty body often used by probes — free.
    return false;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    // Non-JSON → charge (cannot classify).
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
