import { NextResponse } from "next/server";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import {
  notifyPartnerApiKeyIssued,
  notifyPartnerApproved,
} from "@/lib/email/notifications";
import {
  createPartnerAsAdmin,
  issuePartnerApiKey,
  listPartners,
} from "@/lib/partners";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getCurrentUserIsAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const partners = await listPartners();
  return NextResponse.json({ partners });
}

export async function POST(request: Request) {
  if (!(await getCurrentUserIsAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { partner } = body as {
      partner: {
        name: string;
        domain?: string;
        contactEmail?: string;
        accessType: "paid" | "whitelisted" | "trial";
        status?: "pending" | "active" | "suspended";
        creditsBalance?: number;
        notes?: string;
      };
      issueKey?: boolean;
    };

    if (!partner?.name || !partner?.accessType) {
      return NextResponse.json(
        { error: "partner.name and partner.accessType are required" },
        { status: 400 }
      );
    }

    const created = await createPartnerAsAdmin(partner);

    if (
      partner.contactEmail &&
      (partner.status ?? "active") === "active"
    ) {
      notifyPartnerApproved({
        name: partner.name,
        contactEmail: partner.contactEmail,
        accessType: partner.accessType,
      });
    }

    if (body.issueKey) {
      const key = await issuePartnerApiKey(created.id, "initial");
      if (partner.contactEmail) {
        notifyPartnerApiKeyIssued({
          name: partner.name,
          contactEmail: partner.contactEmail,
          apiKey: key.key,
          keyPrefix: key.prefix,
        });
      }
      return NextResponse.json({
        partnerId: created.id,
        apiKey: key.key,
        apiKeyPrefix: key.prefix,
        warning: "Store this key now. It will not be shown again.",
        emailed: Boolean(partner.contactEmail),
      });
    }

    return NextResponse.json({ partnerId: created.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}