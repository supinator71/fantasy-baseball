# Goin' Yard HQ — AI Assistant Guide

@AGENTS.md

> **Read first:** [`SPEC.md`](./SPEC.md) is the product source of truth. Every session
> should start by reading it before making structural decisions. This file (CLAUDE.md)
> covers the *technical* side — directory layout, conventions, libraries, API surface.

---

## 1. What this project is

**Goin' Yard HQ** (domain: `goinyard.app`) is a free Yahoo Fantasy Baseball helper
for beginners. The differentiator is *explainable* recommendations powered by a
deterministic scoring engine (`lib/fantasyBrain.js`) and Claude as the narrator
on top. A paid cyborg trading-card collection layer rides alongside.

- **App name in UI:** "Goin' Yard HQ"
- **Audience:** Yahoo Fantasy Baseball beginners
- **Hosting:** Railway (Nixpacks build), behind goinyard.app
- **Builder:** Solo non-coding director directing agentic AI

For product rules (modules, scoring philosophy, monetization, card design)
see `SPEC.md`. Do not change product structure or invent per-module scoring
without checking `SPEC.md` first.

---

## 2. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js **16.2.4** (App Router) |
| UI | React **19.2.4**, plain JS (no TypeScript), CSS in `app/globals.css` |
| Path alias | `@/*` → repo root (see `jsconfig.json`) |
| Auth | `iron-session` with cookie `batflip_session` (`lib/session.js`) |
| Data fetching (client) | `swr` + `axios` (configured in `app/layout.js`) |
| AI | `@anthropic-ai/sdk` via `lib/claude.js` |
| Yahoo Fantasy | `axios` against `fantasysports.yahooapis.com/fantasy/v2` |
| MLB data | Free `statsapi.mlb.com/api/v1` via `lib/mlbStatsService.js` |
| Payments | `stripe` (card packs only — the fantasy app is free, see SPEC §8) |
| Storage | JSON file at a writable dir (Railway volume / `DATA_DIR` / `/tmp`) |
| Cache | In-process `Map` (`lib/cache.js`) plus `ioredis` dependency available |
| XML parse | `xml2js` (some Yahoo endpoints return XML) |
| Notifications | `react-hot-toast` |
| Icons | `lucide-react` |
| Lint | `eslint` 9 with `eslint-config-next` |

**Important:** This repo runs a Next.js version with breaking changes versus older
training data. Before writing Next.js code (routing, server actions, headers/cookies,
metadata, fonts, etc.), check `node_modules/next/dist/docs/` for the in-tree guide
and heed deprecation notices. See `AGENTS.md`.

---

## 3. Repository layout

