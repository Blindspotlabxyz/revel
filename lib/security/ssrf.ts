import dns from "dns/promises";
import { isIP } from "net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
]);

function isPrivateOrReservedIp(ip: string): boolean {
  if (ip === "::1" || ip === "0.0.0.0") return true;

  if (isIP(ip) === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;

    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;

    return false;
  }

  if (isIP(ip) === 6) {
    const normalized = ip.toLowerCase();
    if (normalized.startsWith("fe80:")) return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("::ffff:")) {
      const mapped = normalized.slice("::ffff:".length);
      if (isIP(mapped) === 4) return isPrivateOrReservedIp(mapped);
    }
  }

  return false;
}

function assertHostnameAllowed(hostname: string): void {
  const lower = hostname.toLowerCase().replace(/\.$/, "");

  if (BLOCKED_HOSTNAMES.has(lower)) {
    throw new Error("That hostname is not allowed");
  }

  if (lower.endsWith(".localhost") || lower.endsWith(".local")) {
    throw new Error("That hostname is not allowed");
  }

  if (isIP(lower)) {
    if (isPrivateOrReservedIp(lower)) {
      throw new Error("Private or internal IP addresses are not allowed");
    }
  }
}

/**
 * Blocks SSRF to cloud metadata, private networks, and non-HTTP(S) schemes.
 * Resolves DNS and rejects if any A/AAAA record is private.
 */
export async function assertPublicHttpUrl(input: string): Promise<string> {
  let parsed: URL;

  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Please enter a valid website URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs with embedded credentials are not allowed");
  }

  const hostname = parsed.hostname;
  assertHostnameAllowed(hostname);

  if (!isIP(hostname)) {
    const records = await dns.lookup(hostname, { all: true });
    if (!records.length) {
      throw new Error("Could not resolve hostname");
    }

    for (const { address } of records) {
      if (isPrivateOrReservedIp(address)) {
        throw new Error("URL resolves to a private or internal network address");
      }
    }
  }

  return parsed.href;
}