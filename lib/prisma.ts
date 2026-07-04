import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isPrismaEnabled(): boolean {
  return !!process.env.DATABASE_URL && !!process.env.DIRECT_URL;
}

function getRuntimeConnectionString(): string {
  // Local dev: session pooler (DIRECT_URL) is more reliable than transaction pooler (6543).
  // Production: prefer DATABASE_URL for connection pooling on serverless.
  const url =
    (process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL
      : process.env.DIRECT_URL) ??
    process.env.DATABASE_URL ??
    process.env.DIRECT_URL;

  return resolveDatabaseUrl(url!);
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getRuntimeConnectionString(),
  });
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient | null {
  if (!isPrismaEnabled()) return null;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}