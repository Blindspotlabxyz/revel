/**
 * Client-safe error handling: full detail stays server-side only.
 */

const CLIENT_AI_GATEWAY_ERROR = "AI gateway error. Please try again.";
const CLIENT_GENERIC_ERROR = "Something went wrong. Please try again.";

/** Messages we intentionally show users (owned product copy). */
const SAFE_CLIENT_MESSAGE_PREFIXES = [
  "Too many requests",
  "Weekly limit reached",
  "Invalid URL",
  "Please enter a valid",
  "Could not access website",
  "email already",
  "Email already",
  "Invalid credentials",
  "Password must",
  "Passwords do not match",
  "Invalid or expired",
  "Token is required",
  "Name is required",
  "Email is required",
  "Unauthorized",
  "Forbidden",
  "Not found",
  "AI gateway error",
  "Something went wrong",
  "Export failed",
  "Could not start",
  "We couldn't start",
  "Application failed",
  "No actions available",
  "Connect",
  "Please wait",
  "Please try again",
];

/** Patterns that almost always mean upstream/provider leakage. */
const UNSAFE_PATTERNS = [
  /groq/i,
  /openrouter/i,
  /gemini/i,
  /openai/i,
  /anthropic/i,
  /meta-llama/i,
  /llama-/i,
  /org[_-]?[a-z0-9]/i,
  /api[_-]?key/i,
  /bearer\s+/i,
  /rate.?limit/i,
  /quota/i,
  /429/,
  /503/,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /stack/i,
  /at\s+\S+\s+\(/,
  /https?:\/\/[^\s]+api/i,
  /model[s]?\s*failed/i,
  /provider/i,
  /All analysis/i,
  /Last errors/i,
  /OPENROUTER_/i,
  /GROQ_/i,
  /GEMINI_/i,
];

export function rawErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause;
    if (
      cause instanceof Error &&
      cause.message &&
      cause.message !== error.message
    ) {
      return `${error.message} (${cause.message})`;
    }
    return error.message;
  }
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export function logServerError(
  scope: string,
  error: unknown,
  meta?: Record<string, unknown>
): void {
  console.error(`[Revel] ${scope}`, {
    ...meta,
    error: rawErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

function looksUnsafe(message: string): boolean {
  if (!message.trim()) return true;
  if (message.length > 280) return true;
  return UNSAFE_PATTERNS.some((re) => re.test(message));
}

function isAllowlistedSafeMessage(message: string): boolean {
  return SAFE_CLIENT_MESSAGE_PREFIXES.some((prefix) =>
    message.startsWith(prefix)
  );
}

/**
 * Map any thrown value to a short client-safe string.
 * Prefer our known product messages; otherwise return a generic fallback.
 */
export function toClientErrorMessage(
  error: unknown,
  fallback: string = CLIENT_GENERIC_ERROR
): string {
  const message = rawErrorMessage(error).trim();

  if (isAllowlistedSafeMessage(message) && !looksUnsafe(message)) {
    return message;
  }

  // Known AI gateway failures always get the same public string
  if (
    /AI gateway/i.test(message) ||
    /All analysis/i.test(message) ||
    /analysis models failed/i.test(message) ||
    /analysis providers failed/i.test(message) ||
    /OpenRouter/i.test(message) ||
    /Groq/i.test(message) ||
    /Gemini/i.test(message)
  ) {
    return CLIENT_AI_GATEWAY_ERROR;
  }

  if (looksUnsafe(message)) {
    return fallback;
  }

  // Unknown but short/safe-looking product errors may pass; still prefer generic for 500s
  return fallback;
}

export function clientAiGatewayError(): string {
  return CLIENT_AI_GATEWAY_ERROR;
}

export function clientGenericError(): string {
  return CLIENT_GENERIC_ERROR;
}
