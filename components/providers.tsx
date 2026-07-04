"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function isClerkClientEnabled(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_DISABLE_CLERK !== "true"
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  if (!isClerkClientEnabled()) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
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