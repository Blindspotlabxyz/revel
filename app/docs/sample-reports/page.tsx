import type { Metadata } from "next";
import Link from "next/link";
import { GenesisStatCards } from "@/components/landing/genesis-stat-cards";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { Button } from "@/components/ui/button";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";
import { siteConfig } from "@/lib/site-config";

const title = "Sample Reports";
const description =
  "See what a Revel analysis looks like: Reveal Index, blindspots, blueprint, and exportable action queue.";
const path = "/docs/sample-reports";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: pageKeywords["sample-reports"],
});

export default function DocsSampleReportsPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path={path}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: title, path },
        ]}
      />
      <section className="border-t border-border bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl font-semibold md:text-4xl">
            A report your team can act on.
          </h1>
          <p className="mt-4 max-w-[680px] text-lg text-muted">
            Real output from Revel&apos;s live audit of Arcapush — Reveal Index,
            blindspots, blueprint, and action queue.
          </p>
          <GenesisStatCards className="mt-12" />
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <Button asChild size="lg">
          <Link href={PUBLIC_SAMPLE_REPORT_PATH}>View genesis report (live)</Link>
        </Button>
        <p className="mt-4 text-sm text-muted">
          Run {siteConfig.name} on your own product from Mission Control.
        </p>
      </div>
    </MarketingPage>
  );
}