import type {
  GitHubMetadata,
  LinearMetadata,
  NotionMetadata,
} from "@/lib/integrations/types";
import {
  isGitHubOAuthConfigured,
  isLinearOAuthConfigured,
  isNotionOAuthConfigured,
  oauthCallbackUrl,
} from "@/lib/integrations/oauth-config";
import { createOAuthState } from "@/lib/integrations/oauth-state";

export function buildLinearAuthorizeUrl(userId: string): string {
  if (!isLinearOAuthConfigured()) {
    throw new Error("Linear OAuth is not configured on the server");
  }
  const params = new URLSearchParams({
    client_id: process.env.LINEAR_CLIENT_ID!,
    redirect_uri: oauthCallbackUrl("linear"),
    response_type: "code",
    scope: "read,write,issues:create",
    state: createOAuthState(userId, "linear"),
    prompt: "consent",
    actor: "user",
  });
  return `https://linear.app/oauth/authorize?${params.toString()}`;
}

export function buildNotionAuthorizeUrl(userId: string): string {
  if (!isNotionOAuthConfigured()) {
    throw new Error("Notion OAuth is not configured on the server");
  }
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    redirect_uri: oauthCallbackUrl("notion"),
    response_type: "code",
    owner: "user",
    state: createOAuthState(userId, "notion"),
  });
  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

export function buildGitHubAuthorizeUrl(userId: string): string {
  if (!isGitHubOAuthConfigured()) {
    throw new Error("GitHub OAuth is not configured on the server");
  }
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: oauthCallbackUrl("github"),
    scope: "gist",
    state: createOAuthState(userId, "github"),
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeLinearCode(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string;
  metadata: LinearMetadata;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: oauthCallbackUrl("linear"),
    client_id: process.env.LINEAR_CLIENT_ID!,
    client_secret: process.env.LINEAR_CLIENT_SECRET!,
  });

  const tokenRes = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "");
    throw new Error(
      `Linear token exchange failed (${tokenRes.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };

  const meRes = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: tokenJson.access_token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        viewer { id name }
        teams { nodes { id name } }
        organization { name }
      }`,
    }),
  });

  if (!meRes.ok) {
    throw new Error("Linear connected but could not load your teams");
  }

  const meJson = await meRes.json();
  const teams = (meJson?.data?.teams?.nodes ?? []) as {
    id: string;
    name: string;
  }[];
  const team = teams[0];
  if (!team) {
    throw new Error(
      "Linear connected, but no team was found on your account. Create a team in Linear, then reconnect."
    );
  }

  return {
    accessToken: tokenJson.access_token,
    refreshToken: tokenJson.refresh_token,
    expiresAt:
      typeof tokenJson.expires_in === "number"
        ? new Date(Date.now() + tokenJson.expires_in * 1000)
        : undefined,
    scopes: tokenJson.scope,
    metadata: {
      teamId: team.id,
      teamName: team.name,
      workspaceName: meJson?.data?.organization?.name,
      viewerName: meJson?.data?.viewer?.name,
    },
  };
}

export async function exchangeNotionCode(code: string): Promise<{
  accessToken: string;
  metadata: NotionMetadata;
}> {
  const basic = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: oauthCallbackUrl("notion"),
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "");
    throw new Error(
      `Notion token exchange failed (${tokenRes.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token: string;
    workspace_id?: string;
    workspace_name?: string;
    bot_id?: string;
    duplicated_template_id?: string;
  };

  // Prefer a database the user shared with the integration; else first page.
  const searchRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 20,
      sort: { direction: "descending", timestamp: "last_edited_time" },
    }),
  });

  let parentPageId: string | undefined;
  let parentPageTitle: string | undefined;
  let databaseId: string | undefined;

  if (searchRes.ok) {
    const searchJson = (await searchRes.json()) as {
      results?: Array<{
        object: string;
        id: string;
        title?: Array<{ plain_text?: string }>;
        properties?: Record<string, { type?: string; title?: Array<{ plain_text?: string }> }>;
      }>;
    };

    const databases = (searchJson.results ?? []).filter(
      (r) => r.object === "database"
    );
    const pages = (searchJson.results ?? []).filter((r) => r.object === "page");

    if (databases[0]) {
      databaseId = databases[0].id;
      const titleProp = Object.values(databases[0].properties ?? {}).find(
        (p) => p.type === "title"
      );
      parentPageTitle =
        titleProp?.title?.[0]?.plain_text ||
        databases[0].title?.[0]?.plain_text ||
        "Notion database";
    } else if (pages[0]) {
      parentPageId = pages[0].id;
      parentPageTitle =
        pages[0].properties?.title?.title?.[0]?.plain_text ||
        pages[0].title?.[0]?.plain_text ||
        "Notion page";
    }
  }

  if (!databaseId && !parentPageId) {
    throw new Error(
      "Notion connected, but no page or database was shared with Revel. In Notion, open a page → ⋯ → Connections → add Revel, then reconnect."
    );
  }

  return {
    accessToken: tokenJson.access_token,
    metadata: {
      workspaceName: tokenJson.workspace_name,
      workspaceId: tokenJson.workspace_id,
      botId: tokenJson.bot_id,
      parentPageId: parentPageId,
      parentPageTitle,
      ...(databaseId ? { databaseId } : {}),
    } as NotionMetadata & { databaseId?: string },
  };
}

export async function exchangeGitHubCode(code: string): Promise<{
  accessToken: string;
  scopes?: string;
  metadata: GitHubMetadata;
}> {
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: oauthCallbackUrl("github"),
      }),
    }
  );

  if (!tokenRes.ok) {
    throw new Error(`GitHub token exchange failed (${tokenRes.status})`);
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenJson.access_token) {
    throw new Error(
      tokenJson.error_description ||
        tokenJson.error ||
        "GitHub did not return an access token"
    );
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!userRes.ok) {
    throw new Error("GitHub connected but could not load your profile");
  }

  const user = (await userRes.json()) as {
    login: string;
    id: number;
    name?: string;
  };

  return {
    accessToken: tokenJson.access_token,
    scopes: tokenJson.scope,
    metadata: {
      login: user.login,
      userId: user.id,
      name: user.name,
    },
  };
}
