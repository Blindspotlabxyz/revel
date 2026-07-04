import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { seoKeywords } from "@/lib/seo/keywords";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  ogType?: "website" | "article";
};

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
  ogType = "website",
}: PageMetadataInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const fullTitle = path === "/" ? undefined : title;

  return {
    title: fullTitle ?? {
      absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
    },
    description,
    keywords: [...new Set([...seoKeywords.slice(0, 12), ...keywords])],
    alternates: {
      canonical,
    },
    openGraph: {
      type: ogType,
      locale: "en_US",
      siteName: siteConfig.name,
      title: path === "/" ? siteConfig.name : `${title} | ${siteConfig.name}`,
      description,
      url: absoluteUrl(canonical),
    },
    twitter: {
      card: "summary_large_image",
      title: path === "/" ? siteConfig.name : title,
      description,
      creator: "@tmojeeb",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}