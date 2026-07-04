import type { Metadata } from "next";
import { FaqSection } from "@/components/landing/faq-section";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { pageKeywords } from "@/lib/seo/keywords";
import { faqPageJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "FAQ";
const description =
  "Frequently asked questions about Revel — what it analyzes, how long it takes, exports, AI usage, pricing, and who it's built for.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/faq",
  keywords: pageKeywords.faq,
});

export default function FaqPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/faq"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/faq" },
        ]}
        extraSchemas={[faqPageJsonLd()]}
      />
      <FaqSection />
    </MarketingPage>
  );
}