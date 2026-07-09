import { redirect } from "next/navigation";
import { PartnersAdmin } from "@/components/dashboard/partners-admin";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { listPartners } from "@/lib/partners";

export const dynamic = "force-dynamic";

export default async function PartnersAdminPage() {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) redirect("/mission-control");

  const partners = await listPartners();

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-3xl font-semibold">Partners</h1>
      <p className="mt-2 text-muted">
        Approve platforms, whitelist Arcapush, issue API keys, and manage credits.
      </p>
      <div className="mt-8">
        <PartnersAdmin initialPartners={partners} />
      </div>
    </div>
  );
}