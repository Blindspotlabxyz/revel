"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkEnabled) {
    return (
      <Button asChild variant="ghost" size="sm">
        <a href="/mission-control/settings">Account</a>
      </Button>
    );
  }

  return <ClerkUserMenu />;
}

function ClerkUserMenu() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="h-8 w-8" />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
      </SignInButton>
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
        },
      }}
    />
  );
}