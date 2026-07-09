import type { AuthenticatedPartner } from "@/lib/partner-auth";
import { getOkxAuditPriceUsd } from "@/lib/billing/okx-x402";
import { getPrisma } from "@/lib/prisma";

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
      hint: "Apply at /partners or contact hello@blindspotlab.xyz",
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
    hint: "Top up credits via admin or pay per audit. Contact hello@blindspotlab.xyz",
    priceUsd: getOkxAuditPriceUsd(),
  };
}

export async function consumePartnerCredit(partnerId: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.partner.update({
    where: { id: partnerId },
    data: { creditsBalance: { decrement: 1 } },
  });
}