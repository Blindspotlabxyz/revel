import { NextResponse } from "next/server";
import { notifyPasswordReset } from "@/lib/email/notifications";
import { isEmailEnabled } from "@/lib/email/resend";
import { getPrisma, isPrismaEnabled } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import {
  createPasswordResetToken,
  normalizeEmail,
} from "@/lib/user-profile";

/**
 * Always returns a generic success message to avoid email enumeration.
 */
export async function POST(request: Request) {
  try {
    if (!isPrismaEnabled()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(String(body.email ?? ""));

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database is not available." },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Only issue tokens for credential accounts (password hash present).
    // Google-only users get the same generic response.
    if (user?.passwordHash) {
      const { token, tokenHash, expiresAt } = createPasswordResetToken();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpires: expiresAt,
        },
      });

      const resetUrl = `${siteConfig.url.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

      if (isEmailEnabled()) {
        notifyPasswordReset({ email, resetUrl });
      } else {
        console.warn(
          "[Revel] password_reset_email_skipped (RESEND_API_KEY not set)",
          email
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, we sent password reset instructions.",
    });
  } catch (error) {
    console.error("forgot_password_error", error);
    return NextResponse.json(
      { error: "Could not process that request. Try again in a moment." },
      { status: 500 }
    );
  }
}
