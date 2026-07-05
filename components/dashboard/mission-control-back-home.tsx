"use client";

import { usePathname } from "next/navigation";
import { BackToHome } from "@/components/back-to-home";

export function MissionControlBackHome() {
  const pathname = usePathname();

  if (pathname === "/mission-control") {
    return null;
  }

  return <BackToHome />;
}