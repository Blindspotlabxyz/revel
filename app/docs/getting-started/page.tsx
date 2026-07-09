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

const title = "Getting Started";
const description =
  "Sign in to Mission Control, run your first Revel audit, and export your Blueprint.";
const path = "/docs/getting-started";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: ["Revel getting started", "Mission Control", "first audit"],
});

export default function GettingStartedPage() {
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
      />
      <DocsArticle
        title={title}
        description={description}
        path={path}
        related={[
          { href: "/docs/how-it-works", label: "How it works" },
          { href: "/docs/sample-reports", label: "Sample reports" },
          { href: "/mission-control", label: "Mission Control" },
        ]}
      >
        <DocSection title="1. Create an account">
          <p>
            Go to{" "}
            <Link href="/mission-control" className="text-primary hover:underline">
              Mission Control
            </Link>{" "}
            and sign in with Google or email/password. Your analyses are saved to
            your account history.
          </p>
        </DocSection>

        <DocSection title="2. Run an audit">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Paste a public website URL (your product homepage works best).</li>
            <li>Click <strong className="text-foreground">Analyze Product</strong>.</li>
            <li>Wait 1–3 minutes while Revel reviews product, UX, messaging, and competition.</li>
            <li>Open the report when status shows completed.</li>
          </ol>
        </DocSection>

        <DocSection title="3. Read your deliverables">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Reveal Index</strong> — 0–100 product health score
            </li>
            <li>
              <strong className="text-foreground">Blindspots</strong> — prioritized issues with suggested fixes
            </li>
            <li>
              <strong className="text-foreground">Blueprint</strong> — ordered improvement sequence
            </li>
            <li>
              <strong className="text-foreground">Action Queue</strong> — concrete tasks to export
            </li>
          </ul>
          <p>
            See a real example:{" "}
            <Link href={PUBLIC_SAMPLE_REPORT_PATH} className="text-primary hover:underline">
              Arcapush genesis report
            </Link>
            .
          </p>
        </DocSection>

        <DocSection title="4. Export and share">
          <p>
            From any completed report, export Markdown or JSON. Optional integrations:
            GitHub Gist, Linear, Notion (when configured on the server).
          </p>
        </DocSection>

        <DocSection title="Usage limits">
          <p>
            Mission Control includes <strong className="text-foreground">3 free audits per week</strong>{" "}
            (resets Monday 00:00 UTC). Need more volume?
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link href="/partners" className="text-primary hover:underline">
                Partner API
              </Link>{" "}
              — embed Revel in your platform
            </li>
            <li>
              <Link href="/docs/ecosystem" className="text-primary hover:underline">
                OKX.AI marketplace
              </Link>{" "}
              — paid per audit via MCP
            </li>
          </ul>
        </DocSection>

        <DocSection title="Next steps">
          <DocCode>{`Founders     → /docs/how-it-works
Developers   → /docs/partners + /docs/integrations
AI agents    → /docs/mcp + /docs/ecosystem
Support      → ${siteConfig.organization.email}`}</DocCode>
        </DocSection>
      </DocsArticle>
    </MarketingPage>
  );
}