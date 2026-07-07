import type { AnalysisReport } from "@/types/analysis";
import { exportToGitHubMarkdown, exportToMarkdown } from "./export-service";

export async function pushToGitHubGist(
  report: AnalysisReport,
  website: string,
  analysisId: string
): Promise<{ url: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const content = exportToGitHubMarkdown(report, website);

  const response = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
  website: string
): Promise<{ created: number; urls: string[] }> {
  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;

  if (!apiKey || !teamId) {
    throw new Error("LINEAR_API_KEY and LINEAR_TEAM_ID are required");
  }

  const urls: string[] = [];
  const topActions = report.actions.slice(0, 8);

  for (const action of topActions) {
    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: apiKey,
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
  analysisId: string
): Promise<{ url: string }> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    throw new Error("NOTION_API_KEY and NOTION_DATABASE_ID are required");
  }

  const markdown = exportToMarkdown(report, website);

  const titleProperty = process.env.NOTION_TITLE_PROPERTY ?? "Name";
  const hostname = new URL(website).hostname;

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        [titleProperty]: {
          title: [
            {
              text: {
                content: `Revel Blueprint — ${hostname} (${report.score})`,
              },
            },
          ],
        },
      },
      children: chunkMarkdownForNotion(
        `${markdown}\n\n_Analysis ID: ${analysisId}_`
      ),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Notion export failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const data = (await response.json()) as { url: string };
  return { url: data.url };
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