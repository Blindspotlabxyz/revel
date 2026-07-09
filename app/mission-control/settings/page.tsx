import { NavLink } from "@/components/nav-link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCurrentUserEmail, isAuthEnabled } from "@/lib/auth";
import { getWeeklyAuditLimit } from "@/lib/weekly-audit-limit";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const email = await getCurrentUserEmail();
  const authEnabled = isAuthEnabled();
  const weeklyLimit = getWeeklyAuditLimit();

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-3xl font-semibold">Settings</h1>
      <p className="mt-2 text-muted">Manage your account and preferences.</p>

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
            {authEnabled && email ? (
              <p className="mt-2 text-sm text-muted">{email}</p>
            ) : authEnabled ? (
              <p className="mt-2 text-sm text-muted">
                <NavLink href="/log-in" className="text-primary hover:underline">
                  Sign in
                </NavLink>{" "}
                to manage your account.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Authentication not configured. Add NextAuth and Google OAuth keys to
                enable accounts.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <CardTitle>Usage</CardTitle>
            <p className="mt-2 text-sm text-muted">
              Mission Control includes {weeklyLimit} free product audits per week
              (resets Monday 00:00 UTC). OKX.AI is live for anyone who needs more
              than {weeklyLimit} per week: $0.35 per successful audit on the OKX.AI
              marketplace via the Revel MCP endpoint.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}