import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

function joinUrl(base: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function authSignInUrl(): string {
  if (subdomainRedirectsEnabled()) {
    return joinUrl(siteConfig.authUrl, "/log-in");
  }
  return "/log-in";
}

export function authSignUpUrl(): string {
  if (subdomainRedirectsEnabled()) {
    return joinUrl(siteConfig.authUrl, "/sign-up");
  }
  return "/sign-up";
}

/** Full-page sign-in URL with redirect_url for cross-subdomain auth gates. */
export function authSignInRedirectUrl(returnBackUrl: string): string {
  const signIn = new URL(authSignInUrl());
  signIn.searchParams.set("redirect_url", returnBackUrl);
  return signIn.toString();
}

export function isAuthConfigured(): boolean {
  return !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
}