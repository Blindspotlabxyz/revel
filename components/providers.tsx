"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { isClerkClientEnabled } from "@/lib/clerk-client";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!isClerkClientEnabled()) {
    return <>{children}</>;
  }

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const cookieDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      {...(cookieDomain ? { domain: cookieDomain } : {})}
      signInUrl="/log-in"
      signUpUrl="/sign-up"
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