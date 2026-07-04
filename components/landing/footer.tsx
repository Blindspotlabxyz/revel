import Link from "next/link";
import { RevelLogo } from "@/components/brand/logo";

const footerLinks = {
  Product: [
    { label: "How it Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Mission Control", href: "/mission-control" },
  ],
  Resources: [
    { label: "Docs", href: "/docs" },
    { label: "Sample Reports", href: "/sample-reports" },
    { label: "FAQ", href: "/faq" },
  ],
  Developers: [
    { label: "API", href: "/docs/api" },
    { label: "GitHub", href: "https://github.com" },
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
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-medium">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <RevelLogo size="sm" className="[&_span]:text-base" />
          <p className="text-sm text-muted">
            Built by BlindspotLab — Reveal what others miss.
          </p>
        </div>
      </div>
    </footer>
  );
}