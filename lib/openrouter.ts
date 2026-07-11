import { resilientFetch } from "@/lib/resilient-fetch";
import {
  isCompleteReport,
  normalizeAnalysisReport,
  reportCompletenessError,
} from "./report-schema";
import { buildAnalysisPrompt } from "./prompt-builder";
import { siteConfig } from "./site-config";
import type { AnalysisReport } from "@/types/analysis";

/**
 * Primary: OPENROUTER_MODEL
 * Fallbacks: OPENROUTER_MODEL_FALLBACK (comma-separated), then built-in free alternates
 *
 * Production recommendation: google/gemini-2.5-flash (~$0.01/analysis, reliable JSON)
 * Free fallback when rate-limited: qwen/qwen3-next-80b-a3b-instruct:free
 */
const BUILTIN_FALLBACK_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
];

const DEFAULT_MODEL = "google/gemini-2.5-flash";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function analysisModels(): string[] {
  const primary = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const extra = (process.env.OPENROUTER_MODEL_FALLBACK ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  return [...new Set([primary, ...extra, ...BUILTIN_FALLBACK_MODELS])];
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 529;
}

async function requestAnalysis(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ ok: true; raw: string } | { ok: false; status: number; detail: string }> {
  try {
    const response = await resilientFetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        context: "OpenRouter API",
        retries: 2,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteConfig.url,
          "X-Title": "Revel",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }] as OpenRouterMessage[],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, status: response.status, detail };
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return {
        ok: false,
        status: 502,
        detail: "Empty analysis response from AI service",
      };
    }

    return { ok: true, raw };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "OpenRouter API unreachable";
    return { ok: false, status: 503, detail };
  }
}

export async function generateAnalysis(
  website: string,
  content: string
): Promise<AnalysisReport> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return generateDemoReport(website);
  }

  const prompt = buildAnalysisPrompt(website, content);
  const models = analysisModels();
  const errors: string[] = [];

  for (const model of models) {
    const result = await requestAnalysis(apiKey, model, prompt);

    if (!result.ok) {
      errors.push(`${model} (${result.status}): ${result.detail.slice(0, 120)}`);
      if (isRetryableStatus(result.status)) {
        continue;
      }
      break;
    }

    try {
      const parsed = JSON.parse(result.raw) as unknown;
      const report = normalizeAnalysisReport(parsed);
      // Reject thin shells (e.g. summary-only with 0 blindspots) — try next model
      if (!isCompleteReport(report)) {
        errors.push(
          `${model}: ${reportCompletenessError(report).slice(0, 140)}`
        );
        continue;
      }
      return report;
    } catch {
      errors.push(`${model}: invalid JSON`);
    }
  }

  const hint =
    process.env.OPENROUTER_MODEL?.endsWith(":free") || !process.env.OPENROUTER_MODEL
      ? " Try OPENROUTER_MODEL=google/gemini-2.5-flash with $5+ OpenRouter credits for production."
      : "";

  throw new Error(
    `All analysis models failed.${hint} Last errors: ${errors.slice(-2).join(" | ")}`
  );
}

