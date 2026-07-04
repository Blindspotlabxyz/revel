const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function rateLimit(
  key: string,
  limit = MAX_REQUESTS,
  windowMs = WINDOW_MS
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

export function getRateLimitKey(request: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
  return `ip:${ip}`;
}