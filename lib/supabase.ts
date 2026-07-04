import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled()) return null;

  if (!client) {
    const url = process.env.SUPABASE_URL!;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY!;

    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}