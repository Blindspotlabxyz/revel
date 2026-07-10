import { isUserAdmin } from "@/lib/admin";
import {
  DEFAULT_WEEKLY_AUDIT_LIMIT,
  getWeeklyAuditLimit,
} from "@/lib/weekly-audit-limit-config";
import { getAllAnalyses } from "@/services/store";

export { DEFAULT_WEEKLY_AUDIT_LIMIT, getWeeklyAuditLimit };

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
