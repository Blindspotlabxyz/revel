import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { isAuthEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

function userInitial(label: string): string {
  return label.charAt(0).toUpperCase();
}

export default async function AccountPage() {
  if (!isAuthEnabled()) {
    redirect("/mission-control/settings");
  }

  const session = await auth();

  if (!session?.user) {
    redirect("/log-in?redirect_url=/mission-control/account");
  }

  const { user } = session;
  const label = user.name ?? user.email ?? "Account";

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-muted">Your Revel profile and sign-in details.</p>

      <Card className="mt-8">
        <CardContent className="pt-0">
          <CardTitle>Profile</CardTitle>
          <div className="mt-4 flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={label}
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-lg font-medium">
                {userInitial(label)}
              </span>
            )}
            <div>
              <p className="font-medium text-foreground">
                {user.name ?? "Revel user"}
              </p>
              {user.email ? (
                <p className="text-sm text-muted">{user.email}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

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