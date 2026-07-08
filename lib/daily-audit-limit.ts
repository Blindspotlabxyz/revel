import { getAllAnalyses } from "@/services/store";

export const DEFAULT_DAILY_AUDIT_LIMIT = 3;

export function getDailyAuditLimit(): number {
  const n = Number(process.env.DAILY_AUDIT_LIMIT ?? DEFAULT_DAILY_AUDIT_LIMIT);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 20) : DEFAULT_DAILY_AUDIT_LIMIT;
}

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function countTodayAudits(userId: string): Promise<number> {
  const since = startOfUtcDay();
  const analyses = await getAllAnalyses(userId);
  return analyses.filter((a) => new Date(a.createdAt) >= since).length;
}

export async function checkDailyAuditLimit(userId: string | null | undefined): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: string;
}> {
  const limit = getDailyAuditLimit();
  const resetsAt = new Date(startOfUtcDay().getTime() + 86_400_000).toISOString();

  if (!userId) {
    return { allowed: true, used: 0, limit, resetsAt };
  }

  const used = await countTodayAudits(userId);
  return {
    allowed: used < limit,
    used,
    limit,
    resetsAt,
  };
}