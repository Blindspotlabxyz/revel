/**
 * Client-safe audit limit config only.
 * Do not import store/prisma here — landing client components use this module.
 */

export const DEFAULT_WEEKLY_AUDIT_LIMIT = 3;

export function getWeeklyAuditLimit(): number {
  const raw =
    process.env.WEEKLY_AUDIT_LIMIT ??
    process.env.DAILY_AUDIT_LIMIT ??
    DEFAULT_WEEKLY_AUDIT_LIMIT;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0
    ? Math.min(Math.floor(n), 20)
    : DEFAULT_WEEKLY_AUDIT_LIMIT;
}
