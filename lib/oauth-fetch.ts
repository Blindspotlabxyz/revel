/**
 * OAuth provider fetch with a longer connect timeout.
 * Default undici connect timeout is ~10s; slow/blocked networks often need more.
 */
const OAUTH_FETCH_TIMEOUT_MS = 30_000;

export async function oauthFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const signals: AbortSignal[] = [];

  if (init?.signal) {
    signals.push(init.signal);
  }

  signals.push(AbortSignal.timeout(OAUTH_FETCH_TIMEOUT_MS));

  const signal =
    signals.length === 1
      ? signals[0]
      : AbortSignal.any(signals);

  try {
    return await fetch(input, { ...init, signal });
  } catch (error) {
    console.error("oauth_fetch_failed", String(input), error);
    throw error;
  }
}