```
app/                 Next.js App Router — pages + API routes
  layout.js          Root layout. Wires up SWR, iron-session auth check, sidebar,
                     and the background cyborg-card "mural". Client component.
  page.js            Dashboard entry — redirects to Yahoo OAuth if signed out.
  globals.css        All app styling (glassmorphism aesthetic).
  <module>/page.js   One page per module (roster, waiver, startsit, trade,
                     pitching, standings, matchup, audit, tradefinder,
                     gameplan, baseball101, tradeblock, store, vault,
                     trophy, test-gallery).
  auth/              Yahoo OAuth callback UI route.
  api/               See §5.

components/          React components. Folder-per-feature.
  Sidebar.jsx        Persistent left nav (collapses to hamburger on mobile).
  Dashboard.jsx      Authenticated dashboard.
  shared/            Cross-module pieces (AiQuestionBox, ModulePage,
                     LeagueIntelligence, FeedbackBox, BackgroundMural, etc.).
  <Module>/          One folder per dashboard module from SPEC §4.

lib/                 Server-side business logic. Import as @/lib/<name>.
  fantasyBrain.js    THE central scoring + roster-analysis engine. ~1.8k LOC.
                     Contains detectFormat(), computePlayerPoints(),
                     calculateVOR(), positional tiers, format-aware logic
                     for ROTO / H2H_CAT / H2H_POINTS. See SPEC §5.
  claude.js          Anthropic client + model registry. Always call Claude
                     through this — never instantiate Anthropic elsewhere.
  yahooService.js    Yahoo OAuth token refresh + REST helpers (yahooGet,
                     getLeagues, getRoster, ...). 12s timeout; auto-retries
                     on 401 by force-refreshing the token.
  database.js        JSON-file "DB". Picks the first writable path among
                     RAILWAY_VOLUME_MOUNT_PATH, DATA_DIR, ./db, /tmp/goinyard-db.
                     Exposes db.getToken, db.setToken, db.getLeagueSettings,
                     db.getAnalysisCache, trophies, subscriptions, etc.
  mlbStatsService.js MLB Stats API wrapper (free, no key) with in-process TTL cache.
  session.js         iron-session wrapper. Cookie name 'batflip_session'.
  cache.js           Tiny TTL Map cache for Yahoo responses.
  constants.js       CARD_COLLECTION (cyborg cards) + getRandomCardId().
  cardGenerator.js   Procedural card-art helpers.
  rosterData.js      Static roster / replacement-level reference data (~1.3k LOC).
  context/
    LeagueContext.js React context for the currently selected league.

scripts/
  quality-audit.js   Standalone CLI audit harness (not run by Next.js).

docs/                Long-form architecture + cyborg image-gen docs.
public/              Cyborg card PNGs + standard Next.js SVGs.
_migration_backup/   Frozen snapshot of the old split frontend+backend repo,
                     kept for reference during migration. DO NOT EDIT — and
                     do not import from it; it isn't part of the build.
SPEC.md              Product source of truth (modules, scoring, cards, monetization).
AGENTS.md            Short top-level reminder about the custom Next.js version.
galactic_roster.md   Lore / character reference for the card collection.
nixpacks.toml        Railway build config.
```

---

## 4. Conventions

### Imports
- Use the `@/` alias for anything in the repo root: `import { db } from '@/lib/database'`.
- Server code under `lib/` uses ESM (`import`/`export`). One file (`lib/cache.js`)
  still uses `module.exports = {...}` — leave it that way unless you're rewriting it.
- React components live in `components/<Feature>/` with `.jsx` extension and
  `'use client'` at the top when they use hooks.

### App Router
- Pages are `app/<route>/page.js`. They're mostly client components (`'use client'`)
  because the app is heavily interactive and reads auth on the client via
  `/api/auth/status`.
- API endpoints are `app/api/.../route.js` exporting named `GET` / `POST` handlers
  that return `NextResponse.json(...)`.
- Route params use folder names like `[leagueKey]` (see
  `app/api/yahoo/league/[leagueKey]/route.js`).
- Read the in-tree docs in `node_modules/next/dist/docs/` before touching
  headers/cookies/metadata/middleware patterns — APIs may differ from older
  Next.js versions.

### Authentication flow
1. Browser hits `/api/auth/yahoo` → redirected to Yahoo OAuth.
2. Yahoo redirects to `app/auth/yahoo/callback` (UI route) with `?code=...`.
3. Server exchanges code for tokens, stores them in `db.tokens[guid]`, and
   sets the `batflip_session` cookie containing `yahoo_guid`.
4. Every protected API route does `const session = await getSession();` then
   reads `session.yahoo_guid`; missing guid → 401.
5. `yahooService.getAccessToken(guid)` transparently refreshes expiring tokens
   (60s buffer) and aggressively retries on 401.
6. Client-side `axios` interceptor in `app/layout.js` watches for 401/refresh-token
   errors and force-logs-out the user.

### Claude / AI
- Import `callClaude`, `callClaudeFast`, or `callClaudeJSON` from `@/lib/claude`.
- Model registry order: `claude-sonnet-4-5` → `claude-3-5-sonnet-20241022` →
  `claude-haiku-4-5` → `claude-opus-4-5` (last resort, expensive).
