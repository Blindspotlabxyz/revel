import { getCurrentUserId, getCurrentUserIsAdmin } from "@/lib/auth";
import { PUBLIC_SAMPLE_REPORT_ID } from "@/lib/public-sample-report";
import type { Analysis } from "@/types/analysis";

export function isPublicSampleReport(id: string): boolean {
  return id === PUBLIC_SAMPLE_REPORT_ID;
}

export async function userCanAccessAnalysis(
  analysis: Analysis,
  options?: { userId?: string | null; isAdmin?: boolean }
): Promise<boolean> {
  if (isPublicSampleReport(analysis.id)) {
    return true;
  }

  const userId = options?.userId ?? (await getCurrentUserId());
  const isAdmin =
    options?.isAdmin ?? (userId ? await getCurrentUserIsAdmin() : false);

  if (isAdmin) {
    return true;
  }

  if (!userId || !analysis.userId) {
    return false;
  }

  return analysis.userId === userId;
}