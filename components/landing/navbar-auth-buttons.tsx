"use client";

import { useSession } from "next-auth/react";
import { authSignInUrl, authSignUpUrl } from "@/lib/auth-config";
import { AccountMenu } from "@/components/auth/account-menu";
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
    return <AccountMenu />;
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