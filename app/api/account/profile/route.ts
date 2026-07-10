import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma, isPrismaEnabled } from "@/lib/prisma";
import {
  displayLabel,
  normalizeUsername,
  validateDisplayName,
  validateUsername,
} from "@/lib/user-profile";

export async function GET() {
  try {
    if (!isPrismaEnabled()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database is not available." },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      hasPassword: Boolean(user.passwordHash),
      createdAt: user.createdAt,
      displayLabel: displayLabel(user),
    });
  } catch (error) {
    console.error("profile_get_error", error);
    return NextResponse.json(
      { error: "Could not load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isPrismaEnabled()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const nameRaw = body.name !== undefined ? String(body.name) : undefined;
    const usernameRaw =
      body.username !== undefined ? String(body.username) : undefined;

    const data: {
      name?: string | null;
      username?: string | null;
    } = {};

    if (nameRaw !== undefined) {
      const trimmed = nameRaw.trim();
      if (!trimmed) {
        data.name = null;
      } else {
        const err = validateDisplayName(trimmed);
        if (err) {
          return NextResponse.json({ error: err }, { status: 400 });
        }
        data.name = trimmed;
      }
    }

    if (usernameRaw !== undefined) {
      const trimmed = usernameRaw.trim();
      if (!trimmed) {
        data.username = null;
      } else {
        const err = validateUsername(trimmed);
        if (err) {
          return NextResponse.json({ error: err }, { status: 400 });
        }
        data.username = normalizeUsername(trimmed);
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update. Provide name and/or username." },
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

    try {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          image: true,
          passwordHash: true,
        },
      });

      return NextResponse.json({
        ok: true,
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        hasPassword: Boolean(user.passwordHash),
        displayLabel: displayLabel(user),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "That username is already taken." },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("profile_patch_error", error);
    return NextResponse.json(
      { error: "Could not update profile." },
      { status: 500 }
    );
  }
}
