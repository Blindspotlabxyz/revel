"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const authEnabled = isAuthClientEnabled();
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setMobileOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)] border-b border-border bg-surface shadow-sm">
      <nav
        className="mx-auto flex h-[var(--header-height)] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
        aria-label="Primary"
      >
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

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            {authEnabled ? <NavbarAuthButtons /> : null}
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/mission-control">Run Revel</Link>
          </Button>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        id={menuId}
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 top-full z-50 border-b border-border bg-surface shadow-md md:hidden",
          "origin-top transition-[opacity,transform] duration-200 ease-out",
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-background"
                onClick={() => setMobileOpen(false)}
                tabIndex={mobileOpen ? 0 : -1}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {authEnabled ? (
            <li className="border-t border-border px-3 py-3 sm:hidden">
              <NavbarAuthButtons />
            </li>
          ) : null}
        </ul>
      </div>

      {/* Dim backdrop — tap outside closes */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--header-height)] z-40 bg-foreground/15 transition-opacity duration-200 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />
    </header>
  );
}
