import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { Button } from "@/components/ui/button";
import {
  PRIMARY_CTA,
  PRIMARY_CTA_HREF,
  SECONDARY_CTA,
  SECONDARY_CTA_HREF,
} from "@/lib/cta";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "How to find product blindspots before your users do";
const description =
  "A practical guide for founders: spotting UX friction, weak messaging, and competitive gaps, then turning them into a prioritized roadmap with Revel.";
const path = "/guides/find-product-blindspots";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: pageKeywords.guides,
  ogType: "article",
});

export default function FindProductBlindspotsGuidePage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path={path}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides/find-product-blindspots" },
          { name: "Find product blindspots", path },
        ]}
      />

      <article className="mx-auto max-w-2xl px-6 pb-24 pt-32">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Guide
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight md:text-5xl">
          How to find product blindspots before your users do
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Most products do not fail from a missing feature. They stall because
          founders are too close to their own work: unclear value props, friction
          in onboarding, thin trust signals, and competitors who explain the
          same idea better.
        </p>

        <div className="mt-12 space-y-10 text-muted leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              1. Start with the first five seconds
            </h2>
            <p className="mt-4">
              Open your homepage as if you have never seen it. Can a stranger
              answer: what is this, who is it for, and why should I care? If
              those answers take more than a few seconds, messaging is already a
              growth tax.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              2. Walk the path to first value
            </h2>
            <p className="mt-4">
              Map the steps from land to signup to first useful outcome. Count
              forms, dead ends, and competing CTAs. Friction compounds: every
              extra decision costs a percentage of visitors who never return.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              3. Check trust before you check features
            </h2>
            <p className="mt-4">
              Logos, security notes, privacy links, and clear access model matter
              more early than a long feature grid. Buyers evaluate risk before
              they evaluate power.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              4. Compare yourself honestly
            </h2>
            <p className="mt-4">
              Pick two or three alternatives your buyers actually consider:
              generic AI chat, a free technical audit tool, or a consultant.
              Write one sentence on what you do that they cannot. If you cannot
              write that sentence, neither can your homepage.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              5. Ship a prioritized list, not a long audit
            </h2>
            <p className="mt-4">
              The useful output is not a score alone. It is an ordered plan:
              what to fix this week, what can wait, and what effort each item
              takes. That is why Revel returns a Reveal Index, blindspots,
              Blueprint, and Action Queue together.
            </p>
          </section>
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-surface p-8">
          <h2 className="font-heading text-2xl font-semibold">
            Run this on your product in minutes
          </h2>
          <p className="mt-3 text-muted">
            Paste your public URL. Get a scored audit and a roadmap you can
            export, without writing prompts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={SECONDARY_CTA_HREF}>{SECONDARY_CTA}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/compare">Compare alternatives</Link>
            </Button>
          </div>
        </div>
      </article>
    </MarketingPage>
  );
}
