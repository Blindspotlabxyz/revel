"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-errors";
import { resolveAuthCallbackUrl } from "@/lib/auth-redirect";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = resolveAuthCallbackUrl(searchParams);
  const oauthError = authErrorMessage(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(oauthError);
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: redirectUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold">Sign in to Revel</h1>
        <p className="mt-2 text-sm text-muted">
          Use your email or Google account to access Mission Control.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleCredentialsSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sign-in-email">Email</Label>
            <Input
              id="sign-in-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-in-password">Password</Label>
            <Input
              id="sign-in-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in with email"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton callbackUrl={redirectUrl} />
      </div>
    </div>
  );
}