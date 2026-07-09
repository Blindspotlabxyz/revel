"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BarChart3, Handshake, LogOut, Settings, User } from "lucide-react";
import { appUrl } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  accountSettingsHref?: string;
  className?: string;
};

function userInitial(label: string): string {
  return label.charAt(0).toUpperCase();
}

export function AccountMenu({
  accountSettingsHref = "/mission-control/account",
  className,
}: AccountMenuProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const label = user?.name ?? user?.email ?? "Account";
  const email = user?.email ?? "";
  const image = user?.image;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-foreground">
            {userInitial(label)}
          </span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={label}
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-sm font-medium">
                  {userInitial(label)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name ?? "Revel user"}
                </p>
                {email ? (
                  <p className="truncate text-xs text-muted">{email}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href={accountSettingsHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-background"
            >
              <Settings className="h-4 w-4 text-muted" />
              Account settings
            </Link>
            <Link
              href="/mission-control"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-background"
            >
              <User className="h-4 w-4 text-muted" />
              Mission Control
            </Link>
            {user.isAdmin ? (
              <>
                <Link
                  href="/mission-control/analytics"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-background"
                >
                  <BarChart3 className="h-4 w-4 text-muted" />
                  Analytics
                </Link>
                <Link
                  href="/mission-control/partners"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-background"
                >
                  <Handshake className="h-4 w-4 text-muted" />
                  Partners
                </Link>
              </>
            ) : null}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut({ callbackUrl: appUrl("/") });
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-background"
            >
              <LogOut className="h-4 w-4 text-muted" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}