/** Canonical public URLs for sitemap, IndexNow, and crawler discovery */
export const publicSitemapPaths = [
  "/",
  "/how-it-works",
  "/features",
  "/pricing",
  "/faq",
  "/sample-reports",
  "/about",
  "/contact",
  "/docs",
  "/docs/api",
  "/privacy",
  "/terms",
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
] as const;

export type PublicSitemapPath = (typeof publicSitemapPaths)[number];

export const sitemapPriorities: Record<
  PublicSitemapPath,
  { changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"; priority: number }
> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/how-it-works": { changeFrequency: "monthly", priority: 0.9 },
  "/features": { changeFrequency: "monthly", priority: 0.9 },
  "/pricing": { changeFrequency: "weekly", priority: 0.9 },
  "/faq": { changeFrequency: "monthly", priority: 0.85 },
  "/sample-reports": { changeFrequency: "monthly", priority: 0.85 },
  "/about": { changeFrequency: "monthly", priority: 0.8 },
  "/contact": { changeFrequency: "yearly", priority: 0.6 },
  "/docs": { changeFrequency: "monthly", priority: 0.85 },
  "/docs/api": { changeFrequency: "monthly", priority: 0.8 },
  "/privacy": { changeFrequency: "yearly", priority: 0.3 },
  "/terms": { changeFrequency: "yearly", priority: 0.3 },
  "/llms.txt": { changeFrequency: "weekly", priority: 0.7 },
  "/llms-full.txt": { changeFrequency: "weekly", priority: 0.65 },
  "/ai.txt": { changeFrequency: "weekly", priority: 0.65 },
};