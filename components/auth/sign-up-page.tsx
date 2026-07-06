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

export function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = resolveAuthCallbackUrl(searchParams);
  const oauthError = authErrorMessage(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(oauthError);
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const signupResponse = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const signupBody = await signupResponse.json().catch(() => ({}));

    if (!signupResponse.ok) {
      setLoading(false);
      setError(signupBody.error ?? "Could not create account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: redirectUrl,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Account created, but sign-in failed. Try signing in.");
      return;
    }

    if (signInResult?.url) {
      window.location.href = signInResult.url;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold">
          Create your Revel account
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign up with email or Google to save analyses and manage your roadmap.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleCredentialsSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sign-up-email">Email</Label>
            <Input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-up-password">Password</Label>
            <Input
              id="sign-up-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-up-confirm-password">Confirm password</Label>
            <Input
              id="sign-up-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up with email"}
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