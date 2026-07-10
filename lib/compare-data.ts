/** Feature matrix: Revel vs common alternatives founders actually consider. */

export type CompareValue = boolean | string;

export type CompareColumn = {
  id: string;
  name: string;
  tagline: string;
  highlight?: boolean;
};

export type CompareRow = {
  feature: string;
  values: Record<string, CompareValue>;
};

export const compareColumns: CompareColumn[] = [
  {
    id: "revel",
    name: "Revel",
    tagline: "AI product strategist",
    highlight: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT / Claude",
    tagline: "Generic AI chat",
  },
  {
    id: "audit-tools",
    name: "Lighthouse & SEO tools",
    tagline: "Technical audits",
  },
  {
    id: "consultant",
    name: "Product consultant",
    tagline: "Agency or freelance",
  },
];

export const compareRows: CompareRow[] = [
  {
    feature: "Structured product strategy audit",
    values: {
      revel: true,
      chatgpt: "Ad-hoc prompts",
      "audit-tools": false,
      consultant: true,
    },
  },
  {
    feature: "Reveal Index™ (product health score)",
    values: {
      revel: true,
      chatgpt: false,
      "audit-tools": "Performance scores only",
      consultant: "Custom scorecards",
    },
  },
  {
    feature: "UX, messaging & positioning review",
    values: {
      revel: true,
      chatgpt: "If you prompt well",
      "audit-tools": "Limited / technical",
      consultant: true,
    },
  },
  {
    feature: "Competitor landscape review",
    values: {
      revel: true,
      chatgpt: "Generic advice",
      "audit-tools": false,
      consultant: true,
    },
  },
  {
    feature: "Prioritized Blueprint™ roadmap",
    values: {
      revel: true,
      chatgpt: false,
      "audit-tools": false,
      consultant: "Usually in decks",
    },
  },
  {
    feature: "Action Queue™ (ship-ready tasks)",
    values: {
      revel: true,
      chatgpt: false,
      "audit-tools": false,
      consultant: "Varies",
    },
  },
  {
    feature: "Export to Markdown, JSON, workflows",
    values: {
      revel: true,
      chatgpt: "Copy-paste only",
      "audit-tools": "PDF / raw data",
      consultant: "Slides & docs",
    },
  },
  {
    feature: "Partner API & MCP for agents",
    values: {
      revel: true,
      chatgpt: false,
      "audit-tools": false,
      consultant: false,
    },
  },
  {
    feature: "Time to first insight",
    values: {
      revel: "Minutes",
      chatgpt: "Minutes (unstructured)",
      "audit-tools": "Minutes",
      consultant: "Days to weeks",
    },
  },
  {
    feature: "Typical cost to start",
    values: {
      revel: "Free early access*",
      chatgpt: "Free / subscription",
      "audit-tools": "Free / freemium",
      consultant: "$2k–$25k+",
    },
  },
];

export const competitorCards = [
  {
    id: "chatgpt",
    name: "ChatGPT / Claude",
    title: "Great for brainstorming. Weak at product ops.",
    body: "Generic models can critique a landing page if you write the right prompt. They do not return a consistent Reveal Index, Blueprint, or Action Queue your team can export and ship. Output quality depends on who is prompting.",
  },
  {
    id: "audit-tools",
    name: "Lighthouse & SEO crawlers",
    title: "Technical health is not product strategy.",
    body: "Performance, accessibility, and crawl scores matter. They do not explain weak positioning, confusing onboarding, or why competitors win the pitch. Revel focuses on growth and clarity, not Core Web Vitals alone.",
  },
  {
    id: "consultant",
    name: "Product consultants & agencies",
    title: "Deep expertise. Slow and expensive to start.",
    body: "A great strategist is hard to beat. Most founders cannot afford a multi-week engagement for every iteration. Revel gives structured, founder-ready prioritization in minutes so you ship while you decide whether to hire deeper help.",
  },
] as const;
