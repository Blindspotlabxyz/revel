import type { Metadata } from "next";
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
  return children;
}