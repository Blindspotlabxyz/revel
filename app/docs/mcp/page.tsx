import type { Metadata } from "next";
import Link from "next/link";
import {
  DocCode,
  DocSection,
  DocsArticle,
} from "@/components/docs/docs-article";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { getOkxAuditPriceUsd } from "@/lib/billing/okx-x402";
import { REVEL_MCP_TOOLS } from "@/lib/mcp/create-server";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "MCP / A2MCP";
const description =
  "Connect AI agents to Revel via Model Context Protocol — analyze websites, get Blueprints, and export roadmaps.";
const path = "/docs/mcp";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path,
  keywords: ["Revel MCP", "A2MCP", "agent to MCP", "OKX AI agent"],
});

export default function McpDocsPage() {
  const endpoint = `${siteConfig.url}/api/mcp`;
  const manifest = `${siteConfig.url}/api/mcp/manifest`;
  const price = getOkxAuditPriceUsd();

  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path={path}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: "MCP", path },
        ]}
      />
      <DocsArticle
        title="Revel MCP (A2MCP)"
        description={description}
        path={path}
        related={[
          { href: "/docs/ecosystem", label: "OKX ecosystem" },
          { href: "/docs/partners", label: "Partner API" },
          { href: "/docs/api", label: "Mission Control API" },
        ]}
      >
        <DocSection title="Overview">
          <p>
            Revel exposes product intelligence as MCP tools so agents can audit
            websites, score the Reveal Index, and return a prioritized Blueprint
            without leaving the chat. Listed on OKX.AI as ASP #4750.
          </p>
        </DocSection>

        <DocSection title="Endpoints">
          <DocCode>{`HTTP      ${endpoint}
Manifest  ${manifest}
Auth      Authorization: Bearer MCP_API_KEY  (dev bypass)
          x402 payment on POST /api/mcp (production marketplace)`}</DocCode>
        </DocSection>

        <DocSection title="Tools">
          <ul className="list-disc space-y-1 pl-5">
            {REVEL_MCP_TOOLS.map((tool) => (
              <li key={tool}>
                <code className="text-foreground">{tool}</code>
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection title="Cursor (stdio)">
          <DocCode>{`{
  "mcpServers": {
    "revel": {
      "command": "npx",
      "args": ["tsx", "scripts/revel-mcp.ts"],
      "cwd": "/path/to/revel"
    }
  }
}`}</DocCode>
        </DocSection>

        <DocSection title="Remote (OKX.AI / HTTP)">
          <DocCode>{`{
  "mcpServers": {
    "revel": {
      "url": "${endpoint}",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_API_KEY"
      }
    }
  }
}`}</DocCode>
        </DocSection>

        <DocSection title="Billing (OKX Agent Payments Protocol / x402)">
          <p>
            Marketplace billing uses the{" "}
            <strong className="text-foreground">OKX Agent Payments Protocol</strong>{" "}
            (x402) — ${price.toFixed(2)} USDT0 per started audit on X Layer.
            Free without payment: <code>initialize</code>, <code>tools/list</code>,{" "}
            <code>revel_health</code>, poll/export tools. Paid:{" "}
            <code>revel_analyze_website</code> /{" "}
            <code>revel_analyze_website_and_wait</code> return{" "}
            <strong className="text-foreground">402</strong> +{" "}
            <code>PAYMENT-REQUIRED</code> when unpaid. Set price via{" "}
            <code>OKX_AUDIT_PRICE_USD</code>. Alternate paid HTTP route:{" "}
            <code>POST /api/audit</code>.
          </p>
          <p>
            Full operator checklist:{" "}
            <Link href="/docs/ecosystem" className="text-primary hover:underline">
              OKX ecosystem docs
            </Link>
            .
          </p>
        </DocSection>

        <DocSection title="Typical agent flow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Call <code>revel_analyze_website</code> with a public URL
            </li>
            <li>
              Poll with <code>revel_get_analysis</code> every 5s (prefer over{" "}
              <code>revel_wait_for_analysis</code> on HTTP — avoids 60s timeouts)
            </li>
            <li>
              Export via <code>revel_export_blueprint</code> or read{" "}
              <code>report</code> from the JSON response
            </li>
          </ol>
        </DocSection>

        <DocSection title="MCP vs Partner API">
          <p>
            <strong className="text-foreground">MCP</strong> — AI agents discover
            Revel on OKX.AI and pay per audit via x402. Best for agent
            marketplaces and Cursor workflows.
          </p>
          <p>
            <strong className="text-foreground">Partner API</strong> — your web
            app embeds Revel with <code>rvl_pk_</code> keys. Best for Arcapush-style
            platform integrations. See{" "}
            <Link href="/docs/partners" className="text-primary hover:underline">
              Partner API
            </Link>{" "}
            and{" "}
            <Link
              href="/docs/integrations"
              className="text-primary hover:underline"
            >
              integration guide
            </Link>
            .
          </p>
        </DocSection>
      </DocsArticle>
    </MarketingPage>
  );
}