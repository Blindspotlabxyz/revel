import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

/** Canonical auth host for OAuth callbacks — never use VERCEL_URL or request host. */
export function getCanonicalAuthUrl(): string {
  // When subdomains are enabled, OAuth must always use auth.tryrevel.xyz even if
  // NEXTAUTH_URL was mistakenly set to the marketing apex (tryrevel.xyz).
  if (subdomainRedirectsEnabled()) {
    return siteConfig.authUrl.replace(/\/$/, "");
  }

  const raw =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    siteConfig.authUrl;
  return raw.replace(/\/$/, "");
}

export function getGoogleOAuthCallbackUrl(): string {
  return `${getCanonicalAuthUrl()}/api/auth/callback/google`;
}

/** Pin Auth.js env before handlers initialize so redirect_uri stays on auth.tryrevel.xyz. */
export function pinCanonicalAuthEnv(): string {
  const canonical = getCanonicalAuthUrl();
  process.env.AUTH_URL = canonical;
  process.env.NEXTAUTH_URL = canonical;
  return canonical;
}