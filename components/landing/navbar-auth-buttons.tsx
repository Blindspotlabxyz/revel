"use client";

import { signOut, useSession } from "next-auth/react";
import { authSignInUrl, authSignUpUrl } from "@/lib/auth-config";
import { appUrl } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

function crossSubdomainHref(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  const url = path.startsWith("http")
    ? new URL(path)
    : new URL(path, window.location.origin);
  url.searchParams.set("redirect_url", window.location.href);
  return url.toString();
}

export function NavbarAuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-16 rounded-md bg-muted/40" />
        <div className="h-8 w-16 rounded-md bg-muted/40" />
      </div>
    );
  }

  if (session?.user) {
    const image = session.user.image;
    const label = session.user.name ?? session.user.email ?? "Account";

    return (
      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={label}
            className="h-8 w-8 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: appUrl("/") })}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" size="sm">
        <a href={crossSubdomainHref(authSignInUrl())}>Sign in</a>
      </Button>
      <Button asChild variant="secondary" size="sm">
        <a href={crossSubdomainHref(authSignUpUrl())}>Sign up</a>
      </Button>
    </div>
  );
}