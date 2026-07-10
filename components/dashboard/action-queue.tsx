"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { ActionTask } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface ActionQueueProps {
  actions: ActionTask[] | null | undefined;
}

export function ActionQueue({ actions }: ActionQueueProps) {
  const list = Array.isArray(actions) ? actions : [];

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          No action items in this report. Export the Blueprint or re-run the
          analysis for a fuller Action Queue.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {list.map((action, index) => (
          <Card key={action.id || `action-${index}`}>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="text-base">{action.title}</CardTitle>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize",
                    action.priority === "critical" && "bg-primary/10 text-primary",
                    action.priority === "high" && "bg-orange-100 text-orange-700",
                    action.priority === "medium" && "bg-yellow-50 text-yellow-700",
                    action.priority === "low" && "bg-background text-muted"
                  )}
                >
                  {action.priority}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {action.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted">Effort</span>
                  <p className="font-medium">{action.estimatedEffort}</p>
                </div>
                <div>
                  <span className="text-muted">Outcome</span>
                  <p className="font-medium">{action.expectedOutcome}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