function generateDemoReport(website: string): AnalysisReport {
  const domain = new URL(website).hostname.replace("www.", "");

  return {
    score: 78,
    summary: `${domain} has a solid foundation but several blindspots are limiting growth. The value proposition needs sharpening, key trust signals are missing, and the user journey has friction points that likely hurt conversion.`,
    blindspots: [
      {
        id: "bs-1",
        title: "Headline lacks clarity",
        priority: "critical",
        category: "messaging",
        description:
          "Visitors cannot immediately understand what the product does within five seconds. This increases bounce rate and wastes paid traffic.",
        suggestedFix:
          "Rewrite the hero headline to communicate your core value proposition in one sentence. Lead with the outcome, not the feature.",
      },
      {
        id: "bs-2",
        title: "Missing social proof above the fold",
        priority: "high",
        category: "product",
        description:
          "No customer logos, testimonials, or usage metrics visible early. First-time visitors lack trust signals to convert.",
        suggestedFix:
          "Add 3-5 customer logos and one short testimonial directly below the hero CTA.",
      },
      {
        id: "bs-3",
        title: "Primary CTA competes with secondary actions",
        priority: "high",
        category: "ux",
        description:
          "Multiple buttons of equal visual weight create decision paralysis. Users may leave without taking any action.",
        suggestedFix:
          "Make one primary CTA visually dominant. Demote secondary actions to text links or ghost buttons.",
      },
      {
        id: "bs-4",
        title: "Pricing transparency is unclear",
        priority: "high",
        category: "product",
        description:
          "Pricing information is buried or absent. Prospects who can't evaluate cost will delay or abandon evaluation.",
        suggestedFix:
          "Add a pricing section or clear 'starting at' indicator on the homepage with a link to full pricing.",
      },
      {
        id: "bs-5",
        title: "Feature benefits not explained",
        priority: "medium",
        category: "messaging",
        description:
          "Features are listed without connecting to user outcomes. Visitors understand what you built, not why it matters to them.",
        suggestedFix:
          "Reframe each feature as a benefit: 'Save 10 hours per week' instead of 'Automated workflows'.",
      },
      {
        id: "bs-6",
        title: "Competitors offer clearer onboarding",
        priority: "medium",
        category: "competition",
        description:
          "Similar products in your space show interactive demos and guided tours. Your static experience feels less approachable.",
        suggestedFix:
          "Add an interactive product tour or embedded demo video on the homepage.",
      },
      {
        id: "bs-7",
        title: "Mobile navigation is cramped",
        priority: "medium",
        category: "ux",
        description:
          "Mobile users may struggle to find key pages. Poor mobile UX directly impacts the growing segment of mobile-first buyers.",
        suggestedFix:
          "Simplify mobile nav to 4 items max. Ensure touch targets are at least 44px.",
      },
      {
        id: "bs-8",
        title: "No clear differentiation statement",
        priority: "low",
        category: "competition",
        description:
          "The site doesn't explain why someone should choose you over alternatives. Commoditized positioning invites comparison shopping.",
        suggestedFix:
          "Add a 'Why [Product]' section highlighting your unique approach or unfair advantage.",
      },
    ],
    blueprint: [
      {
        id: "bp-1",
        step: 1,
        title: "Clarify homepage headline",
        estimatedEffort: "20 minutes",
        expectedImpact: "high",
        description:
          "Rewrite the hero to communicate your value proposition within five seconds. Test with someone unfamiliar with your product.",
      },
      {
        id: "bp-2",
        step: 2,
        title: "Add trust signals above the fold",
        estimatedEffort: "30 minutes",
        expectedImpact: "high",
        description:
          "Place customer logos and one testimonial directly below the primary CTA to build immediate credibility.",
      },
      {
        id: "bp-3",
        step: 3,
        title: "Simplify primary CTA hierarchy",
        estimatedEffort: "15 minutes",
        expectedImpact: "high",
        description:
          "Reduce visual competition between buttons. One clear primary action per viewport.",
      },
      {
        id: "bp-4",
        step: 4,
        title: "Surface pricing information",
        estimatedEffort: "1 hour",
        expectedImpact: "medium",
        description:
          "Make pricing discoverable from the homepage. Even a 'starting at' indicator reduces evaluation friction.",
      },
      {
        id: "bp-5",
        step: 5,
        title: "Reframe features as benefits",
        estimatedEffort: "45 minutes",
        expectedImpact: "medium",
        description:
          "Audit every feature description. Replace technical language with outcome-focused copy.",
      },
      {
        id: "bp-6",
        step: 6,
        title: "Add product demo or tour",
        estimatedEffort: "2 hours",
        expectedImpact: "medium",
        description:
          "Create an interactive demo or embed a walkthrough video to match competitor onboarding experiences.",
      },
    ],
    actions: [
      {
        id: "act-1",
        title: "Rewrite hero headline",
        description:
          "Draft 3 headline variants that lead with the primary user outcome. A/B test the winner.",
        priority: "critical",
        estimatedEffort: "20 minutes",
        expectedOutcome: "Improved message clarity and reduced bounce rate",
      },
      {
        id: "act-2",
        title: "Add customer logo bar",
        description:
          "Collect 5 customer logos with permission. Place in a horizontal strip below the hero.",
        priority: "high",
        estimatedEffort: "30 minutes",
        expectedOutcome: "Increased trust and conversion on first visit",
      },
      {
        id: "act-3",
        title: "Audit CTA hierarchy",
        description:
          "Review all buttons on the homepage. Ensure one primary CTA per section with clear visual hierarchy.",
        priority: "high",
        estimatedEffort: "15 minutes",
        expectedOutcome: "Higher click-through on primary conversion action",
      },
      {
        id: "act-4",
        title: "Create pricing teaser",
        description:
          "Add a pricing section or 'Plans starting at $X' with link to full pricing page.",
        priority: "high",
        estimatedEffort: "1 hour",
        expectedOutcome: "Reduced friction for price-conscious prospects",
      },
      {
        id: "act-5",
        title: "Benefit-rewrite feature copy",
        description:
          "Go through each feature card. Replace feature names with benefit statements.",
        priority: "medium",
        estimatedEffort: "45 minutes",
        expectedOutcome: "Better product comprehension for new visitors",
      },
      {
        id: "act-6",
        title: "Record product walkthrough",
        description:
          "Create a 60-second Loom or embedded demo showing core workflow.",
        priority: "medium",
        estimatedEffort: "2 hours",
        expectedOutcome: "Improved onboarding and reduced time-to-value perception",
      },
      {
        id: "act-7",
        title: "Fix mobile navigation",
        description:
          "Simplify mobile menu. Ensure 44px touch targets and max 4 nav items.",
        priority: "medium",
        estimatedEffort: "1 hour",
        expectedOutcome: "Better mobile conversion and usability",
      },
      {
        id: "act-8",
        title: "Write differentiation section",
        description:
          "Draft a 'Why us' section with 3 unique differentiators vs. alternatives.",
        priority: "low",
        estimatedEffort: "30 minutes",
        expectedOutcome: "Clearer positioning against competitors",
      },
    ],
  };
}