import { NextResponse } from "next/server";
import { notifyPartnerApplicationReceived } from "@/lib/email/notifications";
import { createPartnerApplication } from "@/lib/partners";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { success } = rateLimit(getRateLimitKey(request), 5, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many applications. Try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const name = body.name?.toString().trim();
    const contactEmail = body.contactEmail?.toString().trim().toLowerCase();
    const domain = body.domain?.toString().trim();
    const notes = body.notes?.toString().trim();

    if (!name || !contactEmail) {
      return NextResponse.json(
        { error: "name and contactEmail are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { error: "contactEmail must be a valid email address" },
        { status: 400 }
      );
    }

    const result = await createPartnerApplication({
      name,
      contactEmail,
      domain,
      notes,
    });

    notifyPartnerApplicationReceived({
      name,
      contactEmail,
      domain: domain || null,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message:
        "Application received. We will review and email your API key when approved.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Application failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}