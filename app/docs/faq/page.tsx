import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PRIMARY_CTA, PRIMARY_CTA_HREF } from "@/lib/cta";
import { faqGroups } from "@/lib/seo/faqs";
import { pageKeywords } from "@/lib/seo/keywords";
import { faqPageJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "FAQ";
const description =
  "Revel FAQ by topic: product, access and pricing, privacy, and integrations.";
const path = "/docs/faq";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: pageKeywords.faq,
});

export default function DocsFaqPage() {
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
        extraSchemas={[faqPageJsonLd()]}
      />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Help
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-lg text-muted">
          Grouped by topic so you can scan product, access, privacy, and
          integrations without a wall of questions.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          {faqGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {group.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-14">
          {faqGroups.map((group) => (
            <section key={group.id} id={group.id}>
              <h2 className="font-heading text-2xl font-semibold">
                {group.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{group.description}</p>
              <Accordion type="single" collapsible className="mt-6">
                {group.items.map((faq, i) => (
                  <AccordionItem
                    key={faq.question}
                    value={`${group.id}-${i}`}
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-muted">Ready to audit your product?</p>
          <Button asChild className="mt-4">
            <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
          </Button>
        </div>
      </div>
    </MarketingPage>
  );
}
