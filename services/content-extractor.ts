import * as cheerio from "cheerio";

export async function extractWebsiteContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RevelBot/1.0; +https://revel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("Could not access website");
    }

    const html = await response.text();
    return cleanHtml(html);
  } finally {
    clearTimeout(timeout);
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