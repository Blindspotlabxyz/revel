import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getStripe, isStripeEnabled, PLANS } from "@/lib/stripe";
import { siteConfig } from "@/lib/site-config";

export async function POST(request: Request) {
  try {
    if (!isStripeEnabled()) {
      return NextResponse.json(
        { error: "Billing is not configured yet. Contact support." },
        { status: 503 }
      );
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to upgrade your plan." },
        { status: 401 }
      );
    }

    const { plan } = await request.json();
    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const stripe = getStripe()!;
    const appUrl = siteConfig.url;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: selectedPlan.priceId
        ? [{ price: selectedPlan.priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: { name: `Revel ${selectedPlan.name}` },
                unit_amount: selectedPlan.price,
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
          ],
      success_url: `${appUrl}/mission-control/settings?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}