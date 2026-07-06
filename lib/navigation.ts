import { isLocalAuthHost } from "@/lib/auth-url";
import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

function joinUrl(base: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function appUrl(path = "/"): string {
  return joinUrl(siteConfig.url, path);
}

export function docsUrl(path = "/"): string {
  return joinUrl(siteConfig.docsUrl, path);
}

export function legalUrl(path = "/"): string {
  return joinUrl(siteConfig.legalUrl, path);
}

export function authUrl(path = "/"): string {
  return joinUrl(siteConfig.authUrl, path);
}

const AUTH_PATHS = ["/log-in", "/sign-up", "/sign-in"] as const;
const LEGAL_PATHS = ["/privacy", "/terms"] as const;

function isAuthPath(pathname: string): boolean {
  return (
    AUTH_PATHS.includes(pathname as (typeof AUTH_PATHS)[number]) ||
    pathname.startsWith("/log-in/") ||
    pathname.startsWith("/sign-up/") ||
    pathname.startsWith("/sign-in/")
  );
}

function isLegalPath(pathname: string): boolean {
  return LEGAL_PATHS.includes(pathname as (typeof LEGAL_PATHS)[number]);
}

function absoluteSubdomainForPath(pathname: string): string | null {
  if (isAuthPath(pathname)) {
    return pathname === "/sign-in" ? authUrl("/log-in") : authUrl(pathname);
  }
  if (isLegalPath(pathname)) {
    return legalUrl(pathname);
  }
  return null;
}

function isCrossOriginHref(href: string): boolean {
  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    return false;
  }

  try {
    const target = new URL(href);
    const bases = [
      siteConfig.url,
      siteConfig.docsUrl,
      siteConfig.legalUrl,
      siteConfig.authUrl,
    ];

    return !bases.some((base) => {
      const origin = new URL(base).origin;
      return target.origin === origin;
    });
  } catch {
    return false;
  }
}

export function resolveNavHref(href: string): {
  href: string;
  useAnchor: boolean;
} {
  if (!subdomainRedirectsEnabled() || isLocalAuthHost()) {
    return { href, useAnchor: false };
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { href, useAnchor: isCrossOriginHref(href) };
  }

  const [pathname] = href.split(/[?#]/);
  const subdomainTarget = absoluteSubdomainForPath(pathname);

  if (subdomainTarget) {
    const suffix = href.slice(pathname.length);
    return { href: `${subdomainTarget}${suffix}`, useAnchor: true };
  }

  return { href, useAnchor: false };
}

export function navigateTo(href: string): void {
  const { href: resolved, useAnchor } = resolveNavHref(href);
  if (useAnchor) {
    window.location.href = resolved;
    return;
  }
  window.location.assign(resolved);
}