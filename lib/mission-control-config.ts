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

export function getExportCapabilities() {
  return {
    markdown: true,
    json: true,
    github: true,
    linear: Boolean(
      process.env.LINEAR_API_KEY && process.env.LINEAR_TEAM_ID
    ),
    notion: Boolean(
      process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID
    ),
    githubGist: Boolean(process.env.GITHUB_TOKEN),
  };
}