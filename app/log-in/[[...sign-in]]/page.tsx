import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignInPage } from "@/components/auth/sign-in-page";
import { isAuthConfigured } from "@/lib/auth-config";

export default function LogInPage() {
  if (!isAuthConfigured()) {
    redirect("/mission-control");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignInPage />
    </Suspense>
  );
}