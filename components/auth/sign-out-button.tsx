"use client";

import { signOut } from "next-auth/react";
import { appUrl } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => signOut({ callbackUrl: appUrl("/") })}
    >
      Sign out
    </Button>
  );
}