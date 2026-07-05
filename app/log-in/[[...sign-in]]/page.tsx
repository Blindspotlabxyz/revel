import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth/auth-page";
import { isAuthConfigured } from "@/lib/auth-config";
import { siteConfig } from "@/lib/site-config";

function LogInContent() {
  return (
    <AuthPage
      title="Sign in to Revel"
      description="Use your Google account to access Mission Control."
      defaultCallbackUrl={siteConfig.url}
    />
  );
}

export default function LogInPage() {
  if (!isAuthConfigured()) {
    redirect("/mission-control");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LogInContent />
    </Suspense>
  );
}