export type ExportFormat =
  | "markdown"
  | "json"
  | "github"
  | "linear"
  | "notion";

export function getActiveStorageBackend():
  | "prisma"
  | "supabase"
  | "file"
  | "none" {
  const prismaEnabled = !!(
    process.env.DATABASE_URL && process.env.DIRECT_URL
  );

  if (prismaEnabled && process.env.NODE_ENV === "production") {
    return "prisma";
  }

  if (process.env.SUPABASE_URL) {
    return "supabase";
  }

  if (process.env.VERCEL === "1") {
    return "none";
  }

  return prismaEnabled || process.env.SUPABASE_URL ? "supabase" : "file";
}

/**
 * Server-level export feature availability.
 * Cloud exports (Linear / Notion / Gist) require per-user OAuth — capability
 * is refined per session in GET /api/export.
 */
export function getExportCapabilities() {
  return {
    markdown: true,
    json: true,
    github: true,
    /** Enabled when user has connected Linear (checked at request time). */
    linear: true,
    notion: true,
    githubGist: true,
  };
}
