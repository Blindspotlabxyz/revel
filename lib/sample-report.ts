import type { Analysis, AnalysisReport } from "@/types/analysis";

export const sampleReport: AnalysisReport = {
  score: 91,
  summary:
    "Linear.app demonstrates exceptional product clarity and UX craft. The value proposition is immediately clear, navigation is intuitive, and trust signals are well-placed. Minor opportunities exist in competitive differentiation and mobile onboarding polish.",
  blindspots: [
    {
      id: "sample-1",
      title: "Enterprise positioning could be stronger",
      priority: "medium",
      category: "messaging",
      description:
        "While individual developers are well-served, enterprise buyers may need more explicit security and compliance messaging.",
      suggestedFix:
        "Add an enterprise section highlighting SOC 2, SSO, and team management capabilities.",
    },
    {
      id: "sample-2",
      title: "Competitive differentiation is subtle",
      priority: "medium",
      category: "competition",
      description:
        "The site assumes visitors already know why Linear beats Jira. New prospects may not understand the unique workflow advantages.",
      suggestedFix:
        "Add a comparison section or 'Why Linear' page with specific workflow differentiators.",
    },
    {
      id: "sample-3",
      title: "Mobile onboarding lacks guided tour",
      priority: "low",
      category: "ux",
      description:
        "Desktop users get a polished experience, but mobile first-time visitors may benefit from a brief interactive walkthrough.",
      suggestedFix:
        "Implement a 3-step mobile onboarding tooltip sequence for new signups.",
    },
  ],
  blueprint: [
    {
      id: "sample-bp-1",
      step: 1,
      title: "Strengthen enterprise messaging",
      estimatedEffort: "2 hours",
      expectedImpact: "high",
      description:
        "Create dedicated enterprise content addressing security, compliance, and team scale requirements.",
    },
    {
      id: "sample-bp-2",
      step: 2,
      title: "Add competitive comparison page",
      estimatedEffort: "3 hours",
      expectedImpact: "medium",
      description:
        "Build a 'Why Linear' page comparing workflow speed and developer experience vs. traditional tools.",
    },
    {
      id: "sample-bp-3",
      step: 3,
      title: "Implement mobile onboarding tour",
      estimatedEffort: "4 hours",
      expectedImpact: "low",
      description:
        "Add a lightweight guided tour for mobile first-time users highlighting core workflow features.",
    },
  ],
  actions: [
    {
      id: "sample-act-1",
      title: "Draft enterprise security page",
      description:
        "Document SOC 2, SSO, audit logs, and data residency for enterprise prospects.",
      priority: "medium",
      estimatedEffort: "2 hours",
      expectedOutcome: "Increased enterprise pipeline conversion",
    },
    {
      id: "sample-act-2",
      title: "Create Jira comparison content",
      description:
        "Write 5 specific workflow advantages with screenshots and time-saved metrics.",
      priority: "medium",
      estimatedEffort: "3 hours",
      expectedOutcome: "Clearer competitive positioning for evaluators",
    },
    {
      id: "sample-act-3",
      title: "Design mobile onboarding tooltips",
      description:
        "Create 3-step tooltip sequence for issue creation, keyboard shortcuts, and cycles.",
      priority: "low",
      estimatedEffort: "4 hours",
      expectedOutcome: "Improved mobile activation rate",
    },
  ],
};

export const sampleAnalysis: Analysis = {
  id: "sample",
  website: "https://linear.app",
  status: "completed",
  score: 91,
  createdAt: new Date().toISOString(),
  report: sampleReport,
};