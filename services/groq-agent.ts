import {
  getAgentMaxSteps,
  getGroqModels,
} from "@/lib/analysis-provider";
import { resilientFetch } from "@/lib/resilient-fetch";
import { buildAgentSystemPrompt } from "@/lib/prompt-builder";
import type { AnalysisReport } from "@/types/analysis";
import {
  executeAgentTool,
  getOpenAIAgentTools,
  isAgentToolName,
} from "@/services/agent-tools";

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: ToolCall[];
    }
  | { role: "tool"; tool_call_id: string; name: string; content: string };

interface GroqChoice {
  message?: {
    content?: string | null;
    tool_calls?: ToolCall[];
  };
  finish_reason?: string;
}

interface GroqResponse {
  choices?: GroqChoice[];
}

function isRetryableGroqStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 503;
}

async function callGroq(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: { submitOnly?: boolean }
): Promise<
  | { ok: true; data: GroqResponse }
  | { ok: false; status: number; detail: string }
> {
  const tools = getOpenAIAgentTools();

  try {
    const response = await resilientFetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        context: "Groq API",
        retries: 2,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          tools,
          tool_choice: options?.submitOnly
            ? { type: "function", function: { name: "submit_analysis_report" } }
            : "auto",
          temperature: 0.4,
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, status: response.status, detail };
    }

    return { ok: true, data: (await response.json()) as GroqResponse };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Groq API unreachable";
    return { ok: false, status: 503, detail };
  }
}

async function callGroqWithFallback(
  apiKey: string,
  messages: ChatMessage[],
  preferredModel: string,
  models: string[],
  options?: { submitOnly?: boolean }
): Promise<{ data: GroqResponse; model: string }> {
  const ordered = [
    preferredModel,
    ...models.filter((model) => model !== preferredModel),
  ];
  const errors: string[] = [];

  for (const model of ordered) {
    const result = await callGroq(apiKey, model, messages, options);

    if (result.ok) {
      return { data: result.data, model };
    }

    errors.push(`${model} (${result.status}): ${result.detail.slice(0, 120)}`);

    if (!isRetryableGroqStatus(result.status)) {
      break;
    }
  }

  throw new Error(
    `All Groq models failed. Last errors: ${errors.slice(-2).join(" | ")}`
  );
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

export async function runGroqAgent(website: string): Promise<AnalysisReport> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required for Groq agentic analysis");
  }

  const models = getGroqModels();
  let activeModel = models[0];
  const maxSteps = getAgentMaxSteps();
  const messages: ChatMessage[] = [
    { role: "system", content: buildAgentSystemPrompt() },
    {
      role: "user",
      content: `Analyze this website and produce a strategic product audit: ${website}

Start by fetching the homepage, then discover and fetch 1-2 key pages (pricing or about). Submit via submit_analysis_report with report_json as soon as you have enough evidence — do not over-fetch.`,
    },
  ];

  let submittedReport: AnalysisReport | null = null;
  let fetchedPages = 0;

  for (let step = 0; step < maxSteps; step++) {
    const submitOnly = fetchedPages >= 2 || step >= maxSteps - 2;

    if (submitOnly) {
      messages.push({
        role: "user",
        content:
          "You have enough page content. Call submit_analysis_report now. Requirements: ≥4 blindspots with description≠title and specific suggestedFix (never 'Review this area…'), ≥2 categories, ≥1 high/critical priority, ≥3 blueprint steps, ≥5 actions. Quote real page text in descriptions.",
      });
    }

    let toolCalls: ToolCall[] = [];
    let assistantMessage: GroqChoice["message"];

    for (let apiRetry = 0; apiRetry < 3; apiRetry++) {
      const { data } = await callGroqWithFallback(
        apiKey,
        messages,
        activeModel,
        models,
        { submitOnly }
      );

      assistantMessage = data.choices?.[0]?.message;
      toolCalls = assistantMessage?.tool_calls ?? [];

      if (toolCalls.length) {
        break;
      }

      const text = assistantMessage?.content?.trim();
      if (text) {
        messages.push({ role: "assistant", content: text });
      }

      messages.push({
        role: "user",
        content: `${nextToolNudge(fetchedPages)} Respond with a function call, not plain text.`,
      });
    }

    if (!toolCalls.length) {
      throw new Error(
        `Groq returned no tool calls (finish_reason=${assistantMessage ? "no_tools" : "empty"})`
      );
    }

    messages.push({
      role: "assistant",
      content: assistantMessage?.content ?? null,
      tool_calls: toolCalls,
    });

    for (const call of toolCalls) {
      const name = call.function.name;
      let args: Record<string, unknown> = {};

      try {
        args = JSON.parse(call.function.arguments || "{}") as Record<
          string,
          unknown
        >;
      } catch {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: JSON.stringify({ error: "Invalid tool arguments JSON" }),
        });
        continue;
      }

      if (!isAgentToolName(name)) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: JSON.stringify({ error: `Unknown tool: ${name}` }),
        });
        continue;
      }

      const result = await executeAgentTool(name, args);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name,
        content: JSON.stringify(result.response),
      });

      if (name === "fetch_url" && !result.response.error) {
        fetchedPages++;
      }

      if (result.report) {
        submittedReport = result.report;
      }
    }

    if (submittedReport) {
      return submittedReport;
    }
  }

  throw new Error(
    `Agent did not submit a report within ${maxSteps} steps. Try increasing AGENT_MAX_STEPS.`
  );
}