import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import type { IntegrationProvider } from "@/lib/integrations/types";
import {
  buildGitHubAuthorizeUrl,
  buildLinearAuthorizeUrl,
  buildNotionAuthorizeUrl,
} from "@/lib/integrations/providers";
import { isProviderOAuthConfigured } from "@/lib/integrations/oauth-config";

const PROVIDERS = new Set<IntegrationProvider>(["linear", "notion", "github"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { provider: raw } = await context.params;
  const provider = raw as IntegrationProvider;

  if (!PROVIDERS.has(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  if (!isProviderOAuthConfigured(provider)) {
    return NextResponse.json(
      {
        error: `${provider} OAuth is not configured. Add client id/secret on the server.`,
      },
      { status: 503 }
    );
  }

  try {
    const url =
      provider === "linear"
        ? buildLinearAuthorizeUrl(userId)
        : provider === "notion"
          ? buildNotionAuthorizeUrl(userId)
          : buildGitHubAuthorizeUrl(userId);

    return NextResponse.redirect(url);
  } catch (error) {
    const { logServerError, toClientErrorMessage } = await import(
      "@/lib/safe-client-error"
    );
    logServerError("integration_start_failed", error, { provider });
    return NextResponse.json(
      {
        error: toClientErrorMessage(
          error,
          "Could not start connect flow. Please try again."
        ),
      },
      { status: 500 }
    );
  }
}
