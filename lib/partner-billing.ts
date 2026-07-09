import type { AuthenticatedPartner } from "@/lib/partner-auth";
import { getOkxAuditPriceUsd } from "@/lib/billing/okx-x402";
import { getPrisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

const supportEmail = siteConfig.organization.email;

export type PartnerBillingCheck =
  | { allowed: true; mode: "whitelisted" | "credits" | "trial" }
  | {
      allowed: false;
      status: number;
      error: string;
      hint?: string;
      priceUsd?: number;
    };

export function checkPartnerBilling(
  partner: AuthenticatedPartner
): PartnerBillingCheck {
  if (partner.status === "pending") {
    return {
      allowed: false,
      status: 403,
      error: "Partner account pending approval",
      hint: `Apply at /partners or contact ${supportEmail}`,
    };
  }

  if (partner.status === "suspended") {
    return {
      allowed: false,
      status: 403,
      error: "Partner account suspended",
    };
  }

  if (partner.accessType === "whitelisted" || partner.accessType === "trial") {
    return { allowed: true, mode: partner.accessType };
  }

  if (partner.creditsBalance > 0) {
    return { allowed: true, mode: "credits" };
  }

  return {
    allowed: false,
    status: 402,
    error: "Partner credits required",
    hint: `Top up credits via admin or pay per audit. Contact ${supportEmail}`,
    priceUsd: getOkxAuditPriceUsd(),
  };
}

/** Atomically reserve one credit. Returns false if balance is zero. */
export async function reservePartnerCredit(partnerId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const result = await prisma.partner.updateMany({
    where: { id: partnerId, creditsBalance: { gt: 0 } },
    data: { creditsBalance: { decrement: 1 } },
  });

  return result.count > 0;
}