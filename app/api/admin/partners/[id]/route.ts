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
    const body = await request.json();
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
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}