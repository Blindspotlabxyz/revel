"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { clerkSignInUrl, clerkSignUpUrl } from "@/lib/clerk-config";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkRootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN;

  return (
    <ClerkProvider
      publishableKey={publishableKey ?? ""}
      {...(cookieDomain ? { domain: cookieDomain } : {})}
      signInUrl={clerkSignInUrl()}
      signUpUrl={clerkSignUpUrl()}
      appearance={{
        variables: {
          colorPrimary: "#E07A5F",
          colorBackground: "#F7F2EB",
          borderRadius: "0.75rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}