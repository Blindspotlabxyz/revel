# Revel

> Find the hidden gaps stopping your product from growing.

**Revel** is an AI product strategist by [BlindspotLab](https://blindspotlab.xyz). Paste a public website URL, and Revel analyzes positioning, UX, messaging, and competition, then returns a scored **Reveal Index**, prioritized **Blueprint**, and exportable **Action Queue**.

**Author:** [Mojeeb Titilayo](https://mojeeb.xyz) · **Company:** [BlindspotLab](https://blindspotlab.xyz)

**Live:** [tryrevel.xyz](https://tryrevel.xyz) · **Docs:** [docs.tryrevel.xyz](https://docs.tryrevel.xyz) · **Repo:** [github.com/Blindspotlabxyz/revel](https://github.com/Blindspotlabxyz/revel) · **License:** Proprietary. See [LICENSE](LICENSE)

---

## What ships today

| Area | Status |
|------|--------|
| Website analysis | Public URLs via Mission Control (agentic: Groq / Gemini + OpenRouter fallback) |
| Outputs | Blindspot Map, Reveal Index, Blueprint, Action Queue |
| Export | Markdown, GitHub MD, JSON; optional Linear / Notion / Gist when configured |
| Auth | NextAuth (email/password + Google), forgot/reset password, editable profile |
| Usage | 3 free audits per week per user (Mission Control); admin unlimited |
| Partner API | `rvl_pk_` keys — analyze + poll report (`/api/partner/v1/*`) |
| MCP / OKX | Streamable HTTP at `/api/mcp`; x402 paid audits at `/api/audit` |
| Database | Supabase Postgres + Prisma (production) |
| SEO / AEO | Sitemap, robots, JSON-LD, `llms.txt`, `ai.txt`, IndexNow |
| Subdomains | `docs.`, `legal.`, `auth.` with logo home → marketing apex |

**Also live:** `/compare`, `/pricing` (early access), `/guides/find-product-blindspots`, public Genesis sample report.

---

## Tech stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion, Radix UI
- **AI:** Groq / Gemini agentic tools, OpenRouter fallback
- **Auth:** NextAuth (Auth.js v5) + Google OAuth + credentials
- **Email:** Resend (welcome, partner, password reset)
- **Data:** Supabase Postgres, Prisma 7
- **Deploy:** Vercel

---

## Quick start

### Prerequisites

- Node.js 20+
- Accounts as needed: [Groq](https://console.groq.com) or [Google AI Studio](https://aistudio.google.com), [OpenRouter](https://openrouter.ai), [Google Cloud Console](https://console.cloud.google.com) (OAuth), [Supabase](https://supabase.com), optional [Resend](https://resend.com)

### Setup

```bash
git clone https://github.com/Blindspotlabxyz/revel.git
cd revel
npm install

cp .env.example .env.local
npm run env:merge          # append any missing keys
# Fill secrets in .env.local (see .env.example)

npm run db:setup           # verify database connection
# Apply schema: npx prisma db push  (or run SQL in Supabase SQL Editor)
npm run dev                # http://localhost:3000
```

Configure Google OAuth and set `AUTH_SECRET` / `NEXTAUTH_*` / `GOOGLE_*` in `.env.local`.

### Key scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build (+ IndexNow ping on Vercel) |
| `npm run env:merge` | Sync missing keys from `.env.example` → `.env.local` |
| `npm run indexnow:ping` | Manually ping Bing/IndexNow |
| `npm run db:setup` | Test DB connectivity |
| `npm run generate:brand-icons` | Regenerate favicon / PWA icons |
| `npm run mcp` | Local MCP stdio server |

---

## Environment variables

Copy `.env.example` to `.env.local`. On **Vercel production**:

```env
NEXT_PUBLIC_APP_URL=https://tryrevel.xyz
NEXT_PUBLIC_MARKETING_URL=https://tryrevel.xyz
NEXT_PUBLIC_DOCS_URL=https://docs.tryrevel.xyz
NEXT_PUBLIC_LEGAL_URL=https://legal.tryrevel.xyz
NEXT_PUBLIC_AUTH_URL=https://auth.tryrevel.xyz
NEXT_PUBLIC_ENABLE_SUBDOMAIN_REDIRECTS=true
```

| Group | Variables |
|-------|-----------|
| Site | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_MARKETING_URL`, subdomain URLs, `NEXT_PUBLIC_ENABLE_SUBDOMAIN_REDIRECTS` |
| AI | `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, model env vars |
| Auth | `AUTH_SECRET` / `NEXTAUTH_SECRET`, `AUTH_URL` / `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Database | `DATABASE_URL`, `DIRECT_URL`, optional Supabase keys |
| SEO | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `INDEXNOW_KEY`, `CRON_SECRET` |
| Usage | `WEEKLY_AUDIT_LIMIT` (default 3 / week) |
| Analytics | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional, e.g. `tryrevel.xyz`) |
| MCP | `MCP_API_KEY` |
| OKX billing | `OKX_API_KEY`, `OKX_SECRET_KEY`, `OKX_PASSPHRASE`, `OKX_PAY_TO`, `OKX_AUDIT_PRICE_USD` |
| Email (Resend) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `REVEL_ADMIN_NOTIFY_EMAIL` |
| Exports | `GITHUB_TOKEN`, `LINEAR_API_KEY`, `LINEAR_TEAM_ID`, `NOTION_API_KEY`, `NOTION_DATABASE_ID` |

```bash
node scripts/generate-secrets.mjs
```

### Database migrations

Profile + password-reset columns (if not already applied):

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires" TIMESTAMPTZ(6);
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users" ("username");
```

Or: `npx prisma db push` / `npx prisma migrate deploy`.

---

## Project structure

```
app/              # Routes (marketing, Mission Control, auth, API, llms.txt)
components/       # UI, landing, dashboard, auth, SEO
lib/              # Config, SEO, auth, logo-home, report schema, Prisma
services/         # Analysis store, export, agents, content extraction
prisma/           # Schema and migrations
public/           # Brand assets, images, humans.txt
scripts/          # DB checks, env merge, IndexNow, brand icons, MCP
styles/           # Global CSS and design tokens
types/            # Shared TypeScript types
```

---

## Routes

**Marketing:** `/`, `/features`, `/compare`, `/pricing`, `/about`, `/contact`, `/guides/find-product-blindspots`

**Docs:** `/docs/*` (also `docs.tryrevel.xyz/*`)

**Legal:** `/privacy`, `/terms` (also `legal.tryrevel.xyz/*`)

**App:** `/mission-control`, `/mission-control/analysis/[id]`, `/mission-control/report/[id]`, `/mission-control/history`, `/mission-control/account`, `/mission-control/settings`

**Auth:** `/log-in`, `/sign-up`, `/forgot-password`, `/reset-password` (also `auth.tryrevel.xyz`)

**API:** `POST /api/analyze`, `GET /api/report/:id`, `POST /api/export`, `GET /api/history`, Partner + MCP routes under `/api/partner` and `/api/mcp`

**Discovery:** `/llms.txt`, `/llms-full.txt`, `/ai.txt`, `/sitemap.xml`, `/robots.txt`

---

## Subdomains & logo home

With `NEXT_PUBLIC_ENABLE_SUBDOMAIN_REDIRECTS=true`, product hosts rewrite into this app. The logo uses `NEXT_PUBLIC_MARKETING_URL` (or `NEXT_PUBLIC_APP_URL`) so **docs / legal / auth** always link back to the marketing apex via a real `<a href>`, while the apex keeps a relative Next.js `<Link href="/">`.

---

## Deploy (Vercel)

1. Import `Blindspotlabxyz/revel` from GitHub  
2. Paste env vars (production URL overrides above)  
3. Attach domains: `tryrevel.xyz`, `docs.tryrevel.xyz`, `legal.tryrevel.xyz`, `auth.tryrevel.xyz`  
4. Google OAuth redirect: `https://auth.tryrevel.xyz/api/auth/callback/google`  
5. Submit `https://tryrevel.xyz/sitemap.xml` in Search Console / Bing  

Production builds auto-ping [IndexNow](https://www.indexnow.org/).

---

## Security

- Env files are gitignored; only `.env.example` is tracked  
- Middleware returns **403** for common `.env` scanner probes  
- Analysis access checks, SSRF guards, and partner key hashing  
- Optional: Vercel Firewall custom rule to deny `*.env` paths at the edge  

---

## License

This project is **proprietary and not open source**. All rights reserved by **Mojeeb Titilayo** and **BlindspotLab**.

You may not copy, modify, distribute, sublicense, or commercially use this code without written permission. See [LICENSE](LICENSE) for full terms.

For licensing or partnership inquiries: [hello@blindspotlab.xyz](mailto:hello@blindspotlab.xyz)

---

## Vision

Revel is building toward an intelligence layer that AI agents and applications can call to deeply understand products — not another generic chat audit. **Blindspot Audit** (website analysis) is the first module on that path.

---

Created by **[Mojeeb Titilayo](https://mojeeb.xyz)** · **BlindspotLab** · [hello@blindspotlab.xyz](mailto:hello@blindspotlab.xyz)
