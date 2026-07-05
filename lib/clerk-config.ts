import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

function joinUrl(base: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function clerkSignInUrl(): string {
  if (subdomainRedirectsEnabled()) {
    return joinUrl(siteConfig.authUrl, "/log-in");
  }
  return "/log-in";
}

export function clerkSignUpUrl(): string {
  if (subdomainRedirectsEnabled()) {
    return joinUrl(siteConfig.authUrl, "/sign-up");
  }
  return "/sign-up";
}

/** Full-page sign-in URL with redirect_url for cross-subdomain auth gates. */
export function clerkSignInRedirectUrl(returnBackUrl: string): string {
  const signIn = new URL(clerkSignInUrl());
  signIn.searchParams.set("redirect_url", returnBackUrl);
  return signIn.toString();
}