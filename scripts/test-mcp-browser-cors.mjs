/**
 * Verifies OKX marketplace x402 + browser CORS requirements for A2MCP.
 *
 * Critical: Mozilla + Accept:text/html must still return JSON 402 with
 * PAYMENT-REQUIRED (not an HTML paywall). HTML paywalls fail OKX review.
 *
 * Usage:
 *   npm run test:mcp:cors -- https://tryrevel.xyz/api/mcp
 *   MCP_TEST_URL=http://localhost:3000/api/mcp npm run test:mcp:cors
 */

const endpoint =
  process.argv[2]?.replace(/\/$/, "") ??
  process.env.MCP_TEST_URL?.replace(/\/$/, "") ??
  "http://localhost:3000/api/mcp";
const origin = "https://web3.okx.com";

const analyzeBody = {
  jsonrpc: "2.0",
  id: "x402-check",
  method: "tools/call",
  params: {
    name: "revel_analyze_website",
    arguments: { url: "https://example.com" },
  },
};

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

function decodePaymentRequired(headers) {
  const raw =
    headers.get("payment-required") || headers.get("PAYMENT-REQUIRED");
  if (!raw) throw new Error("Missing PAYMENT-REQUIRED header");
  const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  if (decoded.x402Version !== 1 && decoded.x402Version !== 2) {
    throw new Error(`Unexpected x402Version: ${decoded.x402Version}`);
  }
  if (!Array.isArray(decoded.accepts) || decoded.accepts.length === 0) {
    throw new Error("PAYMENT-REQUIRED accepts[] is empty");
  }
  const first = decoded.accepts[0];
  if (first.scheme !== "exact") {
    throw new Error(`Expected scheme exact, got ${first.scheme}`);
  }
  if (!first.network || !first.amount || !first.asset || !first.payTo) {
    throw new Error("accepts[0] missing network/amount/asset/payTo");
  }
  return decoded;
}

async function assertStandard402(label, headersInit) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-03-26",
      ...headersInit,
    },
    body: JSON.stringify(analyzeBody),
  });

  if (res.status !== 402) {
    throw new Error(`${label}: expected 402, got ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const head = (await res.clone().text()).slice(0, 120);
    throw new Error(
      `${label}: expected application/json 402, got content-type=${ct} body=${head}`
    );
  }

  requireHeader(res.headers, "access-control-allow-origin", "*");
  const challenge = decodePaymentRequired(res.headers);
  const body = await res.json();
  if (!body || body.x402Version == null) {
    throw new Error(
      `${label}: 402 JSON body must include x402 challenge (got ${JSON.stringify(body).slice(0, 120)})`
    );
  }
  if (body.x402Version !== challenge.x402Version) {
    throw new Error(`${label}: body x402Version mismatch vs header`);
  }

  console.log(`ok  ${label}`, {
    amount: challenge.accepts[0].amount,
    network: challenge.accepts[0].network,
    payTo: challenge.accepts[0].payTo,
  });
}

async function main() {
  console.log("endpoint", endpoint);

  const preflight = await fetch(endpoint, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers":
        "content-type, mcp-protocol-version, payment-signature, x-payment",
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
  console.log("ok  OPTIONS preflight");

  // Free discovery must stay free
  const toolsList = await fetch(endpoint, {
    method: "POST",
    headers: {
      Origin: origin,
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-03-26",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    }),
  });
  if (toolsList.status !== 200) {
    throw new Error(`tools/list should be free 200, got ${toolsList.status}`);
  }
  console.log("ok  tools/list free");

  // API / agent client
  await assertStandard402("API client 402", {
    Accept: "application/json",
  });

  // Browser-like client (this previously returned HTML without PAYMENT-REQUIRED)
  await assertStandard402("Browser Mozilla+text/html 402", {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // Alternate audit endpoint if same host
  const auditUrl = endpoint.replace(/\/api\/mcp\/?$/, "/api/audit");
  if (auditUrl !== endpoint) {
    const audit = await fetch(auditUrl, {
      method: "POST",
      headers: {
        Origin: origin,
        Accept: "text/html,application/json",
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    if (audit.status !== 402) {
      throw new Error(`audit expected 402, got ${audit.status}`);
    }
    if (!(audit.headers.get("content-type") || "").includes("application/json")) {
      throw new Error("audit 402 must be application/json, not HTML");
    }
    decodePaymentRequired(audit.headers);
    console.log("ok  /api/audit browser 402");
  }

  console.log("OKX x402 standard validation checks passed");
}

void main().catch((error) => {
  console.error(
    "x402/CORS validation failed:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
