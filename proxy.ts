import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { clerkSignInRedirectUrl } from "@/lib/clerk-config";
import { isClerkClientEnabled } from "@/lib/clerk-client";
import { blockScannerRequest } from "@/lib/security/scanner-block";
import { getSubdomainRedirect } from "@/lib/subdomain-redirects";
import { subdomainRedirectsEnabled } from "@/lib/site-config";

const isProtectedRoute = createRouteMatcher([
  "/mission-control(.*)",
  "/api/analyze(.*)",
  "/api/export(.*)",
  "/api/history(.*)",
  "/api/stripe/checkout(.*)",
]);

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

function redirectUnauthenticatedToSignIn(
  req: NextRequest
): NextResponse {
  const returnBackUrl = req.nextUrl.href;
  return NextResponse.redirect(clerkSignInRedirectUrl(returnBackUrl));
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const shared = runSharedMiddleware(req);
  if (shared) return shared;

  if (isProtectedRoute(req)) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return redirectUnauthenticatedToSignIn(req);
    }
  }
});

function baseHandler(req: NextRequest) {
  const shared = runSharedMiddleware(req);
  if (shared) return shared;
  return NextResponse.next();
}

const clerkProxyEnabled =
  isClerkClientEnabled() && !!process.env.CLERK_SECRET_KEY;

export default clerkProxyEnabled ? clerkHandler : baseHandler;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};