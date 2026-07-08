---
name: revel-a2mcp
description: Revel Agent-to-MCP (A2MCP) server — audit websites, return Reveal Index, Blueprint, and Action Queue via MCP tools. Use when building OKX.AI integrations, connecting Cursor/Claude to Revel, or calling revel_* MCP tools.
---

# Revel A2MCP

Revel exposes product intelligence as MCP tools for AI agents.

## When to use

- User wants to analyze a website from an agent (Cursor, Claude, OKX.AI)
- Listing Revel on OKX.AI as Agent Service Provider (A2MCP category)
- Debugging MCP transport or revel_* tool calls

## Tools

| Tool | Purpose |
|------|---------|
| `revel_health` | Capabilities check |
| `revel_analyze_website` | Start async audit → `analysisId` |
| `revel_get_analysis` | Poll status + report |
| `revel_wait_for_analysis` | Block until complete (≤300s) |
| `revel_analyze_website_and_wait` | One-shot sync audit |
| `revel_export_blueprint` | Markdown or JSON export |
| `revel_fetch_url` | Raw page text extraction |

## Local stdio

```bash
npm run mcp
```

Cursor `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "revel": {
      "command": "npx",
      "args": ["tsx", "scripts/revel-mcp.ts"]
    }
  }
}
```

## Remote HTTP (production)

- Endpoint: `https://tryrevel.xyz/api/mcp`
- Manifest: `https://tryrevel.xyz/api/mcp/manifest`
- Auth: `Authorization: Bearer $MCP_API_KEY`

## Agent workflow

1. `revel_analyze_website` → get `analysisId`
2. `revel_wait_for_analysis` (expect 1–3 minutes)
3. Read `report.score`, `report.blindspots`, `report.actions`
4. Optional: `revel_export_blueprint` with `format: markdown`

## Env

```env
MCP_API_KEY=          # HTTP auth (generate with openssl rand -base64 32)
GROQ_API_KEY=         # Agentic analysis provider
ANALYSIS_PROVIDER=groq
```

## Docs

- `/docs/mcp` on tryrevel.xyz
- `lib/mcp/handlers.ts` — tool implementation
- `scripts/revel-mcp.ts` — stdio entrypoint