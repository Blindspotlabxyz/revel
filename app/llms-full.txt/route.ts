import { revelFaqs } from "@/lib/seo/faqs";
import { absoluteUrl } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

export function GET() {
  const content = `# ${siteConfig.name}: Complete product context for AI systems

## Summary
${siteConfig.name} is an AI product strategist that analyzes public websites and product experiences.
It identifies blindspots in positioning, UX, messaging, and competition, then outputs a scored
Reveal Index, prioritized Blueprint roadmap, and exportable Action Queue (Markdown/JSON).

Tagline: ${siteConfig.tagline}

## Who it is for
Founders, product managers, indie hackers, agencies, designers, developers, and growth teams
who need strategic product feedback without hiring consultants.

## How it works
1. User pastes a public website URL in Mission Control
2. Revel analyzes product, UX, messaging, and competitors
3. Blindspots are revealed with priority levels
4. A Blueprint ranks improvements by impact and effort
5. User exports tasks to Markdown or JSON

## Key features
- Product Analysis: positioning, features, clarity
- UX Review: friction across the user journey
- Messaging Audit: headlines, trust, communication
- Competitor Review: relative market positioning
- Reveal Index: overall product health score
- Blueprint: prioritized improvement sequence
- Action Queue: concrete tasks with export

## Access
- Mission Control: 3 free audits per week (resets Monday 00:00 UTC)
- OKX.AI marketplace (MCP): $0.35 per successful audit for additional volume

## API endpoints (application)
- POST /api/analyze: start analysis with { url }
- GET /api/report/:id: fetch report
- POST /api/export: export { id, format: markdown|json }
- GET /api/history: list user analyses

## FAQ
${revelFaqs.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n")}

## Company
- **${siteConfig.organization.name}**: ${siteConfig.organization.slogan}
- URL: ${siteConfig.organization.url}
- Email: ${siteConfig.organization.email}
- Founder: ${siteConfig.founder.name} (${siteConfig.founder.jobTitle})
- Credentials: ${siteConfig.founder.credentials.map((c) => c.name).join("; ")}

## Canonical URLs
- Home: ${absoluteUrl("/")}
- How it works: ${absoluteUrl("/docs/how-it-works")}
- Features: ${absoluteUrl("/features")}
- MCP docs: ${absoluteUrl("/docs/mcp")}
- FAQ: ${absoluteUrl("/docs/faq")}
- Docs: ${absoluteUrl("/docs")}
- API docs: ${absoluteUrl("/docs/api")}
- Sample reports: ${absoluteUrl("/docs/sample-reports")}
- Sample report (app): ${absoluteUrl("/mission-control/report/89a99571-be09-4aa1-a8aa-17ff1cb5bdf3")}
- About: ${absoluteUrl("/about")}
- Contact: ${absoluteUrl("/contact")}

## Keywords
AI product strategist, website audit, UX review, product blindspots, growth gaps,
product roadmap, Reveal Index, Blueprint, Action Queue, founder tools, SaaS audit.

## Short llms.txt
${absoluteUrl("/llms.txt")}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}