import type { Metadata } from "next";
import { BackToHome } from "@/components/back-to-home";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sign up",
  description: "Create your Revel account.",
  path: "/sign-up",
  noIndex: true,
});

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackToHome />
      {children}
    </>
  );
}