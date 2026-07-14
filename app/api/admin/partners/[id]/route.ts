import { NextResponse } from "next/server";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { notifyPartnerApproved } from "@/lib/email/notifications";
import { getPartnerById, updatePartner } from "@/lib/partners";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getCurrentUserIsAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const before = await getPartnerById(id);
    const raw = await request.json();
    const body: Parameters<typeof updatePartner>[1] = {};

    if (typeof raw.name === "string") body.name = raw.name;
    if (raw.domain === null || typeof raw.domain === "string") {
      body.domain = raw.domain;
    }
    if (raw.contactEmail === null || typeof raw.contactEmail === "string") {
      body.contactEmail = raw.contactEmail;
    }
    if (typeof raw.status === "string") body.status = raw.status;
    if (typeof raw.accessType === "string") body.accessType = raw.accessType;
    if (typeof raw.creditsBalance === "number") {
      body.creditsBalance = raw.creditsBalance;
    }
    if (raw.monthlyQuota === null || typeof raw.monthlyQuota === "number") {
      body.monthlyQuota = raw.monthlyQuota;
    }
    if (raw.notes === null || typeof raw.notes === "string") {
      body.notes = raw.notes;
    }

    if (!Object.keys(body).length) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await updatePartner(id, body);

    const after = await getPartnerById(id);
    if (
      before?.status !== "active" &&
      after?.status === "active" &&
      after.contactEmail
    ) {
      notifyPartnerApproved({
        name: after.name,
        contactEmail: after.contactEmail,
        accessType: after.accessType,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { logServerError, toClientErrorMessage } = await import(
      "@/lib/safe-client-error"
    );
    logServerError("admin_partner_update_failed", error);
    return NextResponse.json(
      {
        error: toClientErrorMessage(error, "Could not update partner."),
      },
      { status: 500 }
    );
  }
}