import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";
import { isAuthConfigured } from "@/lib/auth-config";

export default function ForgotPasswordRoute() {
  if (!isAuthConfigured()) {
    redirect("/mission-control");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
