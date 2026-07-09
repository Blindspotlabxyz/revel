import { NextResponse } from "next/server";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { issuePartnerApiKey, revokePartnerApiKeys } from "@/lib/partners";

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
    const body = await request.json().catch(() => ({}));
    const revokeExisting = body.revokeExisting === true;

    if (revokeExisting) {
      await revokePartnerApiKeys(id);
    }

    const key = await issuePartnerApiKey(id, body.label ?? "rotated");
    return NextResponse.json({
      apiKey: key.key,
      apiKeyPrefix: key.prefix,
      warning: "Store this key now. It will not be shown again.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Key issue failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}