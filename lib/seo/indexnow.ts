import { absoluteUrl } from "@/lib/seo/metadata";
import { publicSitemapPaths } from "@/lib/seo/sitemap-urls";
import { siteConfig } from "@/lib/site-config";

/** Key file must live at /{INDEXNOW_KEY}.txt with the key as plain text */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? "revel-tryrevel-indexnow";

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
] as const;

export function indexNowKeyUrl(): string {
  return absoluteUrl(`/${INDEXNOW_KEY}.txt`);
}

export function allIndexNowUrls(): string[] {
  return publicSitemapPaths.map((path) => absoluteUrl(path));
}

export async function submitToIndexNow(urls?: string[]): Promise<{
  submitted: string[];
  results: { endpoint: string; status: number }[];
}> {
  const host = new URL(siteConfig.url).host;
  const urlList = urls ?? allIndexNowUrls();

  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: indexNowKeyUrl(),
    urlList,
  };

  const results = await Promise.all(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      return { endpoint, status: response.status };
    })
  );

  return { submitted: urlList, results };
}