import { redirect } from "next/navigation";
import { AnalyticsDashboardView } from "@/components/dashboard/analytics-dashboard";
import { getAnalyticsDashboard } from "@/lib/analytics";
import { getCurrentUserIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) {
    redirect("/mission-control");
  }

  const dashboard = await getAnalyticsDashboard();

  return (
    <div className="max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold">Analytics</h1>
      <p className="mt-2 text-muted">
        Usage across Mission Control, OKX marketplace MCP, and paid API routes.
      </p>

      <div className="mt-8">
        {dashboard ? (
          <AnalyticsDashboardView data={dashboard} />
        ) : (
          <p className="text-sm text-muted">
            Analytics requires a configured database. Run the admin migration SQL in
            Supabase, then refresh.
          </p>
        )}
      </div>
    </div>
  );
}