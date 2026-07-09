import { isUserAdmin } from "@/lib/admin";
import { getAllAnalyses } from "@/services/store";

export const DEFAULT_WEEKLY_AUDIT_LIMIT = 3;

export function getWeeklyAuditLimit(): number {
  const raw =
    process.env.WEEKLY_AUDIT_LIMIT ??
    process.env.DAILY_AUDIT_LIMIT ??
    DEFAULT_WEEKLY_AUDIT_LIMIT;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 20) : DEFAULT_WEEKLY_AUDIT_LIMIT;
}

function startOfUtcWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - daysFromMonday);
  return start;
}

export async function countWeekAudits(userId: string): Promise<number> {
  const since = startOfUtcWeek();
  const analyses = await getAllAnalyses(userId);
  return analyses.filter((a) => new Date(a.createdAt) >= since).length;
}

export async function checkWeeklyAuditLimit(userId: string | null | undefined): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: string;
  isAdmin?: boolean;
}> {
  const limit = getWeeklyAuditLimit();
  const resetsAt = new Date(startOfUtcWeek().getTime() + 7 * 86_400_000).toISOString();

  if (!userId) {
    return { allowed: true, used: 0, limit, resetsAt };
  }

  if (await isUserAdmin(userId)) {
    return { allowed: true, used: 0, limit, resetsAt, isAdmin: true };
  }

  const used = await countWeekAudits(userId);
  return {
    allowed: used < limit,
    used,
    limit,
    resetsAt,
  };
}