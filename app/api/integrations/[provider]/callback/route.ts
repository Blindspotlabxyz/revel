import { NextResponse } from "next/server";
import type { IntegrationProvider } from "@/lib/integrations/types";
import { parseOAuthState } from "@/lib/integrations/oauth-state";
import {
  exchangeGitHubCode,
  exchangeLinearCode,
  exchangeNotionCode,
} from "@/lib/integrations/providers";
import { upsertUserIntegration } from "@/lib/integrations/store";
import { siteConfig } from "@/lib/site-config";

const PROVIDERS = new Set<IntegrationProvider>(["linear", "notion", "github"]);

function redirectWith(query: Record<string, string>) {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = new URL(`${base}/mission-control/integrations`);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url.toString());
}

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider: raw } = await context.params;
  const provider = raw as IntegrationProvider;

  if (!PROVIDERS.has(provider)) {
    return redirectWith({ error: "unknown_provider" });
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  if (error) {
    return redirectWith({
      error: error,
      provider,
    });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return redirectWith({ error: "missing_code", provider });
  }

  const parsed = parseOAuthState(state, provider);
  if (!parsed) {
    return redirectWith({ error: "invalid_state", provider });
  }

  try {
    if (provider === "linear") {
      const result = await exchangeLinearCode(code);
      await upsertUserIntegration({
        userId: parsed.userId,
        provider: "linear",
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenExpiresAt: result.expiresAt,
        scopes: result.scopes,
        metadata: result.metadata,
      });
    } else if (provider === "notion") {
      const result = await exchangeNotionCode(code);
      await upsertUserIntegration({
        userId: parsed.userId,
        provider: "notion",
        accessToken: result.accessToken,
        metadata: result.metadata,
      });
    } else {
      const result = await exchangeGitHubCode(code);
      await upsertUserIntegration({
        userId: parsed.userId,
        provider: "github",
        accessToken: result.accessToken,
        scopes: result.scopes,
        metadata: result.metadata,
      });
    }

    return redirectWith({ connected: provider });
  } catch (err) {
    console.error(`[integrations] ${provider} callback failed`, err);
    return redirectWith({
      error: err instanceof Error ? err.message : "connect_failed",
      provider,
    });
  }
}
