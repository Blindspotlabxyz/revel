import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InsightSection } from "@/components/landing/insight-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SampleResult } from "@/components/landing/sample-result";
import { MapSection } from "@/components/landing/map-section";
import { ExportSection } from "@/components/landing/export-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { PageSeo } from "@/components/seo/page-seo";
import { pageKeywords } from "@/lib/seo/keywords";
import {
  faqPageJsonLd,
  softwareApplicationJsonLd,
  speakableWebPageJsonLd,
} from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
  keywords: pageKeywords.home,
});

export default function HomePage() {
  return (
    <>
      <PageSeo
        title={siteConfig.name}
        description={siteConfig.description}
        path="/"
        extraSchemas={[
          faqPageJsonLd(),
          softwareApplicationJsonLd(),
          speakableWebPageJsonLd({
            title: siteConfig.name,
            description: siteConfig.description,
            path: "/",
          }),
        ]}
      />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSection />
        <HowItWorks />
        <InsightSection />
        <FeaturesSection />
        <SampleResult />
        <MapSection />
        <ExportSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}