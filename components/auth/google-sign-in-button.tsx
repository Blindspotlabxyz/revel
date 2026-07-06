"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  className?: string;
  label?: string;
};

export function GoogleSignInButton({
  callbackUrl,
  className,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    if (loading) return;
    setLoading(true);

    try {
      await signIn("google", { callbackUrl });
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleGoogleSignIn()}
      className={cn(
        buttonVariants({ variant: "secondary", size: "default" }),
        "w-full",
        className
      )}
    >
      {loading ? "Redirecting to Google..." : label}
    </button>
  );
}