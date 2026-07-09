const partnerWindows = new Map<string, { count: number; resetAt: number }>();

export function partnerRateLimit(
  partnerId: string,
  limit = 30,
  windowMs = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = partnerWindows.get(partnerId);

  if (!entry || now > entry.resetAt) {
    partnerWindows.set(partnerId, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}