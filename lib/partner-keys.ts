import { createHash, randomBytes } from "node:crypto";

const KEY_PREFIX = "rvl_pk_";

export function hashPartnerApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generatePartnerApiKey(): {
  key: string;
  prefix: string;
  hash: string;
} {
  const secret = randomBytes(24).toString("base64url");
  const key = `${KEY_PREFIX}${secret}`;
  return {
    key,
    prefix: key.slice(0, 20),
    hash: hashPartnerApiKey(key),
  };
}

export function extractPartnerApiKey(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    if (token.startsWith(KEY_PREFIX)) return token;
  }

  const headerKey = request.headers.get("x-revel-partner-key");
  if (headerKey?.startsWith(KEY_PREFIX)) return headerKey.trim();

  return null;
}