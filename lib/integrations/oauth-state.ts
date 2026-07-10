import { createHmac, timingSafeEqual } from "crypto";
import type { IntegrationProvider } from "@/lib/integrations/types";

function stateSecret(): string {
  return (
    process.env.INTEGRATIONS_ENCRYPTION_KEY?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "dev-integrations-state"
  );
}

export function createOAuthState(
  userId: string,
  provider: IntegrationProvider
): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      provider,
      n: Math.random().toString(36).slice(2),
      t: Date.now(),
    }),
    "utf8"
  ).toString("base64url");
  const sig = createHmac("sha256", stateSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function parseOAuthState(
  state: string,
  expectedProvider: IntegrationProvider
): { userId: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", stateSecret())
    .update(payload)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { userId?: string; provider?: string; t?: number };
    if (!data.userId || data.provider !== expectedProvider) return null;
    // 15 minutes
    if (typeof data.t === "number" && Date.now() - data.t > 15 * 60 * 1000) {
      return null;
    }
    return { userId: data.userId };
  } catch {
    return null;
  }
}
