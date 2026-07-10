import type { Prisma } from "@/lib/generated/prisma/client";
import { decryptSecret, encryptSecret } from "@/lib/crypto-secret";
import { getPrisma } from "@/lib/prisma";
import type {
  IntegrationMetadata,
  IntegrationProvider,
  IntegrationStatus,
} from "@/lib/integrations/types";
import { isProviderOAuthConfigured } from "@/lib/integrations/oauth-config";

export type StoredIntegration = {
  provider: IntegrationProvider;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  scopes?: string | null;
  metadata: IntegrationMetadata;
  connectedAt?: Date | null;
};

export async function getUserIntegration(
  userId: string,
  provider: IntegrationProvider
): Promise<StoredIntegration | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const row = await prisma.userIntegration.findUnique({
    where: {
      userId_provider: { userId, provider },
    },
  });

  if (!row) return null;

  return {
    provider,
    accessToken: decryptSecret(row.accessTokenEncrypted),
    refreshToken: row.refreshTokenEncrypted
      ? decryptSecret(row.refreshTokenEncrypted)
      : null,
    tokenExpiresAt: row.tokenExpiresAt,
    scopes: row.scopes,
    metadata: (row.metadata as IntegrationMetadata) ?? {},
    connectedAt: row.connectedAt,
  };
}

export async function upsertUserIntegration(input: {
  userId: string;
  provider: IntegrationProvider;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  scopes?: string | null;
  metadata?: IntegrationMetadata;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("Database is not available");
  }

  await prisma.userIntegration.upsert({
    where: {
      userId_provider: {
        userId: input.userId,
        provider: input.provider,
      },
    },
    create: {
      userId: input.userId,
      provider: input.provider,
      accessTokenEncrypted: encryptSecret(input.accessToken),
      refreshTokenEncrypted: input.refreshToken
        ? encryptSecret(input.refreshToken)
        : null,
      tokenExpiresAt: input.tokenExpiresAt ?? null,
      scopes: input.scopes ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
    update: {
      accessTokenEncrypted: encryptSecret(input.accessToken),
      refreshTokenEncrypted: input.refreshToken
        ? encryptSecret(input.refreshToken)
        : null,
      tokenExpiresAt: input.tokenExpiresAt ?? null,
      scopes: input.scopes ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function deleteUserIntegration(
  userId: string,
  provider: IntegrationProvider
): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  try {
    await prisma.userIntegration.delete({
      where: {
        userId_provider: { userId, provider },
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function listUserIntegrationStatuses(
  userId: string
): Promise<IntegrationStatus[]> {
  const prisma = getPrisma();
  const providers: IntegrationProvider[] = ["linear", "notion", "github"];

  if (!prisma) {
    return providers.map((provider) => ({
      provider,
      connected: false,
      oauthConfigured: isProviderOAuthConfigured(provider),
    }));
  }

  const rows = await prisma.userIntegration.findMany({
    where: { userId },
  });

  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  return providers.map((provider) => {
    const row = byProvider.get(provider);
    const metadata = (row?.metadata as IntegrationMetadata) ?? null;
    let label: string | null = null;
    if (metadata && typeof metadata === "object") {
      const m = metadata as Record<string, unknown>;
      label =
        (typeof m.login === "string" && m.login) ||
        (typeof m.workspaceName === "string" && m.workspaceName) ||
        (typeof m.teamName === "string" && m.teamName) ||
        (typeof m.viewerName === "string" && m.viewerName) ||
        null;
    }

    return {
      provider,
      connected: Boolean(row),
      connectedAt: row?.connectedAt?.toISOString() ?? null,
      label,
      metadata,
      oauthConfigured: isProviderOAuthConfigured(provider),
    };
  });
}
