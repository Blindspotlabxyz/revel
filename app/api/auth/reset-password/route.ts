import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrisma, isPrismaEnabled } from "@/lib/prisma";
import { hashToken, validatePassword } from "@/lib/user-profile";

export async function POST(request: Request) {
  try {
    if (!isPrismaEnabled()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is missing or invalid." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database is not available." },
        { status: 503 }
      );
    }

    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch (error) {
    console.error("reset_password_error", error);
    return NextResponse.json(
      { error: "Could not reset password. Try again in a moment." },
      { status: 500 }
    );
  }
}
