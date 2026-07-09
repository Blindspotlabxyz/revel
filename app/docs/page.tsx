import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { docAudiencePaths } from "@/lib/docs/catalog";
import { pageKeywords } from "@/lib/seo/keywords";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Documentation";
const description =
  "Guides for founders, platform developers, AI agents, and OKX ecosystem operators.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/docs",
  keywords: pageKeywords.docs,
});

const audienceOrder = [
  "founders",
  "developers",
  "agents",
  "ecosystem",
] as const;

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
          Pick your path — {siteConfig.name} docs for founders, integrators,
          agents, and operators.
        </p>

        <div className="mt-12 space-y-14">
          {audienceOrder.map((audience) => {
            const section = docAudiencePaths[audience];
            return (
              <section key={audience}>
                <h2 className="font-heading text-2xl font-semibold">
                  {section.title}
                </h2>
                <p className="mt-2 text-muted">{section.subtitle}</p>
                <nav className="mt-5 grid gap-3 sm:grid-cols-2">
                  {section.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
                    >
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </nav>
              </section>
            );
          })}
        </div>

        <section className="mt-16 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-xl font-semibold">Quick start</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            <li>
              Open{" "}
              <Link
                href="/mission-control"
                className="text-primary hover:underline"
              >
                Mission Control
              </Link>
            </li>
            <li>Paste your product&apos;s public website URL</li>
            <li>Click Analyze Product and wait 1–3 minutes</li>
            <li>
              Review Reveal Index, Blindspots, Blueprint, and Action Queue
            </li>
            <li>Export your roadmap as Markdown or JSON</li>
          </ol>
          <Link
            href="/docs/getting-started"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Full getting started guide →
          </Link>
        </section>
      </div>
    </MarketingPage>
  );
}