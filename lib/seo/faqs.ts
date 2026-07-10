export type FaqItem = {
  question: string;
  answer: string;
  category: "product" | "access" | "privacy" | "integrations";
};

export const faqGroups: {
  id: FaqItem["category"];
  title: string;
  description: string;
  items: FaqItem[];
}[] = [
  {
    id: "product",
    title: "Product",
    description: "What Revel analyzes and what you get back.",
    items: [
      {
        category: "product",
        question: "What does Revel analyze?",
        answer:
          "Revel analyzes your website's product positioning, user experience, messaging clarity, and competitive landscape. You receive a prioritized roadmap with actionable improvements.",
      },
      {
        category: "product",
        question: "How long does an analysis take?",
        answer:
          "Most analyses complete in about 1 to 3 minutes. You will see each stage complete in real time as Revel investigates your product.",
      },
      {
        category: "product",
        question: "What is the Reveal Index?",
        answer:
          "The Reveal Index is a single score that summarizes overall product health across positioning, UX, messaging, and competitive clarity.",
      },
      {
        category: "product",
        question: "What is a Blueprint in Revel?",
        answer:
          "The Blueprint is a prioritized sequence of improvements ranked by impact and effort so your team knows what to ship next.",
      },
      {
        category: "product",
        question: "How is Revel different from a generic AI chat?",
        answer:
          "Revel runs a structured product investigation and returns scored blindspots, a Blueprint roadmap, and an Action Queue you can export. It is not open-ended chat. Compare Revel with ChatGPT, audit tools, and consultants at /compare.",
      },
      {
        category: "product",
        question: "Who is Revel built for?",
        answer:
          "Founders, product managers, indie hackers, agencies, designers, developers, and growth teams who want strategic product feedback without hiring consultants.",
      },
    ],
  },
  {
    id: "access",
    title: "Access & pricing",
    description: "Early access limits and how billing works today.",
    items: [
      {
        category: "access",
        question: "How much does Revel cost?",
        answer:
          "There is no multi-tier SaaS pricing page yet. Early access includes free weekly audits in Mission Control. Agent audits via OKX.AI are usage-priced (about $0.35 per completed audit). Partner API access is available separately. See /pricing for details.",
      },
      {
        category: "access",
        question: "How many analyses can I run?",
        answer:
          "Mission Control includes 3 free audits per week (resets Monday 00:00 UTC). Need more volume? OKX.AI marketplace offers about $0.35 per successful audit via the Revel MCP endpoint.",
      },
      {
        category: "access",
        question: "Does Revel use AI?",
        answer:
          "Yes, but you never choose models or write prompts. Revel handles the investigation. You focus on the insights and roadmap.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & security",
    description: "How public URLs and report data are handled.",
    items: [
      {
        category: "privacy",
        question: "Can I analyze private products?",
        answer:
          "Revel analyzes publicly accessible websites. Private or password-protected pages are not supported in this version.",
      },
      {
        category: "privacy",
        question: "How is my data handled?",
        answer:
          "Revel fetches only public pages you submit, stores analysis results for your account, and does not sell your data. We do not store private keys or wallet credentials. Read the full policy at /privacy.",
      },
      {
        category: "privacy",
        question: "Is my product URL shared publicly?",
        answer:
          "Analyses in Mission Control are private to your account. Public sample reports (like the Genesis report) are intentionally published demos, not your private runs.",
      },
    ],
  },
  {
    id: "integrations",
    title: "Exports & integrations",
    description: "Getting insights into your workflow.",
    items: [
      {
        category: "integrations",
        question: "Can I export results?",
        answer:
          "Yes. Export your Blueprint and Action Queue as Markdown, GitHub-flavored Markdown, or JSON. Linear, Notion, and GitHub Gist are available when configured.",
      },
      {
        category: "integrations",
        question: "Can I embed Revel in my product?",
        answer:
          "Yes. Use the Partner API for server-side audits, or MCP / A2MCP for AI agents on OKX.AI. Start at /partners and /docs/mcp.",
      },
    ],
  },
];

/** Flat list for JSON-LD, docs, and llms.txt */
export const revelFaqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

/** Homepage: top questions only — full set lives under grouped FAQ */
export const homepageFaqs: FaqItem[] = [
  revelFaqs.find((f) => f.question === "What does Revel analyze?")!,
  revelFaqs.find((f) => f.question === "How much does Revel cost?")!,
  revelFaqs.find((f) => f.question === "How is Revel different from a generic AI chat?")!,
  revelFaqs.find((f) => f.question === "How is my data handled?")!,
  revelFaqs.find((f) => f.question === "Can I export results?")!,
  revelFaqs.find((f) => f.question === "How many analyses can I run?")!,
];
