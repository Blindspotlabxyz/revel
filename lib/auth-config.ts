import { shouldPinCanonicalAuthUrl } from "@/lib/auth-url";
import { siteConfig } from "@/lib/site-config";

function joinUrl(base: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function authSignInUrl(): string {
  if (shouldPinCanonicalAuthUrl()) {
    return joinUrl(siteConfig.authUrl, "/log-in");
  }
  return "/log-in";
}

export function authSignUpUrl(): string {
  if (shouldPinCanonicalAuthUrl()) {
    return joinUrl(siteConfig.authUrl, "/sign-up");
  }
  return "/sign-up";
}

/** Full-page sign-in URL with redirect_url for cross-subdomain auth gates. */
export function authSignInRedirectUrl(returnBackUrl: string): string {
  const signInPath = authSignInUrl();
  const signIn = signInPath.startsWith("http")
    ? new URL(signInPath)
    : new URL(signInPath, returnBackUrl);
  signIn.searchParams.set("redirect_url", returnBackUrl);
  return signIn.toString();
}

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export function isAuthConfigured(): boolean {
  return !!(
    getAuthSecret() &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
}