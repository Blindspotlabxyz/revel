"use client";

import { usePathname } from "next/navigation";
import { BackToMissionControl } from "@/components/dashboard/back-to-mission-control";

export function MissionControlBackHome() {
  const pathname = usePathname();

  if (pathname === "/mission-control") {
    return null;
  }

  return <BackToMissionControl />;
}