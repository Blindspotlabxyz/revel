import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { notifyUserWelcome } from "@/lib/email/notifications";
import { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma, isPrismaEnabled } from "@/lib/prisma";
import {
  normalizeEmail,
  normalizeUsername,
  validateDisplayName,
  validatePassword,
  validateUsername,
} from "@/lib/user-profile";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(request: Request) {
  try {
    if (!isPrismaEnabled()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = body.password?.toString() ?? "";
    const nameRaw = body.name?.toString()?.trim() ?? "";
    const usernameRaw = body.username?.toString()?.trim() ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    let name: string | null = null;
    if (nameRaw) {
      const nameError = validateDisplayName(nameRaw);
      if (nameError) {
        return NextResponse.json({ error: nameError }, { status: 400 });
      }
      name = nameRaw;
    }

    let username: string | null = null;
    if (usernameRaw) {
      const usernameError = validateUsername(usernameRaw);
      if (usernameError) {
        return NextResponse.json({ error: usernameError }, { status: 400 });
      }
      username = normalizeUsername(usernameRaw);
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database is not available." },
        { status: 503 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    if (username) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) {
        return NextResponse.json(
          { error: "That username is already taken." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      await prisma.user.create({
        data: {
          id: randomUUID(),
          email,
          passwordHash,
          name,
          username,
        },
      });
    } catch (createError) {
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Email or username already in use" },
          { status: 409 }
        );
      }
      throw createError;
    }

    notifyUserWelcome({ email });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("signup_error", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2022"
    ) {
      return NextResponse.json(
        {
          error:
            "Database schema is out of date. Run the user profile migration (npx prisma db push or apply migration SQL).",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 }
    );
  }
}
