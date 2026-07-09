import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getCurrentUserIsAdmin } from "@/lib/auth";

export async function MissionControlNav() {
  const isAdmin = await getCurrentUserIsAdmin();
  return <DashboardNav isAdmin={isAdmin} />;
}