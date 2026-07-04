import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/mission-control/analysis/",
          "/mission-control/report/",
          "/mission-control/history",
          "/mission-control/settings",
          "/log-in",
          "/sign-in",
          "/sign-up",
          "/api/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/mission-control/", "/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/mission-control/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/ai.txt"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/ai.txt"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "cohere-ai",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/ai.txt"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}