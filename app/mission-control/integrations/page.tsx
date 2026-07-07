import type { Metadata } from "next";
import { IntegrationsSetup } from "@/components/dashboard/integrations-setup";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Export Integrations",
  description:
    "Step-by-step setup for GitHub Gist, Linear, and Notion exports from Revel Mission Control.",
  path: "/mission-control/integrations",
  noIndex: true,
});

export default function IntegrationsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl font-semibold">Export Integrations</h1>
      <p className="mt-2 text-muted">
        Connect GitHub, Linear, and Notion so you can push blueprints from any
        report. Markdown, JSON, and GitHub MD downloads work without setup.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <a href="#github" className="text-primary hover:underline">
          GitHub
        </a>
        <span className="text-muted">·</span>
        <a href="#linear" className="text-primary hover:underline">
          Linear
        </a>
        <span className="text-muted">·</span>
        <a href="#notion" className="text-primary hover:underline">
          Notion
        </a>
      </nav>

      <div className="mt-10">
        <IntegrationsSetup />
      </div>
    </div>
  );
}