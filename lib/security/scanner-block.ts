import { type NextRequest, NextResponse } from "next/server";

/**
 * Block automated scanners probing for exposed secrets.
 * Returns 403 before app logic to avoid wasted invocations.
 */
const BLOCKED_PATH_PATTERNS: RegExp[] = [
  // .env variants anywhere in path
  /\/\.env/i,
  /\.env$/i,
  /\.env\./i,
  // Other secret/config probes
  /\/\.flaskenv$/i,
  /\/\.envrc$/i,
  /^\/env\.json$/i,
  /^\/env$/i,
  // Common repo / CMS probes
  /\/\.git(?:\/|$)/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpinfo/i,
  /\/\.aws\/credentials/i,
  /\/id_rsa$/i,
  /\/config\.json$/i,
  /\/secrets\.(?:ya?ml|json)$/i,
];

export function isScannerProbe(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

export function blockScannerRequest(req: NextRequest): NextResponse | null {
  if (!isScannerProbe(req.nextUrl.pathname)) {
    return null;
  }

  return new NextResponse(null, {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-store",
      "X-Blocked-Reason": "scanner-probe",
    },
  });
}