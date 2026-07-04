import type { Metadata } from "next";
import Link from "next/link";
import { SampleResult } from "@/components/landing/sample-result";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { Button } from "@/components/ui/button";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Sample Reports";
const description =
  "See what a Revel analysis looks like — Reveal Index, blindspots, blueprint, and exportable action queue.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/sample-reports",
  keywords: pageKeywords["sample-reports"],
});

export default function SampleReportsPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/sample-reports"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/sample-reports" },
        ]}
      />
      <SampleResult />
      <div className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <Button asChild size="lg">
          <Link href="/mission-control/sample">View full sample report</Link>
        </Button>
        <p className="mt-4 text-sm text-muted">
          Run {siteConfig.name} on your own product from Mission Control.
        </p>
      </div>
    </MarketingPage>
  );
}