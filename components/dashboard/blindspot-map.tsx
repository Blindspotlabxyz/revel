import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Blindspot, Priority } from "@/types/analysis";
import { cn } from "@/lib/utils";

const priorityStyles: Record<Priority, string> = {
  critical: "bg-primary/10 text-primary",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-background text-muted",
};

interface BlindspotMapProps {
  blindspots: Blindspot[];
}

export function BlindspotMap({ blindspots }: BlindspotMapProps) {
  const sorted = [...blindspots].sort((a, b) => {
    const order: Record<Priority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-4">
      {sorted.map((blindspot) => (
        <Card key={blindspot.id}>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-lg">{blindspot.title}</CardTitle>
              <div className="flex gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize",
                    priorityStyles[blindspot.priority]
                  )}
                >
                  {blindspot.priority}
                </span>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-medium capitalize text-muted">
                  {blindspot.category}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {blindspot.description}
            </p>
            <div className="mt-4 rounded-lg bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Recommendation
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                {blindspot.suggestedFix}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}