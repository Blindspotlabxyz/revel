import type { Metadata } from "next";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { pageKeywords } from "@/lib/seo/keywords";
import { howToJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "How It Works";
const description =
  "See how Revel analyzes your website, reveals blindspots, and generates a prioritized product roadmap in under a minute.";
const path = "/docs/how-it-works";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: pageKeywords["how-it-works"],
});

export default function DocsHowItWorksPage() {
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
        extraSchemas={[howToJsonLd()]}
      />
      <HowItWorks />
    </MarketingPage>
  );
}