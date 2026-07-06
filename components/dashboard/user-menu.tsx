"use client";

import { useSession } from "next-auth/react";
import { authSignInUrl } from "@/lib/auth-config";
import { isAuthClientEnabled } from "@/lib/auth-client";
import { AccountMenu } from "@/components/auth/account-menu";
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
    return <div className="h-9 w-9 rounded-full bg-muted/40" />;
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

  return <AccountMenu />;
}