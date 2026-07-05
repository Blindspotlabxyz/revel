import { NextResponse } from "next/server";
import {
  getCanonicalAuthUrl,
  getGoogleOAuthCallbackUrl,
} from "@/lib/auth-url";

/**
 * Diagnostic endpoint — shows the exact OAuth callback URL Auth.js should use.
 * Remove or protect once production auth is verified.
 */
export async function GET() {
  const canonical = getCanonicalAuthUrl();
  const callback = getGoogleOAuthCallbackUrl();

  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    canonical_auth_url: canonical,
    expected_google_callback: callback,
    has_nextauth_secret: Boolean(process.env.NEXTAUTH_SECRET),
    has_google_client_id: Boolean(process.env.GOOGLE_CLIENT_ID),
    has_google_client_secret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    vercel_url: process.env.VERCEL_URL ?? null,
  });
}