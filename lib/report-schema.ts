import { z } from "zod";
import type {
  ActionTask,
  AnalysisReport,
  Blindspot,
  BlueprintStep,
  Category,
  Impact,
  Priority,
} from "@/types/analysis";

const priority = z.enum(["critical", "high", "medium", "low"]);
const category = z.enum(["product", "ux", "messaging", "competition"]);
const impact = z.enum(["high", "medium", "low"]);

export const analysisReportSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(20),
  blindspots: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        priority,
        category,
        description: z.string(),
        suggestedFix: z.string(),
      })
    )
    .min(4),
  blueprint: z
    .array(
      z.object({
        id: z.string(),
        step: z.number(),
        title: z.string(),
        estimatedEffort: z.string(),
        expectedImpact: impact,
        description: z.string(),
      })
    )
    .min(3),
  actions: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        priority,
        estimatedEffort: z.string(),
        expectedOutcome: z.string(),
      })
    )
    .min(5),
});

export function parseAnalysisReport(raw: unknown): AnalysisReport {
  return analysisReportSchema.parse(raw);
}

/** Always returns arrays — never throws on partial/malformed LLM output. */
export function normalizeAnalysisReport(raw: unknown): AnalysisReport {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const blindspots = asObjectArray(source.blindspots)
    .map((item, index) => normalizeBlindspot(item, index))
    .filter((item): item is Blindspot => item !== null);

  const blueprint = asObjectArray(source.blueprint)
    .flatMap((item, index) => normalizeBlueprintSteps(item, index))
    .map((step, index) => ({ ...step, step: step.step || index + 1 }))
    .sort((a, b) => a.step - b.step);

  let actions = asObjectArray(source.actions)
    .map((item, index) => normalizeAction(item, index))
    .filter((item): item is ActionTask => item !== null);

  // Recover when models omit actions or return non-arrays
  if (actions.length === 0) {
    actions = synthesizeActions(blindspots, blueprint);
  }

  const scoreRaw = source.score;
  const score =
    typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
      ? Math.max(0, Math.min(100, Math.round(scoreRaw)))
      : typeof scoreRaw === "string" && scoreRaw.trim() && !Number.isNaN(Number(scoreRaw))
        ? Math.max(0, Math.min(100, Math.round(Number(scoreRaw))))
        : 50;

  const summary =
    typeof source.summary === "string" && source.summary.trim()
      ? source.summary.trim()
      : "Analysis completed. Review blindspots and the blueprint for prioritized next steps.";

  return {
    score,
    summary,
    blindspots,
    blueprint,
    actions,
  };
}

function asObjectArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object" && !Array.isArray(item)
    );
  }

  // Some models nest under { items: [...] } or similar
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["items", "data", "list", "results"]) {
      if (Array.isArray(record[key])) {
        return asObjectArray(record[key]);
      }
    }
  }

  return [];
}

function pickString(
  item: Record<string, unknown>,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  // Recover values when LLM corrupts keys, e.g.
  // "estimatedEffort\": \"1 hour\", \"description\": ": "actual description"
  for (const [key, value] of Object.entries(item)) {
    if (typeof value !== "string" || !value.trim()) continue;
    const lower = key.toLowerCase();
    if (keys.some((wanted) => lower.includes(wanted.toLowerCase()))) {
      return value.trim();
    }
  }

  return fallback;
}

function pickNumber(item: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function normalizePriority(value: unknown, fallback: Priority = "medium"): Priority {
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (v === "critical" || v === "high" || v === "medium" || v === "low") {
      return v;
    }
  }
  return fallback;
}

function normalizeCategory(value: unknown, fallback: Category = "product"): Category {
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (v === "product" || v === "ux" || v === "messaging" || v === "competition") {
      return v;
    }
  }
  return fallback;
}

function normalizeImpact(value: unknown, fallback: Impact = "medium"): Impact {
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (v === "high" || v === "medium" || v === "low") {
      return v;
    }
  }
  return fallback;
}

function normalizeBlindspot(
  item: Record<string, unknown>,
  index: number
): Blindspot | null {
  const title = pickString(item, ["title", "name", "issue"], "");
  if (!title) return null;

  const description = pickString(
    item,
    ["description", "detail", "details", "issue"],
    title
  );
  const suggestedFix = pickString(
    item,
    ["suggestedFix", "suggested_fix", "fix", "recommendation", "solution"],
    "Review this area and implement a concrete fix this week."
  );

  return {
    id: pickString(item, ["id"], `bs-${index + 1}`),
    title,
    priority: normalizePriority(item.priority),
    category: normalizeCategory(item.category),
    description,
    suggestedFix,
  };
}

function looksCorrupted(text: string): boolean {
  return /\\"|\"\s*:|\{|\}\s*,|estimatedEffort\\/.test(text);
}

