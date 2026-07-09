import { generatePartnerApiKey } from "@/lib/partner-keys";
import { getPrisma } from "@/lib/prisma";

export type PartnerRecord = {
  id: string;
  name: string;
  domain: string | null;
  contactEmail: string | null;
  status: string;
  accessType: string;
  creditsBalance: number;
  monthlyQuota: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  apiKeyCount: number;
  analysisCount: number;
};

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export async function listPartners(): Promise<PartnerRecord[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const rows = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { apiKeys: true, analyses: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    domain: row.domain,
    contactEmail: row.contactEmail,
    status: row.status,
    accessType: row.accessType,
    creditsBalance: row.creditsBalance,
    monthlyQuota: row.monthlyQuota,
    notes: row.notes,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    apiKeyCount: row._count.apiKeys,
    analysisCount: row._count.analyses,
  }));
}

export async function createPartnerApplication(input: {
  name: string;
  domain?: string;
  contactEmail: string;
  notes?: string;
}): Promise<{ id: string }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  const partner = await prisma.partner.create({
    data: {
      name: input.name.trim(),
      domain: input.domain ? normalizeDomain(input.domain) : null,
      contactEmail: input.contactEmail.trim().toLowerCase(),
      notes: input.notes?.trim() || null,
      status: "pending",
      accessType: "paid",
    },
  });

  return { id: partner.id };
}

export async function createPartnerAsAdmin(input: {
  name: string;
  domain?: string;
  contactEmail?: string;
  accessType: "paid" | "whitelisted" | "trial";
  status?: "pending" | "active" | "suspended";
  creditsBalance?: number;
  notes?: string;
}): Promise<{ id: string }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  const partner = await prisma.partner.create({
    data: {
      name: input.name.trim(),
      domain: input.domain ? normalizeDomain(input.domain) : null,
      contactEmail: input.contactEmail?.trim().toLowerCase() ?? null,
      accessType: input.accessType,
      status: input.status ?? "active",
      creditsBalance: input.creditsBalance ?? 0,
      notes: input.notes?.trim() || null,
    },
  });

  return { id: partner.id };
}

export async function updatePartner(
  id: string,
  data: Partial<{
    name: string;
    domain: string | null;
    contactEmail: string | null;
    status: string;
    accessType: string;
    creditsBalance: number;
    monthlyQuota: number | null;
    notes: string | null;
  }>
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  await prisma.partner.update({
    where: { id },
    data: {
      ...data,
      domain: data.domain ? normalizeDomain(data.domain) : data.domain,
      contactEmail: data.contactEmail?.trim().toLowerCase(),
      updatedAt: new Date(),
    },
  });
}

export async function issuePartnerApiKey(
  partnerId: string,
  label?: string
): Promise<{ key: string; prefix: string }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  const { key, prefix, hash } = generatePartnerApiKey();

  await prisma.partnerApiKey.create({
    data: {
      partnerId,
      keyPrefix: prefix,
      keyHash: hash,
      label: label?.trim() || "default",
    },
  });

  return { key, prefix };
}

export async function revokePartnerApiKeys(partnerId: string): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  const result = await prisma.partnerApiKey.updateMany({
    where: { partnerId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count;
}

export async function linkPartnerAnalysis(
  partnerId: string,
  analysisId: string
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.partnerAnalysis.create({
    data: { partnerId, analysisId },
  });
}

export async function partnerOwnsAnalysis(
  partnerId: string,
  analysisId: string
): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const row = await prisma.partnerAnalysis.findUnique({
    where: { analysisId },
  });

  return row?.partnerId === partnerId;
}