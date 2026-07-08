import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { createPageMetadata } from "@/lib/seo/metadata";
import { REVEL_MCP_TOOLS } from "@/lib/mcp/create-server";
import { siteConfig } from "@/lib/site-config";

const title = "MCP / A2MCP";
const description =
  "Connect AI agents to Revel via Model Context Protocol — analyze websites, get Blueprints, and export roadmaps.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/docs/mcp",
  keywords: ["Revel MCP", "A2MCP", "agent to MCP", "OKX AI agent"],
});

export default function McpDocsPage() {
  const endpoint = `${siteConfig.url}/api/mcp`;
  const manifest = `${siteConfig.url}/api/mcp/manifest`;

  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/docs/mcp"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: "MCP", path: "/docs/mcp" },
        ]}
      />
      <div className="mx-auto max-w-2xl px-6 py-32">
        <p className="text-sm text-muted">
          <Link href="/docs" className="hover:text-foreground">
            ← Documentation
          </Link>
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold">
          Revel MCP (A2MCP)
        </h1>
        <p className="mt-4 text-lg text-muted">
          Revel exposes product intelligence as MCP tools so agents can audit
          websites, score the Reveal Index, and return a prioritized Blueprint
          without leaving the chat.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Endpoints</h2>
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p>
              <span className="text-primary">HTTP</span> {endpoint}
            </p>
            <p className="mt-2">
              <span className="text-primary">Manifest</span> {manifest}
            </p>
            <p className="mt-2">
              <span className="text-primary">Auth</span>{" "}
              <code>Authorization: Bearer MCP_API_KEY</code>
            </p>
          </div>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-heading text-2xl font-semibold">Tools</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            {REVEL_MCP_TOOLS.map((tool) => (
              <li key={tool}>
                <code className="text-foreground">{tool}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Cursor (stdio)</h2>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm">
{`{
  "mcpServers": {
    "revel": {
      "command": "npx",
      "args": ["tsx", "scripts/revel-mcp.ts"],
      "cwd": "/path/to/revel"
    }
  }
}`}
          </pre>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">
            Remote (OKX.AI / HTTP)
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm">
{`{
  "mcpServers": {
    "revel": {
      "url": "${endpoint}",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_API_KEY"
      }
    }
  }
}`}
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-2xl font-semibold">
            Typical agent flow
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            <li>
              Call <code>revel_analyze_website</code> with a public URL
            </li>
            <li>
              Poll with <code>revel_wait_for_analysis</code> (1–3 min on slow
              networks)
            </li>
            <li>
              Export via <code>revel_export_blueprint</code> or read{" "}
              <code>report</code> from the JSON response
            </li>
          </ol>
        </section>
      </div>
    </MarketingPage>
  );
}