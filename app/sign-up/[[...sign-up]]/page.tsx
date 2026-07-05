import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth/auth-page";
import { isAuthConfigured } from "@/lib/auth-config";
import { siteConfig } from "@/lib/site-config";

function SignUpContent() {
  return (
    <AuthPage
      title="Create your Revel account"
      description="Sign up with Google to save analyses and manage your roadmap."
      defaultCallbackUrl={siteConfig.url}
    />
  );
}

export default function SignUpPage() {
  if (!isAuthConfigured()) {
    redirect("/mission-control");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpContent />
    </Suspense>
  );
}