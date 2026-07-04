import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { AnalysisReport } from "@/types/analysis";

interface ReportOverviewProps {
  report: AnalysisReport;
}

export function ReportOverview({ report }: ReportOverviewProps) {
  const criticalCount = report.blindspots.filter(
    (b) => b.priority === "critical"
  ).length;
  const highPriorityCount = report.blindspots.filter(
    (b) => b.priority === "critical" || b.priority === "high"
  ).length;
  const highImpactActions = report.blueprint.filter(
    (b) => b.expectedImpact === "high"
  ).length;

  const impact =
    highImpactActions >= 3 ? "High" : highImpactActions >= 1 ? "Medium" : "Low";

  const stats = [
    { label: "Reveal Index™", value: `${report.score} / 100` },
    { label: "Blindspots Found", value: String(report.blindspots.length) },
    { label: "High Priority Actions", value: String(highPriorityCount) },
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