import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma, isPrismaEnabled } from "@/lib/prisma";

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
    const email = body.email?.toString().trim().toLowerCase();
    const password = body.password?.toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
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

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      await prisma.user.create({
        data: {
          id: randomUUID(),
          email,
          passwordHash,
        },
      });
    } catch (createError) {
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
      throw createError;
    }

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
            "Database schema is out of date (missing password_hash). Run: npx prisma db push",
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