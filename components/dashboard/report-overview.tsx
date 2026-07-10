import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { AnalysisReport } from "@/types/analysis";

interface ReportOverviewProps {
  report: AnalysisReport;
}

export function ReportOverview({ report }: ReportOverviewProps) {
  const blindspots = Array.isArray(report.blindspots) ? report.blindspots : [];
  const blueprint = Array.isArray(report.blueprint) ? report.blueprint : [];
  const actions = Array.isArray(report.actions) ? report.actions : [];

  const criticalCount = blindspots.filter((b) => b.priority === "critical")
    .length;
  const highPriorityCount = blindspots.filter(
    (b) => b.priority === "critical" || b.priority === "high"
  ).length;
  const highImpactActions = blueprint.filter(
    (b) => b.expectedImpact === "high"
  ).length;

  const impact =
    highImpactActions >= 3 ? "High" : highImpactActions >= 1 ? "Medium" : "Low";

  const stats = [
    { label: "Reveal Index™", value: `${report.score ?? "—"} / 100` },
    { label: "Blindspots Found", value: String(blindspots.length) },
    {
      label: "High Priority Actions",
      value: String(highPriorityCount || actions.filter((a) => a.priority === "high" || a.priority === "critical").length),
    },
    { label: "Estimated Impact", value: impact },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-0">
            <CardTitle className="text-sm font-medium text-muted">
              {stat.label}
            </CardTitle>
            <p className="mt-2 font-heading text-3xl font-semibold">
              {stat.value}
            </p>
            {stat.label === "Blindspots Found" && criticalCount > 0 && (
              <p className="mt-1 text-xs text-primary">
                {criticalCount} critical
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
