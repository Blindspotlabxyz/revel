"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActionTask } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface ActionQueueProps {
  actions: ActionTask[];
  analysisId: string;
}

export function ActionQueue({ actions, analysisId }: ActionQueueProps) {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  async function handleExport(format: "markdown" | "json") {
    setExporting(true);
    setExportSuccess(false);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: analysisId, format }),
      });

      const data = await res.json();

      if (data.success) {
        const blob = new Blob([data.content], {
          type: format === "json" ? "application/json" : "text/markdown",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
        setExportSuccess(true);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => handleExport("markdown")}
          disabled={exporting}
          variant="secondary"
          size="sm"
        >
          Export Markdown
        </Button>
        <Button
          onClick={() => handleExport("json")}
          disabled={exporting}
          variant="secondary"
          size="sm"
        >
          Export JSON
        </Button>
        {exportSuccess && (
          <span className="text-sm text-primary">
            Blueprint exported successfully.
          </span>
        )}
      </div>

      <div className="space-y-4">
        {actions.map((action) => (
          <Card key={action.id}>
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