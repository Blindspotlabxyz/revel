import { NextRequest, NextResponse } from "next/server";
import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

const PRODUCT_SUBDOMAINS = new Set(["docs", "auth", "legal"]);

const DOCS_SURFACE_PATHS = new Set([
  "/",
  "/api",
  "/how-it-works",
  "/sample-reports",
  "/faq",
]);

function external(path: string, base: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

function hostname(request: NextRequest): string {
  const host = request.headers.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

/** Always resolve to the apex registrable domain, even if APP_URL points at a product subdomain. */
function baseHostname(): string {
  let host = new URL(siteConfig.url).hostname.toLowerCase().replace(/^www\./, "");

  const parts = host.split(".");
  if (parts.length >= 3 && PRODUCT_SUBDOMAINS.has(parts[0])) {
    host = parts.slice(1).join(".");
  }

  return host;
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

function isDocsSubdomainPath(pathname: string): boolean {
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return true;
  return DOCS_SURFACE_PATHS.has(pathname);
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

function sameUrl(a: URL, b: URL): boolean {
  return (
    a.hostname === b.hostname &&
    a.pathname === b.pathname &&
    a.search === b.search
  );
}

function safeRedirect(request: NextRequest, destination: string): NextResponse {
  const current = new URL(request.url);
  const target = new URL(destination, request.url);

  if (sameUrl(current, target)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(target);
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
    if (!isDocsSubdomainPath(pathname)) {
      return safeRedirect(
        request,
        external(`${pathname}${query}`, siteConfig.url)
      );
    }

    if (pathname === "/docs" || pathname.startsWith("/docs/")) {
      return NextResponse.next();
    }

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
      return NextResponse.next();
    }

    if (pathname === "/") {
      return safeRedirect(request, `/log-in${query}`);
    }

    return null;
  }

  if (subdomain === "legal") {
    if (pathname === "/privacy" || pathname === "/terms") {
      return NextResponse.next();
    }

    if (pathname === "/") {
      return safeRedirect(request, `/privacy${query}`);
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
    return safeRedirect(request, external(`${docsPath}${query}`, docsUrl));
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
    return safeRedirect(request, `${destination}${query}`);
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