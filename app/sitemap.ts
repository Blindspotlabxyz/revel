import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import { publicSitemapPaths, sitemapPriorities } from "@/lib/seo/sitemap-urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicSitemapPaths.map((path) => {
    const { changeFrequency, priority } = sitemapPriorities[path];
    return {
      url: absoluteUrl(path),
      lastModified,
      changeFrequency,
      priority,
    };
  });
}