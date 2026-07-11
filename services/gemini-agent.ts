import {
  getAgentMaxSteps,
  getGeminiModels,
} from "@/lib/analysis-provider";
import { resilientFetch } from "@/lib/resilient-fetch";
import { buildAgentSystemPrompt } from "@/lib/prompt-builder";
import type { AnalysisReport } from "@/types/analysis";
import {
  AGENT_TOOL_DECLARATIONS,
  executeAgentTool,
  isAgentToolName,
} from "@/services/agent-tools";

type GeminiPart = {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
  thoughtSignature?: string;
  [key: string]: unknown;
};

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
  finishMessage?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

function geminiEndpoint(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

function isRetryableGeminiStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 503;
}

function toolConfigForModel(
  model: string,
  options?: { submitOnly?: boolean }
): {
  functionCallingConfig: {
    mode: "AUTO" | "ANY";
    allowedFunctionNames?: string[];
  };
} {
  if (options?.submitOnly) {
    return {
      functionCallingConfig: {
        mode: "ANY",
        allowedFunctionNames: ["submit_analysis_report"],
      },
    };
  }

  // Lite models often reply with chat instead of tools under AUTO.
  return {
    functionCallingConfig: { mode: model.includes("lite") ? "ANY" : "AUTO" },
  };
}

async function callGemini(
  apiKey: string,
  model: string,
  contents: GeminiContent[],
  options?: { submitOnly?: boolean }
): Promise<
  | { ok: true; data: GeminiResponse }
  | { ok: false; status: number; detail: string }
> {
  try {
    const response = await resilientFetch(geminiEndpoint(model, apiKey), {
      context: "Gemini API",
      retries: 2,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildAgentSystemPrompt() }],
        },
        contents,
        tools: [{ functionDeclarations: AGENT_TOOL_DECLARATIONS }],
        toolConfig: toolConfigForModel(model, options),
        generationConfig: {
          temperature: 0.4,
          ...(model.includes("lite")
            ? { thinkingConfig: { thinkingBudget: 0 } }
            : {}),
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, status: response.status, detail };
    }

    return { ok: true, data: (await response.json()) as GeminiResponse };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Gemini API unreachable";
    return { ok: false, status: 503, detail };
  }
}

async function callGeminiWithFallback(
  apiKey: string,
  contents: GeminiContent[],
  preferredModel: string,
  models: string[],
  options?: { submitOnly?: boolean }
): Promise<{ data: GeminiResponse; model: string }> {
  const ordered = [
    preferredModel,
    ...models.filter((model) => model !== preferredModel),
  ];
  const errors: string[] = [];

  for (const model of ordered) {
    const result = await callGemini(apiKey, model, contents, options);

    if (result.ok) {
      return { data: result.data, model };
    }

    errors.push(`${model} (${result.status}): ${result.detail.slice(0, 120)}`);

    if (!isRetryableGeminiStatus(result.status)) {
      break;
    }
  }

  const quotaOnly = errors.length > 0 && errors.every((entry) => entry.includes("(429)"));

  if (quotaOnly) {
    throw new Error(
      "Gemini free quota exceeded (429). Quota resets daily. Use gemini-2.5-flash-lite locally, or wait for reset."
    );
  }

  throw new Error(
    `All Gemini models failed. Last errors: ${errors.slice(-2).join(" | ")}`
  );
}

function extractFunctionCalls(candidate: GeminiCandidate | undefined): Array<{
  name: string;
  args: Record<string, unknown>;
}> {
  const parts = candidate?.content?.parts ?? [];
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];

  for (const part of parts) {
    const fn = part.functionCall;
    if (fn?.name) {
      calls.push({
        name: fn.name,
        args: fn.args ?? {},
      });
    }
  }

  return calls;
}

function hasModelText(candidate: GeminiCandidate | undefined): string | null {
  const parts = candidate?.content?.parts ?? [];
  for (const part of parts) {
    if (part.text?.trim()) {
      return part.text.trim();
    }
  }
  return null;
}

