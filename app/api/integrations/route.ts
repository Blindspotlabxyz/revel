import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { listUserIntegrationStatuses } from "@/lib/integrations/store";
import {
  isGitHubOAuthConfigured,
  isLinearOAuthConfigured,
  isNotionOAuthConfigured,
} from "@/lib/integrations/oauth-config";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const integrations = await listUserIntegrationStatuses(userId);

  return NextResponse.json({
    integrations,
    oauth: {
      linear: isLinearOAuthConfigured(),
      notion: isNotionOAuthConfigured(),
      github: isGitHubOAuthConfigured(),
    },
    /** Downloads always work without connecting an account. */
    downloads: {
      markdown: true,
      json: true,
      githubMarkdown: true,
    },
  });
}
