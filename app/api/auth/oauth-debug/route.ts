import { NextResponse } from "next/server";
import {
  getCanonicalAuthUrl,
  getGoogleOAuthCallbackUrl,
} from "@/lib/auth-url";

/**
 * Diagnostic endpoint — local development only.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canonical = getCanonicalAuthUrl();
  const callback = getGoogleOAuthCallbackUrl();

  return NextResponse.json({
    canonical_auth_url: canonical,
    expected_google_callback: callback,
    has_nextauth_secret: Boolean(process.env.NEXTAUTH_SECRET),
    has_google_client_id: Boolean(process.env.GOOGLE_CLIENT_ID),
    has_google_client_secret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
  });
}