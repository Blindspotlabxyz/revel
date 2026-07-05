"use client";

import { signOut, useSession } from "next-auth/react";
import { authSignInUrl } from "@/lib/auth-config";
import { appUrl } from "@/lib/navigation";
import { isAuthClientEnabled } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const authEnabled = isAuthClientEnabled();
  const { data: session, status } = useSession();

  if (!authEnabled) {
    return (
      <Button asChild variant="ghost" size="sm">
        <a href="/mission-control/settings">Account</a>
      </Button>
    );
  }

  if (status === "loading") {
    return <div className="h-8 w-8" />;
  }

  if (!session?.user) {
    const signInHref = (() => {
      if (typeof window === "undefined") return authSignInUrl();
      const path = authSignInUrl();
      const url = path.startsWith("http")
        ? new URL(path)
        : new URL(path, window.location.origin);
      url.searchParams.set("redirect_url", window.location.href);
      return url.toString();
    })();

    return (
      <Button asChild variant="ghost" size="sm">
        <a href={signInHref}>Sign in</a>
      </Button>
    );
  }

  const image = session.user.image;
  const label = session.user.name ?? session.user.email ?? "Account";

  return (
    <div className="flex items-center gap-2">
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