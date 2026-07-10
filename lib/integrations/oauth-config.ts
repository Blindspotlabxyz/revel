import { siteConfig } from "@/lib/site-config";
import type { IntegrationProvider } from "@/lib/integrations/types";

export function getIntegrationsCallbackBase(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    siteConfig.url.replace(/\/$/, "")
  );
}

export function oauthCallbackUrl(provider: IntegrationProvider): string {
  return `${getIntegrationsCallbackBase()}/api/integrations/${provider}/callback`;
}

export function isLinearOAuthConfigured(): boolean {
  return Boolean(
    process.env.LINEAR_CLIENT_ID?.trim() &&
      process.env.LINEAR_CLIENT_SECRET?.trim()
  );
}

export function isNotionOAuthConfigured(): boolean {
  return Boolean(
    process.env.NOTION_CLIENT_ID?.trim() &&
      process.env.NOTION_CLIENT_SECRET?.trim()
  );
}

export function isGitHubOAuthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim()
  );
}

export function isProviderOAuthConfigured(
  provider: IntegrationProvider
): boolean {
  if (provider === "linear") return isLinearOAuthConfigured();
  if (provider === "notion") return isNotionOAuthConfigured();
  return isGitHubOAuthConfigured();
}
