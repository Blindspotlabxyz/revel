import { NextResponse } from "next/server";
import { getAnalyticsDashboard } from "@/lib/analytics";
import { getCurrentUserIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const dashboard = await getAnalyticsDashboard();
  if (!dashboard) {
    return NextResponse.json(
      { error: "Analytics unavailable. Database is not configured." },
      { status: 503 }
    );
  }

  return NextResponse.json(dashboard);
}