import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import type { IntegrationProvider } from "@/lib/integrations/types";
import { deleteUserIntegration } from "@/lib/integrations/store";

const PROVIDERS = new Set<IntegrationProvider>(["linear", "notion", "github"]);

/** Disconnect integration for the signed-in user. */
export async function DELETE(
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

  await deleteUserIntegration(userId, provider);
  return NextResponse.json({ ok: true, provider, connected: false });
}