function describeEmptyCandidate(
  data: GeminiResponse,
  candidate: GeminiCandidate | undefined
): string {
  const parts = candidate?.content?.parts ?? [];
  const reason = candidate?.finishReason ?? "no_candidate";
  const message = candidate?.finishMessage ?? "";
  const blocked = data.promptFeedback?.blockReason ?? "";
  const partKeys = parts.map((part) => Object.keys(part).join("+")).join(", ");

  return [
    `finishReason=${reason}`,
    message && `message=${message}`,
    blocked && `blockReason=${blocked}`,
    partKeys && `partKeys=${partKeys}`,
  ]
    .filter(Boolean)
    .join(", ");
}

function nextToolNudge(fetchedPages: number): string {
  if (fetchedPages === 0) {
    return "Call fetch_url on the homepage now.";
  }
  if (fetchedPages === 1) {
    return "Call discover_internal_links on the homepage, then fetch_url on one pricing/about page.";
  }
  if (fetchedPages < 3) {
    return "Call fetch_url on one more key page if needed, or submit_analysis_report with report_json.";
  }
  return "You have enough context. Call submit_analysis_report with report_json containing the full audit JSON.";
}

export async function runGeminiAgent(website: string): Promise<AnalysisReport> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for agentic analysis");
  }

  const models = getGeminiModels();
  let activeModel = models[0];
  const maxSteps = getAgentMaxSteps();
  const contents: GeminiContent[] = [
    {
      role: "user",
      parts: [
        {
          text: `Analyze this website and produce a strategic product audit: ${website}

Start by fetching the homepage, then discover and fetch 1-2 key pages (pricing or about). Submit via submit_analysis_report with report_json as soon as you have enough evidence — do not over-fetch.`,
        },
      ],
    },
  ];

  let submittedReport: AnalysisReport | null = null;
  let fetchedPages = 0;

  for (let step = 0; step < maxSteps; step++) {
    const submitOnly = fetchedPages >= 2 || step >= maxSteps - 2;
    let modelParts: GeminiPart[] = [];
    let functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
    let candidate: GeminiCandidate | undefined;
    let data: GeminiResponse | undefined;

    if (submitOnly) {
      contents.push({
        role: "user",
        parts: [
          {
            text: "You have enough page content. Call submit_analysis_report now. Requirements: ≥4 blindspots with description≠title and specific suggestedFix (never 'Review this area…'), ≥2 categories, ≥1 high/critical priority, ≥3 blueprint steps, ≥5 actions. Quote real page text in descriptions.",
          },
        ],
      });
    }

    for (let apiRetry = 0; apiRetry < 3; apiRetry++) {
      let usedModel: string;
      ({ data, model: usedModel } = await callGeminiWithFallback(
        apiKey,
        contents,
        activeModel,
        models,
        { submitOnly }
      ));
      activeModel = usedModel;

      if (data.promptFeedback?.blockReason) {
        throw new Error(
          `Gemini blocked the request: ${data.promptFeedback.blockReason}`
        );
      }

      candidate = data.candidates?.[0];
      modelParts = candidate?.content?.parts ?? [];
      functionCalls = extractFunctionCalls(candidate);

      if (functionCalls.length) {
        break;
      }

      const text = hasModelText(candidate);
      if (text) {
        contents.push({ role: "model", parts: [{ text }] });
      }

      contents.push({
        role: "user",
        parts: [
          {
            text: `${nextToolNudge(fetchedPages)} Respond with a function call, not plain text.`,
          },
        ],
      });
    }

    if (!functionCalls.length) {
      throw new Error(
        `Gemini returned no tool calls (${describeEmptyCandidate(data!, candidate)})`
      );
    }

    // Preserve thoughtSignature and other Gemini 2.5 metadata for follow-up turns.
    contents.push({ role: "model", parts: modelParts });

    const responseParts: GeminiPart[] = [];

    for (const call of functionCalls) {
      if (!isAgentToolName(call.name)) {
        responseParts.push({
          functionResponse: {
            name: call.name,
            response: { error: `Unknown tool: ${call.name}` },
          },
        });
        continue;
      }

      const result = await executeAgentTool(call.name, call.args);
      responseParts.push({
        functionResponse: { name: call.name, response: result.response },
      });

      if (call.name === "fetch_url" && !result.response.error) {
        fetchedPages++;
      }

      if (result.report) {
        submittedReport = result.report;
      }
    }

    contents.push({ role: "user", parts: responseParts });

    if (submittedReport) {
      return submittedReport;
    }
  }

  throw new Error(
    `Agent did not submit a report within ${maxSteps} steps. Try increasing AGENT_MAX_STEPS.`
  );
}