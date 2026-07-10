import { NavLink } from "@/components/nav-link";
import { RevelLogo } from "@/components/brand/logo";
import { getLogoHomeLink } from "@/lib/logo-home";

const footerLinks = {
  Product: [
    { label: "How it Works", href: "/docs/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Mission Control", href: "/mission-control" },
  ],
  Resources: [
    { label: "Docs", href: "/docs" },
    { label: "Sample Reports", href: "/docs/sample-reports" },
    { label: "FAQ", href: "/docs/faq" },
    { label: "Contact", href: "/contact" },
  ],
  Developers: [
    { label: "API Reference", href: "/docs/api" },
    { label: "Partner API", href: "/partners" },
    { label: "MCP / A2MCP", href: "/docs/mcp" },
    { label: "GitHub", href: "https://github.com/Blindspotlabxyz/revel" },
  ],
  Ecosystem: [
    {
      label: "Onchain OS Docs",
      href: "https://web3.okx.com/help/section/onchain-os",
    },
    { label: "OKX.AI", href: "https://www.okx.ai/" },
    { label: "OKX", href: "https://www.okx.com" },
    { label: "OKX on X", href: "https://x.com/okx" },
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
    <footer className="border-t border-border bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="min-w-0">
              <h3 className="text-sm font-medium">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      href={link.href}
                      className="break-words text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:mt-16 sm:flex-row sm:items-center">
          <RevelLogo
            size="sm"
            className="[&_span]:text-base"
            href={logo.href}
            external={logo.external}
          />
          <p className="max-w-md text-sm leading-relaxed text-muted sm:text-right">
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
