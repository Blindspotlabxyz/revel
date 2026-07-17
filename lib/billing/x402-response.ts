import { NextResponse } from "next/server";

/**
 * Ensure unpaid x402 challenges always look like the OKX / marketplace standard:
 * - HTTP 402
 * - PAYMENT-REQUIRED header (base64 JSON, x402 v2)
 * - JSON body with the same challenge (helps validators that only inspect body)
 * - Never HTML paywall (browser Accept/UA must still get the header)
 *
 * Passing paywallConfig into withX402 causes HTML responses for Mozilla +
 * Accept: text/html — that fails OKX "x402 standard validation".
 */
export function applyX402Cors(
  response: Response,
  corsHeaders: Record<string, string>
): NextResponse {
  const status = response.status;
  const paymentRequired =
    response.headers.get("PAYMENT-REQUIRED") ??
    response.headers.get("payment-required");

  // Standardize 402 challenges for marketplace validators
  if (status === 402 && paymentRequired) {
    let body: unknown = {};
    try {
      body = JSON.parse(
        Buffer.from(paymentRequired, "base64").toString("utf8")
      ) as unknown;
    } catch {
      body = { error: "Payment required", paymentRequiredHeader: true };
    }

    const headers = new Headers();
    // Preserve settlement / protocol headers from the SDK
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower === "content-type" ||
        lower === "content-length" ||
        lower === "transfer-encoding"
      ) {
        return;
      }
      headers.set(key, value);
    });
    headers.set("Content-Type", "application/json");
    headers.set("PAYMENT-REQUIRED", paymentRequired);
    for (const [key, value] of Object.entries(corsHeaders)) {
      headers.set(key, value);
    }

    return NextResponse.json(body, { status: 402, headers });
  }

  const next = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  for (const [key, value] of Object.entries(corsHeaders)) {
    next.headers.set(key, value);
  }
  return next;
}
