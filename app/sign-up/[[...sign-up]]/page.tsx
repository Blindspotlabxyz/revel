import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignUpPage } from "@/components/auth/sign-up-page";
import { isAuthConfigured } from "@/lib/auth-config";

export default function SignUpPageRoute() {
  if (!isAuthConfigured()) {
    redirect("/mission-control");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpPage />
    </Suspense>
  );
}