import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  authSignInRedirectUrl,
  getAuthSecret,
  getSessionTokenCookieName,
  isAuthConfigured,
  useSecureAuthCookies,
} from "@/lib/auth-config";
import { isPublicSampleReportPath } from "@/lib/public-sample-report";
import { blockScannerRequest } from "@/lib/security/scanner-block";
import { getSubdomainRedirect } from "@/lib/subdomain-redirects";
import { subdomainRedirectsEnabled } from "@/lib/site-config";

const PROTECTED_PREFIXES = [
  "/mission-control",
  "/api/analyze",
  "/api/export",
  "/api/history",
  "/api/stripe/checkout",
];

function isProtectedRoute(pathname: string): boolean {
  if (isPublicSampleReportPath(pathname)) {
    return false;
  }

  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function runSharedMiddleware(req: NextRequest): NextResponse | null {
  const blocked = blockScannerRequest(req);
  if (blocked) return blocked;

  const subdomainRedirect = getSubdomainRedirect(req);
  if (subdomainRedirect) return subdomainRedirect;

  if (
    !subdomainRedirectsEnabled() &&
    req.nextUrl.pathname === "/api" &&
    req.method === "GET"
  ) {
    return NextResponse.redirect(new URL("/docs/api", req.url));
  }

  return null;
}

function redirectUnauthenticatedToSignIn(req: NextRequest): NextResponse {
  const returnBackUrl = req.nextUrl.href;
  return NextResponse.redirect(authSignInRedirectUrl(returnBackUrl));
}

export async function proxy(req: NextRequest) {
  const shared = runSharedMiddleware(req);
  if (shared) return shared;

  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (
    req.nextUrl.pathname === "/api/mcp" ||
    req.nextUrl.pathname === "/api/mcp/manifest"
  ) {
    return NextResponse.next();
  }

  if (isAuthConfigured()) {
    const sessionCookieName = getSessionTokenCookieName();
    const token = await getToken({
      req,
      secret: getAuthSecret(),
      secureCookie: useSecureAuthCookies(),
      cookieName: sessionCookieName,
      salt: sessionCookieName,
    });

    if (!token && isProtectedRoute(req.nextUrl.pathname)) {
      return redirectUnauthenticatedToSignIn(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};