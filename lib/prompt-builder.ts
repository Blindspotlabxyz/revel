export function buildAnalysisPrompt(website: string, content: string): string {
  return `You are an experienced product strategist, UX researcher, and founder advisor.

Analyze the following website and return a strategic product audit.

Website: ${website}

Extracted content:
${content.slice(0, 12000)}

Return ONLY valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "blindspots": [
    {
      "id": "<unique-id>",
      "title": "<concise issue title>",
      "priority": "<critical|high|medium|low>",
      "category": "<product|ux|messaging|competition>",
      "description": "<why this matters, what happens if ignored>",
      "suggestedFix": "<specific actionable fix>"
    }
  ],
  "blueprint": [
    {
      "id": "<unique-id>",
      "step": <number starting at 1>,
      "title": "<action title>",
      "estimatedEffort": "<e.g. 20 minutes, 1 hour>",
      "expectedImpact": "<high|medium|low>",
      "description": "<what to do and why>"
    }
  ],
  "actions": [
    {
      "id": "<unique-id>",
      "title": "<task title>",
      "description": "<implementation details>",
      "priority": "<critical|high|medium|low>",
      "estimatedEffort": "<time estimate>",
      "expectedOutcome": "<expected result>"
    }
  ]
}

Rules:
- Provide 6-10 blindspots across all categories
- Provide 5-8 blueprint steps ordered by business impact
- Provide 8-15 actionable tasks
- Be specific to this website, not generic
- Write for founders, not engineers
- Every recommendation must answer: why it matters, what happens if ignored, how to fix it`;
}