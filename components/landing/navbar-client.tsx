"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthClientEnabled } from "@/lib/auth-client";
import { NavbarAuthButtons } from "@/components/landing/navbar-auth-buttons";
import { RevelLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "How it Works", href: "/docs/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "Docs", href: "/docs" },
];

type NavbarClientProps = {
  logoHref: string;
  logoExternal?: boolean;
  logoSurfaceLabel?: string;
};

export function NavbarClient({
  logoHref,
  logoExternal = false,
  logoSurfaceLabel,
}: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const authEnabled = isAuthClientEnabled();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-border bg-surface/95 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <RevelLogo
          size="md"
          href={logoHref}
          external={logoExternal}
          surfaceLabel={logoSurfaceLabel}
        />

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {authEnabled ? <NavbarAuthButtons /> : null}
          <Button asChild size="sm">
            <Link href="/mission-control">Run Revel</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
