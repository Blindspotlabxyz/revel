# Revel Partner API contract

Base: `https://tryrevel.xyz`

## Auth

```http
Authorization: Bearer rvl_pk_<secret>
# or
X-Revel-Partner-Key: rvl_pk_<secret>
```

Keys issued once from Revel Mission Control → Partners → Issue key.

## GET /api/partner/v1/health

No auth. Returns version, endpoints, pricing.

## POST /api/partner/v1/analyze

**Body:** `{ "url": "https://example.com" }`

**Response 200:**

```json
{
  "analysisId": "uuid",
  "website": "https://example.com",
  "status": "processing",
  "poll": "/api/partner/v1/report/uuid",
  "partner": { "name": "Arcapush", "billingMode": "whitelisted" }
}
```

**Errors:** 401, 402 (no credits), 403 (pending), 429

## GET /api/partner/v1/report/:analysisId

Returns full analysis (same shape as Mission Control report API). Partner can only read analyses they started.

**Completed:**

```json
{
  "id": "uuid",
  "website": "https://example.com",
  "status": "completed",
  "score": 72,
  "report": {
    "score": 72,
    "summary": "...",
    "blindspots": [
      {
        "id": "bs-1",
        "title": "...",
        "priority": "critical",
        "category": "messaging",
        "description": "...",
        "suggestedFix": "..."
      }
    ],
    "blueprint": [],
    "actions": []
  }
}
```

## Billing modes

| access_type | Behavior |
|---|---|
| `whitelisted` | Free (admin-approved, e.g. Arcapush) |
| `trial` | Free with optional monthly quota |
| `paid` | Requires `credits_balance` > 0; 1 credit per analyze |

## TypeScript types

Copy from Revel `types/analysis.ts` — `AnalysisReport`, `Blindspot`, `Analysis`.