- **Do not use `claude-3-5-haiku-20241022`** — it's EOL (Feb 19 2026) and returns 404.
- `callClaudeFast` is for short Q&A, lore, narration; falls back to Sonnet on error.
- `callClaudeJSON` has **no system prompt** on purpose — the friendly default hurts
  strict JSON compliance. Use it for `audit`, `analyze`, `trade verdict`, `predict`,
  anything that must parse cleanly.
- Per SPEC §5: AI never invents recommendations. It narrates `fantasyBrain.js`
  output. Follow-up explanations must reference the actual scorer factors/weights.

### Scoring formats (read SPEC §5 first)
`fantasyBrain.detectFormat(scoringType)` normalizes Yahoo's strings:

| Yahoo string contains | Detected as |
| --- | --- |
| `point`, `h2h_pts`, `pts` | `H2H_POINTS` |
| `head`, `h2h`, `categories`, `cat` | `H2H_CAT` |
| anything else | `ROTO` |

There is **one** hitter scorer and **one** pitcher scorer. Modules transform
their output; modules never reimplement scoring. The grade table in
`app/api/claude/audit/route.js` (`computeGrade`) is deterministic — Claude
cannot override it.

### Caching
- `lib/mlbStatsService.js` caches MLB Stats API responses in-process (10 min general,
  3 min news).
- `lib/cache.js` provides a generic TTL Map cache for Yahoo responses.
- `db.getAnalysisCache(guid, key)` caches per-user-per-day analysis (key prefix per
  route, e.g. `audit_<league_key>`). Pass `force: true` in the request body to
  bypass; there's a daily force-refresh quota tracked in `force_refresh_counts`.

### Styling
All styling is in `app/globals.css` (~34 KB) using CSS variables (`--primary`,
`--text-main`, `--border`, `--font-heading`, `--font-body`). Fonts are loaded via
`next/font/google` in `app/layout.js` (`Rajdhani` for headings, `Space_Grotesk` for body).
Mobile: sidebar hides below the breakpoint and a hamburger button appears in
the topbar — see SPEC architecture doc §4.

---

## 5. API surface (`app/api/`)

```
auth/
  yahoo/route.js                 GET → start Yahoo OAuth (redirect to Yahoo)
  status/route.js                GET → { authenticated, subscription, ... }
  logout/route.js                POST → clear session

yahoo/
  leagues/route.js               List the user's MLB leagues
  league/[leagueKey]/
    route.js                     League settings/details
    roster/route.js              Authoritative roster fetch
    matchup/route.js             Current-week matchup
    standings/route.js           League standings
    players/route.js             Player search / lookup
    transactions/route.js        Recent adds/drops/trades
    trends/route.js              Trending players
    allrosters/route.js          All teams' rosters (for trade intel)
  roster/[leagueKey]/route.js    User's roster shortcut

claude/                          AI-narrated module endpoints. All read
                                 scoring_type from db.getLeagueSettings and
                                 call into fantasyBrain before invoking
                                 Claude. All cache results in db.analysisCache.
  ask/route.js                   Follow-up Q&A on a prior recommendation
  audit/route.js                 Roster / Team Audit (uses callClaudeJSON)
  analyze/route.js               Master analysis bundle
  startsit/route.js              Daily start/sit
  waiver/route.js                Waiver-wire pickups
  trade/route.js                 Trade analyzer (verdict + reasoning)
  trade/find/route.js            Trade-Finder (proposals across the league)
  matchup/route.js               Weekly matchup analysis
  matchup/predict/route.js       Win-prob style prediction (JSON)
  pitching/route.js              Pitcher Intelligence (pitcher-specific logic)
  gameplan/route.js              Weekly game plan
ai/ask/route.js                  Generic AI Q&A used by AiQuestionBox

mlb/pitching-context/route.js    Free MLB Stats API pass-through

trophy/album/route.js            User trophy case
trophy/daily-pack/route.js       Claim today's free common card (SPEC §7.3)

store/buy-pack/route.js          Card pack purchase entry (mock if no Stripe env)
stripe/create-pack-checkout/route.js  Real Stripe Checkout session
stripe/webhook/route.js          Stripe events → unlock cards

tradeblock/route.js              List trade-block postings
tradeblock/offer/route.js        Make/accept offers
```

