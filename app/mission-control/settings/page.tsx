import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUserEmail, isClerkEnabled } from "@/lib/auth";
import { isStripeEnabled } from "@/lib/stripe";
import { SettingsBilling } from "@/components/dashboard/settings-billing";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const params = await searchParams;
  const email = await getCurrentUserEmail();
  const clerkEnabled = isClerkEnabled();
  const stripeEnabled = isStripeEnabled();

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Settings</h1>
      <p className="mt-2 text-muted">Manage your account and preferences.</p>

      {params.upgraded === "true" && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          Your plan has been upgraded successfully.
        </div>
      )}

      <div className="mt-8 space-y-4">
        <Card>
          <CardContent className="pt-0">
            <CardTitle>Theme</CardTitle>
            <p className="mt-2 text-sm text-muted">
              Warm light theme (default)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <CardTitle>Account</CardTitle>
            {clerkEnabled && email ? (
              <p className="mt-2 text-sm text-muted">{email}</p>
            ) : clerkEnabled ? (
              <p className="mt-2 text-sm text-muted">
                <NavLink href="/log-in" className="text-primary hover:underline">
                  Sign in
                </NavLink>{" "}
                to manage your account.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Authentication not configured. Add Clerk keys to enable accounts.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <CardTitle>Billing</CardTitle>
            {stripeEnabled ? (
              <SettingsBilling />
            ) : (
              <>
                <p className="mt-2 text-sm text-muted">
                  You&apos;re on the Starter plan. Stripe billing is not
                  configured yet.
                </p>
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}