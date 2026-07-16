/**
 * Verifies the browser-facing part of the paid A2MCP handshake.
 *
 * Usage:
 *   npm run test:mcp:cors -- https://tryrevel.xyz/api/mcp
 *   MCP_TEST_URL=http://localhost:3000/api/mcp npm run test:mcp:cors
 */

const endpoint =
  process.argv[2]?.replace(/\/$/, "") ??
  process.env.MCP_TEST_URL?.replace(/\/$/, "") ??
  "http://localhost:3000/api/mcp";
const origin = "https://okx.com";

function requireHeader(headers, name, expectedValue) {
  const value = headers.get(name);
  if (!value) throw new Error(`Missing ${name} response header`);
  if (expectedValue && value !== expectedValue) {
    throw new Error(`Expected ${name}=${expectedValue}, received ${value}`);
  }
  return value;
}

function requireListedHeader(headerValue, name) {
  const values = headerValue
    .split(",")
    .map((value) => value.trim().toLowerCase());
  if (!values.includes(name.toLowerCase())) {
    throw new Error(`Expected ${name} in header list: ${headerValue}`);
  }
}

async function main() {
  console.log("endpoint", endpoint);

  const preflight = await fetch(endpoint, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type, mcp-protocol-version",
    },
  });
  if (preflight.status !== 204) {
    throw new Error(`Expected preflight 204, received ${preflight.status}`);
  }
  requireHeader(preflight.headers, "access-control-allow-origin", "*");
  requireListedHeader(
    requireHeader(preflight.headers, "access-control-allow-headers"),
    "MCP-Protocol-Version"
  );

  const paymentChallenge = await fetch(endpoint, {
    method: "POST",
    headers: {
      Origin: origin,
      Accept: "application/json",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-03-26",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "cors-payment-check",
      method: "tools/call",
      params: {
        name: "revel_analyze_website",
        arguments: { url: "https://example.com" },
      },
    }),
  });

  if (paymentChallenge.status !== 402) {
    throw new Error(
      `Expected unpaid billable call to return 402, received ${paymentChallenge.status}`
    );
  }
  requireHeader(paymentChallenge.headers, "access-control-allow-origin", "*");
  requireHeader(paymentChallenge.headers, "payment-required");
  requireListedHeader(
    requireHeader(paymentChallenge.headers, "access-control-expose-headers"),
    "PAYMENT-REQUIRED"
  );

  console.log("browser A2MCP CORS check passed");
}

void main().catch((error) => {
  console.error(
    "browser A2MCP CORS check failed:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
