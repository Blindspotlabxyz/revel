import { AnalysisForm } from "@/components/dashboard/analysis-form";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";

export default function MissionControlPage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Run a New Analysis</h1>
      <p className="mt-2 text-muted">
        Analyze your product in under a minute.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-8">
        <AnalysisForm />
      </div>

      <RecentAnalyses />
    </div>
  );
}