import { NextResponse } from "next/server";
import { isPrismaEnabled } from "@/lib/prisma";
import { isSupabaseEnabled } from "@/lib/supabase";

export async function GET() {
  const storage =
    isPrismaEnabled() && process.env.NODE_ENV === "production"
      ? "prisma"
      : isSupabaseEnabled()
        ? "supabase"
        : process.env.VERCEL === "1"
          ? "none"
          : "file";

  return NextResponse.json({
    ok: storage !== "none",
    storage,
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    openrouter_model:
      process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-120b:free",
    database: isPrismaEnabled(),
    supabase: isSupabaseEnabled(),
    vercel: process.env.VERCEL === "1",
  });
}