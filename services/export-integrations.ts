import type { AnalysisReport } from "@/types/analysis";
import { normalizeAnalysisReport } from "@/lib/report-schema";
import { exportToGitHubMarkdown, exportToMarkdown } from "./export-service";

export async function pushToGitHubGist(
  report: AnalysisReport,
  website: string,
  analysisId: string,
  accessToken: string
): Promise<{ url: string }> {
  if (!accessToken) {
    throw new Error("Connect your GitHub account to create a private Gist");
  }

  const content = exportToGitHubMarkdown(report, website);

  const response = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      description: `Revel Blueprint for ${website}`,
      public: false,
      files: {
        [`revel-blueprint-${analysisId}.md`]: { content },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `GitHub gist failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const data = (await response.json()) as { html_url: string };
  return { url: data.html_url };
}

export async function pushToLinear(
  report: AnalysisReport,
  website: string,
  accessToken: string,
  teamId: string
): Promise<{ created: number; urls: string[] }> {
  if (!accessToken || !teamId) {
    throw new Error("Connect your Linear account to export issues");
  }

  const urls: string[] = [];
  const normalized = normalizeAnalysisReport(report);
  const topActions = normalized.actions.slice(0, 8);

  if (topActions.length === 0) {
    throw new Error("No actions available to create Linear issues");
  }

  for (const action of topActions) {
    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation CreateIssue($teamId: String!, $title: String!, $description: String!) {
            issueCreate(input: {
              teamId: $teamId
              title: $title
              description: $description
            }) {
              success
              issue {
                url
                identifier
                team { key }
              }
            }
          }
        `,
        variables: {
          teamId,
          title: `[Revel] ${action.title}`,
          description: [
            `**Website:** ${website}`,
            `**Priority:** ${action.priority}`,
            `**Effort:** ${action.estimatedEffort}`,
            `**Outcome:** ${action.expectedOutcome}`,
            "",
            action.description,
            "",
            `---`,
            `_Exported from Revel Mission Control_`,
          ].join("\n"),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear API failed (${response.status})`);
    }

    const payload = await response.json();

    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message ?? "Linear GraphQL error");
    }

    const issue = payload?.data?.issueCreate?.issue as
      | { url?: string; identifier?: string; team?: { key?: string } }
      | undefined;

    const url =
      issue?.url ??
      (issue?.team?.key && issue?.identifier
        ? `https://linear.app/${issue.team.key}/issue/${issue.identifier}`
        : undefined);

    if (url) {
      urls.push(url);
    }
  }

  return { created: urls.length, urls };
}

export async function pushToNotion(
  report: AnalysisReport,
  website: string,
  analysisId: string,
  accessToken: string,
  parent: { databaseId?: string; pageId?: string },
  titleProperty = "Name"
): Promise<{ url: string }> {
  if (!accessToken) {
    throw new Error("Connect your Notion account to export");
  }
  if (!parent.databaseId && !parent.pageId) {
    throw new Error(
      "No Notion page or database is linked. Reconnect Notion and share a page/database with Revel."
    );
  }

  const markdown = exportToMarkdown(report, website);
  const hostname = new URL(website).hostname;
  const title = `Revel Blueprint — ${hostname} (${report.score})`;

  const pageBody: Record<string, unknown> = {
    children: chunkMarkdownForNotion(
      `${markdown}\n\n_Analysis ID: ${analysisId}_`
    ),
  };

  if (parent.databaseId) {
    pageBody.parent = { database_id: parent.databaseId };
    pageBody.properties = {
      [titleProperty]: {
        title: [{ text: { content: title } }],
      },
    };
  } else {
    pageBody.parent = { page_id: parent.pageId };
    pageBody.properties = {
      title: {
        title: [{ text: { content: title } }],
      },
    };
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pageBody),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Notion export failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const data = (await response.json()) as { url?: string; id?: string };
  const url =
    data.url ||
    (data.id
      ? `https://www.notion.so/${data.id.replace(/-/g, "")}`
      : undefined);

  if (!url) {
    throw new Error("Notion page created but no URL was returned");
  }

  return { url };
}

function chunkMarkdownForNotion(markdown: string) {
  const chunks = markdown.match(/[\s\S]{1,1800}/g) ?? [markdown];

  return chunks.map((chunk) => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: chunk } }],
    },
  }));
}
