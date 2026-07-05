import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { webApiJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "API Reference";
const description =
  "Revel HTTP API to analyze products, fetch reports, export roadmaps, and list history.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/docs/api",
  keywords: ["Revel API", "product analysis API", "REST API"],
});

const endpoints = [
  {
    method: "POST",
    path: "/api/analyze",
    body: "{ url: string }",
    description: "Start a new product analysis.",
  },
  {
    method: "GET",
    path: "/api/report/:id",
    description: "Fetch a completed analysis report.",
  },
  {
    method: "POST",
    path: "/api/export",
    body: "{ id: string, format: 'markdown' | 'json' }",
    description: "Export blueprint and action queue.",
  },
  {
    method: "GET",
    path: "/api/history",
    description: "List previous analyses for the signed-in user.",
  },
];

export default function ApiDocsPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/docs/api"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: "API", path: "/docs/api" },
        ]}
        extraSchemas={[webApiJsonLd()]}
      />
      <div className="mx-auto max-w-2xl px-6 py-32">
        <p className="text-sm text-muted">
          <Link href="/docs" className="hover:text-foreground">
            ← Documentation
          </Link>
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold">API</h1>
        <p className="mt-4 text-lg text-muted">
          REST endpoints on the main Revel app. Authentication required for
          protected routes when NextAuth is enabled.
        </p>

        <div className="mt-12 space-y-4">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <p className="font-medium">
                <span className="text-primary">{endpoint.method}</span>{" "}
                {endpoint.path}
              </p>
              {endpoint.body ? (
                <p className="mt-1 font-mono text-xs text-muted">
                  Body: {endpoint.body}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-muted">{endpoint.description}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingPage>
  );
}