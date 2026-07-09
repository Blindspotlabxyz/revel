import { AnalysisForm } from "@/components/dashboard/analysis-form";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { getWeeklyAuditLimit } from "@/lib/weekly-audit-limit";

export const dynamic = "force-dynamic";

export default function MissionControlPage() {
  const weeklyLimit = getWeeklyAuditLimit();

  return (
    <div className="max-w-xl">
      <p className="section-eyebrow">Mission Control</p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
        Run a new analysis
      </h1>
      <p className="mt-2 text-muted">
        Analyze your product in under a minute.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <AnalysisForm weeklyLimit={weeklyLimit} />
      </div>

      <RecentAnalyses />
    </div>
  );
}
