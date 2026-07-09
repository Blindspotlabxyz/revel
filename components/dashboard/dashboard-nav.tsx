"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RevelLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/user-menu";

const baseNavItems = [
  { label: "Mission Control", href: "/mission-control" },
  { label: "History", href: "/mission-control/history" },
  { label: "Account", href: "/mission-control/account" },
  { label: "Settings", href: "/mission-control/settings" },
];

const adminNavItems = [
  { label: "Analytics", href: "/mission-control/analytics" },
  { label: "Partners", href: "/mission-control/partners" },
];

type DashboardNavProps = {
  isAdmin?: boolean;
};

export function DashboardNav({ isAdmin = false }: DashboardNavProps) {
  const navItems = isAdmin
    ? [
        baseNavItems[0],
        baseNavItems[1],
        ...adminNavItems,
        ...baseNavItems.slice(2),
      ]
    : baseNavItems;
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <RevelLogo size="md" />

        <div className="flex max-w-[min(100%,42rem)] items-center gap-1 overflow-x-auto md:max-w-none md:gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/mission-control" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-primary-soft/50 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/mission-control">New analysis</Link>
          </Button>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
