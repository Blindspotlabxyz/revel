"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Braces, ExternalLink, FileText, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExportCapabilities = {
  markdown: boolean;
  json: boolean;
  github: boolean;
  linear: boolean;
  notion: boolean;
  githubGist: boolean;
};

interface ExportPanelProps {
  analysisId: string;
}

export function ExportPanel({ analysisId }: ExportPanelProps) {
  const [capabilities, setCapabilities] = useState<ExportCapabilities | null>(
    null
  );
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/export")
      .then((res) => res.json())
      .then((data) => setCapabilities(data.exports ?? null))
      .catch(() => setCapabilities(null));
  }, []);

  async function handleExport(
    format: string,
    options?: { destination?: string }
  ) {
    setExporting(format);
    setSuccess(null);
    setLink(null);
    setError(null);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: analysisId, format, ...options }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Export failed");
      }

      if (data.mode === "download" && data.content) {
        const blob = new Blob([data.content], {
          type: format === "json" ? "application/json" : "text/markdown",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = data.filename;
        anchor.click();
        URL.revokeObjectURL(url);
      }

      if (data.url) {
        setLink(data.url);
      }

      setSuccess(data.message ?? "Export completed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  const linearEnabled = capabilities?.linear ?? false;
  const notionEnabled = capabilities?.notion ?? false;
  const gistEnabled = capabilities?.githubGist ?? false;

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-heading text-lg font-semibold">Export Blueprint</h2>
      <p className="mt-1 text-sm text-muted">
        Download or push your report into your workflow.
      </p>

      <div className="mt-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Download
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleExport("markdown")}
            disabled={!!exporting}
            variant="secondary"
            size="sm"
          >
            <FileText className="mr-2 h-4 w-4" />
            {exporting === "markdown" ? "Exporting..." : "Markdown"}
          </Button>
          <Button
            onClick={() => handleExport("json")}
            disabled={!!exporting}
            variant="secondary"
            size="sm"
          >
            <Braces className="mr-2 h-4 w-4" />
            {exporting === "json" ? "Exporting..." : "JSON"}
          </Button>
          <Button
            onClick={() => handleExport("github")}
            disabled={!!exporting}
            variant="secondary"
            size="sm"
          >
            <Github className="mr-2 h-4 w-4" />
            {exporting === "github" ? "Exporting..." : "GitHub MD"}
          </Button>
        </div>

        <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted">
          Integrations
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              handleExport("github", gistEnabled ? { destination: "gist" } : undefined)
            }
            disabled={!!exporting || !gistEnabled}
            variant="outline"
            size="sm"
            title={
              gistEnabled
                ? "Create a private GitHub Gist"
                : "Set GITHUB_TOKEN on Vercel to enable"
            }
          >
            GitHub Gist
          </Button>
          <Button
            onClick={() => handleExport("linear")}
            disabled={!!exporting || !linearEnabled}
            variant="outline"
            size="sm"
            title={
              linearEnabled
                ? "Create Linear issues from Action Queue"
                : "Set LINEAR_API_KEY + LINEAR_TEAM_ID on Vercel"
            }
          >
            Linear
          </Button>
          <Button
            onClick={() => handleExport("notion")}
            disabled={!!exporting || !notionEnabled}
            variant="outline"
            size="sm"
            title={
              notionEnabled
                ? "Create a Notion page"
                : "Set NOTION_API_KEY + NOTION_DATABASE_ID on Vercel"
            }
          >
            Notion
          </Button>
        </div>
      </div>

      {success ? (
        <p className="mt-3 text-sm text-primary">{success}</p>
      ) : null}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Open export <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <p className="mt-6 border-t border-border pt-4 text-sm text-muted">
        Need API keys?{" "}
        <Link
          href="/mission-control/integrations"
          className="font-medium text-primary hover:underline"
        >
          Step-by-step setup guide
        </Link>
      </p>
    </div>
  );
}