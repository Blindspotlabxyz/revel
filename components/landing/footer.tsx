import { NavLink } from "@/components/nav-link";
import { RevelLogo } from "@/components/brand/logo";
import { getLogoHomeLink } from "@/lib/logo-home";

/** Footer is sitemap + legal — not a second copy of the primary nav CTAs. */
const footerLinks = {
  Product: [
    { label: "Mission Control", href: "/mission-control" },
    { label: "Sample Reports", href: "/docs/sample-reports" },
    { label: "Partner API", href: "/partners" },
  ],
  Resources: [
    {
      label: "Guide: Find blindspots",
      href: "/guides/find-product-blindspots",
    },
    { label: "FAQ", href: "/docs/faq" },
    { label: "API Reference", href: "/docs/api" },
    { label: "MCP / A2MCP", href: "/docs/mcp" },
    { label: "Contact", href: "/contact" },
  ],
  Ecosystem: [
    {
      label: "Onchain OS Docs",
      href: "https://web3.okx.com/help/section/onchain-os",
    },
    { label: "OKX.AI", href: "https://www.okx.ai/" },
    { label: "OKX", href: "https://www.okx.com" },
    { label: "GitHub", href: "https://github.com/Blindspotlabxyz/revel" },
    { label: "BlindspotLab", href: "https://blindspotlab.xyz" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export async function Footer() {
  const logo = await getLogoHomeLink();

  return (
    <footer className="border-t border-border bg-surface py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-medium">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <RevelLogo
            size="sm"
            className="[&_span]:text-base"
            href={logo.href}
            external={logo.external}
            surfaceLabel={logo.surfaceLabel}
          />
          <p className="text-sm text-muted">
            Built by{" "}
            <a
              href="https://blindspotlab.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-foreground"
            >
              BlindspotLab
            </a>
            . Listed on{" "}
            <a
              href="https://www.okx.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-foreground"
            >
              OKX.AI
            </a>
            {" · "}
            Reveal what others miss.
          </p>
        </div>
      </div>
    </footer>
  );
}
