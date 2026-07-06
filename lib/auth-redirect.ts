/** Resolve post-auth redirect from query params, falling back to the current origin. */
export function resolveAuthCallbackUrl(
  searchParams: URLSearchParams,
  fallback = "/"
): string {
  const fromQuery =
    searchParams.get("redirect_url") ?? searchParams.get("callbackUrl");
  if (fromQuery) return fromQuery;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return fallback;
}