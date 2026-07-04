import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Documentation";
const description =
  "Get started with Revel — quick start guide, API reference, FAQ, and sample reports.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/docs",
  keywords: pageKeywords.docs,
});

export default function DocsPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/docs"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/docs" },
        ]}
        extraSchemas={[
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: title,
            description,
            author: { "@id": `${siteConfig.url}/#organization` },
          },
        ]}
      />
      <div className="mx-auto max-w-2xl px-6 py-32">
        <h1 className="font-heading text-4xl font-semibold">Documentation</h1>
        <p className="mt-4 text-lg text-muted">
          Everything you need to get started with {siteConfig.name}.
        </p>

        <nav className="mt-10 grid gap-3 sm:grid-cols-2">
          {[
            { href: "/docs/api", label: "API Reference", desc: "REST endpoints" },
            { href: "/faq", label: "FAQ", desc: "Common questions" },
            {
              href: "/sample-reports",
              label: "Sample Reports",
              desc: "See example output",
            },
            {
              href: "/how-it-works",
              label: "How It Works",
              desc: "Analysis flow",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
            >
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-sm text-muted">{item.desc}</p>
            </Link>
          ))}
        </nav>

        <section className="mt-12 space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Quick Start</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
              <li>Go to Mission Control</li>
              <li>Paste your website URL</li>
              <li>Click Analyze Product</li>
              <li>
                Review your Reveal Index, Blindspot Map, Blueprint, and Action
                Queue
              </li>
              <li>Export your roadmap as Markdown or JSON</li>
            </ol>
          </div>
        </section>

        <Link
          href="/mission-control"
          className="mt-12 inline-block text-primary hover:underline"
        >
          Go to Mission Control →
        </Link>
      </div>
    </MarketingPage>
  );
}