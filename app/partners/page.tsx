import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PartnerApplyForm } from "@/components/partners/partner-apply-form";
import { PageSeo } from "@/components/seo/page-seo";
import { getOkxAuditPriceUsd } from "@/lib/billing/okx-x402";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Partner API";
const description =
  "Integrate Revel audits into your platform — Reveal Index, blindspots, and Blueprint via REST API.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/partners",
  keywords: ["Revel API", "partner integration", "product audit API", "Arcapush"],
});

const priceUsd = getOkxAuditPriceUsd();

export default function PartnersPage() {
  const base = siteConfig.url;

  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/partners"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Partners", path: "/partners" },
        ]}
      />
      <div className="mx-auto max-w-2xl px-6 py-32">
        <p className="text-sm text-muted">
          <Link href="/docs" className="hover:text-foreground">
            ← Documentation
          </Link>
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold">Partner API</h1>
        <p className="mt-4 text-lg text-muted">
          Embed Revel checks in your product — listing quality, positioning, UX blindspots.
          Server-side REST API with partner keys. No MCP required.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Access models</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">Whitelisted</p>
              <p className="mt-2 text-sm text-muted">
                Admin-approved partners (e.g. Arcapush) — no per-call charge. Approved from
                Revel admin dashboard.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">Paid credits</p>
              <p className="mt-2 text-sm text-muted">
                ${priceUsd.toFixed(2)} per audit — prepaid credits on your partner account.
                Apply below, then top up after approval.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Quick start</h2>
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p>
              <span className="text-primary">GET</span> {base}/api/partner/v1/health
            </p>
            <p className="mt-2">
              <span className="text-primary">POST</span> {base}/api/partner/v1/analyze
            </p>
            <p className="mt-1 font-mono text-xs text-muted">
              Authorization: Bearer rvl_pk_…
            </p>
            <p className="mt-1 font-mono text-xs text-muted">Body: {"{ \"url\": \"https://example.com\" }"}</p>
            <p className="mt-2">
              <span className="text-primary">GET</span> {base}/api/partner/v1/report/:analysisId
            </p>
            <p className="mt-2 text-muted">
              Poll every 3s until <code>status</code> is <code>completed</code> (typically 1–3 min).
            </p>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Env vars (your server)</h2>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm">
{`REVEL_PARTNER_API_URL=${base}
REVEL_PARTNER_API_KEY=rvl_pk_...   # issued after approval — never in browser`}
          </pre>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Request access</h2>
          <p className="text-sm text-muted">
            Submit your platform details. We approve whitelisted partners manually; paid partners
            receive credits after payment confirmation.
          </p>
          <PartnerApplyForm />
        </section>
      </div>
    </MarketingPage>
  );
}