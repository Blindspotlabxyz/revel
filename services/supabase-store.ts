import { getSupabase } from "@/lib/supabase";
import type { Analysis, AnalysisReport } from "@/types/analysis";

interface DbAnalysis {
  id: string;
  user_id: string | null;
  website: string;
  status: string;
  score: number | null;
  error: string | null;
  created_at: string;
  reports: { json_result: AnalysisReport }[] | null;
}

function toAnalysis(row: DbAnalysis): Analysis {
  const report = row.reports?.[0]?.json_result;
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    website: row.website,
    status: row.status as Analysis["status"],
    score: row.score ?? undefined,
    createdAt: row.created_at,
    report,
    error: row.error ?? undefined,
  };
}

function throwIfSupabaseError(
  label: string,
  error: { message: string } | null
): void {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

export async function getAnalysisFromSupabase(
  id: string
): Promise<Analysis | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("*, reports(json_result)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toAnalysis(data as DbAnalysis);
}

export async function getAllAnalysesFromSupabase(
  userId?: string | null
): Promise<Analysis[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("analyses")
    .select("id, user_id, website, status, score, error, created_at")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id ?? undefined,
    website: row.website,
    status: row.status as Analysis["status"],
    score: row.score ?? undefined,
    createdAt: row.created_at,
    error: row.error ?? undefined,
  }));
}

export async function saveAnalysisToSupabase(
  analysis: Analysis
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  if (analysis.userId) {
    const { error } = await supabase.from("users").upsert({
      id: analysis.userId,
      email: null,
    });
    throwIfSupabaseError("Failed to save user", error);
  }

  const { error: analysisError } = await supabase.from("analyses").upsert({
    id: analysis.id,
    user_id: analysis.userId ?? null,
    website: analysis.website,
    status: analysis.status,
    score: analysis.score ?? null,
    error: analysis.error ?? null,
    created_at: analysis.createdAt,
  });
  throwIfSupabaseError("Failed to save analysis", analysisError);

  if (analysis.report) {
    const { error: reportError } = await supabase.from("reports").upsert(
      {
        analysis_id: analysis.id,
        json_result: analysis.report,
      },
      { onConflict: "analysis_id" }
    );
    throwIfSupabaseError("Failed to save report", reportError);
  }
}

export async function deleteAnalysisFromSupabase(
  id: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("analyses").delete().eq("id", id);
  return !error;
}