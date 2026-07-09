import * as cheerio from "cheerio";
import { formatFetchError, resilientFetch } from "@/lib/resilient-fetch";

const INTERESTING_PATH =
  /pricing|price|plans|about|features|product|solutions|customers|demo|signup|sign-up|contact/i;

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; RevelBot/1.0; +https://tryrevel.xyz)",
  Accept: "text/html,application/xhtml+xml",
};

export async function extractWebsiteContent(url: string): Promise<string> {
  try {
    const response = await resilientFetch(url, {
      context: `Fetch website ${url}`,
      retries: 2,
      headers: FETCH_HEADERS,
      ssrfGuard: true,
    });

    if (!response.ok) {
      throw new Error(`Could not access website (HTTP ${response.status})`);
    }

    const html = await response.text();
    return cleanHtml(html);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Fetch website")) {
      throw error;
    }
    throw new Error(formatFetchError(error, `Fetch website ${url}`));
  }
}

function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  $("script, style, noscript, svg, iframe, nav, footer").remove();

  const parts: string[] = [];

  const title = $("title").text().trim();
  if (title) parts.push(`Title: ${title}`);

  const description = $('meta[name="description"]').attr("content");
  if (description) parts.push(`Description: ${description}`);

  const h1s = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  if (h1s.length) parts.push(`Headlines: ${h1s.join(" | ")}`);

  const h2s = $("h2")
    .map((_, el) => $(el).text().trim())
    .get()
    .slice(0, 8)
    .filter(Boolean);
  if (h2s.length) parts.push(`Subheadings: ${h2s.join(" | ")}`);

  const buttons = $("button, a[class*='btn'], a[class*='cta']")
    .map((_, el) => $(el).text().trim())
    .get()
    .slice(0, 10)
    .filter((t) => t.length > 0 && t.length < 50);
  if (buttons.length) parts.push(`CTAs: ${buttons.join(" | ")}`);

  const bodyText = $("main, article, section, body")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  if (bodyText) parts.push(`Content: ${bodyText}`);

  return parts.join("\n\n");
}

export async function discoverInternalLinks(
  baseUrl: string,
  limit = 12
): Promise<string[]> {
  try {
    const response = await resilientFetch(baseUrl, {
      context: `Discover links on ${baseUrl}`,
      retries: 2,
      headers: FETCH_HEADERS,
      ssrfGuard: true,
    });

    if (!response.ok) {
      throw new Error(`Could not access website (HTTP ${response.status})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const origin = new URL(baseUrl).origin;
    const seen = new Set<string>();
    const links: string[] = [];

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")?.trim();
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

      try {
        const absolute = new URL(href, baseUrl);
        if (absolute.origin !== origin) return;
        const path = absolute.pathname;
        if (path === "/" || path.length < 2) return;
        const normalized = `${origin}${path}`.replace(/\/$/, "") || origin;
        if (seen.has(normalized)) return;
        seen.add(normalized);
        links.push(normalized);
      } catch {
        // skip invalid href
      }
    });

    const prioritized = [
      ...links.filter((url) => INTERESTING_PATH.test(new URL(url).pathname)),
      ...links.filter((url) => !INTERESTING_PATH.test(new URL(url).pathname)),
    ];

    return prioritized.slice(0, limit);
  } catch (error) {
    throw new Error(formatFetchError(error, `Discover links on ${baseUrl}`));
  }
}