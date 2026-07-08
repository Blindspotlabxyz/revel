# Revel

> Find the hidden gaps stopping your product from growing.

**Revel** is an AI product strategist by [BlindspotLab](https://blindspotlab.xyz). Paste a public website URL, and Revel analyzes positioning, UX, messaging, and competition, then returns a scored **Reveal Index**, prioritized **Blueprint**, and exportable **Action Queue**.

**Author:** [Mojeeb Titilayo](https://mojeeb.xyz) · **Company:** [BlindspotLab](https://blindspotlab.xyz)

**Live:** [tryrevel.xyz](https://tryrevel.xyz) · **Repo:** [github.com/Blindspotlabxyz/revel](https://github.com/Blindspotlabxyz/revel) · **License:** Proprietary. See [LICENSE](LICENSE)

---

## What ships today

| Area | Status |
|------|--------|
| Website analysis | Public URLs via Mission Control |
| Outputs | Blindspot Map, Reveal Index, Blueprint, Action Queue |
| Export | Markdown, JSON |
| Auth | NextAuth + Google (`/log-in`, `/sign-up`) |
| Website usage | 3 free audits/day per user (Mission Control) |
| MCP / OKX | Streamable HTTP at `/api/mcp`; x402 paid audits at `/api/audit` |
| Database | Supabase + Prisma (production), Supabase JS fallback locally |
| SEO / AEO | Sitemap, robots, JSON-LD, `llms.txt`, `ai.txt`, IndexNow |

**Coming soon:** additional input types (Figma, Notion, repos).

---

## Tech stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion, Radix UI
- **AI:** OpenRouter (configurable model)
- **Auth:** NextAuth (Auth.js v5) + Google OAuth
- **Data:** Supabase Postgres, Prisma 7
- **Deploy:** Vercel

---

## Quick start

### Prerequisites

- Node.js 20+
- Accounts: [OpenRouter](https://openrouter.ai), [Google Cloud Console](https://console.cloud.google.com) (OAuth), [Supabase](https://supabase.com)

### Setup

```bash
git clone https://github.com/Blindspotlabxyz/revel.git
cd revel
npm install

cp .env.example .env.local
npm run env:merge          # append any missing keys
# Fill secrets in .env.local (see .env.example for each variable)

npm run db:setup           # verify database connection
npm run dev                # http://localhost:3000
```

Configure Google OAuth credentials and set `NEXTAUTH_*` / `GOOGLE_*` vars in `.env.local` (see `.env.example`).

### Key scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build (+ IndexNow ping on Vercel) |
| `npm run env:merge` | Sync missing keys from `.env.example` → `.env.local` |
| `npm run indexnow:ping` | Manually ping Bing/IndexNow |
| `npm run db:setup` | Test DB connectivity |
| `npm run generate:brand-icons` | Regenerate favicon / PWA icons |

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. For **Vercel production**, use `https://tryrevel.xyz` (with protocol) for `NEXT_PUBLIC_APP_URL` and set `NEXT_PUBLIC_ENABLE_SUBDOMAIN_REDIRECTS=true`.

| Group | Variables |
|-------|-----------|
| Site | `NEXT_PUBLIC_APP_URL`, subdomain URLs |
| AI | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` |
| Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Database | `SUPABASE_*`, `DATABASE_URL`, `DIRECT_URL` |
| SEO | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `INDEXNOW_KEY`, `CRON_SECRET` |
| Usage | `DAILY_AUDIT_LIMIT` (default 3) |
| MCP | `MCP_API_KEY` |
| OKX billing | `OKX_API_KEY`, `OKX_SECRET_KEY`, `OKX_PASSPHRASE`, `OKX_PAY_TO`, `OKX_AUDIT_PRICE_USD` |

Generate IndexNow / cron secrets locally:

```bash
node scripts/generate-secrets.mjs
```

---

## Project structure

```
app/              # Routes (marketing, Mission Control, API, llms.txt)
components/       # UI, landing, dashboard, SEO
lib/              # Config, SEO, auth, OpenRouter, Prisma
services/         # Analysis store, export, content extraction
prisma/           # Schema and migrations
public/           # Brand assets, images, humans.txt
scripts/          # DB checks, env merge, IndexNow, brand icons
styles/           # Global CSS and design tokens
types/            # Shared TypeScript types
```

---

## Routes

**Marketing:** `/`, `/features`, `/about`, `/contact`

**Docs:** `/docs`, `/docs/api`, `/docs/how-it-works`, `/docs/faq`, `/docs/sample-reports` (also `docs.tryrevel.xyz/*`)

**App:** `/mission-control`, `/mission-control/analysis/[id]`, `/mission-control/report/[id]`, `/mission-control/history`, `/mission-control/settings`

**Auth:** `/log-in`, `/sign-up`

**API:** `POST /api/analyze`, `GET /api/report/:id`, `POST /api/export`, `GET /api/history`

**Discovery:** `/llms.txt`, `/llms-full.txt`, `/ai.txt`, `/sitemap.xml`, `/robots.txt`

---

## Deploy (Vercel)

1. Import `Blindspotlabxyz/revel` from GitHub
2. Paste env vars from `.env.local` (production URL overrides above)
3. Add Google OAuth redirect URI: `https://auth.tryrevel.xyz/api/auth/callback/google`
4. Submit `https://tryrevel.xyz/sitemap.xml` in Google Search Console and Bing Webmaster

Production builds auto-ping [IndexNow](https://www.indexnow.org/) for Bing and partners.

---

## Security

- Env files are gitignored; only `.env.example` is tracked
- Middleware returns **403** for common `.env` scanner probes
- Optional: Vercel Firewall custom rule to deny `*.env` paths at the edge

---

## License

This project is **proprietary and not open source**. All rights reserved by **Mojeeb Titilayo** and **BlindspotLab**.

You may not copy, modify, distribute, sublicense, or commercially use this code without written permission. See [LICENSE](LICENSE) for full terms.

For licensing or partnership inquiries: [hello@blindspotlab.xyz](mailto:hello@blindspotlab.xyz)

---

## Vision

Revel is building toward an intelligence layer that AI agents and applications can call to deeply understand products, not another generic chat audit. **Blindspot Audit** (website analysis) is the first module on that path.

---

Created by **[Mojeeb Titilayo](https://mojeeb.xyz)** · **BlindspotLab** · [hello@blindspotlab.xyz](mailto:hello@blindspotlab.xyz)