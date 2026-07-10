import { NextResponse } from "next/server";
import { trackActivity } from "@/lib/activity";
import { getCurrentUserId } from "@/lib/auth";
import { logEvent } from "@/lib/logger";
import type { ExportFormat } from "@/lib/mission-control-config";
import { getUserIntegration } from "@/lib/integrations/store";
import type {
  GitHubMetadata,
  LinearMetadata,
  NotionMetadata,
} from "@/lib/integrations/types";
import {
  pushToGitHubGist,
  pushToLinear,
  pushToNotion,
} from "@/services/export-integrations";
import { normalizeAnalysisReport } from "@/lib/report-schema";
import {
  exportToGitHubMarkdown,
  exportToJson,
  exportToMarkdown,
} from "@/services/export-service";
import { userCanAccessAnalysis } from "@/lib/security/analysis-access";
import { getAnalysis } from "@/services/store";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({
      exports: {
        markdown: true,
        json: true,
        github: true,
        linear: false,
        notion: false,
        githubGist: false,
      },
      requiresAuth: true,
    });
  }

  const [linear, notion, github] = await Promise.all([
    getUserIntegration(userId, "linear"),
    getUserIntegration(userId, "notion"),
    getUserIntegration(userId, "github"),
  ]);

  return NextResponse.json({
    exports: {
      markdown: true,
      json: true,
      github: true,
      linear: Boolean(linear?.accessToken),
      notion: Boolean(notion?.accessToken),
      githubGist: Boolean(github?.accessToken),
    },
    connections: {
      linear: linear
        ? {
            label:
              (linear.metadata as LinearMetadata).teamName ||
              (linear.metadata as LinearMetadata).viewerName,
          }
        : null,
      notion: notion
        ? {
            label:
              (notion.metadata as NotionMetadata).workspaceName ||
              (notion.metadata as NotionMetadata).parentPageTitle,
          }
        : null,
      github: github
        ? { label: (github.metadata as GitHubMetadata).login }
        : null,
    },
  });
}

function recordExport(
  id: string,
  format: string,
  userId: string | null,
  extra?: Record<string, unknown>
) {
  logEvent("export_completed", { id, format, ...extra });
  trackActivity({
    eventType: "export_completed",
    source: "website",
    analysisId: id,
    userId,
    status: "completed",
    metadata: { format, ...extra },
  });
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
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

    if (!(await userCanAccessAnalysis(analysis, { userId }))) {
      return NextResponse.json(
        { error: "Report not found or not ready" },
        { status: 404 }
      );
    }

    const website = analysis.website;
    const report = normalizeAnalysisReport(analysis.report);

    if (format === "markdown") {
      const content = exportToMarkdown(report, website);
      recordExport(id, "markdown", userId);
      return NextResponse.json({
        success: true,
        mode: "download",
        content,
        filename: `revel-blueprint-${analysis.id}.md`,
      });
    }

    if (format === "json") {
      const content = exportToJson(report, website);
      recordExport(id, "json", userId);
      return NextResponse.json({
        success: true,
        mode: "download",
        content,
        filename: `revel-blueprint-${analysis.id}.json`,
      });
    }

    if (format === "github") {
      const content = exportToGitHubMarkdown(report, website);

      if (destination === "gist") {
        if (!userId) {
          return NextResponse.json(
            { error: "Sign in and connect GitHub to create a private Gist." },
            { status: 401 }
          );
        }
        const connection = await getUserIntegration(userId, "github");
        if (!connection?.accessToken) {
          return NextResponse.json(
            {
              error:
                "Connect your GitHub account first (Mission Control → Integrations).",
              connectUrl: "/mission-control/integrations#github",
            },
            { status: 403 }
          );
        }

        const gist = await pushToGitHubGist(
          report,
          website,
          analysis.id,
          connection.accessToken
        );
        recordExport(id, "github-gist", userId, {
          private: true,
          owner: (connection.metadata as GitHubMetadata).login,
        });
        return NextResponse.json({
          success: true,
          mode: "link",
          url: gist.url,
          message:
            "Private Gist created in your GitHub account. Only you can see it unless you share the link.",
        });
      }

      recordExport(id, "github", userId);
      return NextResponse.json({
        success: true,
        mode: "download",
        content,
        filename: `revel-blueprint-${analysis.id}.github.md`,
      });
    }

    if (format === "linear") {
      if (!userId) {
        return NextResponse.json(
          { error: "Sign in and connect Linear to export issues." },
          { status: 401 }
        );
      }
      const connection = await getUserIntegration(userId, "linear");
      const meta = (connection?.metadata ?? {}) as LinearMetadata;
      if (!connection?.accessToken || !meta.teamId) {
        return NextResponse.json(
          {
            error:
              "Connect your Linear account first (Mission Control → Integrations).",
            connectUrl: "/mission-control/integrations#linear",
          },
          { status: 403 }
        );
      }

      const result = await pushToLinear(
        report,
        website,
        connection.accessToken,
        meta.teamId
      );
      recordExport(id, "linear", userId, {
        created: result.created,
        teamId: meta.teamId,
      });
      return NextResponse.json({
        success: true,
        mode: "link",
        created: result.created,
        url: result.urls[0] ?? null,
        urls: result.urls,
        message: `Created ${result.created} Linear issues in your team${meta.teamName ? ` (${meta.teamName})` : ""}. Only your Linear workspace members can see them.`,
      });
    }

    if (format === "notion") {
      if (!userId) {
        return NextResponse.json(
          { error: "Sign in and connect Notion to export." },
          { status: 401 }
        );
      }
      const connection = await getUserIntegration(userId, "notion");
      const meta = (connection?.metadata ?? {}) as NotionMetadata & {
        databaseId?: string;
      };
      if (!connection?.accessToken) {
        return NextResponse.json(
          {
            error:
              "Connect your Notion account first (Mission Control → Integrations).",
            connectUrl: "/mission-control/integrations#notion",
          },
          { status: 403 }
        );
      }

      const result = await pushToNotion(
        report,
        website,
        analysis.id,
        connection.accessToken,
        {
          databaseId: meta.databaseId,
          pageId: meta.parentPageId,
        },
        process.env.NOTION_TITLE_PROPERTY ?? "Name"
      );
      recordExport(id, "notion", userId, {
        workspace: meta.workspaceName,
      });
      return NextResponse.json({
        success: true,
        mode: "link",
        url: result.url,
        message:
          "Blueprint page created in your Notion workspace. Only you (and people you share with) can see it.",
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
