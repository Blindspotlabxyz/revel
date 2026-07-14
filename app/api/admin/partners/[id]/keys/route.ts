import { NextResponse } from "next/server";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { notifyPartnerApiKeyIssued } from "@/lib/email/notifications";
import {
  getPartnerById,
  issuePartnerApiKey,
  revokePartnerApiKeys,
} from "@/lib/partners";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getCurrentUserIsAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const partner = await getPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const revokeExisting = body.revokeExisting === true;

    if (revokeExisting) {
      await revokePartnerApiKeys(id);
    }

    const key = await issuePartnerApiKey(id, body.label ?? "rotated");

    if (partner.contactEmail) {
      notifyPartnerApiKeyIssued({
        name: partner.name,
        contactEmail: partner.contactEmail,
        apiKey: key.key,
        keyPrefix: key.prefix,
      });
    }

    return NextResponse.json({
      apiKey: key.key,
      apiKeyPrefix: key.prefix,
      warning: "Store this key now. It will not be shown again.",
      emailed: Boolean(partner.contactEmail),
    });
  } catch (error) {
    const { logServerError, toClientErrorMessage } = await import(
      "@/lib/safe-client-error"
    );
    logServerError("admin_partner_key_failed", error);
    return NextResponse.json(
      {
        error: toClientErrorMessage(error, "Could not issue partner key."),
      },
      { status: 500 }
    );
  }
}