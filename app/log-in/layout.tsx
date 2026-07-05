import type { Metadata } from "next";
import { BackToHome } from "@/components/back-to-home";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sign in",
  description: "Sign in to Revel Mission Control.",
  path: "/log-in",
  noIndex: true,
});

export default function LogInLayout({
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