import { siteConfig } from "@/lib/site-config";

export type DocLink = {
  href: string;
  label: string;
  description: string;
};

export type DocPath = {
  id: string;
  title: string;
  description: string;
  audience: "founders" | "developers" | "agents" | "ecosystem";
};

export const docAudiencePaths: Record<
  DocPath["audience"],
  { title: string; subtitle: string; links: DocLink[] }
> = {
  founders: {
    title: "Founders & product teams",
    subtitle: "Run audits in Mission Control and act on the Blueprint.",
    links: [
      {
        href: "/docs/getting-started",
        label: "Getting started",
        description: "Sign in, run your first audit, export tasks",
      },
      {
        href: "/docs/how-it-works",
        label: "How it works",
        description: "Analysis pipeline and deliverables",
      },
      {
        href: "/docs/sample-reports",
        label: "Sample reports",
        description: "Live Arcapush genesis audit",
      },
    ],
  },
  developers: {
    title: "Platform developers",
    subtitle: "Embed Revel in your product (e.g. Arcapush).",
    links: [
      {
        href: "/docs/partners",
        label: "Partner API",
        description: "REST API, auth, polling, caching",
      },
      {
        href: "/docs/integrations",
        label: "Integration guide",
        description: "Arcapush Revel Check walkthrough",
      },
      {
        href: "/docs/api",
        label: "Mission Control API",
        description: "Web app REST endpoints",
      },
    ],
  },
  agents: {
    title: "AI agents & MCP",
    subtitle: "OKX.AI marketplace and Cursor agents.",
    links: [
      {
        href: "/docs/mcp",
        label: "MCP / A2MCP",
        description: "Tools, auth, agent workflow",
      },
      {
        href: "/docs/ecosystem",
        label: "OKX ecosystem",
        description: "Listing, x402 billing, Onchain OS",
      },
    ],
  },
  ecosystem: {
    title: "Ecosystem & operators",
    subtitle: "OKX.AI ASP listing and partner operations.",
    links: [
      {
        href: "/docs/ecosystem",
        label: "OKX.AI & Onchain OS",
        description: "Marketplace, payments, ASP checklist",
      },
      {
        href: "/partners",
        label: "Apply for Partner API",
        description: "Request access and API keys",
      },
      {
        href: "/docs/faq",
        label: "FAQ",
        description: "Limits, pricing, support",
      },
    ],
  },
};

export const allDocLinks: DocLink[] = [
  { href: "/docs", label: "Documentation home", description: "Start here" },
  { href: "/docs/getting-started", label: "Getting started", description: "Mission Control" },
  { href: "/docs/how-it-works", label: "How it works", description: "Pipeline" },
  { href: "/docs/api", label: "Mission Control API", description: "Web REST" },
  { href: "/docs/partners", label: "Partner API", description: "Platform integrations" },
  { href: "/docs/integrations", label: "Integrations", description: "Arcapush example" },
  { href: "/docs/mcp", label: "MCP / A2MCP", description: "Agent tools" },
  { href: "/docs/ecosystem", label: "OKX ecosystem", description: "Marketplace & billing" },
  { href: "/docs/sample-reports", label: "Sample reports", description: "Example output" },
  { href: "/docs/faq", label: "FAQ", description: "Common questions" },
];

export const docsBaseUrl = siteConfig.docsUrl;