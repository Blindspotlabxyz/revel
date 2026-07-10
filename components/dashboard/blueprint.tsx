import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { BlueprintStep } from "@/types/analysis";

interface BlueprintProps {
  steps: BlueprintStep[] | null | undefined;
}

export function Blueprint({ steps }: BlueprintProps) {
  const list = Array.isArray(steps) ? [...steps] : [];
  const sorted = list.sort((a, b) => (a.step ?? 0) - (b.step ?? 0));

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          No blueprint steps in this report. Check Blindspots or re-run the
          analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((step, index) => (
        <Card key={step.id || `bp-${index}`}>
          <CardContent className="pt-0">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
                {step.step ?? index + 1}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-muted">Estimated effort</span>
                    <p className="font-medium">{step.estimatedEffort}</p>
                  </div>
                  <div>
                    <span className="text-muted">Expected impact</span>
                    <p className="font-medium capitalize">
                      {step.expectedImpact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
