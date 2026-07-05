"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

type AuthPageProps = {
  title: string;
  description: string;
  defaultCallbackUrl?: string;
};

export function AuthPage({
  title,
  description,
  defaultCallbackUrl = siteConfig.url,
}: AuthPageProps) {
  const searchParams = useSearchParams();
  const redirectUrl =
    searchParams.get("redirect_url") ??
    searchParams.get("callbackUrl") ??
    defaultCallbackUrl;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <Button
          type="button"
          className="mt-8 w-full"
          onClick={() => signIn("google", { callbackUrl: redirectUrl })}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}