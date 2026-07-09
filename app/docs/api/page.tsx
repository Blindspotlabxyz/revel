import type { Metadata } from "next";
import Link from "next/link";
import {
  DocEndpoint,
  DocSection,
  DocsArticle,
} from "@/components/docs/docs-article";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { webApiJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";

const title = "Mission Control API";
const description =
  "REST endpoints for the Revel web app — analyze products, fetch reports, export roadmaps, and list history.";
const path = "/docs/api";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: ["Revel API", "product analysis API", "REST API", "Mission Control"],
});

const endpoints = [
  {
    method: "POST",
    path: "/api/analyze",
    body: '{ "url": "https://example.com" }',
    description:
      "Start a new product analysis. Requires signed-in session (NextAuth). Subject to 3 free audits per week.",
  },
  {
    method: "GET",
    path: "/api/report/:id",
    description:
      "Fetch analysis status and report JSON. Poll until status is completed.",
  },
  {
    method: "POST",
    path: "/api/export",
    body: '{ "id": "...", "format": "markdown" | "json" }',
    description: "Export Blueprint and Action Queue for a completed analysis.",
  },
  {
    method: "GET",
    path: "/api/history",
    description: "List previous analyses for the signed-in user.",
  },
  {
    method: "GET",
    path: "/api/mission-control/health",
    description: "Health check for Mission Control services.",
  },
];

export default function ApiDocsPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path={path}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: "API", path },
        ]}
        extraSchemas={[webApiJsonLd()]}
      />
      <DocsArticle
        title={title}
        description={description}
        path={path}
        related={[
          { href: "/docs/partners", label: "Partner API" },
          { href: "/docs/getting-started", label: "Getting started" },
          { href: "/docs/mcp", label: "MCP / A2MCP" },
        ]}
      >
        <DocSection title="Overview">
          <p>
            These endpoints power the Revel web app (Mission Control). They use
            session cookies from NextAuth — not API keys. For embedding Revel in
            your own platform (e.g. Arcapush), use the{" "}
            <Link href="/docs/partners" className="text-primary hover:underline">
              Partner API
            </Link>{" "}
            instead.
          </p>
        </DocSection>

        <DocSection title="Authentication">
          <p>
            Protected routes require an active browser session after sign-in.
            Server-to-server integrations should use{" "}
            <code>rvl_pk_</code> Partner API keys — see{" "}
            <Link
              href="/docs/integrations"
              className="text-primary hover:underline"
            >
              integration guide
            </Link>
            .
          </p>
        </DocSection>

        <DocSection title="Endpoints">
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <DocEndpoint
                key={endpoint.path}
                method={endpoint.method}
                path={endpoint.path}
                body={endpoint.body}
                description={endpoint.description}
              />
            ))}
          </div>
        </DocSection>

        <DocSection title="Paid agent routes">
          <p>
            AI agents on OKX.AI use MCP (<code>POST /api/mcp</code>) or the
            alternate HTTP route <code>POST /api/audit</code> with x402 billing.
            See{" "}
            <Link href="/docs/mcp" className="text-primary hover:underline">
              MCP docs
            </Link>{" "}
            and{" "}
            <Link href="/docs/ecosystem" className="text-primary hover:underline">
              OKX ecosystem
            </Link>
            .
          </p>
        </DocSection>
      </DocsArticle>
    </MarketingPage>
  );
}