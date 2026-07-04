import { NextRequest, NextResponse } from "next/server";
import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

function external(path: string, base: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function getSubdomainRedirect(
  request: NextRequest
): NextResponse | null {
  if (!subdomainRedirectsEnabled()) return null;

  const { pathname, search } = request.nextUrl;
  const query = search || "";

  const { docsUrl, legalUrl, authUrl } = siteConfig;

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    const docsPath = pathname === "/docs" ? "" : pathname.slice("/docs".length);
    return NextResponse.redirect(external(`${docsPath}${query}`, docsUrl));
  }

  const exactRedirects: Record<string, string> = {
    "/faq": external("/faq", docsUrl),
    "/sample-reports": external("/sample-reports", docsUrl),
    "/api": external("/api", docsUrl),
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