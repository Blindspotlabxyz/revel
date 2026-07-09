/**
 * Stats from Revel's live Arcapush genesis audit
 * (report 89a99571-be09-4aa1-a8aa-17ff1cb5bdf3).
 */
export const GENESIS_REPORT_WEBSITE = "https://arcapush.com";

export const genesisReportStats = {
  revealIndex: 55,
  blindspotsTotal: 8,
  highPriority: 2,
  mediumPriority: 4,
  lowPriority: 2,
  criticalPriority: 0,
  tasksGenerated: 12,
  blueprintSteps: 6,
} as const;

export const genesisReportStatCards = [
  { label: "Reveal Index", value: String(genesisReportStats.revealIndex) },
  {
    label: "Blindspots Found",
    value: String(genesisReportStats.blindspotsTotal),
  },
  {
    label: "High Priority",
    value: String(genesisReportStats.highPriority),
  },
  {
    label: "Tasks Generated",
    value: String(genesisReportStats.tasksGenerated),
  },
] as const;