import type { Metadata } from "next";
import Link from "next/link";
import {
  DocCode,
  DocEndpoint,
  DocSection,
  DocsArticle,
} from "@/components/docs/docs-article";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { getOkxAuditPriceUsd } from "@/lib/billing/okx-x402";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Partner API";
const description =
  "Integrate Revel audits into your platform with server-side REST API keys.";
const path = "/docs/partners";
const base = siteConfig.url;

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: ["Revel Partner API", "platform integration", "rvl_pk_"],
});

export default function PartnerApiDocsPage() {
  const price = getOkxAuditPriceUsd();

  return (
    <MarketingPage>
      <PageSeo title={title} description={description} path={path} />
      <DocsArticle
        title={title}
        description={description}
        path={path}
        related={[
          { href: "/docs/integrations", label: "Integration guide" },
          { href: "/partners", label: "Apply for access" },
          { href: "/docs/api", label: "Mission Control API" },
        ]}
      >
        <DocSection title="Overview">
          <p>
            The Partner API lets platforms (e.g. Arcapush) run Revel audits
            server-side and display Reveal Index, blindspots, and Blueprint to
            their users. Use REST — no MCP required.
          </p>
          <p>
            Apply at{" "}
            <Link href="/partners" className="text-primary hover:underline">
              /partners
            </Link>
            . After approval you receive a key starting with{" "}
            <code>rvl_pk_</code>.
          </p>
        </DocSection>

        <DocSection title="Access models">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Whitelisted</strong> — admin-approved partners, no per-call charge
            </li>
            <li>
              <strong className="text-foreground">Trial</strong> — limited free access
            </li>
            <li>
              <strong className="text-foreground">Paid</strong> — prepaid credits (${price.toFixed(2)} per audit)
            </li>
          </ul>
        </DocSection>

        <DocSection title="Authentication">
          <p>Server-side only. Never expose keys in browser code.</p>
          <DocCode>{`Authorization: Bearer rvl_pk_...
# or
X-Revel-Partner-Key: rvl_pk_...`}</DocCode>
        </DocSection>

        <DocSection title="Endpoints">
          <div className="space-y-4">
            <DocEndpoint
              method="GET"
              path="/api/partner/v1/health"
              description="Service info, pricing, and endpoint list. No auth required."
            />
            <DocEndpoint
              method="POST"
              path="/api/partner/v1/analyze"
              body='{ "url": "https://example.com" }'
              description="Start an audit. Returns analysisId and poll URL."
            />
            <DocEndpoint
              method="GET"
              path="/api/partner/v1/report/:analysisId"
              description="Poll until status is completed. Partners only see their own analyses."
            />
          </div>
        </DocSection>

        <DocSection title="Integration flow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>POST analyze with the product&apos;s public URL</li>
            <li>Poll GET report every 3s (typically 1–3 min)</li>
            <li>Cache score + top blindspots (recommended 24h TTL)</li>
            <li>Display insights only — do not auto-edit user content</li>
          </ol>
        </DocSection>

        <DocSection title="Example (Node.js)">
          <DocCode>{`const REVEL = "${base}";
const KEY = process.env.REVEL_PARTNER_API_KEY;

const start = await fetch(\`\${REVEL}/api/partner/v1/analyze\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: "https://example.com" }),
});
const { analysisId } = await start.json();

// Poll until completed
let report;
while (true) {
  const res = await fetch(\`\${REVEL}/api/partner/v1/report/\${analysisId}\`, {
    headers: { Authorization: \`Bearer \${KEY}\` },
  });
  report = await res.json();
  if (report.status === "completed") break;
  if (report.status === "failed") throw new Error(report.error);
  await new Promise((r) => setTimeout(r, 3000));
}

console.log(report.score, report.report.blindspots);`}</DocCode>
        </DocSection>

        <DocSection title="Errors">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-foreground">401</strong> — invalid or missing API key</li>
            <li><strong className="text-foreground">402</strong> — paid partner, no credits</li>
            <li><strong className="text-foreground">403</strong> — pending approval</li>
            <li><strong className="text-foreground">429</strong> — rate limit (30/min per partner)</li>
          </ul>
        </DocSection>

        <DocSection title="Env vars (your server)">
          <DocCode>{`REVEL_PARTNER_API_URL=${base}
REVEL_PARTNER_API_KEY=rvl_pk_...
REVEL_CACHE_TTL_HOURS=24`}</DocCode>
        </DocSection>
      </DocsArticle>
    </MarketingPage>
  );
}