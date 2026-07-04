import type { Metadata } from "next";
import { PricingSection } from "@/components/landing/pricing-section";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { pageKeywords } from "@/lib/seo/keywords";
import { productOffersJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "Pricing";
const description =
  "Revel pricing for founders and teams. Start free, upgrade for unlimited analyses, exports, and priority processing.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/pricing",
  keywords: pageKeywords.pricing,
});

export default function PricingPage() {
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
        extraSchemas={[productOffersJsonLd()]}
      />
      <PricingSection />
    </MarketingPage>
  );
}