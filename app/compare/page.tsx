import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { CompareTable } from "@/components/landing/compare-table";
import { PageSeo } from "@/components/seo/page-seo";
import { Button } from "@/components/ui/button";
import { competitorCards } from "@/lib/compare-data";
import { getOkxAuditPriceLabel } from "@/lib/billing/okx-x402";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  PRIMARY_CTA,
  PRIMARY_CTA_HREF,
  SECONDARY_CTA,
  SECONDARY_CTA_HREF,
} from "@/lib/cta";
import { DEFAULT_WEEKLY_AUDIT_LIMIT } from "@/lib/weekly-audit-limit-config";

const title = "Compare Revel";
const description =
  "See how Revel compares to ChatGPT, Lighthouse-style audit tools, and product consultants. Structured product strategy, not generic AI chat.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/compare",
  keywords: pageKeywords.compare,
});

export default function ComparePage() {
  const okxPrice = getOkxAuditPriceLabel();

  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/compare"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ]}
      />

      <article className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Differentiation
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Revel vs ChatGPT, audit tools, and consultants.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Founders often ask: why not just ask an AI chat, run Lighthouse, or
          hire a strategist? Revel is built for one job: turn a public product
          URL into a prioritized roadmap your team can execute.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href={SECONDARY_CTA_HREF}>{SECONDARY_CTA}</Link>
          </Button>
        </div>

        <section className="mt-16">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            Side-by-side
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Honest comparison against the alternatives people actually try
            first.
          </p>
          <div className="mt-8">
            <CompareTable />
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            Why founders outgrow the alternatives
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {competitorCards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-border bg-surface p-6 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {card.name}
                </p>
                <h3 className="mt-3 font-heading text-lg font-semibold leading-snug">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-border bg-surface p-8 md:p-10">
          <h2 className="font-heading text-2xl font-semibold">
            Access today (no published SaaS pricing yet)
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            We are not shipping a multi-tier pricing page yet. Early access is
            intentionally simple so you can run audits without a sales call.
          </p>
          <ul className="mt-6 space-y-3 text-muted">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Mission Control</strong>
                {" — "}
                up to {DEFAULT_WEEKLY_AUDIT_LIMIT} free audits per week during
                early access (resets Monday 00:00 UTC).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">OKX.AI agents</strong>
                {" — "}
                usage-priced at about {okxPrice} per completed audit via MCP /
                A2MCP.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Partner API</strong>
                {" — "}
                embed Revel in your product; whitelisted or prepaid credits.{" "}
                <Link
                  href="/partners"
                  className="font-medium text-primary hover:underline"
                >
                  Partner details
                </Link>
              </span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/features">Explore features</Link>
            </Button>
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-heading text-3xl font-semibold">
            See the difference on a real report
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Read a live Genesis report, then run Revel on your own product URL.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={SECONDARY_CTA_HREF}>{SECONDARY_CTA}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
            </Button>
          </div>
        </section>
      </article>
    </MarketingPage>
  );
}
