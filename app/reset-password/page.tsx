import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ResetPasswordPage } from "@/components/auth/reset-password-page";
import { isAuthConfigured } from "@/lib/auth-config";

export default function ResetPasswordRoute() {
  if (!isAuthConfigured()) {
    redirect("/mission-control");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
