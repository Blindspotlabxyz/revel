import { headers } from "next/headers";
import { siteConfig, subdomainRedirectsEnabled } from "@/lib/site-config";

export type LogoHomeLink = {
  /** "/" on marketing apex; absolute marketing URL on docs/legal/auth. */
  href: string;
  /** Use a plain <a> for real cross-origin navigation. */
  external: boolean;
  /** Optional surface label beside the wordmark (Docs / Legal). */
  surfaceLabel?: "Docs" | "Legal" | "Auth";
};

function stripWww(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Resolve where the Revel logo should send the user.
 * - tryrevel.xyz → relative `/` (Next.js client navigation)
 * - docs / legal / auth subdomains → absolute marketing URL via <a>
 */
export async function getLogoHomeLink(): Promise<LogoHomeLink> {
  const marketingUrl = siteConfig.marketingUrl.replace(/\/$/, "");
  const marketingHost = stripWww(new URL(marketingUrl).hostname);

  if (!subdomainRedirectsEnabled()) {
    return { href: "/", external: false };
  }

  const headerList = await headers();
  const hostHeader =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const host = stripWww(hostHeader.split(":")[0] ?? "");

  if (!host || host === "localhost" || host === "127.0.0.1") {
    return { href: "/", external: false };
  }

  // Same apex as marketing (including www)
  if (host === marketingHost) {
    return { href: "/", external: false };
  }

  // product.subdomain.tryrevel.xyz
  if (host.endsWith(`.${marketingHost}`)) {
    const label = host.slice(0, -(marketingHost.length + 1));
    if (label === "docs") {
      return {
        href: marketingUrl,
        external: true,
        surfaceLabel: "Docs",
      };
    }
    if (label === "legal") {
      return {
        href: marketingUrl,
        external: true,
        surfaceLabel: "Legal",
      };
    }
    if (label === "auth") {
      return {
        href: marketingUrl,
        external: true,
        surfaceLabel: "Auth",
      };
    }
  }

  return { href: "/", external: false };
}
