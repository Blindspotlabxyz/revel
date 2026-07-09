---
name: arcapush-revel-integration
description: >
  Integrate Revel Partner API into Arcapush (Revel Check on listings). Use when building
  Arcapush, wiring REVEL_PARTNER_API_KEY, caching audit results, or implementing Revel Check v2.
  Triggers: Arcapush, Revel Check, partner API, rvl_pk_, listing quality, blindspots.
---

# Arcapush × Revel Partner API

Use Revel's **Partner REST API** — not MCP. Server-side only.

## Revel side (already built)

| Resource | URL |
|---|---|
| Partner docs | `https://tryrevel.xyz/partners` |
| Health | `GET /api/partner/v1/health` |
| Start audit | `POST /api/partner/v1/analyze` |
| Poll report | `GET /api/partner/v1/report/:analysisId` |
| Admin approve | Mission Control → **Partners** (whitelist Arcapush, issue key) |

Arcapush is seeded as `arcapush.com` (whitelisted, pending). Admin: **Approve** → **Issue key** → copy `rvl_pk_...` once.

## Arcapush env (server only)

```env
REVEL_PARTNER_API_URL=https://tryrevel.xyz
REVEL_PARTNER_API_KEY=rvl_pk_...    # from Revel admin — never in browser
REVEL_CACHE_TTL_HOURS=24
```

## Integration flow

```
Founder → "Run Revel Check"
Arcapush POST /api/listings/:id/revel-check  (your route)
  → Revel POST /api/partner/v1/analyze  { url: listing.website_url }
  → poll GET /api/partner/v1/report/:id every 3s until completed
  → cache score + top 5 blindspots on listing (24h TTL)
  → display only — no auto-edit of listing fields
```

## Arcapush server client

```ts
const REVEL = process.env.REVEL_PARTNER_API_URL ?? "https://tryrevel.xyz";
const KEY = process.env.REVEL_PARTNER_API_KEY!;

export async function revelAnalyze(url: string) {
  const res = await fetch(`${REVEL}/api/partner/v1/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
  return res.json() as Promise<{ analysisId: string; poll: string }>;
}

export async function revelPollReport(analysisId: string, maxMs = 180_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await fetch(`${REVEL}/api/partner/v1/report/${analysisId}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const data = await res.json();
    if (data.status === "completed" && data.report) return data;
    if (data.status === "failed") throw new Error(data.error ?? "Analysis failed");
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Revel analysis timed out");
}
```

## Cache columns (Arcapush DB only)

```sql
ALTER TABLE listings ADD COLUMN revel_score INTEGER;
ALTER TABLE listings ADD COLUMN revel_summary TEXT;
ALTER TABLE listings ADD COLUMN revel_top_blindspots JSONB;
ALTER TABLE listings ADD COLUMN revel_analysis_id TEXT;
ALTER TABLE listings ADD COLUMN revel_checked_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN revel_cache_expires_at TIMESTAMPTZ;
```

**Forbidden:** auto-update `title`, `problem_statement`, `description`, or any listing copy.

## UI (Bold Minimal)

- Listing edit + founder dashboard: `RevelCheckPanel`
- States: idle → loading (~2 min) → score + top blindspots
- Show "Checked X ago" when cache valid; "Run again" secondary CTA
- Map `messaging` blindspots → "Update problem statement / tagline"

See `references/arcapush-ui-states.md`.

## Errors

| Status | Meaning |
|---|---|
| 401 | Bad/missing API key |
| 402 | Paid partner, no credits |
| 403 | Pending approval — approve in Revel Partners admin |
| 429 | Rate limit — retry in 1 min |

## Prompt for Arcapush agent

```
Implement Arcapush Revel Check using Revel Partner API (not MCP).
Server route calls POST /api/partner/v1/analyze and polls /api/partner/v1/report/:id.
Cache revel_score + top 5 blindspots for 24h. RevelCheckPanel on listing edit + dashboard.
Display-only insights — never auto-modify listing content. Bold Minimal UI.
Env: REVEL_PARTNER_API_URL, REVEL_PARTNER_API_KEY.
```

## Reference audit

Arcapush genesis report:  
`https://tryrevel.xyz/mission-control/report/89a99571-be09-4aa1-a8aa-17ff1cb5bdf3`