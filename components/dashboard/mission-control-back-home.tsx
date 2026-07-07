"use client";

import { usePathname } from "next/navigation";
import { BackToHome } from "@/components/back-to-home";
import { BackToMissionControl } from "@/components/dashboard/back-to-mission-control";

export function MissionControlBackHome() {
  const pathname = usePathname();

  if (pathname === "/mission-control") {
    return null;
  }

  if (pathname.startsWith("/mission-control/report/")) {
    return <BackToMissionControl />;
  }

  return <BackToHome />;
}