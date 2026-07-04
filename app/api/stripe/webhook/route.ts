import { NextResponse } from "next/server";
import { getStripe, isStripeEnabled } from "@/lib/stripe";
import { logEvent } from "@/lib/logger";

export async function POST(request: Request) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const stripe = getStripe()!;
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      logEvent("export_completed", {
        type: "subscription",
        userId: session.metadata?.userId,
        plan: session.metadata?.plan,
      });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}