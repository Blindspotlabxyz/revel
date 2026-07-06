"use client";

import { useState } from "react";
import { Braces, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const comingSoon = [
  { name: "Notion", icon: "📝" },
  { name: "Linear", icon: "◆" },
  { name: "GitHub", icon: "⎇" },
] as const;

interface ExportPanelProps {
  analysisId: string;
}

export function ExportPanel({ analysisId }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: "markdown" | "json") {
    setExporting(true);
    setExportSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: analysisId, format }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Export failed");
      }

      const blob = new Blob([data.content], {
        type: format === "json" ? "application/json" : "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-heading text-lg font-semibold">Export Blueprint</h2>
      <p className="mt-1 text-sm text-muted">
        Download your report or send it to your workflow tools.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          onClick={() => handleExport("markdown")}
          disabled={exporting}
          variant="secondary"
          size="sm"
        >
          <FileText className="mr-2 h-4 w-4" />
          Markdown
        </Button>
        <Button
          onClick={() => handleExport("json")}
          disabled={exporting}
          variant="secondary"
          size="sm"
        >
          <Braces className="mr-2 h-4 w-4" />
          JSON
        </Button>
      </div>

      {exportSuccess ? (
        <p className="mt-3 text-sm text-primary">Export downloaded successfully.</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Coming soon
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {comingSoon.map((item) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted"
              title={`${item.name} export is coming soon`}
            >
              <span>{item.icon}</span>
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}