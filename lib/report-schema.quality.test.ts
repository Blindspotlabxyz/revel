import assert from "node:assert/strict";
import {
  GENERIC_SUGGESTED_FIX,
  isCompleteReport,
  normalizeAnalysisReport,
} from "@/lib/report-schema";

// Thin shell: summary + score only
const thin = normalizeAnalysisReport({
  score: 80,
  summary:
    "Mojeeb is a skilled AI and Web3 product engineer with a strong portfolio of shipped products.",
  blindspots: [],
  blueprint: [],
  actions: [],
});
assert.equal(thin.blindspots.length, 0);
assert.equal(isCompleteReport(thin), false);

// Title-only strings must NOT become fake findings
const stringsOnly = normalizeAnalysisReport({
  score: 70,
  summary:
    "Moou is a productivity tool with a simple homepage and limited pricing info on the landing page.",
  blindspots: [
    "Lack of clear product positioning",
    "Insufficient information on pricing and features",
    "No clear call-to-action on the homepage",
    "Limited trust signals",
    "Unclear target audience",
    "No clear unique value proposition",
  ],
  blueprint: [],
  actions: [],
});
assert.equal(stringsOnly.blindspots.length, 0);
assert.equal(isCompleteReport(stringsOnly), false);

// Generic title=description + placeholder fix → filtered / incomplete
const genericRows = normalizeAnalysisReport({
  score: 70,
  summary:
    "Moou is a productivity tool with a simple homepage and limited information on pricing and features.",
  blindspots: [
    {
      title: "Lack of clear product positioning",
      priority: "medium",
      category: "product",
      description: "Lack of clear product positioning",
      suggestedFix: GENERIC_SUGGESTED_FIX,
    },
    {
      title: "Insufficient information on pricing and features",
      priority: "medium",
      category: "product",
      description: "Insufficient information on pricing and features",
      suggestedFix: GENERIC_SUGGESTED_FIX,
    },
    {
      title: "No clear call-to-action on the homepage",
      priority: "medium",
      category: "product",
      description: "No clear call-to-action on the homepage",
      suggestedFix: GENERIC_SUGGESTED_FIX,
    },
    {
      title: "Limited trust signals",
      priority: "medium",
      category: "product",
      description: "Limited trust signals",
      suggestedFix: GENERIC_SUGGESTED_FIX,
    },
  ],
  blueprint: [
    {
      step: 1,
      title: "Fix hero",
      estimatedEffort: "1h",
      expectedImpact: "high",
      description: "Fix hero",
    },
  ],
  actions: [],
});
assert.equal(genericRows.blindspots.length, 0);
assert.equal(isCompleteReport(genericRows), false);

// Substantive multi-category report passes
const good = normalizeAnalysisReport({
  score: 62,
  summary:
    "Moou positions as a productivity tool but the homepage never names the job-to-be-done, buries pricing, and shows no proof or primary CTA hierarchy.",
  blindspots: [
    {
      id: "bs-1",
      title: "Hero never states the job-to-be-done",
      priority: "critical",
      category: "messaging",
      description:
        "The hero does not explain who Moou is for or what outcome users get in one sentence, so first-time visitors cannot self-qualify in five seconds.",
      suggestedFix:
        "Rewrite the H1 to outcome + audience (e.g. 'Ship weekly plans without spreadsheet chaos for solo founders') and put a one-line subhead under it.",
    },
    {
      id: "bs-2",
      title: "Primary CTA is weak or missing",
      priority: "high",
      category: "ux",
      description:
        "Homepage CTAs do not create a single dominant next step; equal-weight links dilute conversion and make the product feel unfinished.",
      suggestedFix:
        "One solid primary button (Start free / Get access) above the fold; demote secondary links to text.",
    },
    {
      id: "bs-3",
      title: "Pricing is invisible",
      priority: "high",
      category: "product",
      description:
        "There is no pricing section or 'starting at' cue, so evaluators cannot estimate cost and will bounce to competitors with transparent plans.",
      suggestedFix:
        "Add a pricing block or 'Starting at $X' with a link to full plans on the homepage.",
    },
    {
      id: "bs-4",
      title: "No trust or proof near the hero",
      priority: "medium",
      category: "product",
      description:
        "No logos, testimonials, or usage metrics appear early, so cold traffic has no reason to believe the product works.",
      suggestedFix:
        "Place 3 logos or one short testimonial with a name/role directly under the primary CTA.",
    },
    {
      id: "bs-5",
      title: "Differentiation is unclear vs generic tools",
      priority: "medium",
      category: "competition",
      description:
        "The site does not contrast Moou against Notion/Todo apps or spreadsheets, so the wedge is invisible.",
      suggestedFix:
        "Add a 'Why Moou' section with 3 concrete differences tied to a specific workflow.",
    },
  ],
  blueprint: [
    {
      id: "bp-1",
      step: 1,
      title: "Rewrite hero for clarity",
      estimatedEffort: "45 minutes",
      expectedImpact: "high",
      description:
        "Ship an outcome-led H1/subhead and single primary CTA; test with someone who has never seen the product.",
    },
    {
      id: "bp-2",
      step: 2,
      title: "Surface pricing cue",
      estimatedEffort: "1 hour",
      expectedImpact: "high",
      description:
        "Add starting price or free tier language on homepage with link to full pricing.",
    },
    {
      id: "bp-3",
      step: 3,
      title: "Add proof under CTA",
      estimatedEffort: "1 hour",
      expectedImpact: "medium",
      description:
        "Collect one quote and three logos; place them immediately under the hero action.",
    },
  ],
  actions: [
    {
      id: "a1",
      title: "Draft new hero copy",
      description: "Write 3 H1 options with audience + outcome; pick one.",
      priority: "critical",
      estimatedEffort: "30 minutes",
      expectedOutcome: "Visitors understand Moou in five seconds",
    },
    {
      id: "a2",
      title: "Ship single primary CTA",
      description: "Style one button as primary; demote others.",
      priority: "high",
      estimatedEffort: "20 minutes",
      expectedOutcome: "Higher click-through to signup",
    },
    {
      id: "a3",
      title: "Add pricing teaser",
      description: "Starting-at line + link to /pricing.",
      priority: "high",
      estimatedEffort: "45 minutes",
      expectedOutcome: "Faster evaluation",
    },
    {
      id: "a4",
      title: "Collect one testimonial",
      description: "Ask one user for a 1-sentence quote with name/role.",
      priority: "medium",
      estimatedEffort: "1 hour",
      expectedOutcome: "Early trust signal",
    },
    {
      id: "a5",
      title: "Why Moou section",
      description: "Three bullets vs spreadsheets/Notion for your niche.",
      priority: "medium",
      estimatedEffort: "1 hour",
      expectedOutcome: "Clearer differentiation",
    },
  ],
});
assert.ok(good.blindspots.length >= 4);
assert.equal(isCompleteReport(good), true);

console.log("report-schema quality tests passed");
