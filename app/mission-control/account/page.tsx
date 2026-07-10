import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsForm } from "@/components/auth/account-settings-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { isAuthEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!isAuthEnabled()) {
    redirect("/mission-control/settings");
  }

  const session = await auth();

  if (!session?.user) {
    redirect("/log-in?redirect_url=/mission-control/account");
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-muted">
        Edit your profile, username, and password.
      </p>

      <AccountSettingsForm />

      <Card className="mt-4">
        <CardContent className="pt-0">
          <CardTitle>Session</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Sign out of Revel on this device.
          </p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
