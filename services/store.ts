import { isPrismaEnabled } from "@/lib/prisma";
import { isSupabaseEnabled } from "@/lib/supabase";
import type { Analysis } from "@/types/analysis";
import {
  deleteAnalysisFromFile,
  getAllAnalysesFromFile,
  getAnalysisFromFile,
  saveAnalysisToFile,
} from "./file-store";
import {
  deleteAnalysisFromPrisma,
  getAllAnalysesFromPrisma,
  getAnalysisFromPrisma,
  saveAnalysisToPrisma,
} from "./prisma-store";
import {
  deleteAnalysisFromSupabase,
  getAllAnalysesFromSupabase,
  getAnalysisFromSupabase,
  saveAnalysisToSupabase,
} from "./supabase-store";

function usePrisma(): boolean {
  // Direct Postgres (5432/6543) is often blocked on local networks.
  // Supabase JS over HTTPS works locally; Prisma runs on Vercel production.
  if (process.env.USE_PRISMA_LOCAL === "true") {
    return isPrismaEnabled();
  }

  return isPrismaEnabled() && process.env.NODE_ENV === "production";
}

function useSupabase(): boolean {
  return isSupabaseEnabled();
}

/** Local JSON file fallback — not available on Vercel's read-only filesystem. */
function useFileStore(): boolean {
  if (process.env.VERCEL === "1") return false;
  return !usePrisma() && !useSupabase();
}

export async function getAnalysis(id: string): Promise<Analysis | null> {
  if (usePrisma()) {
    const result = await getAnalysisFromPrisma(id);
    if (result) return result;
  }

  if (useSupabase()) {
    const result = await getAnalysisFromSupabase(id);
    if (result) return result;
  }

  return getAnalysisFromFile(id);
}

export async function getAllAnalyses(
  userId?: string | null
): Promise<Analysis[]> {
  if (usePrisma()) {
    return getAllAnalysesFromPrisma(userId);
  }

  if (useSupabase()) {
    const results = await getAllAnalysesFromSupabase(userId);
    if (results.length > 0) return results;
  }

  return getAllAnalysesFromFile(userId);
}

export async function saveAnalysis(analysis: Analysis): Promise<void> {
  if (usePrisma()) {
    await saveAnalysisToPrisma(analysis);
    return;
  }

  if (useSupabase()) {
    await saveAnalysisToSupabase(analysis);
    return;
  }

  if (useFileStore()) {
    await saveAnalysisToFile(analysis);
    return;
  }

  throw new Error("No analysis storage is configured.");
}

export async function deleteAnalysis(id: string): Promise<boolean> {
  let deleted = false;

  if (usePrisma()) {
    deleted = await deleteAnalysisFromPrisma(id);
  } else if (useSupabase()) {
    deleted = await deleteAnalysisFromSupabase(id);
  }

  if (useFileStore()) {
    const fileDeleted = await deleteAnalysisFromFile(id);
    return deleted || fileDeleted;
  }

  return deleted;
}