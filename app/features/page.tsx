import type { Metadata } from "next";
import { FeaturesSection } from "@/components/landing/features-section";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { pageKeywords } from "@/lib/seo/keywords";
import { featuresItemListJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "Features";
const description =
  "Product analysis, UX review, messaging audit, competitor review, Reveal Index, and Blueprint roadmap. Everything Revel delivers.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/features",
  keywords: pageKeywords.features,
});

export default function FeaturesPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/features"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/features" },
        ]}
        extraSchemas={[featuresItemListJsonLd()]}
      />
      {/* Offset fixed marketing navbar */}
      <div className="pt-16">
        <FeaturesSection />
      </div>
    </MarketingPage>
  );
}