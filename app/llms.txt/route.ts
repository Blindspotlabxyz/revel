import { revelFaqs } from "@/lib/seo/faqs";
import { absoluteUrl } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

export function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    `> ${siteConfig.tagline}`,
    "",
    `${siteConfig.description}`,
    "",
    "Built by BlindspotLab. AI product strategist for founders, product teams, and builders.",
    "",
    "## Primary pages",
    `- [Home](${absoluteUrl("/")})`,
    `- [How it works](${absoluteUrl("/how-it-works")})`,
    `- [Features](${absoluteUrl("/features")})`,
    `- [Pricing](${absoluteUrl("/pricing")})`,
    `- [Sample reports](${absoluteUrl("/sample-reports")})`,
    `- [FAQ](${absoluteUrl("/faq")})`,
    `- [About](${absoluteUrl("/about")})`,
    `- [Contact](${absoluteUrl("/contact")})`,
    "",
    "## Documentation",
    `- [Docs hub](${absoluteUrl("/docs")})`,
    `- [API reference](${absoluteUrl("/docs/api")})`,
    `- [Full LLM context](${absoluteUrl("/llms-full.txt")})`,
    "",
    "## Product capabilities",
    "- Website and product experience analysis",
    "- UX, messaging, and competitor review",
    "- Reveal Index product health score",
    "- Prioritized Blueprint roadmap",
    "- Action Queue with export to Markdown and JSON",
    "- Mission Control dashboard for analyses",
    "",
    "## Frequently asked questions",
    ...revelFaqs.map((f) => `- **${f.question}** ${f.answer}`),
    "",
    "## Organization",
    `- Company: ${siteConfig.organization.name} (${siteConfig.organization.url})`,
    `- Founder: ${siteConfig.founder.name}, ${siteConfig.founder.jobTitle}`,
    `- Email: ${siteConfig.organization.email}`,
    `- Twitter: https://x.com/tmojeeb`,
    "",
    "## AI discovery",
    `- AI policy: ${absoluteUrl("/ai.txt")}`,
    `- Humans: ${absoluteUrl("/humans.txt")}`,
    "",
    "## Optional",
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Robots: ${absoluteUrl("/robots.txt")}`,
    `- Privacy: ${absoluteUrl("/privacy")}`,
    `- Terms: ${absoluteUrl("/terms")}`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}