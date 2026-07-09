"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Revel Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="section-eyebrow mx-auto">Error</p>
      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-muted">
        We hit an unexpected issue. Try again in a moment.
      </p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
