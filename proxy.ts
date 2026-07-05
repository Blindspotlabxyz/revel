import { NextResponse, type NextRequest } from "next/server";
import { authSignInRedirectUrl, isAuthConfigured } from "@/lib/auth-config";
import { blockScannerRequest } from "@/lib/security/scanner-block";
import { getSubdomainRedirect } from "@/lib/subdomain-redirects";
import { subdomainRedirectsEnabled } from "@/lib/site-config";
import { auth } from "@/auth";

const PROTECTED_PREFIXES = [
  "/mission-control",
  "/api/analyze",
  "/api/export",
  "/api/history",
  "/api/stripe/checkout",
];

function isProtectedRoute(pathname: string): boolean {
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

export const proxy = auth((req) => {
  const shared = runSharedMiddleware(req);
  if (shared) return shared;

  if (
    isAuthConfigured() &&
    !req.auth &&
    isProtectedRoute(req.nextUrl.pathname)
  ) {
    return redirectUnauthenticatedToSignIn(req);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};