function extractQuotedField(blob: string, field: string): string | null {
  // Match "field": "value" including escaped-quote variants from broken LLM JSON
  const patterns = [
    new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    new RegExp(`${field}\\\\?"\\s*:\\s*\\\\?"([^"\\\\]+)`, "i"),
  ];
  for (const re of patterns) {
    const match = blob.match(re);
    if (match?.[1]) {
      return match[1].replace(/\\"/g, '"').replace(/\\n/g, " ").trim();
    }
  }
  return null;
}

function stepsFromBlob(blob: string, index: number): BlueprintStep[] {
  if (!blob || blob.length < 8) return [];

  // Split on object boundaries if multiple steps were glued into one string
  const chunks = blob.includes('"title"')
    ? blob.split(/(?=\s*"id"\s*:|"id\\?"\s*:)/g).filter((c) => c.trim())
    : [blob];

  const steps: BlueprintStep[] = [];
  chunks.forEach((chunk, chunkIndex) => {
    const title = extractQuotedField(chunk, "title");
    if (!title || looksCorrupted(title)) return;

    const stepNum =
      Number(extractQuotedField(chunk, "step")) ||
      index + chunkIndex + 1;
    const id =
      extractQuotedField(chunk, "id") || `bp-recovered-${index}-${chunkIndex}`;
    const description =
      extractQuotedField(chunk, "description") || title;
    const estimatedEffort =
      extractQuotedField(chunk, "estimatedEffort") || "1 hour";
    const expectedImpact = normalizeImpact(
      extractQuotedField(chunk, "expectedImpact")
    );

    steps.push({
      id,
      step: Number.isFinite(stepNum) ? stepNum : index + chunkIndex + 1,
      title,
      estimatedEffort,
      expectedImpact,
      description,
    });
  });

  return steps;
}

function normalizeBlueprintSteps(
  item: Record<string, unknown>,
  index: number
): BlueprintStep[] {
  const title = pickString(item, ["title", "name"], "");
  const description = pickString(
    item,
    ["description", "detail", "details", "body"],
    ""
  );
  const estimatedEffort = pickString(
    item,
    ["estimatedEffort", "estimated_effort", "effort", "eta"],
    "1 hour"
  );
  const expectedImpact = normalizeImpact(
    item.expectedImpact ?? item.expected_impact ?? item.impact
  );

  // Clean row: title present and not garbage
  if (title && !looksCorrupted(title)) {
    return [
      {
        id: pickString(item, ["id"], `bp-${index + 1}`),
        step: pickNumber(item, ["step", "order", "index", "position"]) ?? index + 1,
        title,
        estimatedEffort: looksCorrupted(estimatedEffort) ? "1 hour" : estimatedEffort,
        expectedImpact,
        description:
          description && !looksCorrupted(description) ? description : title,
      },
    ];
  }

  // Corrupted row: recover every embedded step from keys + values
  const blob = Object.entries(item)
    .map(([k, v]) => `${k} ${typeof v === "string" ? v : JSON.stringify(v) ?? ""}`)
    .join(" ");

  const recovered = stepsFromBlob(blob, index);
  if (recovered.length > 0) return recovered;

  return [];
}

function normalizeAction(
  item: Record<string, unknown>,
  index: number
): ActionTask | null {
  const title = pickString(item, ["title", "name", "task"], "");
  if (!title) return null;

  return {
    id: pickString(item, ["id"], `act-${index + 1}`),
    title,
    description: pickString(
      item,
      ["description", "detail", "details", "body"],
      title
    ),
    priority: normalizePriority(item.priority),
    estimatedEffort: pickString(
      item,
      ["estimatedEffort", "estimated_effort", "effort", "eta"],
      "1 hour"
    ),
    expectedOutcome: pickString(
      item,
      ["expectedOutcome", "expected_outcome", "outcome", "result"],
      "Measurable product improvement"
    ),
  };
}

/** Build Action Queue when the model omits `actions` entirely. */
function synthesizeActions(
  blindspots: Blindspot[],
  blueprint: BlueprintStep[]
): ActionTask[] {
  const fromBlueprint = blueprint.map((step, index) => ({
    id: `synth-bp-${step.id || index + 1}`,
    title: step.title,
    description: step.description,
    priority:
      step.expectedImpact === "high"
        ? ("high" as const)
        : step.expectedImpact === "low"
          ? ("low" as const)
          : ("medium" as const),
    estimatedEffort: step.estimatedEffort || "1 hour",
    expectedOutcome: `${step.expectedImpact} impact improvement`,
  }));

  const fromBlindspots = blindspots.slice(0, 8).map((bs, index) => ({
    id: `synth-bs-${bs.id || index + 1}`,
    title: bs.title,
    description: bs.suggestedFix || bs.description,
    priority: bs.priority,
    estimatedEffort: "1 hour",
    expectedOutcome: "Reduce this blindspot and improve product clarity",
  }));

  const merged = [...fromBlueprint, ...fromBlindspots];
  if (merged.length > 0) return merged;

  return [
    {
      id: "synth-default-1",
      title: "Review report findings",
      description:
        "Walk through blindspots and blueprint with your team and pick the top three fixes for this week.",
      priority: "high",
      estimatedEffort: "30 minutes",
      expectedOutcome: "Clear prioritized plan",
    },
  ];
}
