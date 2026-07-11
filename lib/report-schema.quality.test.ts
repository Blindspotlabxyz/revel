import assert from "node:assert/strict";
import {
  isCompleteReport,
  normalizeAnalysisReport,
} from "@/lib/report-schema";

// Thin shell like production bug: summary + score only → incomplete
const thin = normalizeAnalysisReport({
  score: 80,
  summary:
    "Mojeeb is a skilled AI and Web3 product engineer with a strong portfolio of shipped products.",
  blindspots: [],
  blueprint: [],
  actions: [],
});
assert.equal(thin.blindspots.length, 0);
assert.equal(thin.actions.length, 0);
assert.equal(isCompleteReport(thin), false);

// Nested report + alternate keys
const nested = normalizeAnalysisReport({
  report: {
    score: 72,
    summary:
      "Clear product story but weak conversion path, thin social proof, and buried pricing create growth friction.",
    findings: [
      {
        title: "CTA hierarchy is unclear",
        priority: "high",
        category: "ux",
        description: "Equal-weight buttons create decision paralysis.",
        suggestedFix: "One primary CTA above the fold.",
      },
      {
        title: "Social proof is missing",
        priority: "high",
        category: "product",
        description: "No logos or testimonials early.",
        suggestedFix: "Add logos under hero.",
      },
      {
        title: "Pricing is opaque",
        priority: "critical",
        category: "product",
        description: "Buyers cannot evaluate cost.",
        suggestedFix: "Add starting price.",
      },
      {
        title: "Differentiation is weak",
        priority: "medium",
        category: "competition",
        description: "No clear why-us statement.",
        suggestedFix: "Add comparison or unique wedge.",
      },
    ],
    roadmap: [
      {
        step: 1,
        title: "Clarify hero CTA",
        estimatedEffort: "30 minutes",
        expectedImpact: "high",
        description: "One dominant action.",
      },
      {
        step: 2,
        title: "Add trust bar",
        estimatedEffort: "1 hour",
        expectedImpact: "high",
        description: "Logos + testimonial.",
      },
      {
        step: 3,
        title: "Surface pricing",
        estimatedEffort: "1 hour",
        expectedImpact: "medium",
        description: "Starting-at language.",
      },
    ],
    tasks: [],
  },
});
assert.equal(nested.blindspots.length, 4);
assert.equal(nested.blueprint.length, 3);
assert.ok(nested.actions.length >= 3);
assert.equal(isCompleteReport(nested), true);

// String findings recovery
const strings = normalizeAnalysisReport({
  score: 65,
  summary:
    "Homepage communicates ambition but leaves visitors without a crisp next step or proof.",
  blindspots: [
    "Weak headline",
    "No proof",
    "Buried pricing",
    "Generic features",
  ],
  blueprint: [
    {
      title: "Rewrite headline",
      step: 1,
      estimatedEffort: "20 minutes",
      expectedImpact: "high",
      description: "Lead with outcome.",
    },
    {
      title: "Add proof",
      step: 2,
      estimatedEffort: "30 minutes",
      expectedImpact: "high",
      description: "Logos under hero.",
    },
    {
      title: "Show pricing cue",
      step: 3,
      estimatedEffort: "20 minutes",
      expectedImpact: "medium",
      description: "Starting at.",
    },
  ],
  actions: [
    {
      title: "Rewrite hero",
      description: "Outcome-led headline",
      priority: "high",
      estimatedEffort: "30m",
      expectedOutcome: "Faster comprehension",
    },
    {
      title: "Add logos",
      description: "Trust bar",
      priority: "high",
      estimatedEffort: "30m",
      expectedOutcome: "Higher trust",
    },
    {
      title: "Pricing line",
      description: "Starting at",
      priority: "medium",
      estimatedEffort: "20m",
      expectedOutcome: "Clearer eval",
    },
    {
      title: "Feature reframes",
      description: "Benefits not features",
      priority: "medium",
      estimatedEffort: "1h",
      expectedOutcome: "Clearer value",
    },
    {
      title: "Mobile CTA pass",
      description: "Larger targets",
      priority: "low",
      estimatedEffort: "30m",
      expectedOutcome: "Better mobile convert",
    },
  ],
});
assert.equal(strings.blindspots.length, 4);
assert.equal(isCompleteReport(strings), true);

console.log("report-schema quality tests passed");
