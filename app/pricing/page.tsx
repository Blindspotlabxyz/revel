import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { Button } from "@/components/ui/button";
import { getOkxAuditPriceLabel } from "@/lib/billing/okx-x402";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  PRIMARY_CTA,
  PRIMARY_CTA_HREF,
  SECONDARY_CTA,
  SECONDARY_CTA_HREF,
} from "@/lib/cta";
import { DEFAULT_WEEKLY_AUDIT_LIMIT } from "@/lib/weekly-audit-limit";

const title = "Pricing";
const description =
  "Revel early access: free weekly Mission Control audits. No multi-tier SaaS pricing page yet. Agent audits via OKX.AI are usage-priced.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/pricing",
  keywords: pageKeywords.pricing,
});

export default function PricingPage() {
  const okxPrice = getOkxAuditPriceLabel();

  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/pricing"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/pricing" },
        ]}
      />

      <article className="mx-auto max-w-2xl px-6 pb-24 pt-32">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Early access
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold md:text-5xl">
          No published SaaS pricing yet.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          We are not selling Pro / Business tiers right now. During early
          access you can run product audits without a credit card or sales call.
        </p>

        <div className="mt-10 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold">
              Mission Control
            </h2>
            <p className="mt-2 text-muted">
              Up to {DEFAULT_WEEKLY_AUDIT_LIMIT} free audits per week (resets
              Monday 00:00 UTC). Export Markdown, JSON, and GitHub-ready
              blueprints.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold">OKX.AI agents</h2>
            <p className="mt-2 text-muted">
              About {okxPrice} per completed audit via MCP / A2MCP when you need
              more volume through agents.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold">Partners</h2>
            <p className="mt-2 text-muted">
              Embed Revel in your product with the Partner API. Whitelisted or
              prepaid credits.{" "}
              <Link href="/partners" className="text-primary hover:underline">
                Request access
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/compare">Compare Revel</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href={SECONDARY_CTA_HREF}>{SECONDARY_CTA}</Link>
          </Button>
        </div>
      </article>
    </MarketingPage>
  );
}
