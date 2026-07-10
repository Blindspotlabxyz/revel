import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserIntegrationsPanel } from "@/components/dashboard/user-integrations-panel";
import { isAuthEnabled } from "@/lib/auth";
import { auth } from "@/auth";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Export Integrations",
  description:
    "Connect your Linear, Notion, and GitHub accounts for private blueprint exports.",
  path: "/mission-control/integrations",
  noIndex: true,
});

export default async function IntegrationsPage() {
  if (isAuthEnabled()) {
    const session = await auth();
    if (!session?.user) {
      redirect("/log-in?redirect_url=/mission-control/integrations");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl font-semibold">
        Export integrations
      </h1>
      <p className="mt-2 text-muted">
        Connect your own Linear, Notion, and GitHub. Each export stays in your
        account — other Revel users cannot open it unless you share the link.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <a href="#linear" className="text-primary hover:underline">
          Linear
        </a>
        <span className="text-muted">·</span>
        <a href="#notion" className="text-primary hover:underline">
          Notion
        </a>
        <span className="text-muted">·</span>
        <a href="#github" className="text-primary hover:underline">
          GitHub
        </a>
      </nav>

      <div className="mt-10">
        <UserIntegrationsPanel />
      </div>
    </div>
  );
}
