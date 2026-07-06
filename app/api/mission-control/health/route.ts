import { NextResponse } from "next/server";
import {
  getActiveStorageBackend,
  getExportCapabilities,
} from "@/lib/mission-control-config";
import { getPrisma, isPrismaEnabled } from "@/lib/prisma";
import { isSupabaseEnabled } from "@/lib/supabase";

async function checkAnalysisTables(): Promise<{
  analyses: boolean;
  reports: boolean;
}> {
  const prisma = getPrisma();
  if (!prisma) {
    return { analyses: false, reports: false };
  }

  try {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('analyses', 'reports')
    `;
    const names = new Set(rows.map((row) => row.table_name));
    return {
      analyses: names.has("analyses"),
      reports: names.has("reports"),
    };
  } catch {
    return { analyses: false, reports: false };
  }
}

export async function GET() {
  const storage = getActiveStorageBackend();
  const tables =
    storage === "prisma" ? await checkAnalysisTables() : { analyses: null, reports: null };

  const schemaReady =
    storage !== "prisma" ||
    (tables.analyses === true && tables.reports === true);

  return NextResponse.json({
    ok: storage !== "none" && schemaReady,
    storage,
    schemaReady,
    tables,
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    openrouter_model:
      process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-120b:free",
    database: isPrismaEnabled(),
    supabase: isSupabaseEnabled(),
    vercel: process.env.VERCEL === "1",
    exports: getExportCapabilities(),
    migrateHint:
      storage === "prisma" && !schemaReady
        ? "Run supabase/schema.sql in the Supabase SQL Editor, or npm run db:schema (local 5432 often blocked — use the dashboard)."
        : null,
  });
}