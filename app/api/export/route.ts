import { NextResponse } from "next/server";
import { logEvent } from "@/lib/logger";
import type { ExportFormat } from "@/lib/mission-control-config";
import { getExportCapabilities } from "@/lib/mission-control-config";
import {
  pushToGitHubGist,
  pushToLinear,
  pushToNotion,
} from "@/services/export-integrations";
import {
  exportToGitHubMarkdown,
  exportToJson,
  exportToMarkdown,
} from "@/services/export-service";
import { getAnalysis } from "@/services/store";

export async function GET() {
  return NextResponse.json({ exports: getExportCapabilities() });
}

export async function POST(request: Request) {
  try {
    const { id, format, destination } = await request.json();

    if (!id || !format) {
      return NextResponse.json(
        { error: "Analysis ID and format required" },
        { status: 400 }
      );
    }

    const analysis = await getAnalysis(id);

    if (!analysis?.report) {
      return NextResponse.json(
        { error: "Report not found or not ready" },
        { status: 404 }
      );
    }

    const { report, website } = analysis;
    const capabilities = getExportCapabilities();

    if (format === "markdown") {
      const content = exportToMarkdown(report, website);
      logEvent("export_completed", { id, format: "markdown" });
      return NextResponse.json({
        success: true,
        mode: "download",
        content,
        filename: `revel-blueprint-${analysis.id}.md`,
      });
    }

    if (format === "json") {
      const content = exportToJson(report, website);
      logEvent("export_completed", { id, format: "json" });
      return NextResponse.json({
        success: true,
        mode: "download",
        content,
        filename: `revel-blueprint-${analysis.id}.json`,
      });
    }

    if (format === "github") {
      const content = exportToGitHubMarkdown(report, website);

      if (destination === "gist" && capabilities.githubGist) {
        const gist = await pushToGitHubGist(report, website, analysis.id);
        logEvent("export_completed", { id, format: "github-gist" });
        return NextResponse.json({
          success: true,
          mode: "link",
          url: gist.url,
          message: "Blueprint saved to a private GitHub Gist.",
        });
      }

      logEvent("export_completed", { id, format: "github" });
      return NextResponse.json({
        success: true,
        mode: "download",
        content,
        filename: `revel-blueprint-${analysis.id}.github.md`,
      });
    }

    if (format === "linear") {
      if (!capabilities.linear) {
        return NextResponse.json(
          {
            error:
              "Linear export is not configured. Set LINEAR_API_KEY and LINEAR_TEAM_ID on Vercel.",
          },
          { status: 503 }
        );
      }

      const result = await pushToLinear(report, website);
      logEvent("export_completed", {
        id,
        format: "linear",
        created: result.created,
      });
      return NextResponse.json({
        success: true,
        mode: "link",
        created: result.created,
        url: result.urls[0] ?? null,
        urls: result.urls,
        message: `Created ${result.created} Linear issues from your Action Queue.`,
      });
    }

    if (format === "notion") {
      if (!capabilities.notion) {
        return NextResponse.json(
          {
            error:
              "Notion export is not configured. Set NOTION_API_KEY and NOTION_DATABASE_ID on Vercel.",
          },
          { status: 503 }
        );
      }

      const result = await pushToNotion(report, website, analysis.id);
      logEvent("export_completed", { id, format: "notion" });
      return NextResponse.json({
        success: true,
        mode: "link",
        url: result.url,
        message: "Blueprint page created in Notion.",
      });
    }

    return NextResponse.json(
      { error: `Unsupported format: ${format as ExportFormat}` },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Export failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}