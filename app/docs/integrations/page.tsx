import type { Metadata } from "next";
import Link from "next/link";
import {
  DocCode,
  DocSection,
  DocsArticle,
} from "@/components/docs/docs-article";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Integration Guide";
const description =
  "Embed Revel in your platform — Arcapush Revel Check walkthrough with Partner API, caching, and UI patterns.";
const path = "/docs/integrations";
const base = siteConfig.url;

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: [
    "Revel integration",
    "Arcapush Revel Check",
    "Partner API",
    "platform embed",
  ],
});

export default function IntegrationsDocsPage() {
  return (
    <MarketingPage>
      <PageSeo title={title} description={description} path={path} />
      <DocsArticle
        title={title}
        description={description}
        path={path}
        related={[
          { href: "/docs/partners", label: "Partner API reference" },
          { href: "/partners", label: "Apply for access" },
          { href: PUBLIC_SAMPLE_REPORT_PATH, label: "Sample audit output" },
        ]}
      >
        <DocSection title="Overview">
          <p>
            This guide walks through embedding Revel in a product directory like{" "}
            <strong className="text-foreground">Arcapush</strong> — a
            &quot;Revel Check&quot; on listing edit and founder dashboard. Use the{" "}
            <Link href="/docs/partners" className="text-primary hover:underline">
              Partner REST API
            </Link>
            , not MCP. All calls are server-side.
          </p>
        </DocSection>

        <DocSection title="Prerequisites">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Apply at{" "}
              <Link href="/partners" className="text-primary hover:underline">
                /partners
              </Link>{" "}
              with your platform domain and contact email.
            </li>
            <li>
              After admin approval, receive a key starting with{" "}
              <code>rvl_pk_</code> (shown once — store in your secrets manager).
            </li>
            <li>
              Whitelisted partners run audits at no per-call charge; paid partners
              use prepaid credits.
            </li>
          </ol>
        </DocSection>

        <DocSection title="Environment (your server)">
          <DocCode>{`REVEL_PARTNER_API_URL=${base}
REVEL_PARTNER_API_KEY=rvl_pk_...    # never expose to the browser
REVEL_CACHE_TTL_HOURS=24`}</DocCode>
        </DocSection>

        <DocSection title="Integration flow">
          <DocCode>{`Founder clicks "Run Revel Check"
  → Your API route (e.g. POST /api/listings/:id/revel-check)
    → Revel POST /api/partner/v1/analyze  { url: listing.website_url }
    → Poll GET /api/partner/v1/report/:id every 3s (1–3 min)
    → Cache score + top blindspots on listing (24h TTL)
    → Display insights only — do not auto-edit listing fields`}</DocCode>
        </DocSection>

        <DocSection title="Server client (TypeScript)">
          <DocCode>{`const REVEL = process.env.REVEL_PARTNER_API_URL ?? "${base}";
const KEY = process.env.REVEL_PARTNER_API_KEY!;

export async function revelAnalyze(url: string) {
  const res = await fetch(\`\${REVEL}/api/partner/v1/analyze\`, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
  return res.json() as Promise<{ analysisId: string; poll: string }>;
}

export async function revelPollReport(analysisId: string, maxMs = 180_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await fetch(\`\${REVEL}/api/partner/v1/report/\${analysisId}\`, {
      headers: { Authorization: \`Bearer \${KEY}\` },
    });
    const data = await res.json();
    if (data.status === "completed" && data.report) return data;
    if (data.status === "failed") throw new Error(data.error ?? "Analysis failed");
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Revel analysis timed out");
}`}</DocCode>
        </DocSection>

        <DocSection title="Suggested cache columns">
          <p>
            Store audit results on your listing record. Example schema additions:
          </p>
          <DocCode>{`revel_score            INTEGER
revel_summary          TEXT
revel_top_blindspots   JSONB      -- top 5 items
revel_analysis_id      TEXT
revel_checked_at       TIMESTAMPTZ
revel_cache_expires_at TIMESTAMPTZ`}</DocCode>
          <p>
            <strong className="text-foreground">Forbidden:</strong> auto-updating
            title, problem statement, description, or any user-authored listing
            copy. Revel is display-only guidance.
          </p>
        </DocSection>

        <DocSection title="UI patterns">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">RevelCheckPanel</strong> on
              listing edit + founder dashboard
            </li>
            <li>States: idle → loading (~2 min) → score + top blindspots</li>
            <li>
              Show &quot;Checked X ago&quot; when cache is valid; secondary
              &quot;Run again&quot; CTA
            </li>
            <li>
              Map <code>messaging</code> blindspots to &quot;Update problem
              statement / tagline&quot; hints
            </li>
          </ul>
          <p>
            Reference output:{" "}
            <Link
              href={PUBLIC_SAMPLE_REPORT_PATH}
              className="text-primary hover:underline"
            >
              Arcapush genesis report
            </Link>{" "}
            (Reveal Index 55, 8 blindspots).
          </p>
        </DocSection>

        <DocSection title="Error handling">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">401</strong> — invalid or
              missing API key
            </li>
            <li>
              <strong className="text-foreground">402</strong> — paid partner, no
              credits remaining
            </li>
            <li>
              <strong className="text-foreground">403</strong> — application
              pending; contact Revel admin
            </li>
            <li>
              <strong className="text-foreground">429</strong> — rate limit
              (30/min per partner); retry after 1 minute
            </li>
          </ul>
        </DocSection>

        <DocSection title="Arcapush-specific notes">
          <p>
            Arcapush is seeded as <code>arcapush.com</code> (whitelisted). Revel
            admin approves in Mission Control → Partners, then issues the API key.
            With 100+ products, cache aggressively (24h) and surface only the
            Reveal Index plus top blindspots — full Blueprint stays in Revel for
            founders who want depth.
          </p>
        </DocSection>
      </DocsArticle>
    </MarketingPage>
  );
}