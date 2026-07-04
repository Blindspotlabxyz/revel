import type { Metadata } from "next";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Mission Control",
  description: "Run Revel analyses, view reports, and export your product roadmap.",
  path: "/mission-control",
  noIndex: true,
});

export default function MissionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}