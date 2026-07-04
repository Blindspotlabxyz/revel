"use client";

import Link from "next/link";
import { CheckoutButton } from "@/components/pricing/checkout-button";

export function SettingsBilling() {
  return (
    <div className="mt-2 space-y-4">
      <p className="text-sm text-muted">
        You&apos;re on the Starter plan. Upgrade for unlimited analyses and
        priority processing.
      </p>
      <div className="flex flex-wrap gap-3">
        <CheckoutButton plan="developer" variant="default">
          Upgrade to Developer ($19/mo)
        </CheckoutButton>
        <CheckoutButton plan="business" variant="secondary">
          Upgrade to Business ($49/mo)
        </CheckoutButton>
      </div>
      <p className="text-xs text-muted">
        Or{" "}
        <Link href="/pricing" className="text-primary hover:underline">
          compare all plans
        </Link>
      </p>
    </div>
  );
}