"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RevelLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/user-menu";

const navItems = [
  { label: "Mission Control", href: "/mission-control" },
  { label: "History", href: "/mission-control/history" },
  { label: "Pricing", href: "/pricing" },
  { label: "Settings", href: "/mission-control/settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <RevelLogo size="md" />

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                pathname === item.href
                  ? "font-medium text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/mission-control">New Analysis</Link>
          </Button>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}