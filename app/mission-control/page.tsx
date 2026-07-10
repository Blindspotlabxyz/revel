import { AnalysisForm } from "@/components/dashboard/analysis-form";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { getWeeklyAuditLimit } from "@/lib/weekly-audit-limit";

export const dynamic = "force-dynamic";

export default function MissionControlPage() {
  const weeklyLimit = getWeeklyAuditLimit();

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Run a free analysis</h1>
      <p className="mt-2 text-muted">
        Paste a public product URL. Get Reveal Index, blindspots, Blueprint, and
        Action Queue in minutes.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-8">
        <AnalysisForm weeklyLimit={weeklyLimit} />
      </div>

      <RecentAnalyses />
    </div>
  );
}