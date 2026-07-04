"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  plan: "developer" | "business";
  variant?: "default" | "secondary";
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  plan,
  variant = "default",
  className,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (res.status === 401) {
        router.push("/log-in");
        return;
      }

      router.push("/mission-control");
    } catch {
      router.push("/mission-control");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? "Loading..." : children}
    </Button>
  );
}