export type IntegrationProvider = "linear" | "notion" | "github";

export type LinearMetadata = {
  teamId?: string;
  teamName?: string;
  workspaceName?: string;
  viewerName?: string;
};

export type NotionMetadata = {
  workspaceName?: string;
  workspaceId?: string;
  /** Parent page for new export pages (private to this user). */
  parentPageId?: string;
  parentPageTitle?: string;
  /** If user shared a database with the integration. */
  databaseId?: string;
  botId?: string;
};

export type GitHubMetadata = {
  login?: string;
  userId?: number;
  name?: string;
};

export type IntegrationMetadata =
  | LinearMetadata
  | NotionMetadata
  | GitHubMetadata
  | Record<string, unknown>;

export type IntegrationStatus = {
  provider: IntegrationProvider;
  connected: boolean;
  connectedAt?: string | null;
  label?: string | null;
  metadata?: IntegrationMetadata | null;
  /** OAuth app configured on the server (can start connect flow). */
  oauthConfigured: boolean;
};
