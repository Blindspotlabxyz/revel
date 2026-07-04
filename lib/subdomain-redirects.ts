import { NextRequest, NextResponse } from "next/server";
import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

function external(path: string, base: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

function hostname(request: NextRequest): string {
  const host = request.headers.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

function baseHostname(): string {
  return new URL(siteConfig.url).hostname.toLowerCase();
}

type SubdomainLabel = "docs" | "auth" | "legal" | "www" | "apex";

function resolveSubdomain(host: string): SubdomainLabel | null {
  const base = baseHostname();

  if (host === base) return "apex";
  if (host === `www.${base}`) return "www";

  const suffix = `.${base}`;
  if (!host.endsWith(suffix)) return null;

  const label = host.slice(0, -suffix.length);
  if (label === "docs") return "docs";
  if (label === "auth") return "auth";
  if (label === "legal") return "legal";

  return null;
}

/** Prefix any docs-subdomain path with /docs for internal routing. */
function docsInternalPath(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return "/docs";
  }
  if (pathname.startsWith("/docs")) {
    return pathname;
  }
  return `/docs${pathname}`;
}

function rewriteTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

function inboundSubdomainRewrite(
  request: NextRequest,
  subdomain: SubdomainLabel
): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  const query = search || "";

  if (subdomain === "docs") {
    return rewriteTo(request, docsInternalPath(pathname));
  }

  if (subdomain === "auth") {
    const authPaths = ["/log-in", "/sign-up", "/sign-in"];
    const isAuthPath =
      authPaths.includes(pathname) ||
      pathname.startsWith("/log-in/") ||
      pathname.startsWith("/sign-up/") ||
      pathname.startsWith("/sign-in/");

    if (isAuthPath) {
      return rewriteTo(request, pathname);
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/log-in${query}`, request.url));
    }

    return null;
  }

  if (subdomain === "legal") {
    if (pathname === "/privacy" || pathname === "/terms") {
      return rewriteTo(request, pathname);
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/privacy${query}`, request.url));
    }

    return null;
  }

  return null;
}

function outboundApexRedirect(
  request: NextRequest,
  pathname: string,
  query: string
): NextResponse | null {
  const { docsUrl, legalUrl, authUrl } = siteConfig;

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    const docsPath =
      pathname === "/docs" ? "/" : pathname.slice("/docs".length) || "/";
    return NextResponse.redirect(external(`${docsPath}${query}`, docsUrl));
  }

  const exactRedirects: Record<string, string> = {
    "/how-it-works": external("/how-it-works", docsUrl),
    "/sample-reports": external("/sample-reports", docsUrl),
    "/faq": external("/faq", docsUrl),
    "/privacy": external("/privacy", legalUrl),
    "/terms": external("/terms", legalUrl),
    "/log-in": external("/log-in", authUrl),
    "/sign-in": external("/log-in", authUrl),
    "/sign-up": external("/sign-up", authUrl),
  };

  const destination = exactRedirects[pathname];
  if (destination) {
    return NextResponse.redirect(`${destination}${query}`);
  }

  return null;
}

export function getSubdomainRedirect(
  request: NextRequest
): NextResponse | null {
  if (!subdomainRedirectsEnabled()) return null;

  const host = hostname(request);
  const subdomain = resolveSubdomain(host);
  const { pathname, search } = request.nextUrl;
  const query = search || "";

  if (subdomain === "docs" || subdomain === "auth" || subdomain === "legal") {
    return inboundSubdomainRewrite(request, subdomain);
  }

  if (subdomain === "apex" || subdomain === "www") {
    return outboundApexRedirect(request, pathname, query);
  }

  return null;
}