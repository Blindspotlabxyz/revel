import { NavLink } from "@/components/nav-link";
import { RevelLogo } from "@/components/brand/logo";

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
    { label: "OKX.AI", href: "https://web3.okx.com/ai/home" },
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

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
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
          <RevelLogo size="sm" className="[&_span]:text-base" />
          <p className="text-sm text-muted">
            Built by BlindspotLab. Listed on OKX.AI · Reveal what others miss.
          </p>
        </div>
      </div>
    </footer>
  );
}