---

## 6. Frontend pages

Routes that match SPEC §4 modules:

| Path | Module |
| --- | --- |
| `/` | Dashboard (or login screen if unauthenticated) |
| `/roster` | My Roster |
| `/waiver` | Waiver Wire |
| `/startsit` | Start / Sit |
| `/trade` | Trade Analyzer |
| `/tradefinder` | Trade Finder |
| `/tradeblock` | League Trade Block |
| `/pitching` | Pitcher Intelligence |
| `/standings` | Standings |
| `/matchup` | Weekly Matchup |
| `/audit` | Team Audit |
| `/gameplan` | Weekly Game Plan |
| `/baseball101` | Glossary (Baseball 101) |
| `/store` `/vault` `/trophy` | Paid card-collection surfaces |
| `/test-gallery` | Internal: render every base card image |

The dashboard sidebar is the source of truth for the nav — see
`components/Sidebar.jsx`.

---

## 7. Environment variables

Required at runtime (the build does not need most of them; see `nixpacks.toml`).

| Var | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API access (`lib/claude.js`) |
| `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET` | Yahoo OAuth |
| `YAHOO_REDIRECT_URI` | Defaults to `https://localhost:3000/auth/yahoo/callback` |
| `SECRET_COOKIE_PASSWORD` | iron-session secret (≥32 chars). Has an unsafe dev default — must be set in prod. |
| `STRIPE_SECRET_KEY` | Optional. Without it, store routes fall back to a mock flow. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `STRIPE_PRICE_CORE`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_TITAN` | Pack price IDs |
| `NEXT_PUBLIC_BASE_URL` | Used as the Stripe redirect origin fallback |
| `RAILWAY_VOLUME_MOUNT_PATH` / `DATA_DIR` | Where the JSON DB lives. Falls back to `./db` then `/tmp/goinyard-db`. |
| `PORT` | Read by `npm start` (defaults to 3000) |
| `NODE_ENV` | `production` enables secure cookies |

---

## 8. Commands

```bash
npm install
npm run dev      # next dev --experimental-https  → https://localhost:3000
npm run build    # next build
npm run start    # next start -p ${PORT:-3000}
npm run lint     # eslint (config: eslint.config.mjs)
```

The dev server uses `--experimental-https` because Yahoo OAuth requires
an HTTPS redirect URI. On first run Next.js will generate certs under
`certificates/` (git-ignored).

There is no test suite. There is no formatter beyond ESLint. The
`scripts/quality-audit.js` file is a manual harness, not wired into CI.

---

## 9. Editing rules — non-negotiables

1. **Don't invent per-module scoring.** All recommendations go through
   `lib/fantasyBrain.js`. Add new factors *inside* the central scorer.
2. **Don't bypass `lib/claude.js`.** Never `new Anthropic(...)` outside that file.
3. **Don't split AI work across models** for a single feature. See SPEC §10.
4. **Don't change card art, card numbers, flavor text, or the 42-card set count**
   without explicit user direction (SPEC §7).
5. **Don't add fantasy-side paid features.** Yahoo's API terms prohibit it (SPEC §8.1).
6. **Don't edit `_migration_backup/`.** It's a frozen reference snapshot.
7. **Don't trust your training data on Next.js APIs** — check
   `node_modules/next/dist/docs/` first.
8. **Don't generate follow-up explanations from scratch** — they must reference
   the scorer's actual factors and weights (SPEC §6.2).
9. **Prefer fewer, larger, well-explained changes** to many small unexplained ones.
10. **When in doubt, ask the user.** The human director does not write code.

---

## 10. Branching / deploy

- Default branch: `master`.
- Railway watches the deploy branch and rebuilds with Nixpacks.
- Long-running agent work goes on a feature branch (e.g.
  `claude/add-claude-documentation-21xEW` for this very file) and is pushed
  there, not directly to `master`. Don't open a PR unless asked.
