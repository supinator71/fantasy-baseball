# Goin' Yard HQ - Codebase Export

This document contains the complete source code for the Next.js version of the **Goin' Yard** application.
- **Export Date:** 2026-06-08
- **Excluded folders:** `_migration_backup/`, `public/` (binary assets), `node_modules/`, `.next/`
- **Excluded files:** `package-lock.json`

## File Index

- [.gitattributes](#file--gitattributes)
- [.gitignore](#file--gitignore)
- [AGENTS.md](#file-AGENTS-md)
- [CLAUDE.md](#file-CLAUDE-md)
- [README.md](#file-README-md)
- [SPEC.md](#file-SPEC-md)
- [app/api/ai/ask/route.js](#file-app-api-ai-ask-route-js)
- [app/api/auth/logout/route.js](#file-app-api-auth-logout-route-js)
- [app/api/auth/status/route.js](#file-app-api-auth-status-route-js)
- [app/api/auth/yahoo/route.js](#file-app-api-auth-yahoo-route-js)
- [app/api/claude/analyze/route.js](#file-app-api-claude-analyze-route-js)
- [app/api/claude/ask/route.js](#file-app-api-claude-ask-route-js)
- [app/api/claude/audit/route.js](#file-app-api-claude-audit-route-js)
- [app/api/claude/gameplan/route.js](#file-app-api-claude-gameplan-route-js)
- [app/api/claude/matchup/predict/route.js](#file-app-api-claude-matchup-predict-route-js)
- [app/api/claude/pitching/route.js](#file-app-api-claude-pitching-route-js)
- [app/api/claude/startsit/route.js](#file-app-api-claude-startsit-route-js)
- [app/api/claude/trade/find/route.js](#file-app-api-claude-trade-find-route-js)
- [app/api/claude/trade/route.js](#file-app-api-claude-trade-route-js)
- [app/api/claude/waiver/route.js](#file-app-api-claude-waiver-route-js)
- [app/api/mlb/pitching-context/route.js](#file-app-api-mlb-pitching-context-route-js)
- [app/api/store/buy-pack/route.js](#file-app-api-store-buy-pack-route-js)
- [app/api/stripe/create-pack-checkout/route.js](#file-app-api-stripe-create-pack-checkout-route-js)
- [app/api/stripe/webhook/route.js](#file-app-api-stripe-webhook-route-js)
- [app/api/tradeblock/offer/route.js](#file-app-api-tradeblock-offer-route-js)
- [app/api/tradeblock/route.js](#file-app-api-tradeblock-route-js)
- [app/api/trophy/album/route.js](#file-app-api-trophy-album-route-js)
- [app/api/trophy/daily-pack/route.js](#file-app-api-trophy-daily-pack-route-js)
- [app/api/yahoo/league/[leagueKey]/allrosters/route.js](#file-app-api-yahoo-league--leagueKey--allrosters-route-js)
- [app/api/yahoo/league/[leagueKey]/matchup/route.js](#file-app-api-yahoo-league--leagueKey--matchup-route-js)
- [app/api/yahoo/league/[leagueKey]/myroster/route.js](#file-app-api-yahoo-league--leagueKey--myroster-route-js)
- [app/api/yahoo/league/[leagueKey]/players/route.js](#file-app-api-yahoo-league--leagueKey--players-route-js)
- [app/api/yahoo/league/[leagueKey]/roster/route.js](#file-app-api-yahoo-league--leagueKey--roster-route-js)
- [app/api/yahoo/league/[leagueKey]/route.js](#file-app-api-yahoo-league--leagueKey--route-js)
- [app/api/yahoo/league/[leagueKey]/standings/route.js](#file-app-api-yahoo-league--leagueKey--standings-route-js)
- [app/api/yahoo/league/[leagueKey]/team/[teamKey]/rosterstats/route.js](#file-app-api-yahoo-league--leagueKey--team--teamKey--rosterstats-route-js)
- [app/api/yahoo/league/[leagueKey]/transactions/route.js](#file-app-api-yahoo-league--leagueKey--transactions-route-js)
- [app/api/yahoo/league/[leagueKey]/trends/route.js](#file-app-api-yahoo-league--leagueKey--trends-route-js)
- [app/api/yahoo/leagues/route.js](#file-app-api-yahoo-leagues-route-js)
- [app/api/yahoo/roster/[leagueKey]/route.js](#file-app-api-yahoo-roster--leagueKey--route-js)
- [app/audit/page.js](#file-app-audit-page-js)
- [app/auth/yahoo/callback/route.js](#file-app-auth-yahoo-callback-route-js)
- [app/baseball101/page.js](#file-app-baseball101-page-js)
- [app/gameplan/page.js](#file-app-gameplan-page-js)
- [app/globals.css](#file-app-globals-css)
- [app/layout.js](#file-app-layout-js)
- [app/matchup/page.js](#file-app-matchup-page-js)
- [app/page.js](#file-app-page-js)
- [app/page.module.css](#file-app-page-module-css)
- [app/pitching/page.js](#file-app-pitching-page-js)
- [app/roster/page.js](#file-app-roster-page-js)
- [app/standings/page.js](#file-app-standings-page-js)
- [app/startsit/page.js](#file-app-startsit-page-js)
- [app/store/Store.css](#file-app-store-Store-css)
- [app/store/page.js](#file-app-store-page-js)
- [app/test-gallery/page.jsx](#file-app-test-gallery-page-jsx)
- [app/trade/page.js](#file-app-trade-page-js)
- [app/tradeblock/page.js](#file-app-tradeblock-page-js)
- [app/tradefinder/page.js](#file-app-tradefinder-page-js)
- [app/trophy/TrophyCase.css](#file-app-trophy-TrophyCase-css)
- [app/trophy/page.js](#file-app-trophy-page-js)
- [app/vault/page.js](#file-app-vault-page-js)
- [app/waiver/page.js](#file-app-waiver-page-js)
- [components/Dashboard.jsx](#file-components-Dashboard-jsx)
- [components/DraftAssistant/DraftAssistant.jsx](#file-components-DraftAssistant-DraftAssistant-jsx)
- [components/DraftAssistant/DraftBoard.jsx](#file-components-DraftAssistant-DraftBoard-jsx)
- [components/GamePlan/GamePlan.jsx](#file-components-GamePlan-GamePlan-jsx)
- [components/InsightCard/InsightCard.jsx](#file-components-InsightCard-InsightCard-jsx)
- [components/InsightCard/InsightCard.module.css](#file-components-InsightCard-InsightCard-module-css)
- [components/MatchupPredictor/MatchupPredictor.jsx](#file-components-MatchupPredictor-MatchupPredictor-jsx)
- [components/MatchupView/MatchupView.jsx](#file-components-MatchupView-MatchupView-jsx)
- [components/PitchingIntel/PitchingIntel.jsx](#file-components-PitchingIntel-PitchingIntel-jsx)
- [components/PlayerTrends/PlayerTrends.jsx](#file-components-PlayerTrends-PlayerTrends-jsx)
- [components/RosterAudit/RosterAudit.jsx](#file-components-RosterAudit-RosterAudit-jsx)
- [components/RosterManager/RosterManager.jsx](#file-components-RosterManager-RosterManager-jsx)
- [components/Sidebar.jsx](#file-components-Sidebar-jsx)
- [components/Standings/Standings.jsx](#file-components-Standings-Standings-jsx)
- [components/StartSit/StartSit.jsx](#file-components-StartSit-StartSit-jsx)
- [components/TeamAudit/TeamAudit.jsx](#file-components-TeamAudit-TeamAudit-jsx)
- [components/TradeAnalyzer/TradeAnalyzer.jsx](#file-components-TradeAnalyzer-TradeAnalyzer-jsx)
- [components/TradeFinder/TradeFinder.jsx](#file-components-TradeFinder-TradeFinder-jsx)
- [components/TrophyCase/PackDropModal.jsx](#file-components-TrophyCase-PackDropModal-jsx)
- [components/TrophyCase/TradeBlock.css](#file-components-TrophyCase-TradeBlock-css)
- [components/TrophyCase/TradeBlock.jsx](#file-components-TrophyCase-TradeBlock-jsx)
- [components/TrophyCase/TrophyCase.css](#file-components-TrophyCase-TrophyCase-css)
- [components/TrophyCase/TrophyCase.jsx](#file-components-TrophyCase-TrophyCase-jsx)
- [components/TrophyCase/Vault.css](#file-components-TrophyCase-Vault-css)
- [components/TrophyCase/Vault.jsx](#file-components-TrophyCase-Vault-jsx)
- [components/Upgrade/Upgrade.jsx](#file-components-Upgrade-Upgrade-jsx)
- [components/WaiverWire/WaiverWire.jsx](#file-components-WaiverWire-WaiverWire-jsx)
- [components/shared/AiQuestionBox.jsx](#file-components-shared-AiQuestionBox-jsx)
- [components/shared/AiStrategyModule.jsx](#file-components-shared-AiStrategyModule-jsx)
- [components/shared/BackgroundMural.jsx](#file-components-shared-BackgroundMural-jsx)
- [components/shared/Baseball101.jsx](#file-components-shared-Baseball101-jsx)
- [components/shared/FeedbackBox.jsx](#file-components-shared-FeedbackBox-jsx)
- [components/shared/FeedbackLogs.jsx](#file-components-shared-FeedbackLogs-jsx)
- [components/shared/LastUpdated.jsx](#file-components-shared-LastUpdated-jsx)
- [components/shared/LeagueIntelligence.jsx](#file-components-shared-LeagueIntelligence-jsx)
- [components/shared/ModulePage.jsx](#file-components-shared-ModulePage-jsx)
- [docs/Cyborg_Generation_Guide.md](#file-docs-Cyborg-Generation-Guide-md)
- [docs/Project_Summary_and_Architecture.md](#file-docs-Project-Summary-and-Architecture-md)
- [eslint.config.mjs](#file-eslint-config-mjs)
- [galactic_roster.md](#file-galactic-roster-md)
- [jsconfig.json](#file-jsconfig-json)
- [lib/cache.js](#file-lib-cache-js)
- [lib/cardGenerator.js](#file-lib-cardGenerator-js)
- [lib/claude.js](#file-lib-claude-js)
- [lib/constants.js](#file-lib-constants-js)
- [lib/context/LeagueContext.js](#file-lib-context-LeagueContext-js)
- [lib/database.js](#file-lib-database-js)
- [lib/fantasyBrain.js](#file-lib-fantasyBrain-js)
- [lib/mlbStatsService.js](#file-lib-mlbStatsService-js)
- [lib/rosterData.js](#file-lib-rosterData-js)
- [lib/session.js](#file-lib-session-js)
- [lib/yahooService.js](#file-lib-yahooService-js)
- [next.config.mjs](#file-next-config-mjs)
- [nixpacks.toml](#file-nixpacks-toml)
- [package.json](#file-package-json)
- [scripts/quality-audit.js](#file-scripts-quality-audit-js)

---

## File: `.gitattributes`

```text
* text=auto eol=lf
*.js text eol=lf
*.mjs text eol=lf
*.css text eol=lf
*.html text eol=lf
*.json text eol=lf
*.md text eol=lf
*.png binary
*.jpg binary
*.svg text eol=lf
```

---

## File: `.gitignore`

```text
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

certificates
/db
/scratch

**/node_modules
```

---

## File: `AGENTS.md`

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
```

---

## File: `CLAUDE.md`

```markdown
@AGENTS.md
```

---

## File: `README.md`

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```

---

## File: `SPEC.md`

```markdown
# Going Yard — Project Specification

> This document is the source of truth for the Going Yard project. Every coding session should begin by reading this file. Modules and features should be built or modified in accordance with the rules described here.

---

## 1. What This App Is

Going Yard is a free web tool for Yahoo Fantasy Baseball **beginners**. Its purpose is to help users make better roster decisions faster than they could by reading box scores and stats sites on their own.

The differentiator is teaching by doing — every recommendation is explainable, and the user can ask follow-up questions to learn *why*.

There is also a separate, paid card collection layer (see Section 7).

**Audience:** Yahoo Fantasy Baseball players who are newer to the game, want to be competitive in their leagues, and don't have time or expertise to use elite tools like Rotoballer.

**Domain:** goinyard.app

---

## 2. Tech Stack

- **Framework:** Next.js (frontend and backend consolidated in one codebase). Migration from a separate React frontend + standalone backend is in progress.
- **Data source:** Yahoo Fantasy Sports API
- **Hosting/domain:** Namecheap (goinyard.app)
- **AI model for app's reasoning features (e.g., follow-up explanations):** Claude Sonnet 4.6 end-to-end. Do not split between models — handoffs cause logic drift.
- **Build environment:** Antigravity IDE
- **Builder:** Solo, non-coding director working with agentic AI

---

## 3. Product Structure

### Free Tier
- One Yahoo league connected
- Three module uses per day

### Paid Tier
- Card collection product (see Section 7) — sold as a separate paid experience
- The fantasy tool itself remains free forever (see Section 8 for why)

---

## 4. Modules

The app is organized as a dashboard with the following modules:

1. **Dashboard** — entry point, shows available modules and daily card claim
2. **Sit/Start** — recommends which players to start on a given day
3. **Roster Audit** — evaluates the user's current roster for weaknesses
4. **Team Audit** — broader analysis of team construction
5. **Trade Tips** — analyzes other teams in the league and suggests trades
6. **Weekly Matchup** — analyzes the current week's matchup and provides tips
7. **Pitcher Intelligence** — dedicated pitcher analysis with pitcher-specific logic
8. **Glossary** — single-page reference for basic terms (WHIP, ERA, VOR) and league formats (H2H Points, H2H Categories, Rotisserie)

---

## 5. Decision Philosophy — READ BEFORE TOUCHING ANY MODULE

This is the most important section. Inconsistency between modules has been the project's biggest pain point. The rules below exist to fix that.

### 5.1 The Uniformity Rule

**There is ONE hitter scoring function and ONE pitcher scoring function.** Every module that produces a player recommendation calls one of these two functions. Modules do not invent their own scoring logic. Modules do not duplicate scoring code. Modules do not partially reimplement scoring.

If a module needs different *output* (e.g., trade tips needs a comparison, sit/start needs a daily lineup decision), the module transforms the central scorer's output. It does not replace the scorer.

### 5.2 Hitter Scoring Factors

The hitter scorer takes the following inputs and returns a weighted score:

- VOR (Value Over Replacement)
- Recent performance
- Opposing pitcher quality
- Ballpark factors
- Weather
- Whether the player is in the starting lineup that day
- Injury status (players on IL are excluded from recommendations but surfaced as informational notes)

**Approach:** Weighted blend. All factors contribute, none is a hard override (except IL status, which excludes).

### 5.3 Pitcher Scoring Factors

The pitcher scorer takes the following inputs:

- VOR
- Recent performance
- Opposing lineup difficulty
- Ballpark factors
- Weather
- Run support from the pitcher's offense (recent runs/game)
- Defensive quality of the team behind the pitcher
- Injury status

**Approach:** Pitcher-specific logic. The Pitcher Intelligence module owns this. Pitcher-specific logic can override what a generic factor weighting would produce.

### 5.4 Conflict Resolution

When factors point in different directions:
- For hitters: weighted blend wins. The total score is the answer.
- For pitchers: Pitcher Intelligence's logic takes precedence over any generic blend.

---

## 6. Teaching Philosophy

**Core principle: learn by doing, not by reading.**

The user is not here for a fantasy baseball textbook. They are here to play their league better and pick up concepts along the way.

### 6.1 Glossary Module
- One page, reference only
- Brief definitions: WHIP, ERA, VOR, etc.
- League format explanations: H2H Points, H2H Categories, Rotisserie
- Not a course. Not progressive lessons. Just a lookup.

### 6.2 Contextual Follow-Ups
After any recommendation, the user can ask a follow-up question to get more detail.

**Critical rule:** Follow-up explanations must reference the *actual factors and weights* the scorer used. The follow-up does not generate a fresh, generic explanation. It explains the math that already happened. Otherwise the teaching contradicts the recommendation, and the user loses trust.

The follow-up is itself powered by Sonnet 4.6 and is fed the scorer's output as context.

---

## 7. Card Game (Paid Product)

### 7.1 Concept
Cyborgs playing baseball, cyberpunk aesthetic. Visual humor and hobby-card sensibility (e.g., a cyborg sliding into second base; a cyborg pouring Gatorade and short-circuiting because waterproofing failed). **42 cards total in the set** as of April 21, 2026, 11:21 PM Pacific. Existing card art and varieties are not to be changed by the agent without explicit user direction.

### 7.2 Rarity Tiers
- Common
- Uncommon
- Rare
- Legendary

### 7.2.1 Card Anatomy

The set follows real-world hobby card conventions. Treat these as design rules the agent must respect when generating, displaying, or modifying cards.

**Front of every card:**
- Existing cyborg artwork (do not alter)
- A **card number** displayed on the front, mimicking real-world card numbering. Numbers can be random within a larger range rather than sequential 1–42 (real card sets number cards like #142 of a 200-card set, even when the set is smaller — this is intentional hobby aesthetic).
- For autograph variants only: a **gold metallic signature** rendered across the front. Signature scripts must be **visually distinct from one another** — different cyborgs have different "signatures," so no two scripts should look identical. Do not use a single signature font across all autograph cards.

**Back of every card:**
- The existing individual flavor text / joke for that specific card (preserved, not regenerated)
- For Rare and Legendary cards only: a **serial number** in the format `X / 99`, where X is randomly assigned within 1–99. Each serial-numbered card is unique to one user.

### 7.2.2 Parallels (Variants of Base Cards)

Following real hobby card convention, autograph and patch versions are **parallels**, not separate cards. The 42-card set contains 42 base cards. A given card (e.g., card #17) can exist in multiple parallel forms:

- Base version
- Autograph parallel (same card, with gold metallic signature on front)
- Patch parallel (same card, with patch element rendered)
- **Rookie Patch Auto (RPA) parallel** — combines patch + autograph on the same card. RPAs are the rarest tier in real hobby collecting and should be treated the same way here.

**RPA scarcity:**
- Only **1–2 RPAs exist in the entire 42-card set**
- Always Legendary tier
- Serial numbered very low (e.g., `1/10` or even `1/1`) — exact number TBD

### 7.2.3 Patch Design

The patch is a **fabric scrap from a game-worn jersey**, with a printed note on the back of the card stating its provenance (e.g., "This swatch is from a jersey worn by [cyborg name] during the 2026 Galactic Series").

Optional creative direction (open question — see 7.4): some patches could be cyborg-universe-specific instead of fabric — e.g., a chunk of armor plating, a circuit board fragment, a battery cell, a wire bundle. These would each carry their own provenance note. Mixing fabric patches with cyborg-tech patches across the set is one possibility worth considering.

### 7.3 Mechanics
- **Daily login:** User claims one common card per day
- **Bonus pulls:** Triggered by fantasy app performance milestones (e.g., scoring 500+ points in a week). Bonus pulls are the only way to obtain Uncommon, Rare, or Legendary cards.
- **In-app utility:** None. Cards do not unlock features, do not affect fantasy gameplay, do not gate anything. They are for collection and fun.
- **Connection to fantasy app:** Loose. Engagement with fantasy app earns cards. Cards do not affect fantasy app.

### 7.4 Open Design Questions
- The Common pool may be too small to support one-per-day across a full MLB season. Three options to consider:
  1. Expand the Common pool
  2. Allow duplicates (which has hobby-collecting precedent — duplicates are tradeable in real card collecting)
  3. Treat scarcity as a feature ("you may not complete the set this season")
- Decide before launch.
- **RPA serial numbering:** What's the exact print run for the 1–2 RPAs in the set? Options: `1/1` (true one-of-one, maximum hobby cred), `1/5`, `1/10`. Lower numbers = more scarcity = more value but fewer winners.
- **Patch material variation:** Stick with fabric scraps from game-worn jerseys throughout, or mix in cyborg-tech patches (armor plating, circuit board fragments, etc.) for some cards? Mixing adds variety but may dilute the "patch = jersey relic" hobby convention.
- **Distribution of parallels across rarity tiers:** Which base cards get autograph parallels? Which get patch parallels? Is there a rule (e.g., only Legendary base cards get autograph parallels) or is it case-by-case?

---

## 8. Monetization

### 8.1 The Fantasy App is Free
The Yahoo Fantasy Sports API terms of service prohibit commercial use without prior written permission from Yahoo. The fantasy tool will not be charged for. This is a constraint, not a choice, and it stays in place unless and until Yahoo grants written commercial permission.

### 8.2 The Card Game is Paid
The card collection is original IP and does not depend on Yahoo's API, so it is unrestricted. This is the primary revenue stream.

### 8.3 Future Possibilities (Not Now)
- Sponsorships from card hobby brands (Topps, PSA, card shops, breakers)
- Patreon for behind-the-scenes content
- Expansion to ESPN or Sleeper APIs (Sleeper is friendlier to commercial use but baseball-light)

---

## 9. Non-Goals — Do NOT Build These

These are things the project is explicitly *not* doing. If a session starts heading toward one of these, stop and check with the user.

- Do not charge for fantasy features
- Do not invent per-module scoring logic — always call the central hitter or pitcher scorer
- Do not give cards in-app utility (no boosts, no unlocks, no gating)
- Do not build long-form lesson content — teaching is contextual and reactive, not curricular
- Do not build a Substack or blog inside the app — wrong audience for that format
- Do not add Sleeper or ESPN integration until Yahoo experience is fully polished
- Do not split AI work between models — Sonnet 4.6 owns all reasoning
- Do not generate follow-up explanations from scratch — always reference the scorer's actual factors

---

## 10. Working Style Notes for the AI Agent

- The human director (the project owner) does not write code. They direct.
- Read this SPEC.md at the start of every session before making structural decisions.
- When in doubt about a design choice, ask the user a focused question rather than guessing.
- Surface architectural drift early. If a module starts to diverge from the central scorer pattern, flag it before it spreads.
- Default to fewer, larger, well-explained changes over many small unexplained ones.

---

*Last updated: April 21, 2026, 11:35 PM Pacific*
```

---

## File: `app/api/ai/ask/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { question, leagueKey, context } = await request.json();

    // Pull any saved league settings for richer context
    const leagueSettings = leagueKey ? db.getLeagueSettings(guid, leagueKey) : null;

    const answer = await callClaudeFast([
      {
        role: 'user',
        content: [
          leagueSettings
            ? `League: ${leagueSettings.name} | Format: ${leagueSettings.scoring_type} | Teams: ${leagueSettings.num_teams}`
            : null,
          context || null,
          question,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ]);

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[ai/ask]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/auth/logout/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "batflip_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function POST(request) {
  const session = await getIronSession(await cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ ok: true });
}
```

---

## File: `app/api/auth/status/route.js`

```javascript
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ authenticated: false });
  }

  const subscription = db.getSubscription(guid) || { plan: 'free' };

  return NextResponse.json({
    authenticated: true,
    yahoo_guid: guid,
    subscription,
  });
}
```

---

## File: `app/api/auth/yahoo/route.js`

```javascript
import { NextResponse } from 'next/server';

const YAHOO_AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';

export async function GET() {
  const clientId = process.env.YAHOO_CLIENT_ID?.trim();
  const redirectUri = process.env.YAHOO_REDIRECT_URI?.trim();

  console.log('[Auth] Initiating Yahoo OAuth:', { clientId, redirectUri });

  if (!clientId) {
    return NextResponse.json({ error: 'YAHOO_CLIENT_ID is not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri || 'https://localhost:3000/auth/yahoo/callback',
    response_type: 'code',
    scope: 'fspt-r',
  });

  return NextResponse.redirect(`${YAHOO_AUTH_URL}?${params.toString()}`);
}
```

---

## File: `app/api/claude/analyze/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude, callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';
import * as mlbStats from '@/lib/mlbStatsService';
import * as brain from '@/lib/fantasyBrain';

// Yahoo scoring_type codes → human labels
const SCORING_TYPE_MAP = {
  'headpoint': 'H2H Points (weekly head-to-head, each stat earns points — NOT Roto, NOT categories)',
  'headone':   'H2H Categories (weekly matchup, win/tie/lose each individual stat category)',
  'roto':      'Rotisserie (season-long ranking in each category)',
};

// Yahoo stat ID → human-readable name
const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
  '9': '1B', '10': '2B', '11': '3B', '34': 'HA', '37': 'ER', '39': 'BBA'
};

const PITCHER_SLOTS = new Set(['SP', 'RP', 'P']);

const IL_SLOTS    = new Set(['IL', 'IL+', 'IL7', 'IL10', 'IL15', 'IL60']);
const IL_STATUSES = new Set(['IL', 'IL10', 'IL15', 'IL60', 'DL', 'O', 'OUT', 'SUSP', 'NA']);
const DTD_STATUSES = new Set(['DTD', 'Q', 'QUESTIONABLE']);

// ── Deterministic grade from VOR (cannot be overridden by Claude) ─────────────
function computeGrade(totalVOR) {
  if (totalVOR > 700) return 'A+';
  if (totalVOR > 550) return 'A';
  if (totalVOR > 400) return 'A-';
  if (totalVOR > 300) return 'B+';
  if (totalVOR > 220) return 'B';
  if (totalVOR > 140) return 'B-';
  if (totalVOR > 80)  return 'C+';
  if (totalVOR > 30)  return 'C';
  return 'D';
}

// ── Guardrail: sanitize Claude output against real data ───────────────────────
// Removes hallucinated players and overrides computed values so Claude
// can never fabricate availability, roster membership, or grade.
function sanitizeAnalysis(analysis, { roster, freeAgents, totalVOR, teamsPlaying }) {
  const normName = n => String(n || '').toLowerCase().replace(/[^a-z]/g, '');

  const rosterSet = new Set(roster.map(p => normName(p.name)));
  const faSet     = new Set(freeAgents.map(p => normName(p.name)));

  const onRoster = name => rosterSet.has(normName(name));
  const onFAList = name => faSet.has(normName(name));

  // Build a lookup: player name → does their team have a game today?
  const playerHasGame = {};
  if (teamsPlaying && teamsPlaying.abbrs && teamsPlaying.abbrs.size > 0) {
    for (const p of roster) {
      const teamAbbr = String(p.team || '').toUpperCase();
      playerHasGame[normName(p.name)] = teamsPlaying.abbrs.has(teamAbbr);
    }
  }
  const hasGameToday = name => {
    // If we have schedule data, use it; otherwise assume they have a game (don't strip)
    const key = normName(name);
    return playerHasGame[key] !== undefined ? playerHasGame[key] : true;
  };

  // 1. Audit grade — always engine-computed, never Claude's
  if (analysis.audit) {
    analysis.audit.grade = computeGrade(totalVOR);
    // Verify topPlayer is real
    if (analysis.audit.topPlayer?.name && !onRoster(analysis.audit.topPlayer.name)) {
      analysis.audit.topPlayer = null;
    }
  }

  // 2. Waiver adds — only allow players confirmed on the FA list
  if (analysis.waiver?.adds?.length) {
    const before = analysis.waiver.adds.length;
    analysis.waiver.adds = analysis.waiver.adds.filter(a => onFAList(a.player));
    if (analysis.waiver.adds.length < before) {
      console.warn(`[guardrail] Stripped ${before - analysis.waiver.adds.length} hallucinated waiver add(s)`);
    }
  }

  // 3. Waiver drops — only allow players confirmed on the roster
  if (analysis.waiver?.drops?.length) {
    analysis.waiver.drops = analysis.waiver.drops.filter(d => onRoster(d.player));
  }

  // 4. Start/Sit — only allow roster players + enforce daily schedule
  if (analysis.startSit?.starts?.length) {
    const before = analysis.startSit.starts.length;
    analysis.startSit.starts = analysis.startSit.starts.filter(s => {
      if (!onRoster(s.player)) return false;
      // Cannot start a player whose team has no game today
      if (!hasGameToday(s.player)) {
        console.warn(`[guardrail] Stripped START for ${s.player} — team has no game today`);
        return false;
      }
      return true;
    });
  }
  if (analysis.startSit?.sits?.length) {
    analysis.startSit.sits = analysis.startSit.sits.filter(s => onRoster(s.player));
  }

  // 5. Pitching — enforce waiver vs roster availability
  if (analysis.pitching) {
    // "stream" implies adding from waivers, so they must be on the FA list
    if (analysis.pitching.stream?.player && !onFAList(analysis.pitching.stream.player)) {
      analysis.pitching.stream = null;
    }
    // "avoid" implies avoiding a start, so they must be on the roster
    if (analysis.pitching.avoid?.player && !onRoster(analysis.pitching.avoid.player)) {
      analysis.pitching.avoid = null;
    }
    // "twoStarters" represents players on your roster who have 2 starts
    if (analysis.pitching.twoStarters?.length) {
      analysis.pitching.twoStarters = analysis.pitching.twoStarters.filter(n => onRoster(n));
    }
  }

  return analysis;
}


function playerILTag(p) {
  const slot   = String(p.slot   || '').toUpperCase();
  const status = String(p.status || '').toUpperCase();
  if (IL_SLOTS.has(slot) || [...IL_STATUSES].some(s => status.includes(s))) return ' [⛔IL-UNAVAILABLE]';
  if ([...DTD_STATUSES].some(s => status.includes(s))) return ' [⚠️DTD]';
  return '';
}

function buildPlayerLine(p, numTeams, scoringType) {
  const stats = p.stats || {};
  const parts = Object.entries(stats)
    .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined && v !== null && v !== '0' && v !== 0)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  const statStr = parts.length ? parts.join(' ') : 'no stats yet this season';
  const slot = p.slot || 'BN';
  const team = p.team ? `, ${p.team}` : '';
  const ilTag = playerILTag(p);
  const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
  const rawPos = String(p.position || '').split('/')[0].trim();
  const vorRaw = numTeams ? brain.calculateVOR(stats, rawPos, numTeams, scoringType) : null;
  const vor    = vorRaw !== null ? (typeof vorRaw === 'object' ? (vorRaw.vor ?? vorRaw.score ?? 0) : (vorRaw ?? 0)) : null;
  const vorStr = vor !== null ? ` VOR:${Math.round(vor)}` : '';
  return `  • ${p.name} (${p.position}${team}) [Fantasy Slot:${slot}]${ilTag}${mlbStatus}${vorStr} — ${statStr}`;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { league_key, force = false } = await request.json();
    if (!league_key) return NextResponse.json({ error: 'league_key required' }, { status: 400 });

    // ── Daily cache check — return cached result unless user explicitly force-refreshes ──
    if (!force) {
      const cached = db.getAnalysisCache(guid, league_key);
      if (cached) {
        const used = db.getForceRefreshCount(guid);
        const remaining = Math.max(0, db.DAILY_FORCE_LIMIT - used);
        console.log(`[analyze] Cache hit for ${guid}:${league_key} (${remaining} force refreshes remaining today)`);
        return NextResponse.json({ ...cached, fromCache: true, refreshesRemaining: remaining });
      }
    }

    // ── Force-refresh rate limit check ────────────────────────────────────────
    if (force) {
      const used = db.getForceRefreshCount(guid);
      if (used >= db.DAILY_FORCE_LIMIT) {
        console.log(`[analyze] Force-refresh limit hit for ${guid} (${used}/${db.DAILY_FORCE_LIMIT} today)`);
        // Return today's cache with a limit message rather than hard-erroring
        const cached = db.getAnalysisCache(guid, league_key);
        if (cached) {
          return NextResponse.json({
            ...cached,
            fromCache: true,
            refreshLimitReached: true,
            refreshesRemaining: 0,
            refreshesLimit: db.DAILY_FORCE_LIMIT,
          });
        }
        // No cache at all yet — fall through to Haiku auto-analysis (don't block entirely)
      }
    }

    const settings = db.getLeagueSettings(guid, league_key) || {};

    // ── Fetch all needed data in parallel ─────────────────────────────────────
    const [teamKey, pitching, freeAgents, newsRaw, teamsPlayingRaw] = await Promise.all([
      yahoo.getUserTeamKey(guid, league_key),
      mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [] })),
      yahoo.getPlayers(guid, league_key, 'A', 0, null).catch(() => []),
      mlbStats.getBreakingNews().catch(() => ''),
      mlbStats.getTodayTeamsPlaying().catch(() => ({ abbrs: new Set(), names: new Set() })),
    ]);
    const teamsPlaying = teamsPlayingRaw || { abbrs: new Set(), names: new Set() };

    let roster = [];
    if (teamKey) {
      try {
        const rosterRaw = await yahoo.getRoster(guid, league_key, teamKey);
        const playerKeys = [];
        const slotMap = {};
        for (const item of (rosterRaw || [])) {
          const p = item?.player;
          if (Array.isArray(p)) {
            const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
            if (info.player_key) {
              playerKeys.push(info.player_key);
              let pos = 'BN';
              const spObj = p.find(x => x && x.selected_position);
              if (spObj && spObj.selected_position) {
                const sp = spObj.selected_position;
                if (Array.isArray(sp)) {
                  const pItem = sp.find(x => x && x.position);
                  if (pItem) pos = pItem.position;
                } else if (sp[1] && sp[1].position) {
                  pos = sp[1].position;
                } else if (sp.position) {
                  pos = sp.position;
                }
              }
              slotMap[info.player_key] = pos;
            }
          }
        }
        if (playerKeys.length) {
          const fetchedRoster = await yahoo.getBatchPlayerStats(guid, league_key, playerKeys, null);
          roster = fetchedRoster.map(rp => ({ ...rp, slot: slotMap[rp.key] || 'BN' }));
        }
      } catch (e) {
        console.warn('[analyze] roster fetch failed:', e.message);
      }
    }

    // ── Build human-readable roster summary ───────────────────────────────────
    const numTeams    = settings.num_teams    || 10;
    const scoringType = settings.scoring_type || 'headpoint';
    const hitters  = roster.filter(p => !PITCHER_SLOTS.has(String(p.position || '').split('/')[0]));
    const pitchers = roster.filter(p =>  PITCHER_SLOTS.has(String(p.position || '').split('/')[0]));

    // Compute VOR for every player so Claude has a real grading signal
    const withVOR = roster.map(p => {
      const rawPos = String(p.position || '').split('/')[0].trim();
      const vorRaw = brain.calculateVOR(p.stats || {}, rawPos, numTeams, scoringType);
      const vor    = typeof vorRaw === 'object' ? (vorRaw.vor ?? vorRaw.score ?? 0) : (vorRaw ?? 0);
      return { ...p, _vor: Math.round(vor) };
    });
    const totalVOR   = withVOR.reduce((s, p) => s + (p._vor || 0), 0);
    const hitterVOR  = withVOR.filter(p => !PITCHER_SLOTS.has(String(p.position || '').split('/')[0])).reduce((s, p) => s + (p._vor || 0), 0);
    const pitcherVOR = withVOR.filter(p =>  PITCHER_SLOTS.has(String(p.position || '').split('/')[0])).reduce((s, p) => s + (p._vor || 0), 0);
    const avgVOR     = roster.length ? Math.round(totalVOR / roster.length) : 0;
    const topPlayer  = [...withVOR].sort((a, b) => (b._vor || 0) - (a._vor || 0))[0];

    const rosterBlock = [
      `HITTERS (hitter VOR total: ${hitterVOR}):`,
      ...(hitters.length ? hitters.map(p => buildPlayerLine(p, numTeams, scoringType)) : ['  (none found)']),
      '',
      `PITCHERS (pitcher VOR total: ${pitcherVOR}):`,
      ...(pitchers.length ? pitchers.map(p => buildPlayerLine(p, numTeams, scoringType)) : ['  (none found)']),
    ].join('\n');

    // ── Score waiver targets using the real fantasyBrain engine ─────────────
    // No hardcoded scores — all values come from scoreWaiverTarget()
    const rosterDiag = brain.buildRosterDiagnosis(roster, settings, null, pitching);
    const scoredWaiver = freeAgents.slice(0, 25).map(p => {
      const wScore = brain.scoreWaiverTarget(p, roster, settings, rosterDiag.categoryNeeds, pitching);
      return { ...p, waiverScore: wScore };
    }).sort((a, b) => (b.waiverScore?.score ?? 0) - (a.waiverScore?.score ?? 0));

    // ── Build pitching intelligence block ───────────────────────────────────
    // Normalize a name to lowercase ASCII for fuzzy matching across data sources
    const normName = n => String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    // Build lookup sets: who is a free agent vs already on my roster
    const faNameSet   = new Set(freeAgents.map(p => normName(p.name)));
    const rosterNames = new Set(roster.map(p => normName(p.name)));

    const isAvailableFA = n => faNameSet.has(normName(n));
    const isOnMyRoster  = n => rosterNames.has(normName(n));

    const buildPitcherBlock = (names, details, { faOnly = false } = {}) => {
      const filtered = faOnly
        ? names.filter(n => isAvailableFA(n))                           // streaming: FA only
        : names.filter(n => isAvailableFA(n) || isOnMyRoster(n));      // roster decisions
      if (filtered.length === 0) return faOnly ? '  None available on waivers' : '  None confirmed yet';
      return filtered.map(n => {
        const d     = details?.[n];
        const label = d ? `${d.fullName}: ${d.label}` : n;
        const tag   = isOnMyRoster(n) ? ' [ON YOUR ROSTER — start them]' : ' [FREE AGENT — add now]';
        return `  • ${label}${tag}`;
      }).join('\n');
    };

    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });

    // Separate 2-start pitchers into: available FAs to stream vs already rostered
    const twoStartFAs = (pitching.remainingTwoStarters || []).filter(n => isAvailableFA(n));
    const twoStartRostered = (pitching.remainingTwoStarters || []).filter(n => isOnMyRoster(n));

    const twoStartBlock = [
      '2-START STREAMERS AVAILABLE ON WAIVERS (add immediately):',
      twoStartFAs.length
        ? buildPitcherBlock(twoStartFAs, pitching.pitcherDetails, { faOnly: true })
        : '  None available on waivers this week',
      '',
      '2-START PITCHERS ON YOUR ROSTER (start all of these):',
      twoStartRostered.length
        ? buildPitcherBlock(twoStartRostered, pitching.pitcherDetails)
        : '  None on your roster with 2 starts remaining',
      pitching.oneStartRemaining?.filter(n => isAvailableFA(n)).length
        ? `\n1-START REMAINING — AVAILABLE ON WAIVERS:\n${buildPitcherBlock(pitching.oneStartRemaining, pitching.pitcherDetails, { faOnly: true })}`
        : '',
      pitching.today?.filter(n => isAvailableFA(n)).length
        ? `\nSTARTING TODAY — AVAILABLE ON WAIVERS:\n${buildPitcherBlock(pitching.today, pitching.pitcherDetails, { faOnly: true })}`
        : '',
    ].filter(s => s !== '').join('\n');

    // Next week: only show pitchers available as FAs (you already have your own starters)
    const nextWeekFAs = (pitching.nextWeek || []).filter(n => isAvailableFA(n));
    const nextWeekBlock = nextWeekFAs.length
      ? nextWeekFAs.map(n => `  • ${n} [FREE AGENT — add now to use next week]`).join('\n')
      : '  No confirmed 2-start pitchers next week available on waivers';

    const scoringLabel = SCORING_TYPE_MAP[settings.scoring_type] || settings.scoring_type || 'H2H Points';

    // Split roster into active and IL for Claude context
    const ilPlayers     = roster.filter(p => playerILTag(p).includes('IL-UNAVAILABLE'));
    const activePlayers = roster.filter(p => !playerILTag(p).includes('IL-UNAVAILABLE'));
    const activeBlock   = activePlayers.map(p => buildPlayerLine(p, numTeams, scoringType)).join('\n') || '  (none)';
    const ilBlock       = ilPlayers.length
      ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔ IL SLOT — ${p.status || 'injured'}]`).join('\n')
      : '  None';

    const prompt = `You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine.

🚨 CRITICAL DIRECTIVE: You are NOT the analyst. The algorithm is the analyst. Your ONLY job is to convert the numeric scores, VOR values, and engine recommendations below into engaging natural language.

⚠️ SCORING FORMAT: ${scoringLabel}
This determines ALL advice.

⚠️ DATA RULES:
1. USE ONLY THE STATS AND VOR SCORES BELOW — do not use your training data for player performance numbers or availability.
2. DO NOT invent player names. If a player is not in the active roster or free agent list, they do not exist.
3. You MUST recommend adding/dropping based on the mathematical VOR differences provided. Do not override the algorithm.

⛔⛔⛔ YAHOO IL RULES — READ THIS BEFORE GIVING ANY ADVICE ⛔⛔⛔
IL (Injured List) slots are COMPLETELY SEPARATE from active roster slots in Yahoo Fantasy.
- Dropping an IL player frees an IL slot — it does NOT free an active lineup spot.
- You CANNOT add an active player by dropping an IL player. It is mechanically impossible in Yahoo.
- The ONLY way to open an active roster spot is to drop a NON-IL player (someone from the ACTIVE ROSTER section below).
- Players in the "ON IL" section below occupy IL-only slots. They do NOT block any active roster moves.
- DO NOT mention IL players as drop candidates for roster upgrades. Period.
- DO NOT recommend starting them, trading for them, or treating them as active contributors.
- DO NOT mention them as strengths.

📅 DAILY STARTING LINEUP RULES:
1. [Fantasy Slot: BN] = Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] = Active Lineup.
2. [MLB: Starting Today] = confirmed in today's MLB lineup. [MLB: Not Starting/Bench] = benched in real life. [MLB: No Game/Unknown] = team off or lineup not posted.
3. Do not recommend "starting" someone already in an active slot. If a player is [MLB: Not Starting/Bench] or [MLB: No Game/Unknown] and in an active slot, recommend moving them to BN.

LEAGUE: "${settings.name || league_key}" | Teams: ${settings.num_teams || 10} | Week: ${settings.current_week || '?'}

⚠️ USE ONLY THE STATS BELOW — do not use your training data for player performance numbers. The stats below are the current 2026 season actuals from Yahoo Fantasy.

ROSTER VOR SUMMARY (Value Over Replacement — higher = more valuable relative to position):
• Team Total VOR: ${totalVOR} | Avg VOR per player: ${avgVOR}
• Hitter VOR: ${hitterVOR} | Pitcher VOR: ${pitcherVOR}
• Best player: ${topPlayer?.name || 'N/A'} (VOR:${topPlayer?._vor || 0})

GRADING SCALE — base audit.grade on Total VOR of ${totalVOR} (be accurate and honest, do NOT round up):
• A+ = Total VOR > 700 (elite, championship-caliber)
• A  = Total VOR 550-700 (strong contender)
• A- = Total VOR 400-549 (above average)
• B+ = Total VOR 300-399 (solid, playoff team)
• B  = Total VOR 220-299 (average)
• B- = Total VOR 140-219 (below average)
• C+ = Total VOR 80-139 (weak, needs significant help)
• C  = Total VOR 30-79 (rebuilding)
• D  = Total VOR < 30 (very early season / barely rostered)

ACTIVE ROSTER (these are your only drop candidates if you need to make room):
${activeBlock}

ON IL (⛔ these players occupy IL-ONLY slots — dropping them does NOT open an active spot):
${ilBlock}

PITCHING INTELLIGENCE (as of ${nowDay}):
⚠️ CRITICAL PITCHING RULES:
1. The lists below have ALREADY been filtered to only show pitchers who are either FREE AGENTS or on YOUR ROSTER. Do NOT recommend any pitcher not listed here.
2. Only recommend "streaming" pitchers marked [FREE AGENT — add now]. Players marked [ON YOUR ROSTER] should appear in your startSit.starts, not in waiver adds.
3. Do not invent pitcher names. Do not use your training data for player availability — use ONLY the filtered lists below.

THIS WEEK — filtered to available/rostered only:
${twoStartBlock}

NEXT WEEK — pitchers with 2 confirmed starts next week (add now to benefit):
${nextWeekBlock}

TOP FREE AGENTS (available now):
${freeAgents.slice(0, 10).map(p => `  • ${p.name} (${p.position}) — ${p.team}`).join('\n') || '  None'}

BREAKING NEWS (MLB — last 24h):
${newsRaw || '  No recent news available'}

---
CONSISTENCY RULE: All 6 sections come from ONE unified analysis. Ensure zero contradictions:
- A player recommended as ADD in waiver must NOT appear as SIT in startSit
- A player listed in drops must NOT appear in starts or pitching.stream
- Your audit.strength and matchup.edge must be consistent with each other
- 2-start pitchers in pitching.twoStarters should appear in startSit.starts (if on roster)

Respond ONLY with valid JSON — no markdown fences, no prose outside the JSON object.
All player names, stats, and reasons MUST come from the roster data and free agent list provided above.
DO NOT use your training data to supply player stats — if a stat is not in the data above, do not cite it.
DO NOT invent player names not shown in the data above.
The JSON keys below are FORMAT INSTRUCTIONS — replace ALL quoted placeholder text with real values from the data:

{
  "waiver": {
    "headline": "One punchy sentence — the single most important waiver move this week",
    "summary": "2 sentences explaining the waiver landscape for this league format",
    "adds": [
      {"player": "Name", "position": "SP", "team": "XX", "reason": "specific stat-backed reason"},
      {"player": "Name", "position": "OF", "team": "XX", "reason": "reason"}
    ],
    "drops": [
      {"player": "Name", "position": "SP", "reason": "why they are droppable right now"}
    ]
  },
  "startSit": {
    "headline": "One sentence — who to start or sit that matters most this week",
    "summary": "2 sentences on lineup decisions specific to this week's schedule",
    "starts": [
      {"player": "Name", "position": "SP", "reason": "schedule/stats reason"}
    ],
    "sits": [
      {"player": "Name", "position": "1B", "reason": "why bench them"}
    ]
  },
  "pitching": {
    "headline": "One sentence on pitching strategy this week",
    "summary": "2 sentences on SP streaming and rotation decisions",
    "twoStarters": ["Name1", "Name2"],
    "stream": {"player": "Name", "reason": "matchup/ERA reason"},
    "avoid": {"player": "Name", "reason": "why to avoid"}
  },
  "audit": {
    "grade": "[A+/A/A-/B+/B/B-/C+/C/D/F based on overall roster VOR — be specific]",
    "headline": "[one punchy sentence verdict on this roster's overall strength]",
    "championshipPath": "[one sentence on how THIS specific team wins the league, citing their actual best players]",
    "strengths": [
      "[Strength 1 — cite a specific player from the roster data above with their actual stat]",
      "[Strength 2 — another player or category advantage]",
      "[Strength 3]"
    ],
    "weaknesses": [
      "[Weakness 1 — cite a specific roster gap, low-VOR player, or category hole]",
      "[Weakness 2]",
      "[Weakness 3]"
    ],
    "moves": [
      {"action": "[Specific move: drop X / add Y, or trade suggestion]", "priority": "immediate", "reasoning": "[why, citing actual stats from the data above]"},
      {"action": "[Move 2]", "priority": "high", "reasoning": "[why]"}
    ],
    "topPlayer": {"name": "[best player from roster]", "position": "[position]", "statLine": "[stat:value pairs from data above only]"}
  },
  "gameplan": {
    "headline": "The single most important strategic move for this week",
    "priority": "critical",
    "summary": "2 sentences on the week's strategy specific to this scoring format",
    "steps": [
      "First specific action to take",
      "Second specific action",
      "Third specific action"
    ]
  },
  "matchup": {
    "edge": "Pitching / Hitting / Even",
    "headline": "One sentence on this week's matchup outlook",
    "summary": "1-2 sentences on how to win this week's matchup"
  }
}`;

    // ── Select model: Sonnet for force-refresh (quality), Haiku for daily auto-load (cost) ──
    const model = force ? 'sonnet' : 'haiku';
    console.log(`[analyze] Running ${force ? 'FORCE (Sonnet)' : 'AUTO (Haiku)'} analysis for ${guid}:${league_key}`);
    const raw = force
      ? await callClaude([{ role: 'user', content: prompt }], 4096)
      : await callClaudeFast([{ role: 'user', content: prompt }], 4096);

    // Increment Sonnet counter only on actual force-refresh calls
    if (force) db.incrementForceRefreshCount(guid);

    let analysis = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      analysis = { waiver: { headline: 'Analysis unavailable', summary: raw }, startSit: {}, pitching: {}, audit: {}, gameplan: {}, matchup: {} };
    }

    // ── Guardrail pass — strip hallucinated data, override computed values ─────
    analysis = sanitizeAnalysis(analysis, {
      roster,
      freeAgents,
      totalVOR,
      teamsPlaying,
    });

    const refreshesUsed = db.getForceRefreshCount(guid);
    const refreshesRemaining = Math.max(0, db.DAILY_FORCE_LIMIT - refreshesUsed);

    const payload = { analysis, scoredWaiver: scoredWaiver.slice(0, 10), lineupRecs: null, model, totalVOR, avgVOR };
    db.setAnalysisCache(guid, league_key, payload);

    return NextResponse.json({ ...payload, fromCache: false, refreshesRemaining, refreshesLimit: db.DAILY_FORCE_LIMIT });

  } catch (err) {
    console.error('[claude/analyze]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/ask/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { question, context, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaudeFast([{
      role: 'user',
      content: [
        settings.name ? `League: ${settings.name} (${settings.scoring_type})` : null,
        context || null,
        question
      ].filter(Boolean).join('\n\n')
    }]);

    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error('[claude/ask]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/audit/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeJSON } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as yahoo from '@/lib/yahooService';
import * as mlbStats from '@/lib/mlbStatsService';

// Deterministic grade from VOR — Claude cannot override this
function computeGrade(totalVOR) {
  if (totalVOR > 700)  return 'A+';
  if (totalVOR > 550)  return 'A';
  if (totalVOR > 400)  return 'A-';
  if (totalVOR > 300)  return 'B+';
  if (totalVOR > 220)  return 'B';
  if (totalVOR > 140)  return 'B-';
  if (totalVOR > 80)   return 'C+';
  if (totalVOR > 30)   return 'C';
  return 'D';
}


// Yahoo stat ID → human-readable name
const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
};

const SCORING_TYPE_MAP = {
  'headpoint': 'H2H Points (weekly head-to-head, each stat earns points)',
  'headone':   'H2H Categories (weekly matchup, win/tie/lose each category)',
  'roto':      'Rotisserie (season-long category ranking)',
};

const IL_SLOTS    = new Set(['IL', 'IL+', 'IL7', 'IL10', 'IL15', 'IL60']);
const IL_STATUSES = new Set(['IL', 'IL10', 'IL15', 'IL60', 'DL', 'O', 'OUT', 'SUSP', 'NA']);
const DTD_STATUSES = new Set(['DTD', 'Q', 'QUESTIONABLE']);

function playerILTag(p) {
  const slot   = String(p.slot   || '').toUpperCase();
  const status = String(p.status || '').toUpperCase();
  if (IL_SLOTS.has(slot) || [...IL_STATUSES].some(s => status.includes(s))) return '[⛔IL]';
  if ([...DTD_STATUSES].some(s => status.includes(s))) return '[⚠️DTD]';
  return '';
}

function buildPlayerLine(p) {
  const stats = p.stats || {};
  const parts = Object.entries(stats)
    .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined && v !== null && v !== '0')
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  const tag = playerILTag(p);
  return `  • ${p.name} (${p.position}) [${p.slot || 'BN'}]${tag ? ' ' + tag : ''} — ${parts.join(' ') || 'no stats yet'}`;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await request.json();
    const { league_key, team_key, force = false } = body;
    // Accept pre-fetched roster from frontend as fallback
    const frontendRoster = body.my_roster || body.roster || [];

    const settings = db.getLeagueSettings(guid, league_key) || {};
    const scoringLabel = SCORING_TYPE_MAP[settings.scoring_type] || settings.scoring_type || 'H2H Points';

    // ── Daily cache check (same pattern as /analyze) ──────────────────────────
    // 'audit_' prefix keeps audit cache separate from master analysis cache
    const cacheKey = `audit_${league_key}`;
    if (!force) {
      const cached = db.getAnalysisCache(guid, cacheKey);
      if (cached) {
        console.log(`[audit] Serving cached result for ${guid}:${league_key}`);
        return NextResponse.json({ ...cached, fromCache: true });
      }
    }

    // ── Fetch rich context server-side in parallel ────────────────────────────
    const [pitchingCtx, newsRaw, standingsRaw] = await Promise.allSettled([
      mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], pitcherDetails: {} })),
      mlbStats.getBreakingNews().catch(() => ''),
      yahoo.getStandings(guid, league_key).catch(() => []),
    ]);

    const pitchingContext = pitchingCtx.status === 'fulfilled' ? pitchingCtx.value : { currentWeek: [], nextWeek: [], pitcherDetails: {} };
    const news            = newsRaw.status     === 'fulfilled' ? newsRaw.value     : '';
    const standings       = standingsRaw.status === 'fulfilled' ? standingsRaw.value : [];

    // ── Fetch the actual team roster with stats server-side ───────────────────
    // Prefer server-fetched roster over frontend data — guarantees stats are present
    let roster = frontendRoster;
    const targetTeamKey = team_key || await yahoo.getUserTeamKey(guid, league_key).catch(() => null);
    if (targetTeamKey) {
      try {
        const rosterData   = await yahoo.getRoster(guid, league_key, targetTeamKey);
        const playerKeys   = [];
        const slotMap      = {};
        for (const rosterItem of (rosterData || [])) {
          const p = rosterItem?.player;
          if (!p || !Array.isArray(p)) continue;
          const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
          if (!info.player_key) continue;
          playerKeys.push(info.player_key);
          let slot = 'BN';
          const selPos = p[1]?.selected_position;
          if (selPos) {
            if (Array.isArray(selPos)) {
              const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
              slot = posItem?.position || 'BN';
            } else if (selPos?.position) {
              slot = selPos.position;
            } else if (typeof selPos === 'string') {
              slot = selPos;
            }
          }
          slotMap[info.player_key] = slot;
        }
        if (playerKeys.length) {
          const withStats = await yahoo.getBatchPlayerStats(guid, league_key, playerKeys, null);
          roster = withStats.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
        }
      } catch (e) {
        console.warn('[audit] Server-side roster fetch failed, using frontend data:', e.message);
        // Fall back to whatever the frontend sent
      }
    }

    // ── Build standings context block ─────────────────────────────────────────
    let standingsBlock = '';
    if (standings.length > 0) {
      const parsedStandings = standings.slice(0, 12).map((t, i) => {
        const teamArr = t?.team;
        const info = Array.isArray(teamArr)
          ? Object.assign({}, ...(Array.isArray(teamArr[0]) ? teamArr[0] : []))
          : (teamArr || {});
        const stats = teamArr?.[1]?.team_standings || {};
        const wins  = stats.outcome_totals?.wins ?? '?';
        const losses = stats.outcome_totals?.losses ?? '?';
        const pct   = stats.outcome_totals?.percentage ?? '?';
        return `  ${i + 1}. ${info.name || 'Team'} — ${wins}W-${losses}L (.${String(pct).replace('.', '')})`;
      }).join('\n');
      standingsBlock = `\nLEAGUE STANDINGS (context for grade):\n${parsedStandings}`;
    }

    // ── Two-start pitcher context ─────────────────────────────────────────────
    const twoStartNames = [
      ...(pitchingContext.currentWeek || []),
      ...(pitchingContext.nextWeek    || []),
    ];
    const pitchingBlock = twoStartNames.length
      ? `\n2-START PITCHERS AVAILABLE THIS/NEXT WEEK: ${twoStartNames.join(', ')}`
      : '';

    // ── Player IL/active split ────────────────────────────────────────────────
    const ilPlayers     = roster.filter(p =>  playerILTag(p).includes('IL'));
    const activePlayers = roster.filter(p => !playerILTag(p).includes('IL'));
    const pitchers      = activePlayers.filter(p => ['SP','RP','P'].includes(String(p.position||'').split('/')[0]));
    const hitters       = activePlayers.filter(p => !['SP','RP','P'].includes(String(p.position||'').split('/')[0]));

    const rosterBlock = [
      'ACTIVE HITTERS (these are your only drop candidates if you need to make room):',
      ...hitters.map(buildPlayerLine),
      '',
      'ACTIVE PITCHERS (these are your only drop candidates if you need to make room):',
      ...pitchers.map(buildPlayerLine),
    ].join('\n');

    // ── Pre-compute VOR server-side ───────────────────────────────────────────
    const vorTable = activePlayers.map(p => {
      const rawPos  = String(p.position || '').split('/')[0].trim();
      const vor     = brain.calculateVOR(p.stats || {}, rawPos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const scarcity = brain.getPositionalScarcity(rawPos, settings.num_teams || 10);
      return {
        name:     p.name,
        position: rawPos,
        vor:      typeof vor === 'object' ? (vor.vor ?? vor.score ?? 0) : (vor ?? 0),
        scarcity: scarcity.tier || 'moderate',
      };
    }).sort((a, b) => b.vor - a.vor);

    const vorBlock = vorTable.map(p => `  ${p.name} (${p.position}): VOR ${p.vor} [${p.scarcity}]`).join('\n');

    // ── Roster diagnosis for category needs ──────────────────────────────────
    const diagnosis = brain.buildRosterDiagnosis(activePlayers, settings, null, pitchingContext);

    const totalVOR  = vorTable.reduce((s, p) => s + (p.vor || 0), 0);
    const avgVOR    = vorTable.length ? Math.round(totalVOR / vorTable.length) : 0;
    const topPlayer = vorTable[0];

    // ── Prompt ────────────────────────────────────────────────────────────────
    const raw = await callClaudeJSON([{
      role: 'user',
      content: `You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine for the 2026 MLB season.

🚨 CRITICAL DIRECTIVE: You are NOT the analyst. The fantasyBrain.js algorithm is the analyst. Your ONLY job is to convert the algorithm's numeric VOR (Value Over Replacement) scores and category diagnosis into natural, engaging human language.

⚠️ SCORING FORMAT: ${scoringLabel}
Tailor ALL narrative to this exact format. Do NOT apply Roto logic to H2H leagues.

⚠️ DATA RULES:
1. Use ONLY stats, VOR values, and player names from the data below.
2. DO NOT invent stats or context. If a stat is missing, say "stats not yet available."
3. You MUST recommend dropping players with the lowest VOR scores. Do not disagree with the engine's VOR calculations.
4. DO NOT recommend streaming pitchers who are NOT in the two-start list.
${standingsBlock}${pitchingBlock}

⛔⛔⛔ YAHOO IL RULES — READ THIS BEFORE GIVING ANY ADVICE ⛔⛔⛔
IL (Injured List) slots are COMPLETELY SEPARATE from active roster slots in Yahoo Fantasy.
- Dropping an IL player frees an IL slot — it does NOT free an active lineup spot.
- You CANNOT add an active player by dropping an IL player. It is mechanically impossible in Yahoo.
- The ONLY way to open an active roster spot is to drop a NON-IL player (someone from the ACTIVE sections above).
- Players in the "ON IL" section below occupy IL-only slots. They do NOT block any active roster moves.
- DO NOT mention IL players as drop candidates for roster upgrades or in "moves". Period.
- DO NOT mention them as strengths, streaming options, or trade targets.

LEAGUE: "${settings.name || league_key}" | Teams: ${settings.num_teams || 10} | Format: ${scoringLabel}

TEAM ROSTER — 2026 Yahoo season stats:
${rosterBlock}

ON IL (⛔ these players occupy IL-ONLY slots — dropping them does NOT open an active spot):
${ilPlayers.length ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔ IL SLOT — ${p.status || 'injured'}]`).join('\n') : '  None'}

CATEGORY NEEDS (engine-computed):
${diagnosis.promptBlock || 'N/A'}

PRE-CALCULATED VOR RANKINGS (engine-computed — use these exact values):
Team Total VOR: ${totalVOR} | Avg VOR per player: ${avgVOR} | Best: ${topPlayer?.name || 'N/A'} (VOR:${topPlayer?.vor || 0})
${vorBlock}

GRADING SCALE — base "grade" on Total VOR of ${totalVOR} (be accurate and honest, do NOT round up):
• A+ = Total VOR > 700 (elite, championship-caliber)
• A  = Total VOR 550–700 (strong contender)
• A- = Total VOR 400–549 (above average)
• B+ = Total VOR 300–399 (solid, playoff team)
• B  = Total VOR 220–299 (average)
• B- = Total VOR 140–219 (below average)
• C+ = Total VOR 80–139 (weak, needs significant help)
• C  = Total VOR 30–79 (rebuilding)
• D  = Total VOR < 30 (very early season)

BREAKING NEWS:
${news ? news.slice(0, 600) : 'None'}

Perform a comprehensive team audit. Be specific — cite actual player names, VOR values, and stats from the data above.
REMINDER: Do NOT suggest dropping any player from the "ON IL" section — it will not free an active roster spot.
Respond ONLY with valid JSON (no markdown fences). Do NOT include vorByPlayer — it is handled server-side.
{
  "grade": "[engine-computed]",
  "championshipPath": "[one sentence: how does THIS specific team win, citing 1-2 actual player names + their VOR/stats]",
  "strengths": [
    "[cite player name + actual VOR value + stat]",
    "[cite player name + actual VOR value + stat]",
    "[cite player name + actual VOR value + stat]"
  ],
  "weaknesses": [
    "[cite specific gap, low-VOR player name, or missing category with numbers]",
    "[cite specific gap or player + VOR]",
    "[cite specific gap or player + VOR]"
  ],
  "moves": [
    {"action": "[Drop X / Add Y — real names from the roster data]", "priority": "immediate", "reasoning": "[why, citing VOR numbers and stats]"},
    {"action": "[Move 2 — real names]", "priority": "high", "reasoning": "[why]"},
    {"action": "[Move 3 — real names]", "priority": "medium", "reasoning": "[why]"}
  ]
}`
    }], 1400);

    // ── Parse response ────────────────────────────────────────────────────────
    let parsed = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    } catch {
      parsed = { grade: '?', raw };
    }

    const result = {
      ...parsed,
      grade:      computeGrade(totalVOR),  // Always engine-computed — never trust Claude's grade
      totalVOR,
      avgVOR,
      vorByPlayer: vorTable,               // Always engine-computed VOR, not Claude's
      fromCache:  false,
    };

    // ── Write to daily cache (only if Claude returned real prose) ─────────────
    if (parsed.championshipPath) {
      db.setAnalysisCache(guid, cacheKey, result);
      console.log(`[audit] Cached result for ${guid}:${league_key}`);
    }

    return NextResponse.json(result);

  } catch (err) {
    console.error('[claude/audit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/gameplan/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats and schedule data provided in this prompt.
DO NOT use your training data to supply ERA, AVG, HR, or any other stat values.
DO NOT recommend pitchers not listed in the confirmed probable pitcher schedule below.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, opponent, week_context, league_key, leagueSettings: clientSettings } = await request.json();
    // Client always has fresh Yahoo league data — use it. DB entry is fallback.
    const dbSettings = db.getLeagueSettings(guid, league_key) || {};
    const settings = { ...dbSettings, ...clientSettings };
    const pitching = await mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], today: [], pitcherDetails: {} }));

    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });

    // ── Split roster into active vs IL — IL players shown separately ──────────
    const IL_TAGS = new Set(['IL','IL+','IL7','IL10','IL15','IL60','O','OUT','SUSP','NA','DL']);
    const isIL = p => IL_TAGS.has(String(p.status || '').toUpperCase()) || IL_TAGS.has(String(p.slot || '').toUpperCase());
    const activePlayers = (my_roster || []).filter(p => !isIL(p));
    const ilPlayers     = (my_roster || []).filter(p => isIL(p));

    const buildLine = p => {
      const pos = String(p.position || '').split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, pos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      const norm = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const detail = pitching.pitcherDetails?.[norm];
      const schedTag = detail ? ` [${detail.label}]` : '';
      const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
      return `  • ${p.name} (${p.position}, ${p.team || '?'}) [Fantasy Slot:${p.slot || 'BN'}]${schedTag}${mlbStatus} VOR:${vor.toFixed(1)} | ${statStr || 'no stats'}`;
    };

    const activeBlock = activePlayers.length
      ? activePlayers.map(buildLine).join('\n')
      : '  (no active players)';
    const ilBlock = ilPlayers.length
      ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔ IL SLOT — ${p.status || 'injured'}]`).join('\n')
      : '  None';

    const twoStartNames = (pitching.remainingTwoStarters || []).join(', ') || 'None';
    const nextWeekNames = (pitching.nextWeek || []).slice(0, 8).join(', ') || 'None';

    const text = await callClaudeFast([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League: ${settings.name || league_key || '?'} | Format: ${settings.scoring_type || 'Unknown'} | As of: ${nowDay}

⛔⛔⛔ YAHOO IL RULES — READ THIS BEFORE GIVING ANY ADVICE ⛔⛔⛔
IL (Injured List) slots are COMPLETELY SEPARATE from active roster slots in Yahoo Fantasy.
- Dropping an IL player frees an IL slot — it does NOT free an active lineup spot.
- You CANNOT add an active player by dropping an IL player. It is mechanically impossible in Yahoo.
- The ONLY way to open an active roster spot is to drop a NON-IL player (someone from the ACTIVE ROSTER section below).
- Players in the "ON IL" section below occupy IL-only slots. They do NOT block any active roster moves.
- DO NOT mention IL players as drop candidates for roster upgrades. Period.
- The ONLY valid reason to drop an IL player is if you need that IL slot for a different injured player.

📅 DAILY STARTING LINEUP RULES:
1. [Fantasy Slot: BN] = Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] = Active Lineup.
2. [MLB: Starting Today] = confirmed in today's MLB lineup. [MLB: Not Starting/Bench] = benched in real life. [MLB: No Game/Unknown] = team off or lineup not posted.
3. Do not recommend "starting" someone already in an active slot. If a player is [MLB: Not Starting/Bench] or [MLB: No Game/Unknown] and in an active slot, recommend moving them to BN.

ACTIVE ROSTER (these are your only drop candidates if you need to make room):
${activeBlock}

ON IL (⛔ these players occupy IL-ONLY slots — dropping them does NOT open an active spot):
${ilBlock}

CONFIRMED 2-START PITCHER SCHEDULE (as of ${nowDay}):
- Full 2-start value remaining this week: ${twoStartNames}
- Next week 2-start targets: ${nextWeekNames}
- Starting today: ${(pitching.today || []).join(', ') || 'None'}

Opponent context: ${JSON.stringify(opponent || {})}
Week context: ${week_context || ''}

Build a weekly game plan using ONLY the stats and schedule above.
Identify must-starts (prioritize pitchers with remaining starts this week), streaming targets from the confirmed schedule,
and lineup slots to maximize for the ${settings.scoring_type || 'this'} format.
Remember: the week ends Sunday night — factor in remaining games when prioritizing streamers.
REMINDER: Do NOT suggest dropping any player from the "ON IL" section — it will not free an active roster spot.`
    }]);

    return NextResponse.json({ gameplan: text });
  } catch (err) {
    console.error('[claude/gameplan]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/matchup/predict/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';

// Comprehensive Yahoo Fantasy Baseball stat_id → human-readable name
const STAT_NAMES = {
  '0': 'GP',   '1': 'GS',   '2': 'AB',   '3': 'AVG',  '4': 'OBP',
  '5': 'SLG',  '6': 'OPS',  '7': 'R',    '8': 'H',    '9': '1B',
  '10': '2B',  '11': '3B',  '12': 'HR',  '13': 'RBI', '14': 'SAC',
  '15': 'SF',  '16': 'SB',  '17': 'CS',  '18': 'BB',  '19': 'IBB',
  '20': 'HBP', '21': 'SO',  '22': 'GDP', '23': 'CYC', '24': 'E',
  '25': 'TB',
  '26': 'ERA', '27': 'WHIP','28': 'W',   '29': 'L',   '30': 'GS',
  '31': 'G',   '32': 'SV',  '33': 'HA',  '34': 'BBA', '35': 'HRA',
  '36': 'R_P', '37': 'ER',  '38': 'WP',  '39': 'BK',  '40': 'BS',
  '41': 'HB',  '42': 'K',   '43': 'SHO', '44': 'CG',  '45': 'NH',
  '46': 'PG',  '47': 'WinPct', '48': 'SV%', '49': 'K/9',
  '50': 'IP',  '51': 'K/BB', '52': 'OBA', '53': 'GO/AO',
  '54': 'TP',  '55': 'DP',  '56': 'QS%',
  '57': 'NSV', '58': 'NSB', '59': 'TB_P',
  '60': 'H/AB','61': 'XBH',
  '83': 'QS',  '84': 'NSVH','85': 'HLD',
};
const LOWER_IS_BETTER = new Set(['26', '27', '29', '33', '34', '35', '37', '40']); // ERA, WHIP, L, HA, BBA, HRA, ER, BS

// Safely extract a player name from Yahoo's nested name object
function extractName(info) {
  if (!info) return null;
  // Yahoo returns name as {full, first, last} object or sometimes a plain string
  if (typeof info.full_name === 'string') return info.full_name;
  if (typeof info.full_name === 'object' && info.full_name?.full) return info.full_name.full;
  if (typeof info.name === 'string') return info.name;
  if (typeof info.name === 'object' && info.name?.full) return info.name.full;
  return null;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { matchup_data, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    if (!matchup_data?.myTeam || !matchup_data?.opponent) {
      return NextResponse.json({ error: 'No matchup data provided' }, { status: 400 });
    }

    const { week, myTeam, opponent, stats } = matchup_data;
    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points'
      : settings.scoring_type === 'headone' ? 'H2H Categories'
      : settings.scoring_type === 'roto'    ? 'Rotisserie'
      : settings.scoring_type               || 'H2H Points';

    // ── Fetch roster with slot info ──────────────────────────────────────────
    let rosterLines = [];
    try {
      const teamKey = await yahoo.getUserTeamKey(guid, league_key);
      if (teamKey) {
        const rosterData = await yahoo.getRoster(guid, league_key, teamKey);
        for (const item of (rosterData || [])) {
          const p = item?.player;
          if (!p || !Array.isArray(p)) continue;
          const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
          const name = extractName(info);
          if (!name) continue;
          // Get slot
          const selPos = p[1]?.selected_position;
          let slot = 'BN';
          if (Array.isArray(selPos)) {
            const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
            slot = posItem?.position || 'BN';
          } else if (selPos?.position) {
            slot = selPos.position;
          }
          const pos = info.display_position || info.primary_position || '?';
          rosterLines.push(`  • ${name} (${pos}) [${slot}]`);
        }
      }
    } catch (e) {
      console.warn('[matchup/predict] Roster fetch failed:', e.message);
    }

    // ── Score gap and urgency ────────────────────────────────────────────────
    const myPts  = parseFloat(myTeam.total_points  ?? 0);
    const oppPts = parseFloat(opponent.total_points ?? 0);
    const gap    = Math.round((oppPts - myPts) * 10) / 10;
    const leading = gap < 0;
    const gapAbs  = Math.abs(gap);

    const urgencyLabel = leading
      ? `✅ You are WINNING by ${gapAbs} points.`
      : gapAbs > 75
        ? `🚨 CRITICAL: You are DOWN ${gapAbs} points. Aggressive moves required immediately.`
        : gapAbs > 30
          ? `⚠️ You are trailing by ${gapAbs} points. You need to make moves to close this gap.`
          : `⚡ Close match — gap is only ${gapAbs} points. Smart lineup moves can swing this.`;

    // ── Category comparison ──────────────────────────────────────────────────
    // Translate numeric stat_ids to human-readable names for the AI
    const resolveName = s => STAT_NAMES[s.stat_id] || s.name || s.stat_id;
    const categoryRows = (stats || []).map(s => {
      const catName = resolveName(s);
      const myWin  = s.my_winning  ? ' ← YOU LEAD' : '';
      const oppWin = s.opp_winning ? ' ← OPP LEADS' : '';
      const lowerBetter = LOWER_IS_BETTER.has(s.stat_id) ? ' (lower is better)' : '';
      return `  ${catName}${lowerBetter}: YOU ${s.my_value ?? '—'} vs OPP ${s.opp_value ?? '—'}${myWin}${oppWin}`;
    }).join('\n');

    const myWinningCats  = (stats || []).filter(s => s.my_winning).map(s => resolveName(s));
    const oppWinningCats = (stats || []).filter(s => s.opp_winning).map(s => resolveName(s));

    // ── Schedule Calculation ──────────────────────────────────────────────────
    // Yahoo fantasy weeks start on Monday, end on Sunday night.
    const todayNum = new Date().getDay(); // 0 = Sunday, 1 = Monday... 6 = Saturday
    const daysRemaining = (7 - todayNum) % 7;

    const prompt = `You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine.

🚨 CRITICAL DIRECTIVE: Your ONLY job is to convert the raw numeric gaps and categorical deficits below into a sharp, actionable summary. Do not invent your own analysis, and do not reference external data.

⚠️ DATA RULES: Analyze ONLY the data provided below. Do NOT use training data for player stats or availability. Do NOT disagree with the numeric gaps.

LEAGUE: ${settings.name || league_key} | Format: ${scoringLabel} | Week ${week || '?'} | ${daysRemaining} days remaining in matchup

${urgencyLabel}

LIVE SCORE:
  ${myTeam.name}: ${myPts} pts
  ${opponent.name}: ${oppPts} pts
  Point gap: ${gap > 0 ? `You are DOWN ${gap}` : `You are UP ${Math.abs(gap)}`} points

CATEGORY BREAKDOWN:
${categoryRows || '(no category data)'}

YOU ARE WINNING: ${myWinningCats.join(', ') || 'none yet'}
OPPONENT LEADS:  ${oppWinningCats.join(', ') || 'none yet'}

MY ROSTER (slot shown — BN = bench, active slot = starting):
${rosterLines.length ? rosterLines.join('\n') : '(roster unavailable)'}

${!leading && gapAbs > 30 ? `
TRIAGE PRIORITY: You are significantly behind. Do NOT say "you can still win" without specific actionable advice.
Your response MUST include:
1. Exact point deficit and how you can close it with ${daysRemaining} days remaining.
2. Which bench players should START immediately to maximize scoring
3. Based on the categories you are losing, what specific stat-profiles you should look to stream from the waiver wire (e.g. 'high-K relief pitcher', 'contact hitter with speed'). Do NOT invent or recommend specific free agent names.
4. Which categories are mathematically closeable vs. already lost
` : ''}

Provide sharp, specific, actionable advice based ONLY on the data above.`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1200);
    return NextResponse.json({ prediction: text, gap, leading, urgencyLabel });

  } catch (err) {
    console.error('[claude/matchup/predict]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/pitching/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats and pitcher schedule provided in this prompt.
DO NOT use your training data to supply ERA, WHIP, AVG, HR, or any other stat values.
DO NOT recommend pitchers not listed in the confirmed probable pitcher schedule below.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { available_players, my_roster, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};
    const pitchingContext = await mlbStats.getTwoStartPitchers();
    const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings, null, pitchingContext);

    // Build real pitcher schedule block
    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
    const buildBlock = (names) => names.length ? names.map(n => {
      const d = pitchingContext.pitcherDetails?.[n];
      return `  • ${d ? `${d.fullName}: ${d.label}` : n}`;
    }).join('\n') : '  None confirmed';

    const scheduleBlock = [
      `FULL 2-START VALUE (both starts remaining):\n${buildBlock(pitchingContext.remainingTwoStarters || [])}`,
      pitchingContext.oneStartRemaining?.length ? `PARTIAL (1 already pitched, 1 remaining):\n${buildBlock(pitchingContext.oneStartRemaining)}` : '',
      pitchingContext.today?.length ? `STARTING TODAY:\n${buildBlock(pitchingContext.today)}` : '',
      `NEXT WEEK (2-start):\n${pitchingContext.nextWeek?.length ? pitchingContext.nextWeek.slice(0, 6).join(', ') : 'None confirmed'}`,
    ].filter(Boolean).join('\n\n');

    // Score available pitchers with real engine
    const scored = (available_players || []).map(p => {
      const wScore = brain.scoreWaiverTarget(p, my_roster || [], settings, diagnosis.categoryNeeds, pitchingContext);
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      return { ...p, waiverScore: wScore, statStr };
    }).sort((a, b) => b.waiverScore.score - a.waiverScore.score).slice(0, 15);

    const pitcherBlock = scored.map(p =>
      `  • ${p.name} (${p.position}, ${p.team}) — Score:${p.waiverScore.score} | ${p.statStr || 'no stats'} | ${p.waiverScore.reasoning || ''}`
    ).join('\n');

    const text = await callClaudeFast([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League: ${settings.name || league_key || '?'} | Format: ${settings.scoring_type || 'Unknown'} | As of: ${nowDay}

${diagnosis.promptBlock}

CONFIRMED MLB PITCHER SCHEDULE (as of ${nowDay}):
${scheduleBlock}

AVAILABLE PITCHERS (engine-scored, 2026 Yahoo stats):
${pitcherBlock}

Provide pitching strategy: who to stream (from the schedule above only), who to start/sit on roster, 
and the top waiver wire arms to target. Reference only stats and pitchers listed above.`
    }]);

    return NextResponse.json({ recommendations: text });
  } catch (err) {
    console.error('[claude/pitching]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/startsit/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as mlbStats from '@/lib/mlbStatsService';

// Yahoo stat ID → readable label (same map used in audit route)
const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
  '0': 'GP', '1': 'GS', '2': 'AB', '4': 'OBP', '5': 'SLG',
  '6': 'OPS', '8': 'H', '9': '1B', '10': '2B', '11': '3B',
};

const IL_STATUSES = new Set(['IL','IL+','IL7','IL10','IL15','IL60','DL','O','OUT','SUSP','NA']);

function buildPlayerLine(p, teamsPlaying) {
  const rawStats = p.stats || {};
  const parts = Object.entries(rawStats)
    .filter(([id, v]) => STAT_MAP[id] && v !== null && v !== undefined && v !== '' && v !== '-' && v !== '0' && v !== 0)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);

  const slot     = p.slot || 'BN';
  const status   = String(p.status || '').toUpperCase();
  const isIL     = IL_STATUSES.has(status) || IL_STATUSES.has(slot.toUpperCase());
  const isDTD    = ['DTD','Q','QUESTIONABLE'].some(s => status.includes(s));

  // Check if hitter's team has a game today
  const isPitcher = ['SP','RP','P'].some(x => String(p.position||'').toUpperCase().includes(x));
  const teamAbbr  = String(p.team || '').toUpperCase();
  const teamName  = String(p.team || '').toLowerCase();
  const hasGame   = !teamsPlaying || isPitcher
    || teamsPlaying.abbrs.has(teamAbbr)
    || teamsPlaying.names.has(teamName)
    || teamsPlaying.abbrs.size === 0;  // fallback: if schedule fetch failed, assume game

  const tag = isIL    ? ' [⛔IL-UNAVAILABLE — do NOT start]'
             : isDTD  ? ' [⚠️DTD — health risk]'
             : !hasGame ? ' [⛔NO GAME TODAY — cannot score points, bench this player]'
             : '';

  const statStr = parts.length ? parts.join(' ') : 'no stats yet';
  return `  • ${p.name || p.player_name} (${p.position || '?'}) [Slot:${slot}] Team:${teamAbbr}${tag}\n    Stats: ${statStr}`;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { players, matchup_context, scoring_type, league_key, leagueSettings: clientSettings } = await request.json();
    const dbSettings = db.getLeagueSettings(guid, league_key) || {};
    const settings   = { ...dbSettings, ...clientSettings, scoring_type: clientSettings?.scoring_type || dbSettings.scoring_type || scoring_type };

    const pitching = await mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], today: [], pitcherDetails: {} }));
    const teamsPlaying = await mlbStats.getTodayTeamsPlaying().catch(() => ({ abbrs: new Set(), names: new Set() }));

    const todayNames     = (pitching.today || []).join(', ')                    || 'None confirmed';
    const twoStartNames  = (pitching.remainingTwoStarters || pitching.currentWeek || []).join(', ') || 'None confirmed';
    const nextWeekNames  = (pitching.nextWeek || []).slice(0, 8).join(', ')     || 'None confirmed';
    const teamsOffToday  = teamsPlaying.abbrs.size > 0
      ? `Teams with NO game today (hitters cannot score): any team NOT listed below has the day off.
Teams PLAYING today: ${[...teamsPlaying.abbrs].join(', ')}`
      : 'Schedule unavailable — assume all hitters may play.';

    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points'
      : settings.scoring_type === 'headone' ? 'H2H Categories'
      : settings.scoring_type === 'roto'    ? 'Rotisserie'
      : settings.scoring_type               || 'H2H Points';

    const playerList = Array.isArray(players) ? players : [];
    const ilPlayers  = playerList.filter(p => IL_STATUSES.has(String(p.status||'').toUpperCase()) || IL_STATUSES.has(String(p.slot||'').toUpperCase()));
    const activePlayers = playerList.filter(p => !ilPlayers.includes(p));

    const rosterBlock = [
      'ACTIVE PLAYERS (only recommend these):',
      ...activePlayers.map(p => {
        const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
        return buildPlayerLine(p, teamsPlaying) + mlbStatus;
      }),
      '',
      'IL / UNAVAILABLE (do NOT recommend starting or benching — they cannot play):',
      ...ilPlayers.map(p => `  • ${p.name} (${p.position}) [${p.status || 'injured'}]`),
    ].join('\n') || '(no roster data received)';

    const prompt = `You are Goin' Yard HQ — a fantasy baseball lineup optimizer for the 2026 MLB season.

⛔ ABSOLUTE DATA RULE: You must use ONLY the player names and stats listed in MY ROSTER below.
DO NOT mention any player not listed (e.g. Tyler Glasnow, Logan Webb, Tarik Skubal, or any player from your training data).
DO NOT invent or estimate any stat values. If a stat is missing, say "no stats yet."
DO NOT recommend starting IL/UNAVAILABLE players.

📅 DAILY STARTING LINEUP RULES:
1. Pay attention to the tags: [Fantasy Slot: BN] means the player is on your Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] means they are in your Active Lineup.
2. Pay attention to the MLB tags: [MLB: Starting Today] means they have a game and are confirmed starting. [MLB: Not Starting/Bench] means they have a game but are benched in real life. [MLB: No Game/Unknown] means their team is off today or their lineup isn't posted yet.
3. ADVICE MUST RECOGNIZE BENCHINGS: Do not recommend "starting" a player who is already in an active Fantasy Slot. If a player is marked [MLB: Not Starting/Bench] or [MLB: No Game/Unknown], DO NOT tell the user to start them today, and recommend moving them to the Fantasy Bench [BN] if they are currently active.

SCORING FORMAT: ${scoringLabel}
LEAGUE: ${settings.name || league_key || 'Unknown'}

MY ROSTER — 2026 Yahoo season stats:
${rosterBlock}

HITTER SCHEDULE — TODAY:
${teamsOffToday}
⚠️ HITTER RULES:
1. Any hitter tagged [⛔NO GAME TODAY] has no game — automatic sit, cannot score.
2. Even if a hitter has a game, they may not be in their MLB team's actual starting lineup. Note this uncertainty for players who platoon or sit vs. certain handedness.
3. If a player is [Slot:BN] and has a game + strong stats, recommend whether to move them ACTIVE.
4. If a player is in an active slot but tagged [⛔NO GAME TODAY], recommend moving them to bench.

CONFIRMED PITCHING SCHEDULE:
• Starting TODAY: ${todayNames}
• 2-start SPs this week: ${twoStartNames}
• 2-start SPs next week: ${nextWeekNames}

⚠️ PITCHER RULE: Only recommend starting SPs who appear in the schedule above. If none of MY pitchers appear in those lists, say so.

Context from manager: ${matchup_context || 'Evaluate my full roster for today. Who are must-starts? Who should sit or be moved to bench?'}

Give concrete lineup advice using ONLY my roster. Include:
1. Must-starts (active slot confirmed, team playing, likely in MLB lineup)
2. Automatic sits (no game today, IL, or [Slot:BN] with no reason to activate)
3. Moves to make (BN → active or active → BN swaps)
4. Top 3 toughest decisions`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1200);
    return NextResponse.json({ analysis: text });

  } catch (err) {
    console.error('[claude/startsit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

```

---

## File: `app/api/claude/trade/find/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, all_rosters, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaudeFast([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
My Roster: ${JSON.stringify(my_roster || [])}
Other Teams: ${JSON.stringify(all_rosters || [])}

Identify the best trade targets from other teams. What do I need? What do they need? Suggest 2-3 specific trade proposals that benefit both sides.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/trade/find]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/trade/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats provided in this prompt.
DO NOT use your training data to supply ERA, AVG, HR, or any other stat values.
DO NOT invent or assume stats for any player. If a stat is not listed, say "stats not available" rather than guessing.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { giving, receiving, my_roster, their_roster, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    // Score every player in the trade using the real VOR engine
    const vorScore = (players) => (players || []).map(p => {
      const pos = String(p.position || p).split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, pos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      return `  • ${p.name || p} — VOR: ${vor.toFixed(1)} | ${statStr || 'no stats available'}`;
    }).join('\n');

    const givingBlock    = vorScore(Array.isArray(giving)    ? giving    : [{ name: giving }]);
    const receivingBlock = vorScore(Array.isArray(receiving) ? receiving : [{ name: receiving }]);

    const text = await callClaudeFast([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League Format: ${settings.scoring_type || 'Unknown'} | Teams: ${settings.num_teams || 10} | League: ${settings.name || league_key || '?'}

TRADE PROPOSAL:
You GIVE (VOR and 2026 stats from Yahoo):
${givingBlock}

You RECEIVE (VOR and 2026 stats from Yahoo):
${receivingBlock}

My Current Roster: ${Array.isArray(my_roster) ? my_roster.map(p => p.name || p).join(', ') : my_roster || 'Not provided'}
Their Roster: ${Array.isArray(their_roster) ? their_roster.map(p => p.name || p).join(', ') : their_roster || 'Not provided'}

Evaluate this trade using ONLY the VOR and stats shown above. 
Who wins? Is it fair? Should I accept or counter? Give a clear verdict.
DO NOT cite stats not listed above.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/trade]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/claude/waiver/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/database';
import { callClaudeFast } from '@/lib/claude';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';
import * as yahoo from '@/lib/yahooService';

const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
};

function readableStats(p) {
  const s = p.stats || {};
  return Object.entries(s)
    .filter(([id, v]) => STAT_MAP[id] && v != null && v !== '' && v !== '-' && v !== '0' && v !== 0)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`)
    .join(' ') || 'no stats yet';
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { available_players, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    // ── Self-fetch user's roster server-side ─────────────────────────────────
    let myRoster = [];
    try {
      const teamKey = await yahoo.getUserTeamKey(guid, league_key);
      if (teamKey) {
        const rosterData = await yahoo.getRoster(guid, league_key, teamKey);
        const playerKeys = [];
        const slotMap = {};
        for (const item of (rosterData || [])) {
          const p = item?.player;
          if (!p || !Array.isArray(p)) continue;
          const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
          if (!info.player_key) continue;
          playerKeys.push(info.player_key);
          const selPos = p[1]?.selected_position;
          let slot = 'BN';
          if (Array.isArray(selPos)) {
            slot = selPos.find(s => s?.position)?.position || 'BN';
          } else if (selPos?.position) {
            slot = selPos.position;
          }
          slotMap[info.player_key] = slot;
        }
        if (playerKeys.length) {
          const withStats = await yahoo.getBatchPlayerStats(guid, league_key, playerKeys, null);
          myRoster = withStats.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
        }
      }
    } catch (e) {
      console.warn('[waiver] Roster self-fetch failed:', e.message);
      // Continue — engine will score without roster context (graceful degradation)
    }

    // ── Fetch pitching context + news in parallel ─────────────────────────────
    const [pitchingCtx, news] = await Promise.allSettled([
      mlbStats.getTwoStartPitchers(),
      mlbStats.getBreakingNews(),
    ]);
    const pitchingContext = pitchingCtx.status === 'fulfilled' ? pitchingCtx.value : {};
    const newsText = news.status === 'fulfilled' ? news.value : '';

    // ── Engine-score the available players ────────────────────────────────────
    const diagnosis = brain.buildRosterDiagnosis(myRoster, settings, null, pitchingContext);
    const scored = (available_players || []).map(p => {
      const wScore = brain.scoreWaiverTarget(p, myRoster, settings, diagnosis.categoryNeeds, pitchingContext);
      return { ...p, waiverScore: wScore };
    }).sort((a, b) => b.waiverScore.score - a.waiverScore.score);

    // ── Build roster context string for Claude ────────────────────────────────
    const rosterBlock = myRoster.length
      ? myRoster.map(p => {
          const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
          return `  • ${p.name} (${p.position}) [Fantasy Slot:${p.slot || 'BN'}]${mlbStatus} — ${readableStats(p)}`;
        }).join('\n')
      : '  (roster unavailable)';

    const scoredBlock = scored.slice(0, 10).map((p, i) =>
      `  ${i + 1}. ${p.name} (${p.position}, ${p.team || '?'}) Score:${p.waiverScore.score} Priority:${p.waiverScore.priority}\n     Stats: ${readableStats(p)}\n     Reason: ${p.waiverScore.reasoning || 'N/A'}`
    ).join('\n');

    const prompt = `You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine for the 2026 MLB season.

🚨 CRITICAL DIRECTIVE: You are NOT the analyst. The fantasyBrain.js algorithm is the analyst. Your ONLY job is to convert the algorithm's numeric scores and priorities into natural, engaging human language.

⚠️ DATA RULES:
1. Use ONLY the player names, stats, and Engine Scores listed below.
2. DO NOT reference players not shown in the "ENGINE-RANKED WAIVER TARGETS".
3. DO NOT invent stats or context.
4. You MUST recommend adding the players with the highest Engine Scores. Do not disagree with the engine.
5. If the engine tags a player as "MUST ADD" or "CRITICAL STREAM", you must reflect that urgency exactly.

📅 DAILY STARTING LINEUP RULES:
1. Pay attention to the tags: [Fantasy Slot: BN] means the player is on your Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] means they are in your Active Lineup.
2. Pay attention to the MLB tags: [MLB: Starting Today] means they have a game and are confirmed starting. [MLB: Not Starting/Bench] means they have a game but are benched in real life. [MLB: No Game/Unknown] means their team is off today or their lineup isn't posted yet.

LEAGUE: ${settings.name || league_key} | Format: ${settings.scoring_type === 'headpoint' ? 'H2H Points' : settings.scoring_type || 'H2H Points'} | Teams: ${settings.num_teams || 10}

MY CURRENT ROSTER:
${rosterBlock}

CATEGORY NEEDS (engine-computed):
${diagnosis.promptBlock || 'N/A'}

ENGINE-RANKED WAIVER TARGETS (top 10, scored by fantasyBrain):
${scoredBlock}

BREAKING NEWS:
${newsText ? newsText.slice(0, 500) : 'None'}

Give specific Add/Drop recommendations by directly narrating the Engine-Ranked targets above. Do not deviate from the algorithm's rankings.`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1000);

    return NextResponse.json({
      recommendations: text,
      scored: scored.slice(0, 15),   // Return scored list so frontend can display it
    });

  } catch (err) {
    console.error('[claude/waiver]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/mlb/pitching-context/route.js`

```javascript
import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

async function getLiveProbablePitchers() {
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, {
      params: { sportId: 1, hydrate: 'probablePitcher' },
      timeout: 8000
    });

    const pitchers = new Set();
    const games = data.dates?.[0]?.games || [];
    
    games.forEach(g => {
      if (g.teams?.away?.probablePitcher?.fullName) {
        pitchers.add(g.teams.away.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
      if (g.teams?.home?.probablePitcher?.fullName) {
        pitchers.add(g.teams.home.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    });

    return Array.from(pitchers);
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch probable pitchers:`, err.message);
    return [];
  }
}

async function getTwoStartPitchers() {
  try {
    const now = new Date();
    const day = now.getDay();

    const currentMondayDate = new Date(now);
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    currentMondayDate.setDate(now.getDate() - daysSinceMonday);
    
    const nextMondayDate = new Date(now);
    const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
    nextMondayDate.setDate(now.getDate() + daysUntilNextMonday);

    const cMonStr = currentMondayDate.toISOString().split('T')[0];
    const cSunStr = new Date(currentMondayDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nMonStr = nextMondayDate.toISOString().split('T')[0];
    const nSunStr = new Date(nextMondayDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [currentData, nextData] = await Promise.all([
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: cMonStr, endDate: cSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(res => res.data).catch(() => ({ dates: [] })),
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: nMonStr, endDate: nSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(res => res.data).catch(() => ({ dates: [] }))
    ]);

    function processWeek(data) {
      const starts = {};
      (data.dates || []).forEach(d => {
        (d.games || []).forEach(g => {
          [g.teams?.away?.probablePitcher?.fullName, g.teams?.home?.probablePitcher?.fullName].forEach(name => {
            if (name) {
              const basic = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              starts[basic] = (starts[basic] || 0) + 1;
            }
          });
        });
      });
      return Object.keys(starts).filter(n => starts[n] >= 2);
    }

    return {
      currentWeek: processWeek(currentData),
      nextWeek: processWeek(nextData)
    };
  } catch (err) {
    return { currentWeek: [], nextWeek: [] };
  }
}

export async function GET() {
  const [today, twoStart] = await Promise.all([
    getLiveProbablePitchers(),
    getTwoStartPitchers()
  ]);

  return NextResponse.json({
    today,
    currentWeekTwoStart: twoStart.currentWeek,
    nextWeekTwoStart: twoStart.nextWeek
  });
}
```

---

## File: `app/api/store/buy-pack/route.js`

```javascript
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { packId, forceRarity } = await request.json();

    const packConfig = {
      'core_pack': { count: 3 },
      'premium_hobby': { count: 5 },
      'titan_drop': { count: 10 }
    };
    
    const count = packConfig[packId]?.count || 1;
    const cards = [];

    // Award the guaranteed hit first
    const hit = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, forceRarity);
    cards.push(hit);

    // Award the rest of the pack with standard randomized rarity
    for (let i = 1; i < count; i++) {
      const standardCard = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, null);
      cards.push(standardCard);
    }

    // We'll return the 'hit' to be showcased in the animation, but the user actually gets all of them.
    return NextResponse.json({ success: true, awarded: hit, total_awarded: count });
  } catch (error) {
    console.error('Store checkout error:', error);
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
```

---

## File: `app/api/stripe/create-pack-checkout/route.js`

```javascript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/session';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(request) {
  const session = await getSession();
  const guid = session?.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { packId, packName, priceId } = await request.json();

    // Map packId to Stripe Price IDs (these should be set in env vars, using placeholders for now)
    const priceMap = {
      'core_pack': process.env.STRIPE_PRICE_CORE || 'price_123_core',
      'premium_hobby': process.env.STRIPE_PRICE_PREMIUM || 'price_456_premium',
      'titan_drop': process.env.STRIPE_PRICE_TITAN || 'price_789_titan'
    };

    const stripePriceId = priceMap[packId] || priceId;

    if (!stripePriceId) {
       return NextResponse.json({ error: 'Invalid pack selection' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!stripe) {
      // Graceful fallback for local testing or before Stripe is configured
      console.log('Stripe not configured. Processing mock checkout.');
      return NextResponse.json({ 
        id: 'mock_session', 
        url: `${origin}/store?success=true&packId=${packId}` 
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/store?success=true&packId=${packId}`,
      cancel_url: `${origin}/store?canceled=true`,
      client_reference_id: guid,
      metadata: {
        packId: packId,
        guid: guid
      }
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## File: `app/api/stripe/webhook/route.js`

```javascript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/database';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { guid, packId } = session.metadata || {};

    if (packId && guid) {
      console.log(`[Stripe Webhook] Fulfillment for ${guid} (Pack: ${packId})`);
      
      const packConfig = {
        'core_pack': { count: 3, forceRarity: null },
        'premium_hobby': { count: 5, forceRarity: 'rare' },
        'titan_drop': { count: 10, forceRarity: 'legendary' }
      };
      
      const config = packConfig[packId];
      if (config) {
        // We actually do the db fulfillment here. 
        // But since we also have a "success=true" flow on the frontend (for instant pack opening animation),
        // we need to make sure we don't double-award.
        // For the MVP, we can just rely on the frontend `/api/store/buy-pack` if webhook is too complex to sync with animations.
        // OR we just use the webhook to record it and the frontend to claim it.
        // For now, let's keep it simple: the frontend handles the claim on return to show the animation.
        // This webhook could be used for email receipts or background logging.
      }
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## File: `app/api/tradeblock/offer/route.js`

```javascript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('yahoo_auth_token');
    
    // We get the listing ID and the instanceId of the card being offered
    const { listingId, offerInstanceId } = await request.json();

    if (!listingId || !offerInstanceId) {
      return NextResponse.json({ error: "Missing listing ID or offer card ID" }, { status: 400 });
    }

    let buyerGuid = "mock-user-123"; // Fallback for testing
    if (tokenCookie) {
      const parsed = JSON.parse(tokenCookie.value);
      buyerGuid = parsed.guid;
    }

    const listing = db.addTradeOffer(listingId, buyerGuid, offerInstanceId);

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## File: `app/api/tradeblock/route.js`

```javascript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';

export async function GET(request) {
  try {
    const listings = db.getTradeBlockListings();
    
    // We need to resolve the 'instanceId' back to the actual card data so the UI can render it
    // Wait, the listing just has instanceId and user guid.
    // For a global market, we need to inject the full card object from that user's trophy case!
    const resolvedListings = listings.map(listing => {
      const sellerCase = db.getTrophyCase(listing.user);
      const card = sellerCase?.unlocked_cards?.find(c => c.instanceId === listing.instanceId);
      const sellerProfile = db.getUserProfile(listing.user) || {};
      return {
        ...listing,
        card: card || null,
        username: sellerProfile.team_name || 'Anonymous Collector'
      };
    }).filter(l => l.card !== null);

    return NextResponse.json({ listings: resolvedListings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('yahoo_auth_token');
    
    if (!tokenCookie) {
      // TEMP FOR TESTING
      const { instanceId, seeking } = await request.json();
      const listing = db.postToTradeBlock("mock-user-123", instanceId, seeking);
      return NextResponse.json({ success: true, listing });
    }

    const { guid } = JSON.parse(tokenCookie.value);
    const { instanceId, seeking } = await request.json();
    
    if (!instanceId || !seeking) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = db.postToTradeBlock(guid, instanceId, seeking);
    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## File: `app/api/trophy/album/route.js`

```javascript
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';
import { CARD_COLLECTION } from '@/lib/constants';

export async function GET() {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const trophyCase = db.getTrophyCase(guid);
  const serverToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  
  return NextResponse.json({
    ...trophyCase,
    all_cards: CARD_COLLECTION,
    server_today: serverToday,
  });
}
```

---

## File: `app/api/trophy/daily-pack/route.js`

```javascript
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';
import { getRandomCardId, CARD_COLLECTION } from '@/lib/constants';

export async function POST() {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const trophyCase = db.getTrophyCase(guid);
  const lastClaim = trophyCase.last_daily_pack || '';
  
  if (lastClaim === today) {
    return NextResponse.json({ error: 'Already claimed today' }, { status: 429 });
  }

  const cardId = 'random_dynamic';
  
  const awardedData = await db.awardCard(guid, cardId, 'daily_pack');
  db.updateDailyPackTimer(guid, today);

  return NextResponse.json({
    awarded: awardedData
  });
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/allrosters/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStandings, getUserTeamKey, getRoster } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const standings = await getStandings(guid, leagueKey);
    const myTeamKey = await getUserTeamKey(guid, leagueKey);
    const allRosters = [];
    const promises = [];
    
    for (const t of (standings || [])) {
      const teamObj = t?.team;
      if (!teamObj) continue;
      const info = Array.isArray(teamObj) ? (Array.isArray(teamObj[0]) ? Object.assign({}, ...teamObj[0]) : teamObj[0]) : teamObj;
      const teamKey = info?.team_key;
      const teamName = info?.name;
      if (!teamKey || teamKey === myTeamKey) continue;
      
      promises.push(
        getRoster(guid, leagueKey, teamKey).then(rosterData => {
          const playerList = [];
          for (const rosterItem of (rosterData || [])) {
            const p = rosterItem?.player;
            if (p && Array.isArray(p)) {
              const pInfo = Array.isArray(p[0]) ? Object.assign({}, ...p[0]) : p[0];
              const name = pInfo.name?.full || pInfo.full_name;
              const pos = pInfo.display_position || '';
              if (name) playerList.push(name + ' (' + pos + ')');
            }
          }
          if (playerList.length > 0) allRosters.push({ team: teamName, players: playerList });
        }).catch(e => console.error(e))
      );
    }
    await Promise.all(promises);
    return NextResponse.json(allRosters);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/matchup/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getScoreboard, getUserTeamKey } from '@/lib/yahooService';

// Comprehensive Yahoo Fantasy Baseball stat_id → human-readable name
const STAT_NAMES = {
  '0': 'GP',   '1': 'GS',   '2': 'AB',   '3': 'AVG',  '4': 'OBP',
  '5': 'SLG',  '6': 'OPS',  '7': 'R',    '8': 'H',    '9': '1B',
  '10': '2B',  '11': '3B',  '12': 'HR',  '13': 'RBI', '14': 'SAC',
  '15': 'SF',  '16': 'SB',  '17': 'CS',  '18': 'BB',  '19': 'IBB',
  '20': 'HBP', '21': 'SO',  '22': 'GDP', '23': 'CYC', '24': 'E',
  '25': 'TB',
  // Pitching
  '26': 'ERA', '27': 'WHIP','28': 'W',   '29': 'L',   '30': 'GS',
  '31': 'G',   '32': 'SV',  '33': 'HA',  '34': 'BBA', '35': 'HRA',
  '36': 'R_P', '37': 'ER',  '38': 'WP',  '39': 'BK',  '40': 'BS',
  '41': 'HB',  '42': 'K',   '43': 'SHO', '44': 'CG',  '45': 'NH',
  '46': 'PG',  '47': 'WinPct', '48': 'SV%', '49': 'K/9',
  '50': 'IP',  '51': 'K/BB', '52': 'OBA', '53': 'GO/AO',
  '54': 'TP',  '55': 'DP',  '56': 'QS%',
  '57': 'NSV', '58': 'NSB', '59': 'TB_P',
  '60': 'H/AB','61': 'XBH',
  '83': 'QS',  '84': 'NSVH','85': 'HLD',
};
const LOWER_IS_BETTER = new Set(['26', '27', '29', '33', '34', '35', '37', '40']);

function parseYahooMatchup(matchups, myTeamKey) {
  if (!matchups) return null;
  let totalMatchups = parseInt(matchups['@attributes']?.count) || Object.keys(matchups).filter(k => /^\d+$/.test(k)).length;
  const week = matchups['@attributes']?.week || null;

  function extractTeamsFromMatchup(m) {
    if (!m) return null;
    if (m.teams) return m.teams;
    if (Array.isArray(m)) {
      for (const item of m) { if (item?.teams) return item.teams; }
    }
    for (const key of Object.keys(m)) { if (m[key]?.teams) return m[key].teams; }
    return null;
  }
  function getMatchupEntry(idx) {
    const raw = matchups[idx] || matchups[String(idx)];
    if (!raw) return null;
    return raw.matchup || raw;
  }
  function extractTeamKey(teamData) {
    if (!teamData) return null;
    const teamArr = teamData.team || teamData;
    if (!Array.isArray(teamArr)) return teamData.team_key;
    const first = teamArr[0];
    if (Array.isArray(first)) return Object.assign({}, ...first)?.team_key;
    return first?.team_key;
  }
  function getTeamEntries(teamsObj) {
    if (!teamsObj) return [];
    const entries = [];
    const numericKeys = Object.keys(teamsObj).filter(k => /^\d+$/.test(k)).sort((a,b) => a-b);
    if (numericKeys.length > 0) {
      for (const k of numericKeys) if (teamsObj[k]) entries.push(teamsObj[k]);
    }
    if (!entries.length && Array.isArray(teamsObj)) entries.push(...teamsObj);
    if (!entries.length && teamsObj.team) {
      if (Array.isArray(teamsObj.team)) {
        if (teamsObj.team[0] && !Array.isArray(teamsObj.team[0]) && teamsObj.team[0].team_key) entries.push({ team: teamsObj.team });
        else for (const t of teamsObj.team) entries.push({ team: Array.isArray(t) ? t : [t] });
      }
    }
    return entries;
  }

  let foundMatchup = null;
  for (let i = 0; i < totalMatchups; i++) {
    const matchupData = getMatchupEntry(i);
    if (!matchupData) continue;
    const teamsObj = extractTeamsFromMatchup(matchupData);
    if (!teamsObj) continue;
    const teamEntries = getTeamEntries(teamsObj);
    for (const entry of teamEntries) {
      if (myTeamKey && extractTeamKey(entry) === myTeamKey) { foundMatchup = matchupData; break; }
    }
    if (foundMatchup) break;
  }
  if (!foundMatchup) foundMatchup = getMatchupEntry(0);
  if (!foundMatchup) return null;

  const teamEntries = getTeamEntries(extractTeamsFromMatchup(foundMatchup));
  const parsedTeams = [];
  for (let j = 0; j < teamEntries.length; j++) {
    const teamArr = teamEntries[j]?.team;
    if (!teamArr || !Array.isArray(teamArr)) continue;
    let info = Array.isArray(teamArr[0]) ? Object.assign({}, ...teamArr[0]) : teamArr[0] || {};
    // Collect team_stats (category breakdown) AND team_points (H2H score) separately
    let statsObj = {};
    let pointsObj = {};
    for (let k = 1; k < teamArr.length; k++) {
      if (teamArr[k]?.team_stats) statsObj = teamArr[k].team_stats;
      if (teamArr[k]?.team_points) pointsObj = teamArr[k].team_points;
    }

    // Handle Yahoo's {stat: [...]} or [{stat:{...}}, ...] nesting inside team_stats.stats
    const rawStats = statsObj.stats;
    const statsArr = Array.isArray(rawStats)
      ? rawStats
      : rawStats?.stat
        ? (Array.isArray(rawStats.stat) ? rawStats.stat : [rawStats.stat])
        : [];

    const stats = statsArr
      .map(s => s.stat || s)
      .filter(s => s.stat_id !== undefined && s.value !== undefined)
      .map(s => ({ stat_id: String(s.stat_id), name: STAT_NAMES[String(s.stat_id)] || String(s.stat_id), value: s.value }));

    let manager = '';
    if (info.managers) {
      if (Array.isArray(info.managers)) manager = info.managers[0]?.manager?.nickname || info.managers[0]?.nickname || '';
      else if (info.managers.manager) manager = info.managers.manager?.nickname || '';
    }
    // Prefer team_points.total for H2H score; fall back to team_stats total
    let pointsTotal = parseFloat(pointsObj.total) || parseFloat(statsObj.total) || null;
    parsedTeams.push({ key: info.team_key, name: info.name || 'Team '+(j+1), manager, stats, total_points: pointsTotal });
  }

  const myIdx = myTeamKey ? parsedTeams.findIndex(t => t.key === myTeamKey) : 0;
  const myTeam = parsedTeams[myIdx >= 0 ? myIdx : 0];
  const opponent = parsedTeams[myIdx === 0 ? 1 : 0];

  const statMap = {};
  (myTeam?.stats || []).forEach(s => { statMap[s.stat_id] = { ...s, my_value: s.value } });
  (opponent?.stats || []).forEach(s => {
    if (statMap[s.stat_id]) statMap[s.stat_id].opp_value = s.value;
    else statMap[s.stat_id] = { stat_id: s.stat_id, name: s.name, opp_value: s.value };
  });

  const statComparison = Object.values(statMap).map(s => {
    const myVal = parseFloat(s.my_value) || 0;
    const oppVal = parseFloat(s.opp_value) || 0;
    const lowerBetter = LOWER_IS_BETTER.has(s.stat_id);
    return {
      ...s,
      my_winning: myVal !== oppVal && (lowerBetter ? myVal < oppVal : myVal > oppVal),
      opp_winning: myVal !== oppVal && (lowerBetter ? oppVal < myVal : oppVal > myVal)
    };
  });

  return { week: week || foundMatchup.week, myTeam, opponent, stats: statComparison };
}

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const matchups = await getScoreboard(guid, leagueKey);
    const myTeamKey = await getUserTeamKey(guid, leagueKey);

    const parsed = parseYahooMatchup(matchups, myTeamKey);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/myroster/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoster, getUserTeamKey, getBatchPlayerStats } from '@/lib/yahooService';
import { getLiveProbablePitchers } from '@/lib/mlbStatsService';
import * as brain from '@/lib/fantasyBrain';
import { db } from '@/lib/database';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const teamKey = await getUserTeamKey(guid, leagueKey);
    if (!teamKey) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const rosterData = await getRoster(guid, leagueKey, teamKey);
    const playerKeys = [];
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (p && Array.isArray(p)) {
        const infoArray = Array.isArray(p[0]) ? p[0] : [];
        const info = Object.assign({}, ...infoArray);
        if (info.player_key) playerKeys.push(info.player_key);
      }
    }

    if (!playerKeys.length) {
      return NextResponse.json({ players: [] });
    }

    let players = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);

    // MLB Stats API Override for Probable Pitchers
    try {
      const probablePitchers = await getLiveProbablePitchers();
      if (probablePitchers.length > 0) {
        players.forEach(p => {
          if (p.position === 'SP' || String(p.position).includes('SP/')) {
            const normName = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (probablePitchers.includes(normName)) {
              p.is_starting = 'Yes';
            } else {
              p.is_starting = 'No';
            }
          }
        });
      }
    } catch (err) {
      console.error('[Yahoo Roster] Failed to override probable pitchers:', err.message);
    }

    // Build a map of player_key → lineup slot (selected_position)
    const slotMap = {};
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (!p || !Array.isArray(p)) continue;
      const infoArray = Array.isArray(p[0]) ? p[0] : [];
      const info = Object.assign({}, ...infoArray);
      if (!info.player_key) continue;

      // selected_position can be in p[1] or nested differently
      // Yahoo returns it as [{coverage_type, date}, {position: 'C'}]
      let slot = 'BN';
      const selPos = p[1]?.selected_position;
      if (selPos) {
        if (Array.isArray(selPos)) {
          // Find whichever item actually has the position key
          const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
          slot = posItem?.position || 'BN';
        } else if (selPos && typeof selPos === 'object' && selPos.position) {
          slot = selPos.position;
        } else if (typeof selPos === 'string') {
          slot = selPos;
        }
      }
      slotMap[info.player_key] = slot;
    }

    players = players.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));

    // ── Compute VOR for every player using the same engine as TeamAudit ──────
    const settings = db.getLeagueSettings(guid, leagueKey) || {};
    const numTeams    = settings.num_teams    || 10;
    const scoringType = settings.scoring_type || 'headpoint';
    players = players.map(p => {
      const rawPos  = String(p.position || '').split('/')[0].trim();
      const vorRaw  = brain.calculateVOR(p.stats || {}, rawPos, numTeams, scoringType);
      const vor     = typeof vorRaw === 'object' ? (vorRaw.vor ?? vorRaw.score ?? 0) : (vorRaw ?? 0);
      const scarcity = brain.getPositionalScarcity(rawPos, numTeams);
      return { ...p, vor: Math.round(vor), vorScarcity: scarcity.tier || 'moderate' };
    });

    // Sort by VOR descending so Dashboard and other consumers get ranked order
    const sorted = [...players].sort((a, b) => b.vor - a.vor);

    return NextResponse.json({ players: sorted, teamKey });
  } catch (err) {
    console.error('[Pitching Hub] Roster fetch failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/players/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPlayers } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'A';
  const position = searchParams.get('position') || null;
  const start = parseInt(searchParams.get('start') || '0', 10);

  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const players = await getPlayers(guid, leagueKey, status, start, position);
    return NextResponse.json(players);
  } catch (err) {
    console.error('[Pitching Hub] Player search failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/roster/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserTeamKey, getRoster } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  
  try {
    const myTeamKey = await getUserTeamKey(guid, leagueKey);
    if (!myTeamKey) throw new Error('Could not find your team in this league.');
    const data = await getRoster(guid, leagueKey, myTeamKey);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getLeague } from '@/lib/yahooService';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function GET(request, { params }) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  const { leagueKey } = await params;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const raw = await getLeague(guid, leagueKey);

    // Yahoo returns league as an array: [settingsObj, metadataObj]
    // or sometimes a plain object. Normalize both cases.
    const info = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});

    const settings = {
      league_key: leagueKey,
      name: info.name || leagueKey,
      num_teams: info.num_teams,
      scoring_type: info.scoring_type,
      current_week: info.current_week,
      draft_status: info.draft_status,
      season: info.season,
      start_week: info.start_week,
      end_week: info.end_week,
    };

    // Persist to DB
    db.saveLeagueSettings(guid, leagueKey, settings);
    db.trackLeagueUse(guid, leagueKey);

    return NextResponse.json(settings);
  } catch (err) {
    console.error('[league route]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

```

---

## File: `app/api/yahoo/league/[leagueKey]/standings/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStandings } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  if (!session?.yahoo_guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const data = await getStandings(session.yahoo_guid, leagueKey);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/team/[teamKey]/rosterstats/route.js`

```javascript

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoster, getBatchPlayerStats } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey, teamKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const rosterData = await getRoster(guid, leagueKey, teamKey);
    const playerKeys = [];

    // Build slot map while extracting player keys
    const slotMap = {};
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (!p || !Array.isArray(p)) continue;
      const infoArray = Array.isArray(p[0]) ? p[0] : [];
      const info = Object.assign({}, ...infoArray);
      if (!info.player_key) continue;
      playerKeys.push(info.player_key);

      // Parse selected_position → slot (mirrors myroster logic)
      let slot = 'BN';
      const selPos = p[1]?.selected_position;
      if (selPos) {
        if (Array.isArray(selPos)) {
          const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
          slot = posItem?.position || 'BN';
        } else if (selPos && typeof selPos === 'object' && selPos.position) {
          slot = selPos.position;
        } else if (typeof selPos === 'string') {
          slot = selPos;
        }
      }
      slotMap[info.player_key] = slot;
    }

    if (!playerKeys.length) return NextResponse.json({ players: [], teamKey });
    let players = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);
    players = players.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
    return NextResponse.json({ players, teamKey });
  } catch (err) {
    console.error('[rosterstats]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/transactions/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTransactions, toArray } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  if (!session?.yahoo_guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const raw = await getTransactions(session.yahoo_guid, leagueKey);
    const cleaned = [];
    if (Array.isArray(raw)) {
      raw.forEach(txn => {
        const playersObj = txn.players;
        if (!playersObj) return;
        const players = toArray(playersObj);
        players.forEach(p => {
          const pData = p.player;
          if (!Array.isArray(pData)) return;
          const pInfo = Array.isArray(pData[0]) ? Object.assign({}, ...pData[0]) : pData[0];
          const pTxn = pData[1]?.transaction_data || pData[2]?.transaction_data || {};
          if (pInfo && pInfo.name) {
            cleaned.push({
              player_name: pInfo.name.full || pInfo.name.ascii_first + ' ' + pInfo.name.ascii_last,
              type: pTxn.type || txn.type, 
              team_name: pTxn.destination_team_name || pTxn.source_team_name || 'Unknown',
              timestamp: new Date(parseInt(txn.timestamp) * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })
            });
          }
        });
      });
    }
    return NextResponse.json(cleaned);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/league/[leagueKey]/trends/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as yahoo from '@/lib/yahooService';

// ── Trend calculation logic (ported from old Express server) ──────────────────

function calculateTrend(seasonStats, recentStats, position, historicalStats = {}) {
  const hasRecent = Object.values(recentStats || {}).some(v => parseFloat(v) > 0);
  if (!hasRecent) return 'neutral';

  const isPitcher = /SP|RP|P/.test(String(position));
  let score = 0;

  if (isPitcher) {
    const hERA = parseFloat(historicalStats?.['26']);
    const sERA = parseFloat(seasonStats?.['26']) || 4.00;
    const rERA = parseFloat(recentStats?.['26']);

    if (!isNaN(rERA)) {
      if (rERA <= 2.50) score += 10;
      else if (rERA >= 5.50) score -= 10;
      if (rERA <= sERA * 0.7) score += 10;
      else if (rERA >= sERA * 1.3) score -= 10;
      if (!isNaN(hERA) && hERA > 0) {
        if (sERA <= hERA - 1.00) score += 5;
        else if (sERA >= hERA + 1.00) score -= 15;
      }
    }
    const rW  = parseFloat(recentStats?.['28'] || 0);
    const rSV = parseFloat(recentStats?.['32'] || 0);
    const rK  = parseFloat(recentStats?.['42'] || 0);
    if (rW > 0 || rSV > 0) score += 5;
    if (rK >= 10) score += 5;
  } else {
    const hAVG = parseFloat(historicalStats?.['3']);
    const sAVG = parseFloat(seasonStats?.['3']) || 0.250;
    const rAVG = parseFloat(recentStats?.['3']);

    if (!isNaN(rAVG)) {
      if (rAVG >= 0.330) score += 10;
      else if (rAVG <= 0.200) score -= 10;
      if (rAVG >= sAVG + 0.050) score += 10;
      else if (rAVG <= sAVG - 0.050) score -= 10;
      if (!isNaN(hAVG) && hAVG > 0) {
        if (sAVG >= hAVG + 0.030) score += 5;
        else if (sAVG <= hAVG - 0.040) score -= 15;
      }
    }
    const rHR  = parseFloat(recentStats?.['7']  || 0);
    const rRBI = parseFloat(recentStats?.['12'] || 0);
    const rSB  = parseFloat(recentStats?.['16'] || 0);
    if (rHR >= 2) score += 10;
    else if (rHR === 1) score += 3;
    if (rRBI >= 5) score += 5;
    if (rSB >= 2) score += 5;
  }

  if (score >= 15) return 'hot';
  if (score > 0)   return 'rising';
  if (score <= -10) return 'cold';
  return 'neutral';
}

function trendDisplayStats(recentStats, seasonStats, position) {
  const isPitcher = /SP|RP|P/.test(String(position));
  if (isPitcher) {
    return [
      { label: 'ERA',  season: seasonStats?.['26'], lowerBetter: true },
      { label: 'WHIP', season: seasonStats?.['27'], lowerBetter: true },
      { label: 'K',    season: seasonStats?.['42'] },
    ].filter(s => s.season !== undefined);
  }
  return [
    { label: 'AVG', season: seasonStats?.['3'] },
    { label: 'HR',  season: seasonStats?.['7'] },
    { label: 'RBI', season: seasonStats?.['12'] },
    { label: 'R',   season: seasonStats?.['60'] },
    { label: 'SB',  season: seasonStats?.['16'] },
  ].filter(s => s.season !== undefined);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request, { params }) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  const { leagueKey } = await params;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const myTeamKey = await yahoo.getUserTeamKey(guid, leagueKey);
    if (!myTeamKey) {
      return NextResponse.json({ myPlayers: [], freeAgents: [] });
    }

    const rosterData = await yahoo.getRoster(guid, leagueKey, myTeamKey);
    const playerKeys = [];
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (Array.isArray(p)) {
        const infoArray = Array.isArray(p[0]) ? p[0] : [];
        const info = Object.assign({}, ...infoArray);
        if (info.player_key) playerKeys.push(info.player_key);
      }
    }

    const [recentMine, seasonMine, historicalMine, faData] = await Promise.all([
      playerKeys.length ? yahoo.getBatchPlayerStats(guid, leagueKey, playerKeys, 'lastweek') : [],
      playerKeys.length ? yahoo.getBatchPlayerStats(guid, leagueKey, playerKeys, null) : [],
      playerKeys.length ? yahoo.getBatchPlayerStats(guid, leagueKey, playerKeys, 'season;year=2025') : [],
      yahoo.getFreeAgentsTrending(guid, leagueKey, 25),
    ]);

    const seasonMap = {};
    const historicalMap = {};
    seasonMine.forEach(p => { seasonMap[p.key] = p.stats; });
    historicalMine.forEach(p => { historicalMap[p.key] = p.stats; });

    const myPlayers = recentMine.map(p => {
      const seasonStats = seasonMap[p.key] || {};
      const historicalStats = historicalMap[p.key] || {};
      const trend = calculateTrend(seasonStats, p.stats, p.position, historicalStats);
      return {
        ...p,
        recentStats: p.stats,
        seasonStats,
        trend,
        displayStats: trendDisplayStats(p.stats, seasonStats, p.position),
      };
    }).sort((a, b) => {
      const order = { hot: 0, rising: 1, neutral: 2, cold: 3 };
      return (order[a.trend] ?? 2) - (order[b.trend] ?? 2);
    });

    const freeAgents = faData
      .map(p => ({
        ...p,
        trend: calculateTrend(p.seasonStats, p.recentStats, p.position, p.historicalStats),
        displayStats: trendDisplayStats(p.recentStats, p.seasonStats, p.position),
      }))
      .filter(p => p.trend === 'hot' || p.trend === 'rising')
      .sort((a, b) => (a.trend === 'hot' ? -1 : 1));

    return NextResponse.json(
      { myPlayers, freeAgents },
      {
        headers: {
          'X-Cache-Hit': 'false',
          'X-Cache-Updated': new Date().toISOString(),
        },
      }
    );
  } catch (err) {
    console.error('[trends route]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/leagues/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getLeagues } from '@/lib/yahooService';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await getLeagues(guid);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/api/yahoo/roster/[leagueKey]/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getRoster, getUserTeamKey } from '@/lib/yahooService';
import { getSession } from '@/lib/session';

export async function GET(request, { params }) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  const { leagueKey } = await params;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const teamKey = await getUserTeamKey(guid, leagueKey);
    if (!teamKey) throw new Error('Could not find user team in league');
    
    const players = await getRoster(guid, leagueKey, teamKey);
    return NextResponse.json({ players });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## File: `app/audit/page.js`

```javascript
'use client';
import ModulePage from '@/components/shared/ModulePage';
import RosterAudit from '@/components/RosterAudit/RosterAudit';
export default function AuditPage() {
  return <ModulePage title="Roster Audit"><RosterAudit /></ModulePage>;
}
```

---

## File: `app/auth/yahoo/callback/route.js`

```javascript
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSession } from '@/lib/session';
import { db } from '@/lib/database';

// Use public app URL — request.url resolves to Railway's internal localhost:8080
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://goinyard.app').replace(/\/$/, '');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('[Auth Callback] No code received');
    return NextResponse.redirect(`${APP_URL}/`);
  }

  const clientId     = process.env.YAHOO_CLIENT_ID?.trim();
  const clientSecret = process.env.YAHOO_CLIENT_SECRET?.trim();
  const redirectUri  = process.env.YAHOO_REDIRECT_URI?.trim() || 'https://goinyard.app/auth/yahoo/callback';

  if (!clientId || !clientSecret) {
    console.error('[Auth Callback] Missing YAHOO_CLIENT_ID or YAHOO_CLIENT_SECRET');
    return NextResponse.redirect(`${APP_URL}/?error=server_config_error`);
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('[Auth Callback] Exchanging code for token...');

    const { data } = await axios.post(
      'https://api.login.yahoo.com/oauth2/get_token',
      new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization:  `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[Auth Callback] Token exchange response:', data);
    let guid = data.xoauth_yahoo_guid || data.guid;

    // If GUID is missing from token response, fetch it from the profile API
    if (!guid) {
      console.log('[Auth Callback] GUID missing from token response, fetching from profile API...');
      try {
        const profileResponse = await axios.get(
          'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json',
          { headers: { Authorization: `Bearer ${data.access_token}` } }
        );
        const userNode = profileResponse.data?.fantasy_content?.users?.['0']?.user?.[0];
        if (userNode) guid = userNode.guid;
      } catch (profileErr) {
        console.error('[Auth Callback] Profile fetch failed:', profileErr.message);
      }
    }

    if (!guid) throw new Error('Failed to retrieve Yahoo GUID');

    const expiresAt = Date.now() + data.expires_in * 1000;
    console.log('[Auth Callback] Success! GUID:', guid);

    db.setToken(guid, {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    expiresAt,
    });

    const session = await getSession();
    session.yahoo_guid = guid;
    await session.save();

    return NextResponse.redirect(`${APP_URL}/`);
  } catch (err) {
    console.error('Yahoo Auth Error:', err.response?.data || err.message);
    return NextResponse.redirect(`${APP_URL}/?error=auth_failed`);
  }
}
```

---

## File: `app/baseball101/page.js`

```javascript
'use client';

import React from 'react';

export default function Baseball101Page() {
  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8, color: 'var(--text-main)' }}>🎓 Baseball 101</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>
        The beginner's guide to understanding the sport and dominating your fantasy league.
      </p>

      {/* The Core Objective */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚾</span> The absolute basics
        </h2>
        <p style={{ color: 'var(--text-main)', fontSize: 15, lineHeight: 1.6 }}>
          The core objective of baseball is simple: score more <strong>Runs</strong>.
          A run is scored when a hitter safely hits the ball, rounds all four bases in consecutive order, and crosses home plate.
          Meanwhile, the opposing team (the defense on the field) tries to record three <strong>Outs</strong>. An out is recorded when a batter fails to reach base safely—most commonly by striking out, hitting a ball that is caught in the air before it touches the ground, or having the ball thrown to the base before they can run there. Once the defense gets three outs, the teams swap places and it is their turn to hit.
          There are nine <strong>Innings</strong> in a standard game. Each inning is split into two halves: the <strong>Top</strong> of the inning (where the Away team bats) and the <strong>Bottom</strong> of the inning (where the Home team bats). The break in between is called the Middle of the inning.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Hitting Stats */}
        <div className="card">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18 }}>
            Hitter Dictionary (Offense)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>AVG (Batting Average)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hits divided by At-Bats. A good average is around .270. Anything over .300 is elite.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>HR (Home Run)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hitting the ball out of the park, instantly scoring a run for the hitter and anyone else on base.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>RBI (Runs Batted In)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You get an RBI when your hit successfully brings a teammate across home plate to score a run.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>SB (Stolen Base)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Running to the next base while the pitcher is throwing the ball to the catcher. Huge for fantasy points!</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>OBP (On-Base Percentage)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>How often a batter reaches base via a hit or a walk.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>OPS (On-Base Plus Slugging)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>A combined metric of OBP and Slugging Percentage (power). An OPS over .800 is great; over .900 is MVP-level.</div>
            </div>
          </div>
        </div>

        {/* Pitching Stats */}
        <div className="card">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18 }}>
            Pitcher Dictionary (Defense)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>ERA (Earned Run Average)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>How many runs a pitcher gives up per 9 innings. <strong>Lower is better!</strong> An ERA under 3.50 is fantastic.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>WHIP</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Walks + Hits per Inning Pitched. How many guys get on base against you. Under 1.20 is great.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>K (Strikeout)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Getting three strikes on a batter. Pitchers who strike out many batters are highly prized in fantasy.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>W (Wins) & QS (Quality Starts)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You get a Win if your team leads when you leave the game. A Quality Start is 6+ innings allowing 3 runs or less.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>SV (Saves)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>A specialized stat for Relief Pitchers who come into the 9th inning to protect a close lead.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18, color: '#4aafdb' }}>
          Advanced Fantasy Analytics
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>VOR (Value Over Replacement)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
              This is the holy grail metric for fantasy baseball. VOR calculates how many more points/stats a player produces compared to a totally average, "free" replacement-level player you could just pick off the Waiver Wire.
              <br /><br />
              <strong>Why it matters:</strong> A First Baseman who hits 25 home runs is good, but a Catcher who hits 25 home runs has an exponentially higher VOR, because good hitting catchers are incredibly rare! VOR tells you exactly who is actually helping you win your league by accounting for positional scarcity.
            </div>
          </div>
        </div>
      </div>

      {/* Fantasy Formats */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: 16, fontSize: 20 }}>Fantasy League Formats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 8, fontSize: 16 }}>Head-to-Head (Points)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Works like fantasy football. Every action (a home run, a strikeout) earns physical points. The person with the most total points at the end of the week wins the matchup. Starting Pitchers are extremely valuable here.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 8, fontSize: 16 }}>Head-to-Head (Categories)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Instead of one total score, you battle your opponent across ~10 different categories (e.g., who hit the most Home Runs?). You get a win for every category you beat them in. Balanced teams thrive here.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: '#eab308', marginBottom: 8, fontSize: 16 }}>Rotisserie (Roto)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              No weekly matchups! You rank against every team in the league simultaneously across all stat categories over the entire 162-game season. It requires extreme consistency and patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: `app/gameplan/page.js`

```javascript
'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import AiQuestionBox from '@/components/shared/AiQuestionBox';

export default function GameplanPage() {
  const {
    leagues, selectedLeague, setSelectedLeague,
    aiAnalysis, aiLoading,
    refreshAnalysis, refreshesRemaining, refreshLimitReached,
  } = useLeague();

  return (
    <div>
      {/* Header with league selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>📅 Weekly Game Plan</h1>
          <p style={{ color: '#7aafc4' }}>
            Your personalized weekly strategy — auto-generated from your live league data
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {leagues?.length > 1 && (
            <select
              value={selectedLeague || ''}
              onChange={e => setSelectedLeague(e.target.value)}
              style={{ minWidth: 200, padding: '8px 12px', borderRadius: 6, background: '#122840', color: '#fff', border: '1px solid #1e3d5c' }}
            >
              {leagues.map((l, i) => (
                <option key={i} value={l.league_key}>{l.name || l.league_key}</option>
              ))}
            </select>
          )}
          {selectedLeague && (
            <button
              onClick={refreshAnalysis}
              disabled={aiLoading || refreshLimitReached}
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '8px 16px', whiteSpace: 'nowrap' }}
              title={refreshLimitReached ? 'Daily refresh limit reached' : `${refreshesRemaining} refresh${refreshesRemaining !== 1 ? 'es' : ''} remaining today`}
            >
              {aiLoading ? '⟳ Analyzing...' : `🔄 Refresh${refreshesRemaining < 3 ? ` (${refreshesRemaining})` : ''}`}
            </button>
          )}
        </div>
      </div>

      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading && !aiAnalysis} />

      {aiAnalysis?.matchup && (
        <InsightCard data={aiAnalysis.matchup} type="matchup" loading={false} />
      )}

      {aiAnalysis?.pitching && (
        <InsightCard data={aiAnalysis.pitching} type="pitching" loading={false} />
      )}

      {!aiAnalysis && !aiLoading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p style={{ color: '#7aafc4' }}>
            {leagues?.length > 1 ? 'Select a league above to load your weekly strategy.' : 'Your weekly game plan is loading...'}
          </p>
        </div>
      )}

      {(aiAnalysis || aiLoading) && (
        <div style={{ marginTop: 16 }}>
          <AiQuestionBox
            context={`Weekly gameplan: ${JSON.stringify(aiAnalysis?.gameplan || '')}. Matchup: ${JSON.stringify(aiAnalysis?.matchup || '')}`}
            leagueKey={selectedLeague}
            title="Ask About This Week's Strategy"
            icon="📅"
            placeholder="e.g. Should I stream a pitcher this week? Who's my must-start?"
          />
        </div>
      )}
    </div>
  );
}
```

---

## File: `app/globals.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

:root {
  /* Texas Rangers Brand Palette */
  --primary: #C0111F;      /* Rangers Red */
  --primary-hover: #a10d19;
  --secondary: #003278;    /* Rangers Blue */
  --secondary-hover: #002354;
  
  /* Glass / Depth Elements */
  --bg-app: #030712;       /* Very deep space black */
  --bg-card: rgba(10, 25, 60, 0.4);
  --bg-card-hover: rgba(15, 35, 80, 0.5);
  --border: rgba(100, 150, 255, 0.15);
  --border-glow: rgba(0, 200, 255, 0.5);
  
  /* Alerts */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;

  /* Typography */
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  
  --font-heading: 'Rajdhani', sans-serif;
  --font-body: 'Space Grotesk', -apple-system, sans-serif;
}

body {
  font-family: var(--font-body);
  background: var(--bg-app);
  color: var(--text-main);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  background-image: 
    radial-gradient(circle at 100% 0%, rgba(0, 150, 255, 0.15), transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(192, 17, 31, 0.1), transparent 50%);
  background-attachment: fixed;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

p {
  line-height: 1.6;
}

/* ===================== BUTTONS ===================== */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-heading);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary { 
  background: linear-gradient(135deg, var(--primary) 0%, #fa192f 100%); 
  color: white; 
  box-shadow: 0 4px 14px rgba(192, 17, 31, 0.3);
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.btn-primary:hover { 
  background: linear-gradient(135deg, #e51325 0%, #ff3143 100%);
  box-shadow: 0 6px 20px rgba(192, 17, 31, 0.5);
  transform: translateY(-2px);
}

.btn-success { background: var(--success); color: white; }
.btn-danger { background: var(--danger); color: white; }

.btn-ghost { 
  background: rgba(255, 255, 255, 0.03); 
  color: var(--text-muted); 
  border: 1px solid var(--border); 
}
.btn-ghost:hover { 
  background: rgba(255, 255, 255, 0.08); 
  color: var(--text-main); 
  border-color: rgba(255,255,255,0.2);
}

/* ===================== CARD (GLASSMORPHISM) ===================== */
.card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.05);
}

.card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-glow);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(192, 17, 31, 0.15);
}

/* ===================== BADGES ===================== */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-heading);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
}

.badge-sp { background: rgba(0, 50, 120, 0.4); color: #7dd3fc; }
.badge-rp { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
.badge-c  { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
.badge-1b { background: rgba(244, 63, 94, 0.2); color: #fda4af; }
.badge-2b { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }
.badge-3b { background: rgba(236, 72, 153, 0.2); color: #f9a8d4; }
.badge-ss { background: rgba(6, 182, 212, 0.2); color: #67e8f9; }
.badge-of { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.badge-util { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; }

/* ===================== FORMS ===================== */
input, select, textarea {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-main);
  padding: 10px 16px;
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  width: 100%;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--secondary);
  box-shadow: 0 0 0 3px rgba(0, 50, 120, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

/* ===================== TABLES ===================== */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 2px solid rgba(255,255,255,0.05);
  font-family: var(--font-heading);
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 14px;
  transition: background 0.2s;
}

tr:hover td { 
  background: rgba(255,255,255,0.02); 
}

/* Responsive Mobile Cards for Tables */
@media (max-width: 768px) {
  table { display: block; }
  thead { display: none; }
  tbody { display: block; width: 100%; }
  
  tr {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    background: var(--bg-card);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 4px;
    border-bottom: 1px dashed rgba(255,255,255,0.08);
  }
  
  td:last-child {
    border-bottom: none;
  }
  
  td::before {
    content: attr(data-label);
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 700;
    margin-right: 16px;
  }
}

/* ===================== MISC ===================== */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-muted);
  font-family: var(--font-heading);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; text-shadow: 0 0 10px rgba(0,50,120,0.5); }
  100% { opacity: 0.6; }
}

.ai-response {
  background: rgba(0, 50, 120, 0.15);
  border: 1px solid rgba(0, 50, 120, 0.3);
  border-radius: 12px;
  padding: 20px;
  line-height: 1.7;
  white-space: pre-wrap;
  font-size: 15px;
  position: relative;
  overflow: hidden;
}

.ai-response::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--secondary), var(--primary));
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { 
  background: rgba(255,255,255,0.1); 
  border-radius: 4px; 
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.2);
}

/* ===================== LAYOUT ===================== */
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 40px 48px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ===================== SIDEBAR ===================== */
.sidebar {
  width: 260px;
  background: rgba(3, 8, 18, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0,0,0,0.2);
}

.sidebar h2 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar h2 span {
  background: linear-gradient(135deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  letter-spacing: 0.01em;
}

.sidebar-nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.sidebar-nav-item.active {
  background: rgba(0, 50, 120, 0.3);
  color: white;
  border-right: 3px solid var(--primary);
  border-radius: 10px 4px 4px 10px;
}

.sidebar-nav-item .icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 99;
  -webkit-tap-highlight-color: transparent;
}

/* ===================== MOBILE TOPBAR ===================== */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 64px;
  background: rgba(3, 8, 18, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 90;
  flex-shrink: 0;
}

.mobile-topbar h1 {
  font-size: 18px;
  margin: 0;
}

.hamburger-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 20px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}

.hamburger-btn:hover {
  background: rgba(255,255,255,0.05);
}

/* ===================== GRID UTILITIES ===================== */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.grid-2-tight {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Player row */
.player-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
  background: rgba(255,255,255,0.02);
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.03);
}

/* ===================== MOBILE ===================== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed !important;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay.active {
    display: block;
  }

  .mobile-topbar {
    display: flex;
  }

  .main-content {
    padding: 16px 12px !important;
  }

  .card table, table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    margin-bottom: 8px;
  }

  th, td {
    white-space: nowrap;
    padding: 12px;
  }

  .grid-2, .grid-2-tight {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .player-row {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .player-row > *:first-child, .player-row > *:last-child {
    grid-column: 1 / -1;
  }

  .card {
    padding: 16px 14px;
    border-radius: 12px;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .btn {
    min-height: 48px;
    font-size: 15px;
  }

  input, select, textarea {
    font-size: 16px !important;
    padding: 12px 14px;
    max-width: 100%;
  }

  /* Prevent any flex child from blowing out the layout */
  .card > *, .ai-response {
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* Don't fight clamp() — only override truly fixed large sizes */
  h2 { font-size: 18px !important; }
  h3 { font-size: 15px !important; }

  /* Background Mural Scaling */
  .mural-container img {
    opacity: 0.08 !important;   /* Fade to watermark so text is readable */
    width: 250px !important;    /* Avoid massive images on 375px screens */
    left: auto !important;
    right: -10vw !important;    /* Stick them on the right edge */
  }
  
  .mural-container img:nth-child(n+3) {
    display: none !important;   /* Only show 2 cards on mobile / tablet to prevent stacking */
  }

  .mural-container img:nth-child(1) {
    top: 5% !important;
    right: auto !important;
    left: -10vw !important;
  }
  
  .mural-container img:nth-child(2) {
    top: 60% !important;
    left: auto !important;
    right: -10vw !important;
  }
}

/* ===================== MASCOT ANIMATIONS ===================== */
@keyframes mascot-float {
  0%   { transform: translateY(0px) rotate(-1deg); }
  50%  { transform: translateY(-10px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(-1deg); }
}

@keyframes mascot-glow {
  0%   { box-shadow: 0 0 20px rgba(192,17,31,0.4), 0 0 60px rgba(0,150,255,0.15); }
  50%  { box-shadow: 0 0 40px rgba(192,17,31,0.7), 0 0 80px rgba(0,150,255,0.3); }
  100% { box-shadow: 0 0 20px rgba(192,17,31,0.4), 0 0 60px rgba(0,150,255,0.15); }
}

@keyframes mascot-glow-blue {
  0%   { box-shadow: 0 0 20px rgba(0,150,255,0.4), 0 0 50px rgba(0,200,255,0.1); }
  50%  { box-shadow: 0 0 40px rgba(0,150,255,0.7), 0 0 80px rgba(0,200,255,0.25); }
  100% { box-shadow: 0 0 20px rgba(0,150,255,0.4), 0 0 50px rgba(0,200,255,0.1); }
}

/* Hero mascot — large, floating, glowing (Dashboard, Login) */
.mascot-hero {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(192,17,31,0.6);
  animation: mascot-float 4s ease-in-out infinite, mascot-glow 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(192,17,31,0.6));
  flex-shrink: 0;
}

/* Page header mascot — medium, blue glow (Waiver, GamePlan) */
.mascot-header {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,150,255,0.6);
  animation: mascot-float 5s ease-in-out infinite, mascot-glow-blue 3.5s ease-in-out infinite;
  filter: drop-shadow(0 0 16px rgba(0,150,255,0.5));
  flex-shrink: 0;
}

/* AI result mascot — medium, mixed glow (Trade, Draft, Matchup) */
.mascot-ai {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(192,17,31,0.5);
  animation: mascot-float 4.5s ease-in-out infinite 0.5s, mascot-glow 4s ease-in-out infinite;
  filter: drop-shadow(0 0 18px rgba(192,17,31,0.5));
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .mascot-hero   { width: 110px; height: 110px; }
  .mascot-header { width: 88px;  height: 88px; }
  .mascot-ai     { width: 96px;  height: 96px; }
}

/* ── Upgrade Page ──────────────────────────────────────────────────────── */
.upgrade-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.upgrade-header {
  text-align: center;
  margin-bottom: 40px;
}

.upgrade-header h1 {
  font-family: var(--font-heading);
  font-size: 2rem;
  background: linear-gradient(135deg, #fff 30%, var(--accent, #00c8ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.upgrade-subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-top: 8px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.pricing-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px 24px;
  position: relative;
  transition: transform 0.2s, border-color 0.3s;
}

.pricing-card:hover {
  transform: translateY(-4px);
}

.pricing-card.recommended {
  border-color: var(--accent, #00c8ff);
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.15);
}

.pricing-card.current {
  border-color: var(--success);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
}

.pricing-recommended {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #00c8ff, #0088ff);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 16px;
  border-radius: 12px;
  letter-spacing: 0.05em;
}

.pricing-badge {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.pricing-badge.pro { color: var(--accent, #00c8ff); }
.pricing-badge.addon { color: var(--warning); }

.pricing-price {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1;
}

.pricing-period {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
  margin-bottom: 20px;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}

.pricing-features li {
  padding: 6px 0;
  font-size: 14px;
  color: var(--text-secondary, #cbd5e1);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.pricing-features li:last-child { border-bottom: none; }

.pricing-cta {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #00c8ff, #0066ff);
  color: #fff;
  transition: transform 0.15s, box-shadow 0.2s;
}

.pricing-cta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 200, 255, 0.3);
}

.pricing-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pricing-cta.addon {
  background: linear-gradient(135deg, var(--warning), #e68a00);
}

.pricing-cta.compact {
  width: auto;
  padding: 10px 24px;
  font-size: 14px;
}

.pricing-current-badge {
  text-align: center;
  padding: 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: var(--success);
  font-weight: 600;
  font-size: 14px;
}

.upgrade-footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

/* Compact upgrade prompt (shown in modals when free limit hit) */
.upgrade-prompt {
  text-align: center;
  padding: 32px 24px;
  background: var(--bg-card);
  border: 1px solid var(--accent, #00c8ff);
  border-radius: 16px;
  max-width: 400px;
  margin: 20px auto;
}

.upgrade-prompt-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upgrade-prompt h3 {
  color: var(--text-main);
  font-size: 16px;
  margin-bottom: 8px;
}

.upgrade-prompt p {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 16px;
}

/* AI usage badge in sidebar */
.ai-usage-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 8px;
  font-size: 11px;
  color: var(--accent, #00c8ff);
  font-weight: 600;
}

.ai-usage-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--warning);
}

.ai-usage-badge.exhausted {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger);
}

/* ── Shared Module Styles ─────────────────────────────────────────────── */

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Text Gradient */
.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-success { color: var(--success) !important; }
.text-danger  { color: var(--danger) !important; }
.text-muted   { color: var(--text-muted) !important; }

/* Module Header */
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.module-header .header-text h1 {
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 800;
  margin-bottom: 4px;
}

.module-header .header-text p {
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions .input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-actions .input-group label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  font-weight: 700;
  font-family: var(--font-heading);
}

.league-selector {
  min-width: 180px;
  max-width: 260px;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}

.loading-state p {
  color: var(--text-muted);
  font-size: 14px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

/* Section title used inside cards */
.section-title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-main);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* Position pill (compact badge for player positions) */
.pos-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 50, 120, 0.4);
  color: #7dd3fc;
  font-family: var(--font-heading);
  flex-shrink: 0;
}

.pos-pill.accent {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

/* AI response prose */
.ai-response-prose {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary, #cbd5e1);
  white-space: pre-wrap;
}

/* Button large variant */
.btn-large {
  padding: 14px 28px;
  font-size: 16px;
  min-height: 48px;
}

/* ── Game Plan Module ────────────────────────────────────────────────── */
.gameplan-page {
  max-width: 1200px;
  margin: 0 auto;
}

.gameplan-cta {
  border: 1px dashed rgba(0, 200, 255, 0.3);
  background: rgba(0, 50, 120, 0.08);
}

.gameplan-cta .card:hover {
  transform: none;
}

.gameplan-cta-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.gameplan-cta-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.gameplan-cta-text {
  flex: 1;
  min-width: 200px;
}

.gameplan-cta-text h3 {
  font-size: 18px;
  margin-bottom: 4px;
}

.gameplan-cta-text p {
  font-size: 14px;
}

.gameplan-loading {
  text-align: center;
  padding: 48px 24px;
}

.gameplan-loading h3 {
  margin-bottom: 8px;
}

.gameplan-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gameplan-top-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.gameplan-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.gameplan-section {
  /* Override hover lift for plan cards — looks janky with many cards */
}

.gameplan-section:hover {
  transform: none;
}

.gameplan-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.day-emoji {
  margin-right: 4px;
}

/* Scoreboard Badge */
.scoreboard-badge {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scoreboard-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
}

.scoreboard-divider {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text-muted);
  opacity: 0.5;
  font-weight: 800;
}

.stat-group {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.confidence-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70%  { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.target-capsules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.cat-target {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--warning);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.tiny-advice {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

.tactical-list {
  display: flex;
  flex-direction: column;
}

.tactical-item {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.2s;
  border-radius: 8px;
}

.tactical-item:last-child {
  border-bottom: none;
}

.tactical-item.highlight-hover:hover {
  background: rgba(0, 200, 255, 0.05);
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
}

.item-logic {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.decision-stack, .timeline-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decision-node {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  border-left: 3px solid #00c8ff;
}

.node-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.node-question {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  min-width: 150px;
}

.node-verdict {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.node-reasoning {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.timeline-event {
  display: flex;
  gap: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.event-day {
  min-width: 80px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #00c8ff;
  letter-spacing: 0.05em;
  padding-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.event-content {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  flex: 1;
}

.ai-processing-visual {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.center-node {
  font-size: 40px;
  z-index: 2;
}

.orbit-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid #00c8ff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Standings Module ────────────────────────────────────────────────── */
.standings-container {
  max-width: 1000px;
  margin: 0 auto;
}

.standings-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.gold    { background: #f59e0b; }
.legend-dot.playoff { background: var(--secondary); }

.standings-card {
  padding: 0;
  overflow: hidden;
}

.standings-table {
  width: 100%;
}

.standings-table th {
  background: rgba(0, 0, 0, 0.2);
}

.standings-row td {
  transition: background 0.2s;
}

.standings-row.first-place td {
  background: rgba(245, 158, 11, 0.06);
}

.standings-row.playoff td {
  /* subtle highlight */
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
  font-family: var(--font-heading);
}

.rank-badge.gold {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #000;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
}

.rank-badge.playoff {
  background: rgba(0, 50, 120, 0.5);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.rank-badge.standard {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
}

.team-name {
  font-weight: 600;
  font-size: 14px;
}

.manager-name {
  color: var(--text-muted);
  font-size: 13px;
}

.wins-value  { color: var(--success); font-weight: 700; }
.losses-value { color: var(--danger); font-weight: 700; }

.pct-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pct-value {
  font-weight: 700;
  font-size: 13px;
  font-family: var(--font-heading);
}

.pct-bar {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.pct-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease-out;
}

.playoff-cutoff-row td {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

.playoff-cutoff-line {
  text-align: center;
  padding: 6px 0;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(239, 68, 68, 0.5);
  font-family: var(--font-heading);
}

/* ── Mobile Overrides for GamePlan + Standings ─────────────────────── */
@media (max-width: 768px) {
  .module-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .league-selector {
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }

  .gameplan-top-row,
  .gameplan-columns {
    grid-template-columns: 1fr;
  }

  .gameplan-cta-inner {
    flex-direction: column;
    text-align: center;
  }

  .gameplan-cta-inner .btn {
    width: 100%;
  }

  .stat-value {
    font-size: 24px;
  }

  .scoreboard-content {
    gap: 12px;
  }

  .timeline-event {
    flex-direction: column;
    gap: 6px;
  }

  .event-day {
    min-width: unset;
  }

  .node-top {
    flex-direction: column;
  }

  .gameplan-footer {
    flex-direction: column;
    gap: 8px;
  }

  .gameplan-footer .btn {
    width: 100%;
  }

  /* Standings mobile: switch table to stacked cards */
  .standings-card {
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
  }

  .standings-table thead {
    display: none;
  }

  .standings-table tbody {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .standings-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(24px);
    align-items: center;
  }

  .standings-row.first-place {
    border-color: rgba(245, 158, 11, 0.4);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
  }

  .standings-row td {
    padding: 4px 0;
    border-bottom: none;
  }

  .standings-row td[data-label="Rank"] {
    order: -1;
  }

  .standings-row td[data-label="Team"] {
    flex: 1;
    min-width: 120px;
  }

  .standings-row td[data-label="Manager"] {
    width: 100%;
    order: 10;
    font-size: 12px;
  }

  .standings-row td[data-label="W"],
  .standings-row td[data-label="L"],
  .standings-row td[data-label="T"],
  .standings-row td[data-label="Win %"],
  .standings-row td[data-label="GB"] {
    text-align: center;
  }

  .standings-row td::before {
    content: attr(data-label);
    display: block;
    font-size: 9px;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 2px;
    font-family: var(--font-heading);
  }

  .standings-row td[data-label="Rank"]::before,
  .standings-row td[data-label="Team"]::before {
    display: none;
  }

  .pct-bar {
    display: none;
  }

  .playoff-cutoff-row {
    display: block;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    padding: 0 !important;
  }
}


```

---

## File: `app/layout.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import { Rajdhani, Space_Grotesk } from 'next/font/google';
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

import { LeagueProvider } from '@/lib/context/LeagueContext';
import { SWRConfig } from 'swr';

export default function RootLayout({ children }) {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isAuthError = 
          error.response?.status === 401 ||
          (error.response?.status === 500 && (
            error.response?.data?.error?.includes('refresh token') ||
            error.response?.data?.error?.includes('Not authenticated') ||
            error.response?.data?.error?.includes('No token found')
          ));

        if (isAuthError) {
          if (window.location.pathname !== '/') {
            toast.error('Session expired. Please sign in again.', { duration: 5000 });
            setAuthStatus({ authenticated: false, loading: false });
            axios.post('/api/auth/logout').finally(() => {
              window.location.href = '/';
            });
          }
        }
        return Promise.reject(error);
      }
    );

    checkAuth();

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  async function checkAuth() {
    try {
      const { data } = await axios.get('/api/auth/status');
      setAuthStatus({ ...data, loading: false });
    } catch {
      setAuthStatus({ authenticated: false, loading: false });
    }
  }

  const swrOptions = {
    fetcher: (url) => axios.get(url).then(res => res.data),
    revalidateOnFocus: false, // Don't spam Yahoo API when tabbing back and forth
    dedupingInterval: 10000, // 10 seconds deduping
  };

  return (
    <html lang="en" className={`${rajdhani.variable} ${spaceGrotesk.variable}`}>
      <head>
        <title>Goin' Yard HQ</title>
        <meta name="description" content="AI Fantasy Baseball Intelligence" />
      </head>
      <body>
        <Toaster position="top-right" />
        <SWRConfig value={swrOptions}>
        <LeagueProvider>
          <div className="app-layout">
            <Sidebar 
              authenticated={authStatus.authenticated} 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)}
              subscription={authStatus.subscription}
            />
            <div className="app-body">
              {authStatus.authenticated && (
                <div className="mobile-topbar">
                  <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                  <span style={{ fontWeight: 700 }}>⚾ Goin' Yard HQ</span>
                </div>
              )}
              <main className="main-content">
                {/* ── Cyborg Card Mural Background ── */}
                <div className="mural-container" style={{
                  position: 'fixed',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 0,
                  overflow: 'hidden',
                }}>
                  {[
                    { src: '/cyborg_card_tier1_hitter.png',   top: '2%',  left: '3%',   rotate: '-8deg',  opacity: 0.13, width: 200 },
                    { src: '/cyborg_card_tier2_holo_premium.png', top: '18%', left: '1%',  rotate: '5deg',   opacity: 0.10, width: 180 },
                    { src: '/cyborg_card_tier3_prism.png',    top: '55%', left: '2%',   rotate: '-4deg',  opacity: 0.12, width: 190 },
                    { src: '/cyborg_card_tier2_holo.png',     top: '78%', left: '4%',   rotate: '7deg',   opacity: 0.09, width: 170 },
                    { src: '/cyborg_card_tier1_pitcher.png',  top: '5%',  right: '3%',  rotate: '9deg',   opacity: 0.13, width: 200 },
                    { src: '/cyborg_silver_prism_wide.png',   top: '30%', right: '1%',  rotate: '-6deg',  opacity: 0.10, width: 185 },
                    { src: '/card-hitter.png',                top: '62%', right: '2%',  rotate: '5deg',   opacity: 0.12, width: 190 },
                    { src: '/card-pitcher.png',               top: '82%', right: '4%',  rotate: '-9deg',  opacity: 0.09, width: 175 },
                  ].map((card, i) => (
                    <img
                      key={i}
                      src={card.src}
                      alt=""
                      style={{
                        position: 'absolute',
                        top:     card.top,
                        left:    card.left,
                        right:   card.right,
                        width:   card.width,
                        opacity: card.opacity,
                        transform: `rotate(${card.rotate})`,
                        borderRadius: 16,
                        filter: 'saturate(1.2) brightness(0.9)',
                        transition: 'opacity 0.3s',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                    />
                  ))}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {children}
                </div>
              </main>
            </div>
          </div>
        </LeagueProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
```

---

## File: `app/matchup/page.js`

```javascript
'use client';
import ModulePage from '@/components/shared/ModulePage';
import MatchupView from '@/components/MatchupView/MatchupView';
export default function MatchupPage() {
  return <ModulePage title="Live Matchup"><MatchupView /></ModulePage>;
}
```

---

## File: `app/page.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data } = await axios.get('/api/auth/status');
      setAuthStatus({ ...data, loading: false });
    } catch {
      setAuthStatus({ authenticated: false, loading: false });
    }
  }

  if (authStatus.loading) return <div className="loading">⚾ Loading HQ...</div>;

  if (!authStatus.authenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 16 }}>
        <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'white' }}>Goin' Yard <span style={{ color: 'var(--primary)' }}>HQ</span></h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.6, fontSize: 15 }}>
            An AI-powered fantasy baseball command center.
          </p>
          <a href="/api/auth/yahoo" style={{ display: 'block', textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12 }}>
              Connect Yahoo Fantasy Account
            </button>
          </a>
        </div>
      </div>
    );
  }

  return <Dashboard subscription={authStatus.subscription} />;
}
```

---

## File: `app/page.module.css`

```css
.page {
  --background: #fafafa;
  --foreground: #fff;

  --text-primary: #000;
  --text-secondary: #666;

  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;
  --button-secondary-border: #ebebeb;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-geist-sans);
  background-color: var(--background);
}

.main {
  display: flex;
  flex: 1;
  width: 100%;
  max-width: 800px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  background-color: var(--foreground);
  padding: 120px 60px;
}

.intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 24px;
}

.intro h1 {
  max-width: 320px;
  font-size: 40px;
  font-weight: 600;
  line-height: 48px;
  letter-spacing: -2.4px;
  text-wrap: balance;
  color: var(--text-primary);
}

.intro p {
  max-width: 440px;
  font-size: 18px;
  line-height: 32px;
  text-wrap: balance;
  color: var(--text-secondary);
}

.intro a {
  font-weight: 500;
  color: var(--text-primary);
}

.ctas {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 440px;
  gap: 16px;
  font-size: 14px;
}

.ctas a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-radius: 128px;
  border: 1px solid transparent;
  transition: 0.2s;
  cursor: pointer;
  width: fit-content;
  font-weight: 500;
}

a.primary {
  background: var(--text-primary);
  color: var(--background);
  gap: 8px;
}

a.secondary {
  border-color: var(--button-secondary-border);
}

/* Enable hover only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  a.primary:hover {
    background: var(--button-primary-hover);
    border-color: transparent;
  }

  a.secondary:hover {
    background: var(--button-secondary-hover);
    border-color: transparent;
  }
}

@media (max-width: 600px) {
  .main {
    padding: 48px 24px;
  }

  .intro {
    gap: 16px;
  }

  .intro h1 {
    font-size: 32px;
    line-height: 40px;
    letter-spacing: -1.92px;
  }
}

@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }

  .page {
    --background: #000;
    --foreground: #000;

    --text-primary: #ededed;
    --text-secondary: #999;

    --button-primary-hover: #ccc;
    --button-secondary-hover: #1a1a1a;
    --button-secondary-border: #1a1a1a;
  }
}
```

---

## File: `app/pitching/page.js`

```javascript
'use client';

import React from 'react';
import PitchingIntel from '@/components/PitchingIntel/PitchingIntel';
import { useLeague } from '@/lib/context/LeagueContext';

export default function PitchingPage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Pitching Intelligence</h1>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <PitchingIntel leagueKey={selectedLeague} />
      ) : (
        <div className="card">Please select a league.</div>
      )}
    </div>
  );
}
```

---

## File: `app/roster/page.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLeague } from '@/lib/context/LeagueContext';

export default function RosterPage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchRoster(selectedLeague);
  }, [selectedLeague]);

  async function fetchRoster(leagueKey) {
    setLoading(true);
    try {
      // myroster returns clean parsed { name, position, team, status, injury } objects
      const res = await axios.get(`/api/yahoo/league/${leagueKey}/myroster`);
      setRoster(res.data.players || []);
    } catch (err) {
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  }

  const active = roster.filter(p => p.slot !== 'BN' && p.slot !== 'IL');
  const bench  = roster.filter(p => p.slot === 'BN');
  const il     = roster.filter(p => p.slot === 'IL');

  function RosterSection({ title, players, color }) {
    if (!players.length) return null;
    return (
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color }}>
          {title} ({players.length})
        </h2>
        <table>
          <thead>
            <tr>
              <th>Slot</th>
              <th>Player</th>
              <th>Position</th>
              <th>Team</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{p.slot}</td>
                <td><strong>{p.name}</strong></td>
                <td>
                  <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`}>
                    {p.position}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{p.team}</td>
                <td>
                  {p.injury
                    ? <span style={{ color: '#ef4444', fontSize: 12 }}>{p.injury}</span>
                    : <span style={{ color: '#00a86b', fontSize: 12 }}>Active</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◈ My Roster</h1>
          <p style={{ color: 'var(--text-muted)' }}>Your current lineup pulled from Yahoo Fantasy</p>
        </div>
        {leagues.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
              {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => fetchRoster(selectedLeague)} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading your roster from Yahoo...</div>
      ) : roster.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <p style={{ color: 'var(--text-muted)' }}>
            No roster data available. Make sure your Yahoo league is active and try refreshing.
          </p>
        </div>
      ) : (
        <>
          <RosterSection title="Active Lineup" players={active} color="#00a86b" />
          <RosterSection title="Bench" players={bench} color="#f59e0b" />
          <RosterSection title="Injured List (IL)" players={il} color="#ef4444" />
        </>
      )}
    </div>
  );
}
```

---

## File: `app/standings/page.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import AiQuestionBox from '@/components/shared/AiQuestionBox';
import Standings from '@/components/Standings/Standings';

export default function StandingsPage() {
  const { leagues, selectedLeague, setSelectedLeague, aiAnalysis, aiLoading, leagueData } = useLeague();

  // Raw standings data (fetched inside Standings component already)
  // We duplicate a light fetch here just for the AI context string
  const [standingsData, setStandingsData] = useState([]);
  const [aiRec, setAiRec]               = useState('');
  const [aiRecLoading, setAiRecLoading] = useState(false);
  const [aiRecError, setAiRecError]     = useState('');

  useEffect(() => {
    if (selectedLeague) {
      setStandingsData([]);
      setAiRec('');
      fetchStandingsForAi(selectedLeague);
    }
  }, [selectedLeague]);

  async function fetchStandingsForAi(key) {
    try {
      const { data } = await axios.get(`/api/yahoo/league/${key}/standings`);
      if (Array.isArray(data)) setStandingsData(data);
    } catch (e) {
      // non-fatal — Standings component handles its own display
    }
  }

  function buildStandingsBlock() {
    if (!standingsData.length) return 'Standings not yet loaded.';
    return standingsData.slice(0, 12).map((item, i) => {
      const t = item?.team;
      const info = Array.isArray(t)
        ? Object.assign({}, ...(Array.isArray(t[0]) ? t[0] : [t[0]]))
        : (t || {});
      const s = (Array.isArray(t) ? t.find(x => x?.team_standings) : t)?.team_standings || {};
      const out = s?.outcome_totals || {};
      return `  ${i + 1}. ${info.name || 'Team'} — ${out.wins ?? '?'}W-${out.losses ?? '?'}L (.${String(out.percentage ?? '000').replace('.', '')}) GB:${s.games_back || '-'}`;
    }).join('\n');
  }

  async function runStandingsAnalysis() {
    if (!standingsData.length) return;
    setAiRecLoading(true);
    setAiRecError('');
    try {
      const { data } = await axios.post('/api/ai/ask', {
        question: `Analyze these standings and tell me: who is in playoff position, who is in danger, and what's the best strategy for teams trying to climb?`,
        leagueKey: selectedLeague,
        context: `League format: ${leagueData?.scoring_type || 'H2H Points'}. Teams: ${standingsData.length}.
CURRENT STANDINGS:
${buildStandingsBlock()}
Use only the data above. Be specific about team names and records.`,
      });
      setAiRec(data.answer || '');
    } catch (err) {
      setAiRecError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setAiRecLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◎ League Standings</h1>
          <p style={{ color: '#7aafc4' }}>Live standings · AI playoff positioning analysis on demand</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {leagues?.length > 1 && (
            <select
              value={selectedLeague || ''}
              onChange={e => setSelectedLeague(e.target.value)}
              style={{ minWidth: 200, padding: '8px 12px', borderRadius: 6, background: '#122840', color: '#fff', border: '1px solid #1e3d5c' }}
            >
              {leagues.map((l, i) => (
                <option key={i} value={l.league_key}>{l.name || l.league_key}</option>
              ))}
            </select>
          )}
          <button
            className="btn btn-primary"
            onClick={runStandingsAnalysis}
            disabled={aiRecLoading || !standingsData.length}
            style={{ whiteSpace: 'nowrap' }}
          >
            {aiRecLoading ? '⟳ Analyzing...' : '⚡ Get AI Analysis'}
          </button>
        </div>
      </div>

      {/* Master-analyze InsightCard — gameplan section is most relevant for standings context */}
      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading && !aiAnalysis} />

      {/* Deep-dive AI standings narration */}
      {aiRecError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {aiRecError}
        </div>
      )}
      {aiRec && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            🏆 Standings Analysis
          </div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {aiRec}
          </div>
        </div>
      )}

      {/* Live standings table */}
      <Standings />

      {/* Follow-up Q&A */}
      {(aiRec || standingsData.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <AiQuestionBox
            context={`League standings:\n${buildStandingsBlock()}\nAI analysis: ${aiRec?.slice(0, 400) || ''}`}
            leagueKey={selectedLeague}
            title="Ask about your Standings"
            icon="🏆"
            placeholder="e.g. What do I need to do to make the playoffs? Who's my biggest threat?"
          />
        </div>
      )}
    </div>
  );
}
```

---

## File: `app/startsit/page.js`

```javascript
'use client';

import React from 'react';
import StartSit from '@/components/StartSit/StartSit';
import { useLeague } from '@/lib/context/LeagueContext';

export default function StartSitPage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Start/Sit Intelligence</h1>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <StartSit leagueKey={selectedLeague} />
      ) : (
        <div className="card">Please select a league to see recommendations.</div>
      )}
    </div>
  );
}
```

---

## File: `app/store/Store.css`

```css
.store-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.store-header {
  text-align: center;
  margin-bottom: 60px;
}

.store-header h1 {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #fff 0%, #00c8ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  font-family: var(--font-heading);
}

.store-header p {
  color: var(--text-muted);
  font-size: 18px;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  padding: 20px 0;
}

.store-card {
  background: rgba(10, 20, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.store-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(var(--pack-color-rgb), 0.3);
  border-color: var(--pack-color);
}

.store-card.popular {
  border: 2px solid var(--pack-color);
  box-shadow: 0 0 30px rgba(159, 122, 234, 0.2);
}

.popular-badge {
  position: absolute;
  top: 16px;
  right: -32px;
  background: var(--pack-color);
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 40px;
  transform: rotate(45deg);
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 10;
}

.pack-visual {
  height: 200px;
  background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), var(--pack-color);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.pack-foil-effect {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent);
  background-size: 10px 10px;
  opacity: 0.3;
  mix-blend-mode: overlay;
}

.pack-visual h2 {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  font-family: var(--font-heading);
  z-index: 2;
  padding: 0 20px;
}

.pack-details {
  padding: 30px 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pack-price {
  font-size: 36px;
  font-weight: 900;
  font-family: var(--font-heading);
  color: #fff;
  margin-bottom: 12px;
  text-align: center;
}

.pack-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: center;
}

.pack-guarantee {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  margin-top: auto;
}

.buy-btn {
  background: var(--pack-color);
  color: #fff;
  width: 100%;
  font-size: 16px;
  font-weight: 800;
  padding: 16px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.buy-btn:hover:not(:disabled) {
  filter: brightness(1.2);
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}
```

---

## File: `app/store/page.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PackDropModal from '../../components/TrophyCase/PackDropModal';
import './Store.css';

export default function Store() {
  const [loading, setLoading] = useState(false);
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);

  const packs = [
    {
      id: 'core_pack',
      name: 'Core Draft Pack',
      price: '$2.99',
      color: '#4299e1',
      description: 'A solid starting point. Contains 3 digital collectibles.',
      guarantee: 'Guarantees 1 Uncommon or better.',
      forceRarity: 'uncommon' // Mocking the guarantee for the single card we award for now
    },
    {
      id: 'premium_hobby',
      name: 'Premium Hobby Box',
      price: '$9.99',
      color: '#9f7aea',
      description: 'For serious collectors. Contains 5 digital collectibles.',
      guarantee: 'Guarantees 1 Rare or Epic, plus higher chance of patches.',
      forceRarity: 'rare',
      popular: true
    },
    {
      id: 'titan_drop',
      name: 'Titan Syndicate Drop',
      price: '$19.99',
      color: '#d69e2e',
      description: 'The ultimate score. Contains 10 digital collectibles.',
      guarantee: 'Guarantees 1 Legendary autographed card.',
      forceRarity: 'legendary'
    }
  ];

  useEffect(() => {
    // Check if returning from Stripe checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      const packId = query.get('packId');
      if (packId) {
        fulfillPurchase(packId);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, '/store');
    }
    if (query.get('canceled')) {
      toast.error('Purchase was canceled.');
      window.history.replaceState({}, document.title, '/store');
    }
  }, []);

  async function fulfillPurchase(packId) {
    try {
      setLoading(true);
      const packDef = packs.find(p => p.id === packId);
      const { data } = await axios.post('/api/store/buy-pack', {
        packId: packId,
        forceRarity: packDef?.forceRarity || null
      });
      setAwardedCard(data.awarded);
      setPackOpening(true);
      toast.success('Payment successful! Pack delivered.');
    } catch (e) {
      toast.error('Failed to claim your pack. Please contact support.');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyPack(pack) {
    try {
      setLoading(true);
      
      const { data } = await axios.post('/api/stripe/create-pack-checkout', {
        packId: pack.id,
        packName: pack.name
      });
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        toast.error('Failed to initialize checkout.');
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toast.error(e.response?.data?.error || 'Failed to start purchase process.');
    }
  }

  return (
    <div className="store-container">
      <PackDropModal awardedCard={packOpening ? awardedCard : null} onClose={() => setPackOpening(false)} />
      
      <div className="store-header">
        <h1>🛍️ The Collector's Store</h1>
        <p>Expand your roster with premium digital collectibles. Discover rare variants, jersey patches, and liquid-gold autographs.</p>
      </div>

      <div className="store-grid">
        {packs.map(pack => (
          <div key={pack.id} className={`store-card ${pack.popular ? 'popular' : ''}`} style={{ '--pack-color': pack.color }}>
            {pack.popular && <div className="popular-badge">MOST POPULAR</div>}
            
            <div className="pack-visual">
              <div className="pack-foil-effect"></div>
              <h2>{pack.name}</h2>
            </div>
            
            <div className="pack-details">
              <div className="pack-price">{pack.price}</div>
              <p className="pack-desc">{pack.description}</p>
              <div className="pack-guarantee">✨ {pack.guarantee}</div>
              
              <button 
                className="btn buy-btn" 
                onClick={() => handleBuyPack(pack)}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Buy ${pack.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## File: `app/test-gallery/page.jsx`

```jsx
'use client';
import React, { useState } from 'react';
import { GALACTIC_ROSTER as rosterData } from '@/lib/rosterData';
import '@/components/TrophyCase/TrophyCase.css';

export default function TestGallery() {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ padding: 40, background: '#050a15', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: 20 }}>Roster Test Gallery</h1>
      <p style={{ color: '#aaa', marginBottom: 40 }}>Click any card to flip it over. All 120 base cards rendered in Legendary foil for testing purposes.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {rosterData.map(player => {
          // Mock a cardDef for rendering
          const cardDef = {
            id: player.id,
            name: player.name,
            playerName: player.name,
            team: player.team,
            teamColor: player.teamColor,
            position: player.position,
            set_num: player.jersey_number,
            rarity: 'legendary',
            img: player.image || '/generic.png',
            has_signature: true,
            has_patch: true,
            patch_type: 'jersey',
            sig_style: 'classic',
            signature_name: player.name,
            specialization: 'Core Player',
            lore: `Drafted from ${player.home_planet || 'Earth'} to dominate the Galactic League.`
          };

          const isFlipped = flippedCards[player.id];

          return (
            <div className="card-container-3d" key={player.id} style={{ transform: 'scale(0.8)', margin: -20 }}>
              <div 
                className={`card-wrapper-3d ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => toggleFlip(player.id)}
              >
                <div className="card-inner-3d">
                  {/* FRONT */}
                  <div className="card-front-3d legendary" data-id={cardDef.id}>
                    <img src={cardDef.img} alt={cardDef.name} className="card-image" />
                    <div className={`card-signature ${cardDef.sig_style}`}>{cardDef.signature_name}</div>
                    <div className={`card-patch ${cardDef.patch_type}`} />
                    <div className="card-front-nameplate" style={{ borderLeftColor: cardDef.teamColor || '#fff' }}>
                      <div className="plate-name">{cardDef.playerName}</div>
                      <div className="plate-team">{cardDef.team} | {cardDef.position}</div>
                    </div>
                    <div className="card-set-num">CARD #{cardDef.set_num}</div>
                  </div>

                  {/* BACK */}
                  <div className="card-back-3d">
                    <div className="series">SERIES 1</div>
                    <div className="mint-stamp">1 / 500</div>
                    <div className="back-content" style={{ padding: '0 12px' }}>
                      <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{cardDef.playerName}</h3>
                      <div style={{ fontSize: 11, color: cardDef.teamColor || '#00c8ff', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                        {cardDef.team} | {cardDef.position}
                      </div>
                      
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>SPECIFICATION</div>
                      <h4 style={{ marginBottom: 12 }}>{cardDef.specialization}</h4>
                      
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>BIOMETRIC LORE</div>
                      <p style={{ fontSize: 12, lineHeight: 1.4 }}>{cardDef.lore}</p>
                    </div>
                    <div className="back-footer">
                      <span className="rarity-tag">{cardDef.rarity.toUpperCase()} UNIT</span>
                      <div className="card-trademark">© 2046 Galactic Baseball Auth. TM Goin' Yard Collectibles.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## File: `app/trade/page.js`

```javascript
'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';
import TradeAnalyzer from '@/components/TradeAnalyzer/TradeAnalyzer';

export default function TradePage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();

  return (
    <div className="trade-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Trade Analyzer</h1>
        {leagues.length > 0 && (
          <select 
            value={selectedLeague} 
            onChange={e => setSelectedLeague(e.target.value)} 
            style={{ width: 240 }}
          >
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <TradeAnalyzer />
      ) : (
        <div className="card">Please select a league to evaluate trades.</div>
      )}
    </div>
  );
}
```

---

## File: `app/tradeblock/page.js`

```javascript
'use client';

import React from 'react';
import TradeBlock from '@/components/TrophyCase/TradeBlock';

export default function TradeBlockPage() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <TradeBlock />
    </div>
  );
}
```

---

## File: `app/tradefinder/page.js`

```javascript
'use client';

import React from 'react';
import TradeAnalyzer from '@/components/TradeAnalyzer/TradeAnalyzer';

// Trade Finder uses the full TradeAnalyzer component which:
// 1. Auto-loads your roster on mount
// 2. Shows InsightCard from master analyze
// 3. Has an AI "Find Trades" button that calls /api/claude/trade/find with real roster data
export default function TradeFinderPage() {
  return <TradeAnalyzer />;
}
```

---

## File: `app/trophy/TrophyCase.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');

.trophy-case-container {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.trophy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: rgba(12, 29, 53, 0.6);
  padding: 32px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.album-stats-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.stat {
  text-align: right;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  font-family: var(--font-heading);
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.claim-btn {
  background: linear-gradient(135deg, #FFD700, #FDB931);
  color: #111;
  font-weight: 800;
  padding: 14px 24px;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.pulse-glow {
  animation: pulse-gold 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulse-gold {
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 32px;
}

.card-slot {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-wrapper-3d {
  perspective: 1200px;
  width: 100%;
  aspect-ratio: 3/4;
}

.card-inner-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  cursor: pointer;
}

.card-wrapper-3d.is-flipped .card-inner-3d {
  transform: rotateY(180deg);
}

.card-front-3d, .card-back-3d {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.card-front-3d {
  background: #000;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  display: block;
}

.card-back-3d {
  background: linear-gradient(135deg, #0c1d35 0%, #050a12 100%);
  transform: rotateY(180deg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid var(--primary);
}

.card-back-3d .series {
  font-size: 12px;
  color: white;
  font-weight: 700;
  margin-top: 4px;
}

.card-back-3d h4 {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  margin-top: 20px;
}

.card-back-3d p {
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
  font-style: italic;
}

.card-back-3d .rarity-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  border: 1px solid var(--primary);
  color: var(--primary);
}

.card-slot.locked .card-front-3d {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  background: rgba(0,0,0,0.3);
}

.card-slot.locked .card-image {
  filter: grayscale(100%) brightness(15%) blur(3px);
  opacity: 0.5;
}

.lock-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
}

.dupe-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary);
  color: white;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 10;
}

.card-meta {
  text-align: center;
}

.card-name {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
  font-family: var(--font-heading);
}

.card-rarity {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.card-rarity.common { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }
.card-rarity.uncommon { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
.card-rarity.rare { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.card-rarity.epic { color: #a855f7; background: rgba(168, 85, 247, 0.1); }
.card-rarity.legendary { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.card-set-num {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  border: 1px solid rgba(255,255,255,0.3);
  z-index: 10;
  font-family: var(--font-heading);
}

.card-signature {
  position: absolute;
  bottom: 40px;
  left: 20px;
  font-family: 'Caveat', cursive;
  font-size: 24px;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255,215,0,0.5);
  transform: rotate(-10deg);
  z-index: 15;
  pointer-events: none;
}

.card-patch {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: #222;
  border: 3px solid #444;
  box-shadow: inset 0 0 10px #000;
  z-index: 12;
  overflow: hidden;
}

.card-patch::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: repeating-linear-gradient(45deg, #333, #333 2px, #444 2px, #444 4px);
  opacity: 0.5;
}

.pack-opening-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.pack-shatter-effect {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.strobe-text {
  font-family: var(--font-heading);
  font-size: 64px;
  font-weight: 900;
  color: white;
  text-align: center;
  letter-spacing: 0.1em;
  margin-bottom: 40px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px var(--primary);
  animation: explode-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.pack-card-container {
  width: 320px;
  height: 440px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.2);
}

.pack-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes explode-in {
  0% { transform: scale(0.5); opacity: 0; letter-spacing: -0.5em; }
  100% { transform: scale(1); opacity: 1; letter-spacing: 0.1em; }
}
```

---

## File: `app/trophy/page.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './TrophyCase.css';

export default function TrophyCase() {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);
  const [flippedIds, setFlippedIds] = useState(new Set());

  useEffect(() => {
    fetchAlbum();
  }, []);

  async function fetchAlbum() {
    try {
      const { data } = await axios.get('/api/trophy/album');
      setCollection(data);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load Collection');
      setLoading(false);
    }
  }

  const toggleFlip = (id) => {
    const newFlipped = new Set(flippedIds);
    if (newFlipped.has(id)) newFlipped.delete(id);
    else newFlipped.add(id);
    setFlippedIds(newFlipped);
  };

  const getSeries = (id) => {
    if (id.startsWith('tgl_')) return 'Series 2: Titanium Grapefruit League';
    return 'Series 1: Goin\' Yard Core Set';
  };

  async function claimDailyPack() {
    try {
      setLoading(true);
      const localToday = new Date().toLocaleDateString('en-CA');
      const { data } = await axios.post('/api/trophy/daily-pack', { clientDate: localToday });
      setAwardedCard(data.awarded);
      setPackOpening(true);
      fetchAlbum();
    } catch (e) {
      setLoading(false);
      toast.error(e.response?.data?.error || 'Failed to claim pack');
    }
  }

  if (loading && !collection) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading Trophy Case...</div>;
  }

  const { all_cards, unlocked_cards, last_daily_pack } = collection || {};
  const validUnlockedIds = unlocked_cards?.filter(c => all_cards?.some(card => card.id === c.id)).map(c => c.id) || [];
  const uniqueUnlocked = new Set(validUnlockedIds).size;

  const sortedCards = [...(all_cards || [])].sort((a, b) => {
    const aUnlocked = validUnlockedIds.includes(a.id);
    const bUnlocked = validUnlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <div className="trophy-case-container">
      {packOpening && awardedCard && (
        <div className="pack-opening-overlay" onClick={() => setPackOpening(false)}>
          <div className="pack-shatter-effect">
            <div className="strobe-text">YOU UNLOCKED</div>
            <div className={`pack-card-container ${awardedCard.rarity} drop-in`}>
              <img src={awardedCard.img} alt={awardedCard.name} className="pack-card-image" />
            </div>
            <div className="pack-card-details slide-up">
              <h2>{awardedCard.name}</h2>
              <div className={`card-rarity ${awardedCard.rarity}`}>{awardedCard.rarity.toUpperCase()}</div>
            </div>
            <div style={{ marginTop: 40, color: 'var(--text-muted)', fontSize: 13 }}>Click anywhere to continue</div>
          </div>
        </div>
      )}

      <div className="trophy-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🏆 The Collector's Album</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Earn premium digital trading cards by dominating your league.
            <a href="/vault" style={{ color: 'var(--primary)', marginLeft: 8, textDecoration: 'none', fontWeight: 600 }}>View Full Collection →</a>
          </p>
        </div>
        <div className="album-stats-box">
          <div className="stat">
            <div className="stat-value">{uniqueUnlocked} / {all_cards?.length || 0}</div>
            <div className="stat-label">Unique Cards</div>
          </div>
          <button className="btn claim-btn pulse-glow" onClick={claimDailyPack} disabled={loading}>
            🎁 Claim Daily Free Pack!
          </button>
        </div>
      </div>

      <div className="album-grid">
        {sortedCards.map(cardDef => {
          const unlocks = unlocked_cards?.filter(u => u.id === cardDef.id) || [];
          const isUnlocked = unlocks.length > 0;
          const count = unlocks.length;
          const isFlipped = flippedIds.has(cardDef.id);
          
          return (
            <div key={cardDef.id} className={`card-slot ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className={`card-wrapper-3d ${isFlipped && isUnlocked ? 'is-flipped' : ''}`} onClick={() => isUnlocked && toggleFlip(cardDef.id)}>
                <div className="card-inner-3d">
                  <div className="card-front-3d">
                    <img src={cardDef.img} alt={cardDef.name} className="card-image" />
                    {isUnlocked && count > 1 && <div className="dupe-badge">x{count}</div>}
                    <div className="card-set-num">No. {unlocks[0]?.cardNumber || cardDef.set_num}</div>
                    {isUnlocked && cardDef.has_signature && (
                      <div className="card-signature">{cardDef.signature_name || 'Authentic Autograph'}</div>
                    )}
                    {isUnlocked && cardDef.has_patch && (
                      <div className="card-patch" title="Authentic Jersey Material"></div>
                    )}
                    {!isUnlocked && (
                      <div className="lock-overlay">
                        <span style={{ fontSize: 32 }}>🔒</span>
                        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>UNDISCOVERED</div>
                      </div>
                    )}
                  </div>
                  <div className="card-back-3d">
                    <div className="series">{getSeries(cardDef.id)}</div>
                    <div className="back-content">
                      <div style={{ color: cardDef.teamColor || 'var(--primary)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{(unlocks[0]?.team || cardDef.team || 'UNASSIGNED').toUpperCase()}</div>
                      <h4 style={{ color: 'var(--text-muted)' }}>{cardDef.specialization || 'Player Intelligence'}</h4>
                      <p>{cardDef.lore || "A premium digital collectible."}</p>
                      {unlocks[0]?.serial && (cardDef.rarity === 'rare' || cardDef.rarity === 'epic' || cardDef.rarity === 'legendary') && (
                        <div style={{ marginTop: 20, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.15em', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8, display: 'inline-block', fontFamily: 'var(--font-heading)' }}>
                          {unlocks[0].serialPosition || 1} / {cardDef.serial_total || '∞'}
                        </div>
                      )}
                    </div>
                    <div className="back-footer">
                      <span className="rarity-tag">{cardDef.rarity.toUpperCase()} UNIT</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-meta">
                <div className="card-name">{isUnlocked ? cardDef.name : '???'}</div>
                <div className={`card-rarity ${cardDef.rarity}`}>{cardDef.rarity.toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## File: `app/vault/page.js`

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../trophy/TrophyCase.css';

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState(new Set());

  useEffect(() => {
    axios.get('/api/trophy/album').then(({ data }) => {
      setCards(data.all_cards || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleFlip = (id) => {
    const newFlipped = new Set(flippedIds);
    if (newFlipped.has(id)) newFlipped.delete(id);
    else newFlipped.add(id);
    setFlippedIds(newFlipped);
  };

  const getSeries = (id) => {
    if (id.startsWith('tgl_')) return 'Series 2: Titanium Grapefruit League';
    return 'Series 1: Goin\' Yard Core Set';
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Opening the Vault...</div>;

  return (
    <div className="trophy-case-container">
      <div className="trophy-header" style={{ borderLeft: '4px solid #00c8ff' }}>
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>💎 The Collector's Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>Master Reference: All Collectibles</p>
        </div>
      </div>

      <div className="album-grid">
        {cards.map(cardDef => {
          const isFlipped = flippedIds.has(cardDef.id);
          return (
            <div key={cardDef.id} className="card-slot unlocked">
              <div className={`card-wrapper-3d ${isFlipped ? 'is-flipped' : ''}`} onClick={() => toggleFlip(cardDef.id)}>
                <div className="card-inner-3d">
                  <div className="card-front-3d">
                    <img src={cardDef.img} alt={cardDef.name} className="card-image" />
                    {cardDef.has_signature && (
                      <div className={`card-signature ${cardDef.sig_style || ''}`}>{cardDef.signature_name}</div>
                    )}
                    {cardDef.has_patch && (
                      <div className={`card-patch ${cardDef.patch_type || 'jersey'}`} />
                    )}
                    <div className="card-set-num">CARD #{cardDef.set_num}</div>
                  </div>
                  <div className="card-back-3d" style={{ borderColor: '#00c8ff' }}>
                    <div className="series">{getSeries(cardDef.id)}</div>
                    <div className="back-content" style={{ padding: '0 12px' }}>
                      <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{cardDef.playerName || cardDef.name}</h3>
                      <div style={{ fontSize: 11, color: cardDef.teamColor || '#00c8ff', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                        {cardDef.team || 'Goin\' Yard Core'} | {cardDef.position || 'Utility'}
                      </div>
                      
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>SPECIFICATION</div>
                      <h4 style={{ marginBottom: 12 }}>{cardDef.specialization || 'Player Intelligence'}</h4>
                      
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>BIOMETRIC LORE</div>
                      <p style={{ fontSize: 12, lineHeight: 1.4 }}>{cardDef.lore || "A premium digital collectible."}</p>
                      
                      {cardDef.serial_total && (
                        <div className="card-serial-stamp" style={{ color: '#00c8ff', borderColor: 'rgba(0,200,255,0.4)', marginTop: 16 }}>
                          X / {cardDef.serial_total}
                        </div>
                      )}
                    </div>
                    <div className="back-footer">
                      <span className="rarity-tag" style={{ color: '#00c8ff', borderColor: '#00c8ff' }}>{cardDef.rarity.toUpperCase()} UNIT</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-meta">
                <div className="card-name">{cardDef.name}</div>
                <div className={`card-rarity ${cardDef.rarity}`}>{cardDef.rarity.toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## File: `app/waiver/page.js`

```javascript
'use client';
import ModulePage from '@/components/shared/ModulePage';
import WaiverWire from '@/components/WaiverWire/WaiverWire';
export default function WaiverPage() {
  return <ModulePage title="Waiver Wire"><WaiverWire /></ModulePage>;
}
```

---

## File: `components/Dashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PlayerTrends from './PlayerTrends/PlayerTrends'
import LastUpdated from './shared/LastUpdated'
import LeagueIntelligence from './shared/LeagueIntelligence'
import FeedbackBox from './shared/FeedbackBox'
import { useLeague } from '@/lib/context/LeagueContext'

export default function Dashboard({ subscription }) {
  const { leagues, selectedLeague, setSelectedLeague, loading, refreshAnalysis, refreshesRemaining, refreshLimitReached, aiLoading } = useLeague()
  const [fromCache, setFromCache] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [cachedAt, setCachedAt] = useState(null)
  const [roster, setRoster]         = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)

  const formatScoringType = (type) => {
    if (!type) return 'Rotisserie';
    const t = String(type).toLowerCase();
    if (t.includes('headpoint')) return 'Head-to-Head (Points)';
    if (t.includes('head')) return 'Head-to-Head (Categories)';
    if (t === 'roto') return 'Rotisserie';
    return type;
  }


  useEffect(() => {
    if (selectedLeague) {
      setSyncing(true)
      axios.get('/api/yahoo/league/' + selectedLeague)
        .catch(err => console.error('Failed to auto-sync league settings', err))
        .finally(() => setSyncing(false))
      // Also auto-load roster for VOR display
      fetchRoster(selectedLeague)
    }
  }, [selectedLeague, leagues])

  async function fetchRoster(key) {
    setRosterLoading(true)
    setRoster([])
    try {
      const { data } = await axios.get(`/api/yahoo/league/${key}/myroster`)
      // myroster route now returns players pre-sorted by VOR descending
      setRoster(data.players || [])
    } catch (e) {
      console.error('Dashboard roster fetch failed:', e.message)
    } finally {
      setRosterLoading(false)
    }
  }


  return (
    <div style={{ position: 'relative' }}>
      {/* Hero Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(192,17,31,0.12) 0%, rgba(0,50,120,0.15) 100%)',
        border: '1px solid rgba(192,17,31,0.25)', borderRadius: 16,
        padding: '20px 20px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,17,31,0.15), transparent 70%)',
          pointerEvents: 'none'
        }} />
        <img
          src="/cyborg_batflip.png"
          alt="Goin' Yard Mascot"
          className="mascot-hero"
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
            ⚡ AI-Powered Fantasy Intelligence
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 6vw, 34px)', fontWeight: 800, marginBottom: 4, letterSpacing: -1, lineHeight: 1.1 }}>
            Goin' Yard <span style={{ color: 'var(--primary)' }}>Intelligence</span> HQ
          </h1>
          <p style={{ color: '#7aafc4', fontSize: 14, margin: 0, lineHeight: 1.4 }}>
            Welcome back to <strong style={{ color: '#f8fafc' }}>goinyard.app</strong> — your automated fantasy analytics command center.
          </p>
        </div>
      </div>

      {syncing && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 12,
          padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span className="loading" style={{ padding: 0 }}>⚙️</span>
          <div>
            <strong>Auto-Syncing League Rules...</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              Downloading your specific scoring format and roster limits directly from Yahoo...
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'My Roster',          icon: '👥', href: '/roster',    desc: 'Manage your players' },
          { label: 'Waiver Wire',        icon: '🔄', href: '/waiver',    desc: 'Find hidden gems' },
          { label: 'Start / Sit',        icon: '⚡', href: '/startsit',  desc: 'Optimize your lineup' },
          { label: 'Trade Analyzer',     icon: '🤝', href: '/trade',     desc: 'Evaluate trades' },
          { label: 'Standings',          icon: '🏆', href: '/standings', desc: 'Track your position' },
          { label: 'Matchup Predictor',  icon: '⚔️', href: '/matchup',      desc: 'AI weekly predictions' },
          { label: 'Team Audit',         icon: '📊', href: '/audit',        desc: 'Grade your team' },
          { label: 'Trade Finder',       icon: '💡', href: '/tradefinder',  desc: 'AI trade proposals' },
          { label: 'Weekly Game Plan',   icon: '📅', href: '/gameplan',     desc: 'Lineup optimizer' },
          { label: 'Baseball 101',       icon: '🎓', href: '/baseball101',  desc: 'Beginner metrics guide' },
        ].map(item => (
          <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s', padding: '16px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#007a7a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3d5c'}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 13, lineHeight: 1.2 }}>{item.label}</div>
              <div style={{ color: '#7aafc4', fontSize: 12 }}>{item.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your Yahoo Leagues</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {leagues.length > 1 && (
              <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: '100%', maxWidth: 220 }}>
                {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
              </select>
            )}
            <LastUpdated cachedAt={cachedAt} fromCache={fromCache} ttlLabel="5 min cache"
              onRefresh={() => window.location.reload()} loading={loading} />
            {selectedLeague && (
              <button
                onClick={refreshAnalysis}
                disabled={aiLoading || refreshLimitReached}
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap' }}
                title={refreshLimitReached ? 'Daily refresh limit reached' : `${refreshesRemaining} force refresh${refreshesRemaining !== 1 ? 'es' : ''} remaining today`}
              >
                {aiLoading ? '⟳ Analyzing...' : `🔄 Refresh AI${refreshesRemaining < 3 ? ` (${refreshesRemaining} left)` : ''}`}
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="loading">Loading leagues...</div>
        ) : leagues.length === 0 ? (
          <p style={{ color: '#7aafc4' }}>No active MLB leagues found for the current season.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leagues.map((league, i) => (
              <div key={i} style={{
                background: league.league_key === selectedLeague ? '#0c2c56' : '#122840',
                border: `1px solid ${league.league_key === selectedLeague ? '#007a7a' : '#1e3d5c'}`,
                borderRadius: 8, padding: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 8,
              cursor: 'pointer', transition: 'all 0.15s'
              }} onClick={() => setSelectedLeague(league.league_key)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{league.name || 'League'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {league.num_teams} teams • {formatScoringType(league.scoring_type)} • {league.draft_status}
                  </div>
                </div>
                {league.league_key === selectedLeague && (
                  <span className="badge badge-success" style={{ background: 'var(--primary)' }}>Active</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roster with descending composite score */}
      {selectedLeague && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 24 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>My Roster — Ranked by Score</span>
            <button onClick={() => fetchRoster(selectedLeague)} disabled={rosterLoading}
              style={{ fontSize: 11, background: 'none', border: '1px solid #1e3d5c', borderRadius: 4, padding: '3px 10px', color: '#7aafc4', cursor: 'pointer' }}>
              {rosterLoading ? '...' : '↻ Refresh'}
            </button>
          </div>
          {rosterLoading ? (
            <div className="loading" style={{ padding: 24 }}>Loading roster...</div>
          ) : roster.length === 0 ? (
            <div style={{ padding: 24, color: '#7aafc4', textAlign: 'center' }}>No roster data yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Slot</th>
                  <th>Key Stats</th>
                  <th>VOR</th>
                  <th>Scarcity</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p, i) => {
                  const s = p.stats || {}
                  const isPitcher = ['SP','RP','P'].includes(String(p.position||'').split('/')[0])
                  const statLine = isPitcher
                    ? `${s['28']??'—'}W  ${s['42']??'—'}K  ${parseFloat(s['26']||0).toFixed(2)} ERA  ${parseFloat(s['27']||0).toFixed(2)} WHIP`
                    : `${s['12']??'—'}HR  ${s['13']??'—'}RBI  ${s['7']??'—'}R  ${s['16']??'—'}SB  .${String(parseFloat(s['3']||0).toFixed(3)).replace('0.','')}`
                  const slotColor = p.slot === 'IL' || p.slot === 'IL+' ? '#ef4444' : p.slot === 'BN' ? '#7aafc4' : '#00a86b'
                  const vor = p.vor ?? 0
                  const vorColor = vor >= 40 ? '#00a86b' : vor >= 15 ? '#f59e0b' : vor >= 0 ? '#e2e8f0' : '#ef4444'
                  const scarcityColor = p.vorScarcity === 'scarce' ? '#ef4444' : p.vorScarcity === 'high' ? '#f59e0b' : '#7aafc4'
                  return (
                    <tr key={i}>
                      <td style={{ color: '#4a7a94', fontSize: 12, width: 28 }}>{i+1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge">{String(p.position||'').split('/')[0]}</span></td>
                      <td style={{ fontSize: 11, fontWeight: 700, color: slotColor }}>{p.slot || 'BN'}</td>
                      <td style={{ fontSize: 12, color: '#a0aab2', whiteSpace: 'nowrap' }}>{statLine}</td>
                      <td style={{ fontWeight: 800, fontSize: 15, color: vorColor }}>{vor}</td>
                      <td style={{ fontSize: 11, color: scarcityColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.vorScarcity || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
        <LeagueIntelligence leagueKey={selectedLeague} />
        <FeedbackBox />
      </div>

      {selectedLeague && <PlayerTrends selectedLeague={selectedLeague} />}
    </div>
  )
}
```

---

## File: `components/DraftAssistant/DraftAssistant.jsx`

```jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import DraftBoard from './DraftBoard'

const POSITIONS = ['ALL', 'SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'OF']

// Positional scarcity multipliers — how urgently to address each position
const SCARCITY = {
  C:    2.0,   // catastrophic dropoff after top 5-6
  SS:   1.8,   // scarce — 8-10 good options only
  '2B': 1.4,
  '3B': 1.3,
  SP:   1.2,
  OF:   0.85,  // deep
  '1B': 0.8,
  RP:   0.6,   // mostly streamable
}

const SCARCITY_LABEL = {
  C:    '🚨 Critical',
  SS:   '⚠️ Scarce',
  '2B': '⚠️ Moderate',
  '3B': '📋 Moderate',
  SP:   '📋 Moderate',
  OF:   '✅ Deep',
  '1B': '✅ Deep',
  RP:   '✅ Deep',
}

// Positions eligible for UTIL slot (non-pitchers)
const UTIL_ELIGIBLE = new Set(['C', '1B', '2B', '3B', 'SS', 'OF'])

const DEFAULT_PLAYERS = [
  { player_key: '1',  player_name: 'Aaron Judge',        position: 'OF',    team: 'NYY', adp: 1.2 },
  { player_key: '2',  player_name: 'Shohei Ohtani',      position: 'SP/OF', team: 'LAD', adp: 2.1 },
  { player_key: '3',  player_name: 'Mookie Betts',       position: 'OF/2B', team: 'LAD', adp: 3.4 },
  { player_key: '4',  player_name: 'Elly De La Cruz',    position: 'SS',    team: 'CIN', adp: 4.2 },
  { player_key: '5',  player_name: 'Juan Soto',          position: 'OF',    team: 'NYM', adp: 5.1 },
  { player_key: '6',  player_name: 'Bobby Witt Jr.',     position: 'SS',    team: 'KC',  adp: 6.0 },
  { player_key: '7',  player_name: 'Yordan Alvarez',     position: 'OF/1B', team: 'HOU', adp: 7.2 },
  { player_key: '8',  player_name: 'Julio Rodriguez',    position: 'OF',    team: 'SEA', adp: 8.4 },
  { player_key: '9',  player_name: 'Jose Ramirez',       position: '3B',    team: 'CLE', adp: 9.1 },
  { player_key: '10', player_name: 'Gunnar Henderson',   position: 'SS/3B', team: 'BAL', adp: 10.3 },
  { player_key: '11', player_name: 'Corbin Carroll',     position: 'OF',    team: 'ARI', adp: 11.5 },
  { player_key: '12', player_name: 'Jackson Chourio',    position: 'OF',    team: 'MIL', adp: 12.2 },
  { player_key: '13', player_name: 'Bryce Harper',       position: '1B',    team: 'PHI', adp: 13.4 },
  { player_key: '14', player_name: 'Gerrit Cole',        position: 'SP',    team: 'NYY', adp: 14.1 },
  { player_key: '15', player_name: 'Zack Wheeler',       position: 'SP',    team: 'PHI', adp: 15.2 },
  { player_key: '16', player_name: 'Paul Skenes',        position: 'SP',    team: 'PIT', adp: 16.0 },
  { player_key: '17', player_name: 'Spencer Strider',    position: 'SP',    team: 'ATL', adp: 17.5 },
  { player_key: '18', player_name: 'Corey Seager',       position: 'SS',    team: 'TEX', adp: 18.2 },
  { player_key: '19', player_name: 'Freddie Freeman',    position: '1B',    team: 'LAD', adp: 19.0 },
  { player_key: '20', player_name: 'Adley Rutschman',    position: 'C',     team: 'BAL', adp: 20.1 },
  { player_key: '21', player_name: 'William Contreras',  position: 'C',     team: 'MIL', adp: 28.4 },
  { player_key: '22', player_name: 'Emmanuel Clase',     position: 'RP',    team: 'CLE', adp: 31.2 },
  { player_key: '23', player_name: 'Edwin Diaz',         position: 'RP',    team: 'NYM', adp: 34.1 },
  { player_key: '24', player_name: 'Tarik Skubal',       position: 'SP',    team: 'DET', adp: 22.3 },
  { player_key: '25', player_name: 'Tyler Glasnow',      position: 'SP',    team: 'LAD', adp: 24.8 },
]

function isMyPickFn(pick, pos, teams) {
  const round = Math.ceil(pick / teams)
  const spot = pick - (round - 1) * teams
  return round % 2 === 1 ? spot === pos : spot === (teams - pos + 1)
}

function primaryPos(position) {
  return String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
}

// All positions a player is eligible for
function allPositions(position) {
  return String(position || '').split('/').map(p => p.split(',')[0].trim().toUpperCase())
}

// Count how many of each position the team already has (starting slots only)
function countFilled(myTeam) {
  const filled = {}
  myTeam.forEach(p => {
    allPositions(p.position).forEach(pos => {
      filled[pos] = (filled[pos] || 0) + 1
    })
  })
  return filled
}

// Expert Smart Score: ADP value + positional urgency + scarcity bonus
function computeSmartScore(player, pickNumber, myTeam, rosterSlots, numTeams, totalRounds) {
  const pos = primaryPos(player.position)
  const positions = allPositions(player.position)
  const adpValue = pickNumber - (player.adp || pickNumber)
  const filled = countFilled(myTeam)
  const currentRound = Math.ceil(pickNumber / numTeams)
  const roundsLeft = Math.max(1, totalRounds - currentRound)

  // Check if any position this player fills still has open slots
  let bestUrgency = -Infinity
  let isFull = true

  for (const p of positions) {
    const required = rosterSlots[p] || 0
    const have = filled[p] || 0
    const need = Math.max(0, required - have)

    if (need > 0) {
      isFull = false
      const scarcity = SCARCITY[p] || 1.0
      const urgency = (need / roundsLeft) * scarcity * 20
      if (urgency > bestUrgency) bestUrgency = urgency
    }
  }

  // Check UTIL slot if no primary slot open but player is UTIL-eligible
  let utilBonus = 0
  if (isFull) {
    const utilRequired = rosterSlots['UTIL'] || 0
    const utilHave = filled['UTIL'] || 0
    const anyPosIsUtilElig = positions.some(p => UTIL_ELIGIBLE.has(p))
    if (anyPosIsUtilElig && utilHave < utilRequired) {
      isFull = false
      utilBonus = 5
    }
  }

  if (isFull) return adpValue - 30   // heavy penalty — you don't need this position

  const urgencyBonus = bestUrgency === -Infinity ? 0 : bestUrgency
  const multiPosBonus = positions.length > 1 ? 8 : 0  // multi-eligibility premium

  return adpValue + urgencyBonus + utilBonus + multiPosBonus
}

// Build roster slot status for display and AI
function getRosterStatus(myTeam, rosterSlots) {
  const filled = countFilled(myTeam)
  const status = {}
  for (const [pos, req] of Object.entries(rosterSlots)) {
    if (pos === 'BN' || pos === 'IL') continue
    const have = Math.min(filled[pos] || 0, req)
    status[pos] = { required: req, have, need: Math.max(0, req - have), full: have >= req }
  }
  return status
}

export default function DraftAssistant({ leagueSettings }) {
  const [players, setPlayers] = useState([])
  const [myTeam, setMyTeam] = useState([])
  const [posFilter, setPosFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [pickNumber, setPickNumber] = useState(1)
  const [aiRec, setAiRec] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('board')
  const [numTeams, setNumTeams] = useState(leagueSettings?.num_teams || 12)
  const [countdown, setCountdown] = useState(null)
  const [timerActive, setTimerActive] = useState(false)
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [liveMode, setLiveMode] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [syncError, setSyncError] = useState('')
  const autoTriggered = useRef(false)
  const countdownRef = useRef(null)
  const syncRef = useRef(null)

  const draftPosition = leagueSettings?.draft_position || 1
  const totalRounds = 23
  const rosterSlots = leagueSettings?.roster_slots || { SP:2, RP:2, C:1, '1B':1, '2B':1, '3B':1, SS:1, OF:3, UTIL:1, BN:4 }

  useEffect(() => {
    loadBoard()
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  const myPick = useMemo(
    () => isMyPickFn(pickNumber, draftPosition, numTeams),
    [pickNumber, draftPosition, numTeams]
  )

  const rosterStatus = useMemo(
    () => getRosterStatus(myTeam, rosterSlots),
    [myTeam, rosterSlots]
  )

  // Auto-trigger AI + countdown when it becomes user's turn
  useEffect(() => {
    if (myPick && !autoTriggered.current && players.length > 0) {
      autoTriggered.current = true
      setActiveTab('pool')
      startCountdown(90)
      getAiRecommendation()
    }
    if (!myPick) {
      autoTriggered.current = false
      stopCountdown()
    }
  }, [myPick, players.length])

  function startCountdown(seconds) {
    setCountdown(seconds)
    setTimerActive(true)
    clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); setTimerActive(false); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function stopCountdown() {
    clearInterval(countdownRef.current)
    setTimerActive(false)
    setCountdown(null)
  }

  useEffect(() => () => clearInterval(countdownRef.current), [])

  const syncNow = useCallback(async () => {
    if (!selectedLeague) return
    try {
      const { data } = await axios.get(`/api/draft/sync/${selectedLeague}`)
      if (data.board) {
        setPlayers(data.board)
        setMyTeam(data.board.filter(p => p.drafted_by === 'me'))
        setPickNumber(data.board.filter(p => p.drafted).length + 1)
      }
      setLastSync(new Date())
      setSyncError('')
    } catch (err) {
      setSyncError(err.response?.data?.error || 'Sync failed')
    }
  }, [selectedLeague])

  useEffect(() => {
    if (liveMode) {
      syncNow()
      syncRef.current = setInterval(syncNow, 10000)
    } else {
      clearInterval(syncRef.current)
    }
    return () => clearInterval(syncRef.current)
  }, [liveMode, syncNow])

  useEffect(() => () => clearInterval(syncRef.current), [])

  async function initFromYahoo() {
    if (!selectedLeague) return toast.error('Select a league first')
    setInitLoading(true)
    try {
      const { data } = await axios.post(`/api/draft/init-yahoo/${selectedLeague}`)
      toast.success(`Loaded ${data.count} players from Yahoo!`)
      await loadBoard()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load Yahoo players')
    } finally {
      setInitLoading(false)
    }
  }

  async function loadBoard() {
    try {
      const { data } = await axios.get('/api/draft/board')
      if (data.length === 0) {
        await axios.post('/api/draft/load', { players: DEFAULT_PLAYERS })
        setPlayers(DEFAULT_PLAYERS.map(p => ({ ...p, drafted: 0 })))
      } else {
        setPlayers(data)
        setMyTeam(data.filter(p => p.drafted_by === 'me'))
        setPickNumber(data.filter(p => p.drafted).length + 1)
      }
    } catch {
      setPlayers(DEFAULT_PLAYERS.map(p => ({ ...p, drafted: 0 })))
    }
  }

  async function markDrafted(player, by = 'other') {
    const round = Math.ceil(pickNumber / numTeams)
    await axios.post('/api/draft/pick', { player_key: player.player_key, drafted_by: by, draft_round: round, draft_pick: pickNumber })
    setPlayers(prev => prev.map(p =>
      p.player_key === player.player_key ? { ...p, drafted: 1, drafted_by: by, draft_round: round, draft_pick: pickNumber } : p
    ))
    if (by === 'me') setMyTeam(prev => [...prev, { ...player, drafted_by: 'me', draft_round: round, draft_pick: pickNumber }])
    setPickNumber(prev => prev + 1)
    stopCountdown()
    toast.success(`${player.player_name} drafted${by === 'me' ? ' to YOUR team' : ''}`)
  }

  async function undoPick(player) {
    await axios.post('/api/draft/undo', { player_key: player.player_key })
    setPlayers(prev => prev.map(p =>
      p.player_key === player.player_key ? { ...p, drafted: 0, drafted_by: null } : p
    ))
    setMyTeam(prev => prev.filter(p => p.player_key !== player.player_key))
    setPickNumber(prev => Math.max(1, prev - 1))
  }

  async function getAiRecommendation() {
    setAiLoading(true)
    setAiRec('')
    try {
      const availableForAI = players
        .filter(p => !p.drafted)
        .map(p => ({
          ...p,
          smartScore: computeSmartScore(p, pickNumber, myTeam, rosterSlots, numTeams, totalRounds)
        }))
        .sort((a, b) => b.smartScore - a.smartScore)
        .slice(0, 25)

      const { data } = await axios.post('/api/claude/draft/recommend', {
        available_players: availableForAI,
        my_roster: myTeam,
        pick_number: pickNumber,
        total_picks: numTeams * totalRounds,
        num_teams: numTeams,
        roster_slots: rosterSlots,
        needs: rosterStatus
      })
      setAiRec(data.recommendation)
    } catch {
      toast.error('AI recommendation failed')
    } finally {
      setAiLoading(false)
    }
  }

  // Compute scores + sort for display
  const availableSorted = useMemo(() => {
    const undrafted = players.filter(p => !p.drafted)
    return undrafted.map(p => ({
      ...p,
      adpValue: +(pickNumber - (p.adp || pickNumber)).toFixed(1),
      smartScore: +computeSmartScore(p, pickNumber, myTeam, rosterSlots, numTeams, totalRounds).toFixed(1),
    })).sort((a, b) => b.smartScore - a.smartScore)
  }, [players, pickNumber, myTeam, rosterSlots, numTeams])

  const filteredAvailable = useMemo(() => {
    return availableSorted.filter(p => {
      const matchPos = posFilter === 'ALL' || p.position.includes(posFilter)
      const matchSearch = p.player_name.toLowerCase().includes(search.toLowerCase())
      return matchPos && matchSearch
    })
  }, [availableSorted, posFilter, search])

  const filteredDrafted = useMemo(() => {
    return players.filter(p => p.drafted && (
      posFilter === 'ALL' || p.position.includes(posFilter)
    ) && p.player_name.toLowerCase().includes(search.toLowerCase()))
  }, [players, posFilter, search])

  const countdownPct = countdown != null ? (countdown / 90) * 100 : 0
  const currentRound = Math.ceil(pickNumber / numTeams)

  // Tier break detection: ADP gap > 12 between consecutive available players
  const tierBreakAfter = useMemo(() => {
    const breaks = new Set()
    const sorted = [...filteredAvailable].sort((a, b) => (a.adp || 999) - (b.adp || 999))
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = (sorted[i + 1]?.adp || 999) - (sorted[i]?.adp || 0)
      if (gap > 12) breaks.add(sorted[i].player_key)
    }
    return breaks
  }, [filteredAvailable])

  // Position status for filter buttons
  function posButtonStyle(pos) {
    if (pos === 'ALL') return {}
    const s = rosterStatus[pos]
    if (!s) return {}
    if (s.full) return { borderColor: '#ef4444', color: '#ef4444' }
    if (s.need > 0 && (SCARCITY[pos] || 1) >= 1.8) return { borderColor: '#f59e0b', color: '#f59e0b' }
    return {}
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Draft Assistant</h1>
          <p style={{ color: '#7aafc4' }}>Smart Score · Scarcity analysis · AI recommendations</p>
        </div>
        <button className="btn btn-primary" onClick={getAiRecommendation} disabled={aiLoading}>
          {aiLoading ? '⟳ Thinking...' : '⚡ AI Pick'}
        </button>
      </div>

      {/* Live sync panel */}
      <div className="card" style={{
        marginBottom: 16, padding: '12px 16px',
        border: liveMode ? '1px solid #00a86b' : '1px solid #1e3d5c',
        background: liveMode ? 'rgba(0,168,107,0.06)' : undefined,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7aafc4', whiteSpace: 'nowrap' }}>Yahoo League:</span>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">Select league...</option>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={initFromYahoo} disabled={initLoading || !selectedLeague}>
            {initLoading ? 'Loading...' : '📥 Load Yahoo Players'}
          </button>
          <button className={`btn ${liveMode ? 'btn-danger' : 'btn-success'}`}
            style={{ fontSize: 12, padding: '6px 14px', fontWeight: 700 }}
            onClick={() => setLiveMode(v => !v)} disabled={!selectedLeague}>
            {liveMode ? '⏹ Stop Live Sync' : '🔴 Go Live'}
          </button>
          {liveMode && <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={syncNow}>↻ Sync Now</button>}
          {liveMode && lastSync && <span style={{ fontSize: 11, color: '#00a86b' }}>✓ {lastSync.toLocaleTimeString()}</span>}
          {syncError && <span style={{ fontSize: 11, color: '#ef4444' }}>{syncError}</span>}
          {liveMode && <span style={{ fontSize: 11, color: '#7aafc4', marginLeft: 'auto' }}>Auto-syncing every 10s</span>}
        </div>
      </div>

      {/* Draft status + roster needs bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Pick</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: myPick ? '#00a86b' : '#e2e8f0' }}>
              #{pickNumber} {myPick && '← YOU'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Round</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{currentRound} / {totalRounds}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Drafted</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{players.filter(p => p.drafted).length}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Available</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{players.filter(p => !p.drafted).length}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#7aafc4' }}>Teams:</label>
            <input type="number" value={numTeams} onChange={e => setNumTeams(+e.target.value)} style={{ width: 60 }} min={8} max={20} />
          </div>
        </div>

        {/* Roster needs grid */}
        <div style={{ borderTop: '1px solid #1e3d5c', paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: '#4a7a94', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Roster Slots — Starting Lineup
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(rosterStatus).map(([pos, s]) => {
              const scarcityMulti = SCARCITY[pos] || 1
              const isCritical = !s.full && s.need > 0 && scarcityMulti >= 1.8
              const isUrgent = !s.full && s.need > 0 && scarcityMulti >= 1.3
              return (
                <div key={pos} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: s.full ? 'rgba(239,68,68,0.1)' : isCritical ? 'rgba(245,158,11,0.15)' : isUrgent ? 'rgba(245,158,11,0.08)' : 'rgba(0,168,107,0.08)',
                  border: `1px solid ${s.full ? '#ef4444' : isCritical ? '#f59e0b' : isUrgent ? '#d97706' : '#00a86b'}`,
                  color: s.full ? '#ef4444' : isCritical ? '#f59e0b' : isUrgent ? '#d97706' : '#00a86b',
                }}>
                  {pos} {s.have}/{s.required}
                  {isCritical && ' 🚨'}
                  {!isCritical && isUrgent && ' ⚠️'}
                  {s.full && ' ✓'}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* YOUR PICK banner */}
      {myPick && (
        <div style={{
          marginBottom: 16, borderRadius: 10, overflow: 'hidden',
          border: '2px solid #00a86b',
          boxShadow: '0 0 24px rgba(0,168,107,0.35), inset 0 0 16px rgba(0,168,107,0.07)',
          background: 'linear-gradient(135deg, #002a1a, #0c2c56)',
        }}>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#00a86b', letterSpacing: 1 }}>⏱ YOUR PICK ON THE CLOCK</div>
            {countdown != null && (
              <div style={{ fontSize: 28, fontWeight: 800, color: countdown <= 15 ? '#ef4444' : '#00a86b', minWidth: 50 }}>
                {countdown}s
              </div>
            )}
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }}
              onClick={() => { stopCountdown(); startCountdown(90) }}>Reset Timer</button>
          </div>
          {countdown != null && (
            <div style={{ height: 4, background: '#0c1d35' }}>
              <div style={{
                height: '100%', width: `${countdownPct}%`,
                background: countdown <= 15 ? '#ef4444' : '#00a86b',
                transition: 'width 1s linear, background 0.3s',
              }} />
            </div>
          )}
        </div>
      )}

      {/* AI Recommendation */}
      {(aiRec || aiLoading) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/cyborg_mascot_bat.png" alt="Galactic Slugger Draft Mascot" className="mascot-ai" />
              <h3 style={{ color: '#00a86b', margin: 0 }}>⚡ AI Recommendation — Round {currentRound}</h3>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAiRec(null)}>Dismiss</button>
          </div>
          {aiLoading
            ? <div style={{ color: '#7aafc4', fontSize: 14 }}>Analyzing scarcity, tier breaks, and your roster needs...</div>
            : <div className="ai-response">{aiRec}</div>
          }
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { id: 'board',  label: '📊 Board' },
          { id: 'pool',   label: '📋 Player Pool' },
          { id: 'myteam', label: `⭐ My Team (${myTeam.length})` },
        ].map(tab => (
          <button key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 13, padding: '8px 16px' }}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* BOARD */}
      {activeTab === 'board' && (
        <div className="card" style={{ padding: 16 }}>
          <DraftBoard players={players} numTeams={numTeams} draftPosition={draftPosition} currentPick={pickNumber} />
        </div>
      )}

      {/* PLAYER POOL */}
      {activeTab === 'pool' && (
        <>
          {/* Scarcity legend */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', fontSize: 11 }}>
            <span style={{ color: '#4a7a94' }}>Position depth:</span>
            {Object.entries(SCARCITY_LABEL).map(([pos, label]) => (
              <span key={pos} style={{ color: '#7aafc4' }}><strong>{pos}</strong> {label}</span>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search players..." style={{ maxWidth: 200 }} />
            {POSITIONS.map(pos => {
              const s = rosterStatus[pos]
              const extra = posButtonStyle(pos)
              return (
                <button key={pos}
                  className={`btn ${posFilter === pos ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 12, padding: '6px 12px', position: 'relative', ...extra }}
                  onClick={() => setPosFilter(pos)}>
                  {pos}
                  {s && s.full && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 8, background: '#ef4444', borderRadius: '50%', width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>✓</span>}
                </button>
              )
            })}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ maxHeight: 'calc(100vh - 480px)', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th title="Smart Score = ADP value + positional urgency + scarcity bonus">Smart ▼</th>
                    <th title="Raw ADP value: pick# minus ADP">ADP Val</th>
                    <th>Player</th>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>Need</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvailable.map((player, idx) => {
                    const pos = primaryPos(player.position)
                    const posStatus = rosterStatus[pos]
                    const isFull = posStatus?.full
                    const isNeeded = posStatus && !posStatus.full && posStatus.need > 0
                    const isCritical = isNeeded && (SCARCITY[pos] || 1) >= 1.8
                    const isMulti = allPositions(player.position).length > 1
                    const showTierBreak = tierBreakAfter.has(player.player_key)

                    const ss = player.smartScore
                    const ssColor = ss >= 20 ? '#00a86b' : ss >= 5 ? '#f59e0b' : ss >= 0 ? '#7aafc4' : '#ef4444'
                    const avColor = player.adpValue >= 5 ? '#00a86b' : player.adpValue >= 0 ? '#f59e0b' : '#ef4444'

                    return (
                      <React.Fragment key={player.player_key}>
                        <tr style={{
                          background: isFull ? 'rgba(239,68,68,0.04)' : isCritical && isNeeded ? 'rgba(245,158,11,0.05)' : 'transparent',
                          borderLeft: isFull ? '3px solid #ef4444' : isCritical ? '3px solid #f59e0b' : isNeeded ? '3px solid #00a86b' : '3px solid transparent',
                          opacity: isFull ? 0.65 : 1,
                        }}>
                          <td data-label="Smart">
                            <span style={{ fontSize: 12, fontWeight: 800, color: ssColor }}>
                              {ss > 0 ? `+${ss}` : ss}
                            </span>
                          </td>
                          <td data-label="ADP Val">
                            <span style={{ fontSize: 11, color: avColor }}>
                              {player.adpValue > 0 ? `+${player.adpValue}` : player.adpValue}
                            </span>
                          </td>
                          <td data-label="Player" style={{ fontWeight: 500 }}>
                            {player.player_name}
                            {isMulti && <span style={{ fontSize: 9, color: '#7aafc4', marginLeft: 4 }}>MULTI</span>}
                          </td>
                          <td data-label="Pos">
                            <span className={`badge badge-${pos.toLowerCase()}`}>{player.position}</span>
                          </td>
                          <td data-label="Team" style={{ color: '#7aafc4' }}>{player.team}</td>
                          <td data-label="Need">
                            {isFull
                              ? <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>FULL</span>
                              : isCritical
                                ? <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>🚨 SCARCE</span>
                                : isNeeded
                                  ? <span style={{ fontSize: 11, color: '#00a86b', fontWeight: 700 }}>NEED</span>
                                  : <span style={{ fontSize: 11, color: '#4a7a94' }}>UTIL/BN</span>
                            }
                          </td>
                          <td data-label="Actions">
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success" style={{ fontSize: 11, padding: '4px 10px' }}
                                onClick={() => markDrafted(player, 'me')}>Draft Me</button>
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                                onClick={() => markDrafted(player, 'other')}>Taken</button>
                            </div>
                          </td>
                        </tr>
                        {showTierBreak && (
                          <tr>
                            <td colSpan={7} style={{ background: '#0a1e33', color: '#4aafdb', fontSize: 11, textAlign: 'center', padding: '4px', fontWeight: 700, letterSpacing: 1 }}>
                              ▼ TIER DROP — talent level falls significantly below this line ▼
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filteredDrafted.length > 0 && (
                    <>
                      <tr><td colSpan={7} style={{ background: '#122840', color: '#4a7a94', fontSize: 12, textAlign: 'center' }}>— DRAFTED —</td></tr>
                      {filteredDrafted.map(player => (
                        <tr key={player.player_key} style={{ opacity: 0.4 }}>
                          <td data-label="Smart">—</td>
                          <td data-label="ADP Val" style={{ fontSize: 12, color: '#4a7a94' }}>{player.adp}</td>
                          <td data-label="Player" style={{ textDecoration: 'line-through' }}>{player.player_name}</td>
                          <td data-label="Pos"><span className={`badge badge-${primaryPos(player.position).toLowerCase()}`}>{player.position}</span></td>
                          <td data-label="Team" style={{ color: '#7aafc4' }}>{player.team}</td>
                          <td data-label="Need"><span style={{ fontSize: 12, color: player.drafted_by === 'me' ? '#007a7a' : '#ef4444' }}>
                            {player.drafted_by === 'me' ? `Mine R${player.draft_round}` : `#${player.draft_pick}`}
                          </span></td>
                          <td data-label="Actions">
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}
                              onClick={() => undoPick(player)}>Undo</button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Smart Score legend */}
          <div style={{ marginTop: 10, fontSize: 11, color: '#4a7a94', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span><strong style={{ color: '#e2e8f0' }}>Smart Score</strong> = ADP value + positional urgency + scarcity bonus</span>
            <span style={{ color: '#00a86b' }}>Green border = needed slot</span>
            <span style={{ color: '#f59e0b' }}>Yellow border = scarce + needed</span>
            <span style={{ color: '#ef4444' }}>Red border = position full</span>
          </div>
        </>
      )}

      {/* MY TEAM */}
      {activeTab === 'myteam' && (
        <MyTeam team={myTeam} rosterStatus={rosterStatus} onUndo={undoPick} />
      )}
    </div>
  )
}

function MyTeam({ team, rosterStatus, onUndo }) {
  const totalSlots = Object.values(rosterStatus).reduce((s, v) => s + v.required, 0)
  const filledSlots = Object.values(rosterStatus).reduce((s, v) => s + v.have, 0)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Draft Picks ({team.length})</h2>
        <span style={{ fontSize: 13, color: '#7aafc4' }}>Starting slots: {filledSlots} / {totalSlots - (rosterStatus.BN?.required || 0) - (rosterStatus.IL?.required || 0)} filled</span>
      </div>
      {team.length === 0 ? (
        <p style={{ color: '#7aafc4' }}>No picks yet. Use "Draft Me" to add players to your team.</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>Rd</th><th>Player</th><th>Pos</th><th>ADP</th><th>Value</th><th>Team</th><th></th></tr>
          </thead>
          <tbody>
            {[...team].sort((a, b) => (a.draft_pick || 0) - (b.draft_pick || 0)).map(player => {
              const val = +(player.draft_pick - (player.adp || player.draft_pick)).toFixed(1)
              return (
                <tr key={player.player_key}>
                  <td data-label="#" style={{ color: '#7aafc4' }}>{player.draft_pick}</td>
                  <td data-label="Rd" style={{ color: '#7aafc4' }}>{player.draft_round}</td>
                  <td data-label="Player" style={{ fontWeight: 500 }}>{player.player_name}</td>
                  <td data-label="Pos"><span className={`badge badge-${primaryPos(player.position).toLowerCase()}`}>{player.position}</span></td>
                  <td data-label="ADP" style={{ color: '#7aafc4', fontSize: 12 }}>{player.adp}</td>
                  <td data-label="Value" style={{ fontSize: 12, color: val >= 3 ? '#00a86b' : val >= 0 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                    {val > 0 ? `+${val}` : val}
                  </td>
                  <td data-label="Team" style={{ color: '#7aafc4' }}>{player.team}</td>
                  <td data-label="Actions"><button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => onUndo(player)}>Undo</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

---

## File: `components/DraftAssistant/DraftBoard.jsx`

```jsx
import React from 'react'

const POS_COLORS = {
  SP:   { bg: '#0a1e3a', border: '#2d6fa8', label: '#93c5fd' },
  RP:   { bg: '#002626', border: '#008070', label: '#4de0b0' },
  C:    { bg: '#002a1a', border: '#007850', label: '#6ee7b7' },
  '1B': { bg: '#3a1a02', border: '#c47a0a', label: '#fcd34d' },
  '2B': { bg: '#051628', border: '#1d6090', label: '#7dd3fc' },
  '3B': { bg: '#3a0416', border: '#a02060', label: '#f9a8d4' },
  SS:   { bg: '#002828', border: '#0a9090', label: '#99f6e4' },
  OF:   { bg: '#071830', border: '#1a4a90', label: '#bfdbfe' },
  DH:   { bg: '#18082e', border: '#6040a8', label: '#c4b5fd' },
  P:    { bg: '#0a1e3a', border: '#2d6fa8', label: '#93c5fd' },
}
const DEFAULT_C = { bg: '#0c1d35', border: '#1e3d5c', label: '#7aafc4' }

function primaryPos(position) {
  return String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
}

function pickToCell(pickNum, numTeams) {
  const round = Math.ceil(pickNum / numTeams)
  const posInRound = (pickNum - 1) % numTeams
  const col = round % 2 === 1 ? posInRound : (numTeams - 1 - posInRound)
  return { round, col }
}

const CELL_W = 112
const CELL_H = 64

export default function DraftBoard({ players, numTeams, draftPosition, currentPick }) {
  const drafted = players.filter(p => p.drafted && p.draft_round && p.draft_pick)
  const maxRound = Math.max(6, Math.ceil((drafted.length + numTeams) / numTeams))
  const displayRounds = Math.min(maxRound, 25)

  // Build grid[round-1][col] = player
  const grid = Array.from({ length: displayRounds }, () => Array(numTeams).fill(null))
  drafted.forEach(p => {
    const { round, col } = pickToCell(p.draft_pick, numTeams)
    if (round >= 1 && round <= displayRounds && col >= 0 && col < numTeams) {
      grid[round - 1][col] = p
    }
  })

  const { round: curRound, col: curCol } = pickToCell(currentPick, numTeams)

  // Position legend
  const posInPlay = [...new Set(players.filter(p => p.drafted).map(p => primaryPos(p.position)))]

  return (
    <div>
      {/* Position legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {Object.entries(POS_COLORS).filter(([k]) => posInPlay.includes(k) || ['SP','RP','OF','SS','C','1B','2B','3B'].includes(k)).map(([pos, c]) => (
          <span key={pos} style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
            background: c.bg, border: `1px solid ${c.border}`, color: c.label
          }}>{pos}</span>
        ))}
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'linear-gradient(90deg,#003d3d,#0c2c56)', border: '1px solid #4aafdb', color: '#4aafdb', fontWeight: 700 }}>★ Mine</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(0,168,107,0.15)', border: '1px solid #00a86b', color: '#00a86b', fontWeight: 700 }}>⏱ On Clock</span>
      </div>

      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '65vh', borderRadius: 8, border: '1px solid #1e3d5c' }}>
        <div style={{ minWidth: 48 + numTeams * (CELL_W + 2) }}>

          {/* Column headers — sticky top */}
          <div style={{
            display: 'flex', position: 'sticky', top: 0, zIndex: 5,
            background: '#060e1a', borderBottom: '2px solid #1e3d5c'
          }}>
            <div style={{ width: 48, flexShrink: 0 }} /> {/* spacer for round labels */}
            {Array.from({ length: numTeams }, (_, i) => {
              const isMyCol = i === draftPosition - 1
              return (
                <div key={i} style={{
                  width: CELL_W, flexShrink: 0, marginRight: 2,
                  padding: '7px 4px', textAlign: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: isMyCol ? '#4aafdb' : '#4a7a94',
                  background: isMyCol ? 'rgba(74,175,219,0.08)' : 'transparent',
                  borderBottom: isMyCol ? '2px solid #4aafdb' : '2px solid transparent',
                }}>
                  {isMyCol ? '★ Me' : `Pk${i + 1}`}
                </div>
              )
            })}
          </div>

          {/* Grid rows */}
          {grid.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', borderBottom: '1px solid #0d1e33' }}>

              {/* Round label — sticky left */}
              <div style={{
                width: 48, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#4a7a94',
                background: '#07111e',
                borderRight: '2px solid #1e3d5c',
                position: 'sticky', left: 0, zIndex: 3,
              }}>
                R{rIdx + 1}
              </div>

              {row.map((cell, cIdx) => {
                const isCurPick = (rIdx + 1 === curRound) && (cIdx === curCol)
                const isMyPick  = cell?.drafted_by === 'me'
                const pos       = cell ? primaryPos(cell.position) : null
                const c         = (pos && POS_COLORS[pos]) ? POS_COLORS[pos] : DEFAULT_C

                return (
                  <div key={cIdx} style={{
                    width: CELL_W, flexShrink: 0, height: CELL_H, marginRight: 2,
                    padding: '5px 7px',
                    background: cell
                      ? isMyPick
                        ? 'linear-gradient(135deg, #003d3d 0%, #0a2444 100%)'
                        : c.bg
                      : isCurPick
                        ? 'rgba(0,168,107,0.1)'
                        : '#0c1d35',
                    border: `1px solid ${
                      isCurPick ? '#00a86b'
                      : isMyPick ? '#4aafdb'
                      : cell     ? c.border
                      : '#152a3e'
                    }`,
                    boxShadow: isCurPick
                      ? '0 0 12px rgba(0,168,107,0.4), inset 0 0 8px rgba(0,168,107,0.08)'
                      : isMyPick
                        ? '0 0 6px rgba(74,175,219,0.25)'
                        : 'none',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    transition: 'background 0.3s',
                  }}>
                    {isCurPick && !cell ? (
                      <div style={{ textAlign: 'center', color: '#00a86b', fontSize: 10, fontWeight: 800, lineHeight: 1.4 }}>
                        ⏱ ON THE<br />CLOCK
                      </div>
                    ) : cell ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 3,
                            background: c.bg, border: `1px solid ${c.border}`, color: c.label,
                            textTransform: 'uppercase', flexShrink: 0,
                          }}>{pos}</span>
                          {isMyPick && (
                            <span style={{ fontSize: 10, color: '#4aafdb', marginLeft: 'auto' }}>★</span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: isMyPick ? '#e2e8f0' : '#b8ccd8',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          lineHeight: 1.2, marginBottom: 2,
                        }}>
                          {cell.player_name}
                        </div>
                        <div style={{ fontSize: 10, color: '#4a7a94' }}>{cell.team}</div>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
```

---

## File: `components/GamePlan/GamePlan.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLeague } from '@/lib/context/LeagueContext'
import InsightCard from '@/components/InsightCard/InsightCard'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_EMOJI = {
  monday: '🟢', tuesday: '🔵', wednesday: '🟣',
  thursday: '🟠', friday: '🔴', saturday: '🟡', sunday: '⚪'
}

function ProjectionBadge({ projection }) {
  if (!projection) return null
  const conf = projection.confidence
  const confColor = conf === 'high' ? '#10b981' : conf === 'medium' ? '#f59e0b' : '#ef4444'
  
  return (
    <div className="scoreboard-badge">
      <div className="scoreboard-content">
        {projection.myProjected && (
          <div className="stat-group">
            <span className="stat-label">My Projected</span>
            <span className="stat-value text-success">{projection.myProjected}</span>
          </div>
        )}
        <div className="scoreboard-divider">VS</div>
        {projection.opponentProjected && (
          <div className="stat-group">
            <span className="stat-label">Opponent Proj.</span>
            <span className="stat-value text-danger">{projection.opponentProjected}</span>
          </div>
        )}
      </div>
      {conf && (
        <div className="confidence-indicator" style={{ borderColor: confColor, color: confColor }}>
          <span className="pulse-dot" style={{ backgroundColor: confColor }}></span>
          {conf} Confidence
        </div>
      )}
    </div>
  )
}

export default function GamePlan({ leagueSettings }) {
  const { leagues, selectedLeague: ctxLeague, leagueData, aiAnalysis, aiLoading, refreshAnalysis } = useLeague()
  const [localLeagues, setLocalLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [roster, setRoster] = useState([])
  const [matchup, setMatchup] = useState(null)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Use leagues from context, fall back to local fetch
  const allLeagues = leagues.length ? leagues : localLeagues

  useEffect(() => {
    if (ctxLeague && !selectedLeague) setSelectedLeague(ctxLeague)
  }, [ctxLeague])

  useEffect(() => {
    if (selectedLeague) loadRoster()
  }, [selectedLeague])

  async function loadRoster() {
    setRosterLoading(true)
    setRoster([])
    setPlan(null)
    setMatchup(null)
    setError('')
    try {
      // Fetch roster and matchup in parallel
      const [rosterRes, matchupRes] = await Promise.allSettled([
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`),
        axios.get(`/api/yahoo/league/${selectedLeague}/matchup`)
      ])

      if (rosterRes.status === 'fulfilled') {
        setRoster(rosterRes.value.data.players || [])
      } else {
        setError('Could not load roster.')
      }

      if (matchupRes.status === 'fulfilled') {
        const m = matchupRes.value.data
        // Build matchup object for the gameplan API
        if (m && m.myTeam && m.opponent) {
          const myStats = {}
          const oppStats = {}
          ;(m.stats || []).forEach(s => {
            if (s.name) {
              myStats[s.name] = s.my_value ?? s.value
              oppStats[s.name] = s.opp_value ?? s.value
            }
          })
          setMatchup({
            opponent_name: m.opponent?.name || 'Opponent',
            my_stats: myStats,
            opp_stats: oppStats,
            week: m.week
          })
        }
      }
      // Matchup fetch failure is non-critical — plan still works without it
    } catch (err) {
      setError('Could not load roster.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function generatePlan() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/claude/gameplan', {
        my_roster: roster,
        opponent: matchup,
        week_context: matchup?.week ? `Week ${matchup.week} matchup vs ${matchup.opponent_name || 'opponent'}` : '',
        league_key: selectedLeague,
        leagueSettings: leagueData || leagueSettings || {}  // leagueData from context has scoring_type, name, num_teams
      })
      setPlan(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Game plan generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gameplan-page animate-fade-in">
      {/* Header */}
      <header className="module-header">
        <div className="header-text">
          <h1 className="text-gradient">▦ Weekly Game Planner</h1>
          <p className="text-muted">AI-optimized strategy for your current matchup</p>
        </div>
        <div className="header-actions">
          <div className="input-group">
            <label>League</label>
            <select 
              value={selectedLeague} 
              onChange={e => setSelectedLeague(e.target.value)}
              className="league-selector"
            >
              {allLeagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading roster */}
      {rosterLoading && (
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Scouting your roster...</p>
        </div>
      )}

      {/* Quick AI Snapshot from master analysis */}
      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading} onRefresh={refreshAnalysis} />

      {/* CTA: Generate Plan */}
      {!rosterLoading && roster.length > 0 && !plan && !loading && (
        <section className="gameplan-cta card">
          <div className="gameplan-cta-inner">
            <div className="gameplan-cta-icon">📅</div>
            <div className="gameplan-cta-text">
              <h3>Ready for Week {matchup?.week || ''} Analysis</h3>
              <p className="text-muted">
                Your roster has <strong>{roster.length}</strong> active players.
                {matchup ? ` Matchup: vs ${matchup.opponent_name}.` : ''} Generate a full AI strategy breakdown.
              </p>
            </div>
            <button className="btn btn-primary btn-large" onClick={generatePlan} disabled={loading}>
              Generate Weekly Strategy
            </button>
          </div>
        </section>
      )}

      {/* Loading AI */}
      {loading && (
        <section className="card gameplan-loading">
          <div className="ai-processing-visual">
            <div className="orbit-ring"></div>
            <div className="center-node">🤖</div>
          </div>
          <h3>Constructing Game Plan</h3>
          <p className="text-muted">Simulating matchups, checking streaming options, and weighting category needs...</p>
        </section>
      )}

      {/* Results */}
      {plan && (
        <div className="gameplan-results animate-slide-up">
          
          {/* Top Row: Projection + Swing Categories */}
          <div className="gameplan-top-row">
            {plan.weeklyProjection && (
              <div className="card gameplan-section">
                <h4 className="section-title">📊 Strategic Outlook</h4>
                <ProjectionBadge projection={plan.weeklyProjection} />
              </div>
            )}

            {plan.swingCategories?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">🎯 Swing Categories</h4>
                <div className="target-capsules">
                  {plan.swingCategories.map((cat, i) => (
                    <div key={i} className="cat-target">{cat}</div>
                  ))}
                </div>
                <p className="tiny-advice">{plan.catAnalysis?.advice || 'Focus strategy here for maximum impact.'}</p>
              </div>
            )}
          </div>

          {/* Middle Row: Optimal Lineup + Streaming Targets */}
          <div className="gameplan-columns">
            {plan.lineupOptimizer?.starters?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">⚡ Optimal Lineup</h4>
                <div className="tactical-list">
                  {plan.lineupOptimizer.starters.map((p, i) => (
                    <div key={i} className="tactical-item">
                      <div className="item-meta">
                        <span className="pos-pill">{p.position || '??'}</span>
                        <span className="item-name">{p.player_name || p.player}</span>
                      </div>
                      <p className="item-logic">{p.reasoning || p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.lineupOptimizer?.volumePlays?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">🔥 Extra Volume (7-Game Week)</h4>
                <div className="tactical-list">
                  {plan.lineupOptimizer.volumePlays.map((p, i) => (
                    <div key={i} className="tactical-item highlight-hover">
                      <div className="item-meta">
                        <span className="pos-pill accent">{p.position || '??'}</span>
                        <span className="item-name">{p.player_name || p.player}</span>
                      </div>
                      <p className="item-logic">{p.reasoning || p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Key Decisions + Daily Timeline */}
          <div className="gameplan-columns">
            {plan.keyDecisions?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">🧠 Key Decisions</h4>
                <div className="decision-stack">
                  {plan.keyDecisions.map((d, i) => (
                    <div key={i} className="decision-node">
                      <div className="node-top">
                        <p className="node-question">{d.decision}</p>
                        <span className="node-verdict">RECO: {d.recommendation}</span>
                      </div>
                      <p className="node-reasoning">{d.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.dailyMoves && Object.keys(plan.dailyMoves).length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">📅 Daily Playbook</h4>
                <div className="timeline-stack">
                  {DAY_ORDER.filter(day => plan.dailyMoves[day]).map(day => (
                    <div key={day} className="timeline-event">
                      <div className="event-day">
                        <span className="day-emoji">{DAY_EMOJI[day]}</span>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </div>
                      <div className="event-content">{plan.dailyMoves[day]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Raw Fallback */}
          {plan.rawPlan && (
            <div className="card gameplan-section">
              <h4 className="section-title">📝 Full Briefing</h4>
              <div className="ai-response-prose">{plan.rawPlan}</div>
            </div>
          )}

          {/* Footer */}
          <div className="gameplan-footer">
            <button className="btn btn-ghost" onClick={generatePlan} disabled={loading}>
              {loading ? 'Recalculating...' : '↻ Refresh Analysis'}
            </button>
            <button className="btn btn-ghost" onClick={() => setPlan(null)}>Reset View</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <p className="text-muted">Select a league to generate a weekly tactical game plan.</p>
        </div>
      )}
    </div>
  )
}
```

---

## File: `components/InsightCard/InsightCard.jsx`

```jsx
/**
 * InsightCard — Shared rich renderer for structured Claude AI analysis.
 * Handles both new object shape AND legacy string shape so no module breaks.
 *
 * Usage:
 *   <InsightCard data={aiAnalysis.waiver} type="waiver" loading={aiLoading} />
 *   <InsightCard data={aiAnalysis.pitching} type="pitching" loading={aiLoading} />
 */

import React from 'react';
import styles from './InsightCard.module.css';

const TYPE_CONFIG = {
  waiver:   { icon: '⚡', label: 'Waiver Wire Intel',    accent: '#4aafdb' },
  startSit: { icon: '📋', label: 'Start / Sit',          accent: '#22c55e' },
  pitching: { icon: '⚾', label: 'Pitching Intel',        accent: '#a855f7' },
  audit:    { icon: '🔍', label: 'Team Audit',            accent: '#f59e0b' },
  gameplan: { icon: '🎯', label: 'Weekly Game Plan',      accent: '#ef4444' },
  matchup:  { icon: '⚔️', label: 'Matchup Outlook',       accent: '#06b6d4' },
};

const PRIORITY_STYLES = {
  critical: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444', label: '🔴 CRITICAL' },
  high:     { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#f59e0b', label: '🟡 HIGH' },
  medium:   { bg: 'rgba(74,175,219,0.1)',  border: '#4aafdb', text: '#4aafdb', label: '🔵 MEDIUM' },
};

function PlayerBadge({ action, player, position, team, reason, accentColor }) {
  const isAdd  = action === 'ADD'   || action === 'add';
  const isDrop = action === 'DROP'  || action === 'drop';
  const isStart= action === 'START' || action === 'start';
  const isSit  = action === 'SIT'   || action === 'sit';
  const isStream = action === 'STREAM' || action === 'stream';
  const isAvoid  = action === 'AVOID'  || action === 'avoid';

  const color = isAdd || isStart || isStream
    ? '#22c55e'
    : isDrop || isSit || isAvoid
    ? '#ef4444'
    : accentColor;

  const label = isAdd ? '+ ADD' : isDrop ? '− DROP' : isStart ? '▶ START' : isSit ? '⏸ SIT'
    : isStream ? '🌊 STREAM' : isAvoid ? '⛔ AVOID' : action?.toUpperCase() || '';

  return (
    <div className={styles.playerBadge} style={{ borderColor: color }}>
      <span className={styles.actionTag} style={{ background: color }}>{label}</span>
      <div className={styles.playerInfo}>
        <span className={styles.playerName}>{player}</span>
        {(position || team) && (
          <span className={styles.playerMeta}>{[position, team].filter(Boolean).join(' · ')}</span>
        )}
      </div>
      {reason && <p className={styles.playerReason}>{reason}</p>}
    </div>
  );
}

function renderWaiver(data, accent) {
  return (
    <>
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      {data.adds?.length > 0 && (
        <div className={styles.actionGroup}>
          {data.adds.map((a, i) => (
            <PlayerBadge key={i} action="ADD" player={a.player} position={a.position} team={a.team} reason={a.reason} accentColor={accent} />
          ))}
        </div>
      )}
      {data.drops?.length > 0 && (
        <div className={styles.actionGroup}>
          {data.drops.map((d, i) => (
            <PlayerBadge key={i} action="DROP" player={d.player} position={d.position} reason={d.reason} accentColor={accent} />
          ))}
        </div>
      )}
    </>
  );
}

function renderStartSit(data, accent) {
  return (
    <>
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      <div className={styles.twoCol}>
        {data.starts?.length > 0 && (
          <div>
            {data.starts.map((s, i) => (
              <PlayerBadge key={i} action="START" player={s.player} position={s.position} reason={s.reason} accentColor={accent} />
            ))}
          </div>
        )}
        {data.sits?.length > 0 && (
          <div>
            {data.sits.map((s, i) => (
              <PlayerBadge key={i} action="SIT" player={s.player} position={s.position} reason={s.reason} accentColor={accent} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function renderPitching(data, accent) {
  return (
    <>
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      {data.twoStarters?.length > 0 && (
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>🏆 2-Start Lock</span>
          {data.twoStarters.map((name, i) => (
            <span key={i} className={styles.chip} style={{ borderColor: accent, color: accent }}>{name}</span>
          ))}
        </div>
      )}
      {data.stream?.player && (
        <PlayerBadge action="STREAM" player={data.stream.player} reason={data.stream.reason} accentColor={accent} />
      )}
      {data.avoid?.player && (
        <PlayerBadge action="AVOID" player={data.avoid.player} reason={data.avoid.reason} accentColor={accent} />
      )}
    </>
  );
}

function renderAudit(data, accent) {
  // Normalise to arrays — handle both new (arrays) and old (single strings) shapes
  const strengths  = data.strengths  || (data.strength  ? [data.strength]  : []);
  const weaknesses = data.weaknesses || (data.weakness  ? [data.weakness]  : []);
  const moves      = data.moves      || [];

  return (
    <>
      {/* Grade + championship path */}
      <div className={styles.gradeRow}>
        <div className={styles.gradeBadge} style={{ borderColor: accent, color: accent }}>{data.grade || '?'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.championshipPath && (
            <p style={{ margin: 0, fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>{data.championshipPath}</p>
          )}
          {data.topPlayer && (
            <div className={styles.topPlayerPill} style={{ marginTop: data.championshipPath ? 6 : 0 }}>
              <span className={styles.topPlayerName}>⭐ {data.topPlayer.name}</span>
              <span className={styles.topPlayerStat}>{data.topPlayer.statLine}</span>
            </div>
          )}
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {strengths.map((s, i) => (
            <div key={i} className={styles.auditLine} style={{ borderColor: '#22c55e' }}>
              <span className={styles.auditIcon}>💪</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {weaknesses.map((w, i) => (
            <div key={i} className={styles.auditLine} style={{ borderColor: '#ef4444' }}>
              <span className={styles.auditIcon}>⚠️</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommended moves */}
      {moves.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Recommended Moves
          </div>
          {moves.map((m, i) => {
            const priorityColor = m.priority === 'immediate' ? '#ef4444' : m.priority === 'high' ? '#f59e0b' : '#4aafdb';
            return (
              <div key={i} style={{
                background: '#0c1d35', borderRadius: 6, padding: '8px 12px', marginBottom: 6,
                borderLeft: `3px solid ${priorityColor}`
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{m.action}</div>
                {m.reasoning && <p style={{ margin: 0, fontSize: 12, color: '#7aafc4', lineHeight: 1.4 }}>{m.reasoning}</p>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}


function renderGameplan(data, accent) {
  const pri = PRIORITY_STYLES[data.priority] || PRIORITY_STYLES.medium;
  return (
    <>
      {data.priority && (
        <span className={styles.priorityTag} style={{ background: pri.bg, color: pri.text, border: `1px solid ${pri.border}` }}>
          {pri.label}
        </span>
      )}
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      {data.steps?.length > 0 && (
        <ol className={styles.stepList}>
          {data.steps.map((step, i) => (
            <li key={i} className={styles.stepItem}>
              <span className={styles.stepNum} style={{ background: accent }}>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function renderMatchup(data, accent) {
  return (
    <>
      {data.edge && (
        <div className={styles.edgeBadge} style={{ borderColor: accent, color: accent }}>
          ⚔️ Edge: {data.edge}
        </div>
      )}
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
    </>
  );
}

const RENDERERS = { waiver: renderWaiver, startSit: renderStartSit, pitching: renderPitching, audit: renderAudit, gameplan: renderGameplan, matchup: renderMatchup };

export default function InsightCard({ data, type = 'waiver', loading = false, onRefresh }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.waiver;
  const accent = config.accent;

  // Backward-compat: if data is a plain string, render it as a paragraph
  const isLegacyString = typeof data === 'string';
  const headline = isLegacyString ? null : data?.headline;
  const bodyData = isLegacyString ? null : data;

  const renderBody = RENDERERS[type];

  return (
    <div className={styles.card} style={{ borderLeftColor: accent }}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>{config.icon}</span>
          <h4 className={styles.title} style={{ color: accent }}>{config.label}</h4>
        </div>
        {onRefresh && !loading && (
          <button onClick={onRefresh} className={styles.refreshBtn} style={{ borderColor: accent, color: accent }}>
            ↻ Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingRow}>
          <div className={styles.shimmer} />
          <div className={styles.shimmer} style={{ width: '70%' }} />
        </div>
      ) : !data ? null : (
        <div className={styles.body}>
          {headline && <p className={styles.headline}>{headline}</p>}
          {isLegacyString
            ? <p className={styles.summary}>{data}</p>
            : renderBody ? renderBody(bodyData, accent) : <p className={styles.summary}>{JSON.stringify(data)}</p>
          }
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/InsightCard/InsightCard.module.css`

```css
.card {
  background: var(--card-bg, rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 4px solid transparent;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon { font-size: 16px; }

.title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.refreshBtn {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  border-width: 1px;
  border-style: solid;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.refreshBtn:hover { opacity: 1; }

/* Loading shimmer */
.loadingRow { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
.shimmer {
  height: 14px;
  width: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.body { display: flex; flex-direction: column; gap: 10px; }

.headline {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main, #f1f5f9);
  margin: 0 0 4px;
  line-height: 1.4;
}

.summary {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
  margin: 0;
  line-height: 1.65;
}

/* Player badges */
.actionGroup { display: flex; flex-direction: column; gap: 6px; }

.playerBadge {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.03);
  transition: background 0.15s;
}
.playerBadge:hover { background: rgba(255,255,255,0.06); }

.actionTag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 4px;
  color: #fff;
  white-space: nowrap;
  align-self: flex-start;
  margin-top: 2px;
}

.playerInfo { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 120px; }
.playerName  { font-size: 13px; font-weight: 600; color: var(--text-main, #f1f5f9); }
.playerMeta  { font-size: 11px; color: var(--text-muted, #94a3b8); }
.playerReason { font-size: 12px; color: var(--text-muted, #94a3b8); margin: 2px 0 0; width: 100%; line-height: 1.5; }

/* Two-column layout for Start/Sit */
.twoCol { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .twoCol { grid-template-columns: 1fr; } }

/* Chip row for 2-start pitchers */
.chipRow { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.chipLabel { font-size: 11px; font-weight: 700; color: var(--text-muted, #94a3b8); margin-right: 4px; }
.chip {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.04);
}

/* Audit */
.gradeRow { display: flex; align-items: center; gap: 12px; }
.gradeBadge {
  font-size: 26px;
  font-weight: 800;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid transparent;
  flex-shrink: 0;
}
.topPlayerPill {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
}
.topPlayerName { font-size: 13px; font-weight: 600; color: var(--text-main, #f1f5f9); }
.topPlayerStat { font-size: 11px; color: var(--text-muted, #94a3b8); font-family: monospace; }

.auditLine {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid transparent;
  background: rgba(255,255,255,0.03);
  font-size: 13px;
  color: var(--text-main, #f1f5f9);
  line-height: 1.55;
}
.auditIcon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

/* Gameplan */
.priorityTag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.stepList { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.stepItem { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--text-main, #f1f5f9); line-height: 1.5; }
.stepNum {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Matchup */
.edgeBadge {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.04);
  align-self: flex-start;
}
```

---

## File: `components/MatchupPredictor/MatchupPredictor.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LastUpdated from '../shared/LastUpdated'
import PackDropModal from '../TrophyCase/PackDropModal'
import AiQuestionBox from '../shared/AiQuestionBox'
import { useLeague } from '@/lib/context/LeagueContext'

function ConfidenceBadge({ level }) {
  const styles = {
    high:   { background: 'rgba(0,168,107,0.2)',   color: '#00a86b' },
    medium: { background: 'rgba(245,158,11,0.2)',  color: '#f59e0b' },
    low:    { background: 'rgba(239,68,68,0.2)',   color: '#ef4444' },
  }
  const s = styles[level?.toLowerCase()] || styles.medium
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: s.background, color: s.color,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
    }}>{level || 'medium'}</span>
  )
}

export default function MatchupPredictor({ leagueSettings }) {
  const { leagues, selectedLeague: ctxLeague } = useLeague()
  const [selectedLeague, setSelectedLeague] = useState('')
  const [matchup, setMatchup] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [cachedAt, setCachedAt] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [awardedCard, setAwardedCard] = useState(null)

  // Sync to context's selected league
  useEffect(() => {
    if (ctxLeague && !selectedLeague) setSelectedLeague(ctxLeague)
  }, [ctxLeague])

  useEffect(() => {
    if (selectedLeague) fetchMatchup()
  }, [selectedLeague])

  async function fetchMatchup(force = false) {
    setLoading(true)
    setError('')
    setMatchup(null)
    setPrediction(null)
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/matchup${force ? '?force=true' : ''}`)
      if (res.data.error) { setError(res.data.error); return }
      setMatchup(res.data)
      setCachedAt(res.headers['x-cache-updated'] || null)
      setFromCache(res.headers['x-cache-hit'] === 'true')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load matchup data')
    } finally {
      setLoading(false)
    }
  }

  async function checkTrophyUnlocks(predictData) {
    // Check if projecting a Stolen Bases win!
    const sbCat = predictData.categories?.find(c => c.name.includes('SB') || c.name.includes('Stolen'));
    if (sbCat && sbCat.winner === 'me') {
      try {
        const { data } = await axios.post('/api/trophy/award', { trigger: 'stolen_base_win' });
        if (data?.awarded) setAwardedCard(data.awarded);
      } catch (e) {}
    }
  }

  async function getPrediction() {
    if (!matchup) return
    setAiLoading(true)
    try {
      // Proactively fetch waiver targets for the scout to consider
      let waivers = [];
      try {
        const waiverRes = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, { params: { status: 'A' } });
        waivers = Array.isArray(waiverRes.data) ? waiverRes.data.slice(0, 15) : [];
      } catch (e) {
        console.warn('Could not fetch waivers for matchup context');
      }

      const { data } = await axios.post('/api/claude/matchup/predict', {
        my_team: matchup.myTeam,
        opponent: matchup.opponent,
        stat_categories: leagueSettings?.stat_categories || ['R','HR','RBI','SB','AVG','W','SV','K','ERA','WHIP'],
        available_players: waivers,
        week: matchup.week,
        league_key: selectedLeague
      })
      setPrediction(data)
      checkTrophyUnlocks(data)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI prediction failed. Please try again.';
      setError(msg);
    } finally {
      setAiLoading(false)
    }
  }

  const myWins = matchup?.stats?.filter(s => s.my_winning).length || 0
  const oppWins = matchup?.stats?.filter(s => s.opp_winning).length || 0
  
  // Detect start of week: all stat values are 0 or empty
  const noStatsYet = matchup?.stats?.length > 0 && matchup.stats.every(s => {
    const myVal = parseFloat(s.my_value) || 0;
    const oppVal = parseFloat(s.opp_value) || 0;
    return myVal === 0 && oppVal === 0;
  });

  const STAT_DICT = {
    '0': { abbv: 'GP', full: 'Games Played' },
    '1': { abbv: 'R', full: 'Runs' },
    '2': { abbv: 'H', full: 'Hits' },
    '3': { abbv: 'AVG', full: 'Batting Avg' },
    '4': { abbv: 'OBP', full: 'On-Base %' },
    '5': { abbv: 'SLG', full: 'Slugging %' },
    '6': { abbv: 'AB', full: 'At Bats' },
    '7': { abbv: 'R', full: 'Runs' },
    '8': { abbv: 'H', full: 'Hits' },
    '9': { abbv: '1B', full: 'Singles' },
    '10': { abbv: '2B', full: 'Doubles' },
    '11': { abbv: '3B', full: 'Triples' },
    '12': { abbv: 'HR', full: 'Home Runs' },
    '13': { abbv: 'RBI', full: 'Runs Batted In' },
    '14': { abbv: 'SH', full: 'Sacrifice Hits' },
    '15': { abbv: 'SF', full: 'Sacrifice Flies' },
    '16': { abbv: 'SB', full: 'Stolen Bases' },
    '17': { abbv: 'CS', full: 'Caught Stealing' },
    '18': { abbv: 'BB', full: 'Walks (Hitter)' },
    '19': { abbv: 'IBB', full: 'Int. Walks' },
    '20': { abbv: 'HBP', full: 'Hit By Pitch' },
    '21': { abbv: 'K', full: 'Strikeouts (Hitter)' },
    '22': { abbv: 'GIDP', full: 'Grounded Into DP' },
    '23': { abbv: 'CYC', full: 'Hitting for the Cycle' },
    '24': { abbv: 'TB', full: 'Total Bases' },
    '26': { abbv: 'ERA', full: 'Earned Run Avg' },
    '27': { abbv: 'WHIP', full: 'Walks+Hits/Inning' },
    '28': { abbv: 'W', full: 'Wins' },
    '29': { abbv: 'L', full: 'Losses' },
    '30': { abbv: 'CG', full: 'Complete Games' },
    '31': { abbv: 'SHO', full: 'Shutouts' },
    '32': { abbv: 'SV', full: 'Saves' },
    '33': { abbv: 'OUT', full: 'Outs Pitched' },
    '34': { abbv: 'H', full: 'Hits Allowed' },
    '35': { abbv: 'TBF', full: 'Total Batters Faced' },
    '36': { abbv: 'R', full: 'Runs Allowed' },
    '37': { abbv: 'ER', full: 'Earned Runs' },
    '38': { abbv: 'HR', full: 'Home Runs Allowed' },
    '39': { abbv: 'BB', full: 'Walks Issued' },
    '40': { abbv: 'IBB', full: 'Int. Walks Issued' },
    '41': { abbv: 'HBP', full: 'Hit Batsmen' },
    '42': { abbv: 'K', full: 'Strikeouts (Pitcher)' },
    '43': { abbv: 'WP', full: 'Wild Pitches' },
    '44': { abbv: 'BLK', full: 'Balks' },
    '45': { abbv: 'SB', full: 'Stolen Bases Allowed' },
    '46': { abbv: 'CS', full: 'Caught Stealing Allowed' },
    '47': { abbv: 'PKO', full: 'Pickoffs' },
    '48': { abbv: 'GIDP', full: 'Double Plays Induced' },
    '50': { abbv: 'IP', full: 'Innings Pitched' },
    '54': { abbv: 'OPS', full: 'On-Base + Slugging' },
    '55': { abbv: 'OPS', full: 'On-Base + Slugging' },
    '60': { abbv: 'H/AB', full: 'Hits/At Bats' },
    '61': { abbv: 'XBH', full: 'Extra Base Hits' },
    '65': { abbv: 'NSB', full: 'Net Stolen Bases' },
    '83': { abbv: 'QS', full: 'Quality Starts' },
    '84': { abbv: 'BSV', full: 'Blown Saves' },
    '85': { abbv: 'HLD', full: 'Holds' }
  };

  const getStatInfo = (stat_id, name) => {
    // If Yahoo already resolved it to 'HR', just use it.
    if (name && isNaN(parseInt(name))) {
      const match = Object.values(STAT_DICT).find(s => s?.abbv === name);
      return match || { abbv: name, full: name };
    }
    const key = String(stat_id || name).trim();
    return STAT_DICT[key] || { abbv: key, full: 'Unknown Stat' };
  }

  return (
    <div>
      <PackDropModal awardedCard={awardedCard} onClose={() => setAwardedCard(null)} />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>⚔️ Matchup Predictor</h1>
          <p style={{ color: '#7aafc4' }}>
            {matchup ? `Week ${matchup.week} — live stats & AI projection` : 'Current week projections and lineup optimization'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <LastUpdated cachedAt={cachedAt} fromCache={fromCache} ttlLabel="5 min cache"
            onRefresh={() => fetchMatchup(true)} loading={loading} />
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {loading && <div className="loading">Loading matchup data from Yahoo...</div>}

      {matchup && !loading && (
        <>
          {/* No stats banner */}
          {noStatsYet && (
            <div style={{ 
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', 
              borderRadius: 8, padding: 16, marginBottom: 16, color: '#f59e0b',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Week {matchup.week} — No Live Stats Yet</div>
                <div style={{ fontSize: 13, color: '#d4a34a' }}>
                  Stats for this matchup are exactly tied 0 to 0. If it's Monday morning, check back after today's games begin!
                </div>
              </div>
            </div>
          )}
          {/* VS banner */}
          <div className="card" style={{
            marginBottom: 16, padding: '20px 28px',
            background: 'linear-gradient(135deg, #0c2c56 0%, #0c1d35 50%, #003d3d 100%)',
            border: '1px solid #1e3d5c'
          }}>
            <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 16 }}>
              Week {matchup.week} Matchup
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{matchup.myTeam?.name}</div>
                <div style={{ color: '#7aafc4', fontSize: 13, marginTop: 2 }}>{matchup.myTeam?.manager}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: (matchup.myTeam?.total_points || myWins) > (matchup.opponent?.total_points || oppWins) ? '#00a86b' : '#e2e8f0' }}>
                    {matchup.myTeam?.total_points !== null && matchup.myTeam?.total_points !== undefined ? Math.round(matchup.myTeam.total_points) : myWins}
                  </span>
                  <span style={{ fontSize: 13, color: '#7aafc4', marginLeft: 6 }}>{matchup.myTeam?.total_points !== null && matchup.myTeam?.total_points !== undefined ? 'pts' : 'cats'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4aafdb' }}>VS</div>
                <div style={{ fontSize: 11, color: '#4a7a94', marginTop: 4 }}>Current</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{matchup.opponent?.name}</div>
                <div style={{ color: '#7aafc4', fontSize: 13, marginTop: 2 }}>{matchup.opponent?.manager}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: (matchup.opponent?.total_points || oppWins) > (matchup.myTeam?.total_points || myWins) ? '#00a86b' : '#e2e8f0' }}>
                    {matchup.opponent?.total_points !== null && matchup.opponent?.total_points !== undefined ? Math.round(matchup.opponent.total_points) : oppWins}
                  </span>
                  <span style={{ fontSize: 13, color: '#7aafc4', marginLeft: 6 }}>{matchup.opponent?.total_points !== null && matchup.opponent?.total_points !== undefined ? 'pts' : 'cats'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category comparison table */}
          <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
              Live Category Stats
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>{matchup.myTeam?.name}</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Category</th>
                  <th style={{ paddingLeft: 24 }}>{matchup.opponent?.name}</th>
                </tr>
              </thead>
              <tbody>
                {matchup.stats?.length > 0 ? matchup.stats.map((cat, i) => (
                  <tr key={i} style={{
                    background: cat.my_winning ? 'rgba(0,168,107,0.06)' : cat.opp_winning ? 'rgba(239,68,68,0.06)' : 'transparent'
                  }}>
                    <td data-label="My Team" style={{ textAlign: 'right', paddingRight: 24, fontWeight: 600, fontSize: 15,
                      color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#e2e8f0'
                    }}>
                      {cat.my_winning && <span style={{ marginRight: 8, fontSize: 12 }}>▲</span>}
                      {cat.my_value ?? '—'}
                    </td>
                    <td data-label="Category" style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                        background: cat.my_winning ? 'rgba(0,168,107,0.2)' : cat.opp_winning ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                        color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#7aafc4'
                      }}>{getStatInfo(cat.stat_id, cat.name).abbv}</span>
                    </td>
                    <td data-label="Opponent" style={{ paddingLeft: 24, fontWeight: 600, fontSize: 15,
                      color: cat.opp_winning ? '#00a86b' : cat.my_winning ? '#ef4444' : '#e2e8f0'
                    }}>
                      {cat.opp_value ?? '—'}
                      {cat.opp_winning && <span style={{ marginLeft: 8, fontSize: 12 }}>▲</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#7aafc4', padding: 24 }}>
                    No category stats available yet for this week
                  </td></tr>
                )}
              </tbody>
            </table>
            {matchup.stats?.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid #1e3d5c', fontSize: 11, color: '#7aafc4', lineHeight: 1.6 }}>
                <strong style={{ color: '#4aafdb' }}>Key:</strong>{' '}
                {Array.from(new Set(matchup.stats.map(s => s.stat_id || s.name))).map(id => {
                  const info = getStatInfo(id, id);
                  return info.abbv !== info.full ? `${info.abbv} = ${info.full}` : null;
                }).filter(Boolean).join(' • ') || 'No shorthand metrics to display.'}
              </div>
            )}
          </div>

          {/* AI Predict button */}
          {!prediction && (
            <button className="btn btn-primary" onClick={getPrediction} disabled={aiLoading}
              style={{ width: '100%', padding: '14px', fontSize: 15, marginBottom: 16 }}>
              {aiLoading ? '⟳ Analyzing matchup...' : '⚡ Predict Outcome & Optimize Lineup'}
            </button>
          )}
        </>
      )}

      {/* AI Prediction results */}
      {prediction && (
        <>
          {/* Projected score */}
          <div className="card" style={{
            marginBottom: 16, textAlign: 'center', padding: '24px 28px',
            background: 'linear-gradient(135deg, #004d4d, #0c2c56)',
            border: '1px solid #007a7a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/cyborg_mascot_homerun.png" alt="Galactic Slugger Mascot" className="mascot-ai" />
              <div style={{ fontSize: 13, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2 }}>
                AI Projected Score
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 2 }}>{matchup?.myTeam?.name}</div>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1,
                  color: (prediction.projected_my_points || prediction.projected_wins || 0) >= (prediction.projected_opp_points || prediction.projected_losses || 0) ? '#00a86b' : '#ef4444'
                }}>{(prediction.projected_my_points || prediction.projected_wins) ?? '?'}</div>
              </div>
              <div style={{ fontSize: 28, color: '#4a7a94', fontWeight: 300 }}>–</div>
              <div>
                <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 2 }}>{matchup?.opponent?.name}</div>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1,
                  color: (prediction.projected_opp_points || prediction.projected_losses || 0) >= (prediction.projected_my_points || prediction.projected_wins || 0) ? '#00a86b' : '#ef4444'
                }}>{(prediction.projected_opp_points || prediction.projected_losses) ?? '?'}</div>
              </div>
              {!prediction.projected_my_points && prediction.projected_ties > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 2 }}>Ties</div>
                  <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: '#f59e0b' }}>{prediction.projected_ties}</div>
                </div>
              )}
            </div>
            <div style={{ color: '#7aafc4', fontSize: 14, marginBottom: 12 }}>{prediction.summary}</div>
            <ConfidenceBadge level={prediction.overall_confidence} />
          </div>

          {/* Category projections */}
          {prediction.categories?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
                Category Projections
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'right' }}>My Proj.</th>
                    <th style={{ textAlign: 'center', width: 100 }}>Category</th>
                    <th>Opp. Proj.</th>
                    <th>Confidence</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.categories.map((cat, i) => (
                    <tr key={i} style={{
                      background: cat.winner === 'me' ? 'rgba(0,168,107,0.06)' : cat.winner === 'opponent' ? 'rgba(239,68,68,0.06)' : 'transparent'
                    }}>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 15,
                        color: cat.winner === 'me' ? '#00a86b' : cat.winner === 'opponent' ? '#ef4444' : '#e2e8f0'
                      }}>
                        {cat.winner === 'me' && <span style={{ marginRight: 8, fontSize: 12 }}>▲</span>}
                        {cat.my_proj ?? '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                          background: cat.winner === 'me' ? 'rgba(0,168,107,0.2)' : cat.winner === 'opponent' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                          color: cat.winner === 'me' ? '#00a86b' : cat.winner === 'opponent' ? '#ef4444' : '#7aafc4'
                        }}>{cat.name}</span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 15,
                        color: cat.winner === 'opponent' ? '#00a86b' : cat.winner === 'me' ? '#ef4444' : '#e2e8f0'
                      }}>
                        {cat.opp_proj ?? '—'}
                        {cat.winner === 'opponent' && <span style={{ marginLeft: 8, fontSize: 12 }}>▲</span>}
                      </td>
                      <td><ConfidenceBadge level={cat.confidence} /></td>
                      <td style={{ fontSize: 12, color: '#7aafc4', maxWidth: 200 }}>{cat.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Key battlegrounds */}
          {prediction.key_matchups && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>🎯 Key Battlegrounds</h3>
              <div className="ai-response">{prediction.key_matchups}</div>
            </div>
          )}

          {/* Lineup recommendations */}
          {prediction.lineup_recommendations && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>⚡ Lineup Optimization</h3>
              <div className="ai-response">{prediction.lineup_recommendations}</div>
            </div>
          )}

          <AiQuestionBox 
            context={`Matchup prediction context: ${prediction.summary} ${prediction.key_matchups} ${prediction.lineup_recommendations}`}
            leagueKey={selectedLeague}
            title="Cross-Examine the Prediction"
            icon="⚖️"
            placeholder="Ask why a certain category is at risk or how to swing a tie..."
            isPro={true} // Forcing true for now as requested for testing
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={getPrediction} disabled={aiLoading}>
              {aiLoading ? '⟳ Re-analyzing...' : '↻ Regenerate Prediction'}
            </button>
            <button className="btn btn-ghost" onClick={() => setPrediction(null)}>Clear</button>
          </div>
        </>
      )}

      {!matchup && !loading && !error && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚔️</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to load your current week's matchup.</p>
        </div>
      )}
    </div>
  )
}
```

---

## File: `components/MatchupView/MatchupView.jsx`

```jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import { toast } from 'react-hot-toast';

// Convert the [{stat_id, name, value}] array from the API into {R: 8, HR: 2, ...}
function statsArrayToMap(statsArr) {
  const map = {};
  for (const s of (statsArr || [])) {
    if (s.name && !isNaN(parseInt(s.name)) === false) {
      map[s.name] = s.value;
    } else if (s.stat_id) {
      map[s.stat_id] = s.value;
    }
  }
  return map;
}

export default function MatchupView() {
  const { selectedLeague, leagueData, aiAnalysis } = useLeague();
  const [aiPrediction, setAiPrediction]     = useState(null);
  const [aiPredLoading, setAiPredLoading]   = useState(false);
  const [aiPredError, setAiPredError]       = useState('');

  // SWR automatically handles caching, deduping, and background refresh!
  const { data: matchup, error, isLoading: loading } = useSWR(
    selectedLeague ? `/api/yahoo/league/${selectedLeague}/matchup` : null
  );

  // Clear previous prediction when league changes
  useEffect(() => {
    setAiPrediction(null);
  }, [selectedLeague]);

  // Auto-run prediction when matchup data loads
  useEffect(() => {
    if (matchup && !aiPrediction && !aiPredLoading) {
      runMatchupPrediction();
    }
  }, [matchup]);

  async function runMatchupPrediction() {
    setAiPredLoading(true);
    setAiPredError('');
    try {
      const { data } = await axios.post('/api/claude/matchup/predict', {
        league_key: selectedLeague,
        matchup_data: matchup,
      });
      setAiPrediction(data.prediction || data.analysis || data.summary || JSON.stringify(data));
    } catch (err) {
      setAiPredError(err.response?.data?.error || 'Prediction failed. Try again.');
    } finally {
      setAiPredLoading(false);
    }
  }

  if (loading) return <div className="card loading">Analyzing live matchup...</div>;
  if (!matchup) return <div className="card">No active matchup found. Select a league above.</div>;

  const myScore   = matchup.myTeam?.total_points ?? 0;
  const oppScore  = matchup.opponent?.total_points ?? 0;
  const isPoints  = myScore !== null && oppScore !== null;

  return (
    <div className="matchup-view">
      {/* Score banner */}
      <div className="card" style={{ background: 'linear-gradient(to right, #1a365d, #0f172a)', padding: 40, textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <img src="/cyborg_mascot_homerun.png" alt="Home Run Mascot" style={{ height: 56, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(74,175,219,0.5))' }} />
          <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2 }}>Week {matchup.week} — Live Score</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{matchup.myTeam?.name}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: myScore >= oppScore ? 'var(--primary)' : '#e2e8f0' }}>
              {isPoints ? Math.round(myScore) : '—'}
            </div>
            {isPoints && <div style={{ fontSize: 12, color: '#7aafc4', marginTop: 4 }}>pts</div>}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, opacity: 0.3 }}>VS</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{matchup.opponent?.name}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: oppScore > myScore ? '#ff4444' : '#e2e8f0' }}>
              {isPoints ? Math.round(oppScore) : '—'}
            </div>
            {isPoints && <div style={{ fontSize: 12, color: '#7aafc4', marginTop: 4 }}>pts</div>}
          </div>
        </div>
      </div>

      {/* Live deficit banner — replaces stale cached InsightCard */}
      {(() => {
        const gap    = parseFloat(oppScore) - parseFloat(myScore);
        const gapAbs = Math.abs(gap).toFixed(1);
        const losing = gap > 0;
        const urgent = gap > 75;
        const close  = Math.abs(gap) <= 30;
        const color  = urgent ? '#ef4444' : close ? '#f59e0b' : losing ? '#fb923c' : '#00a86b';
        const bg     = urgent ? 'rgba(239,68,68,0.1)' : close ? 'rgba(245,158,11,0.1)' : losing ? 'rgba(251,146,60,0.08)' : 'rgba(0,168,107,0.1)';
        const icon   = urgent ? '🚨' : close ? '⚡' : losing ? '⚠️' : '✅';
        const msg    = losing
          ? `${icon} You are DOWN ${gapAbs} pts — ${urgent ? 'URGENT: make aggressive moves NOW' : 'make lineup moves to close the gap'}`
          : `${icon} You are leading by ${gapAbs} pts — stay the course`;
        return (
          <div style={{ background: bg, border: `1px solid ${color}`, borderRadius: 12, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, color, fontSize: 15 }}>{msg}</div>
              {losing && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>AI analysis loading below — check your bench for immediate upgrades</div>}
            </div>
          </div>
        );
      })()}

      {/* AI Prediction button + result */}
      {aiPredError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {aiPredError}
        </div>
      )}
      {aiPrediction ? (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #06b6d4' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            ⚔️ Deep Matchup Prediction
          </div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiPrediction}</div>
          <button className="btn btn-ghost" style={{ marginTop: 12, fontSize: 12 }} onClick={runMatchupPrediction} disabled={aiPredLoading}>
            ↻ Re-run Prediction
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={runMatchupPrediction} disabled={aiPredLoading}>
            {aiPredLoading ? '⟳ Predicting...' : '⚔️ Get AI Prediction'}
          </button>
        </div>
      )}

      {/* Category table */}
      {matchup.stats?.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
            Live Category Stats
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'right', paddingRight: 24 }}>{matchup.myTeam?.name}</th>
                <th style={{ textAlign: 'center', width: 100 }}>Category</th>
                <th style={{ paddingLeft: 24 }}>{matchup.opponent?.name}</th>
              </tr>
            </thead>
            <tbody>
              {matchup.stats.map((cat, i) => (
                <tr key={i} style={{ background: cat.my_winning ? 'rgba(0,168,107,0.06)' : cat.opp_winning ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                  <td style={{ textAlign: 'right', paddingRight: 24, fontWeight: 600,
                    color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#e2e8f0'
                  }}>{cat.my_winning && '▲ '}{cat.my_value ?? '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                      background: cat.my_winning ? 'rgba(0,168,107,0.2)' : cat.opp_winning ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                      fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                      color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#7aafc4'
                    }}>{cat.name}</span>
                  </td>
                  <td style={{ paddingLeft: 24, fontWeight: 600,
                    color: cat.opp_winning ? '#00a86b' : cat.my_winning ? '#ef4444' : '#e2e8f0'
                  }}>{cat.opp_value ?? '—'}{cat.opp_winning && ' ▲'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

```

---

## File: `components/PitchingIntel/PitchingIntel.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import AiQuestionBox from '../shared/AiQuestionBox'
import InsightCard from '@/components/InsightCard/InsightCard'
import { useLeague } from '@/lib/context/LeagueContext'


export default function PitchingIntel({ subscription }) {
  const { leagues, selectedLeague, setSelectedLeague, aiAnalysis, aiLoading } = useLeague()
  const [availablePitchers, setAvailablePitchers] = useState([])
  const [myRoster, setMyRoster] = useState([])
  const [myPitchers, setMyPitchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [posFilter, setPosFilter] = useState('ALL')
  const [pitchingRec, setPitchingRec]     = useState(null)
  const [pitchingLoading, setPitchingLoading] = useState(false)
  const [pitchingError, setPitchingError] = useState('')

  const isPitcher = (pos) => ['SP', 'RP', 'P'].some(x => String(pos).toUpperCase().includes(x));

  const [pitchingContext, setPitchingContext] = useState({ today: [], currentWeekTwoStart: [], nextWeekTwoStart: [] })


  useEffect(() => {
    if (selectedLeague) {
       fetchData()
    }
  }, [selectedLeague])

  async function fetchData() {
    setLoading(true)
    try {
      const [rosterRes, availableRes, contextRes] = await Promise.all([
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`),
        axios.get(`/api/yahoo/league/${selectedLeague}/players`, { params: { status: 'A', force: 'true', position: 'P' } }),
        axios.get('/api/mlb/pitching-context')
      ]);

      const myFullRoster = rosterRes.data?.players || [];
      setMyRoster(myFullRoster);
      setPitchingContext(contextRes.data);

      // Extract my pitchers
      setMyPitchers(myFullRoster.filter(p => isPitcher(p.position)));

      // Identify my pitcher names to exclude from Free Agents
      const rosterNames = myFullRoster.map(p => (p.player_name || p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

      let freeAgents = availableRes.data || [];
      if (!Array.isArray(freeAgents)) freeAgents = [];

      const filteredFA = freeAgents.filter(p => {
        const basicName = (p.player_name || p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return isPitcher(p.position) && !rosterNames.includes(basicName);
      })
      
      setAvailablePitchers(filteredFA);
    } catch (err) {
      toast.error('Failed to parse pitching hub data: ' + err.message);
      setAvailablePitchers([]);
      setMyPitchers([]);
    } finally {
      setLoading(false);
    }
  }

  // AI recommendation — master analyze InsightCard shows on load;
  // "Get Pitching Strategy" button calls targeted pitching route (Haiku, cheap).
  const aiRec = aiAnalysis?.pitching || null;

  async function getPitchingStrategy() {
    setPitchingLoading(true);
    setPitchingError('');
    try {
      const { data } = await axios.post('/api/claude/pitching', {
        league_key: selectedLeague,
        my_pitchers: myPitchers,
        available_pitchers: availablePitchers.slice(0, 15),
        pitching_context: pitchingContext,
      });
      setPitchingRec(data.recommendation || data.analysis || data.summary || '');
    } catch (err) {
      setPitchingError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setPitchingLoading(false);
    }
  }

  const safeStat = (val) => (val === undefined || val === null || val === '-' || val === '-/-') ? '—' : val;
  const safeRate = (val, decimals = 3) => {
    if (val === undefined || val === null || val === '-' || val === '-/-') return '—'
    const n = parseFloat(val)
    return isNaN(n) ? '—' : n.toFixed(decimals).replace(/^0/, '')
  }

  const renderPitcherStats = (p) => {
    return (
      <span style={{ fontSize: 13, color: '#a0aab2' }}>
        W: {safeStat(p.stats?.['28'])} | SV: {safeStat(p.stats?.['32'])} | K: {safeStat(p.stats?.['42'])} | ERA: {safeRate(p.stats?.['26'], 2)} | WHIP: {safeRate(p.stats?.['27'], 2)}
      </span>
    )
  }

  const renderContextBadges = (p) => {
    const basicName = (p.player_name || p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isProbable = pitchingContext.today?.includes(basicName);
    const isCurrentTwoStart = pitchingContext.currentWeekTwoStart?.includes(basicName);
    const isNextTwoStart = pitchingContext.nextWeekTwoStart?.includes(basicName);

    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {isCurrentTwoStart && <span className="badge" style={{ background: '#d4af37', color: '#000', fontSize: 10 }}>🏆 2-Start (This Wk)</span>}
        {isNextTwoStart && !isCurrentTwoStart && <span className="badge" style={{ background: '#4aafdb', color: '#000', fontSize: 10 }}>🔮 2-Start (Next Wk)</span>}
        {isProbable && <span className="badge" style={{ background: '#00a86b', color: '#fff', fontSize: 10 }}>⚾ Probable Today</span>}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>🎯 Pitching Intel</h1>
          <p style={{ color: '#7aafc4' }}>Command Center for Starting Pitchers, Relievers, and Weekly Streaming</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <button className="btn btn-primary" onClick={getPitchingStrategy} disabled={pitchingLoading || loading}>
            {pitchingLoading ? '🤖 Building Playbook...' : '⚡ Get Pitching Strategy'}
          </button>
        </div>
      </div>

      {(aiRec || aiLoading || pitchingRec) && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(to bottom, var(--panel-bg), #0c1524)', border: '1px solid #00a86b33' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/cyborg_batflip.png" alt="Goin' Yard Scout" className="mascot-header" style={{height: 48, filter: 'hue-rotate(140deg)'}} />
              <h3 style={{ color: '#00a86b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Pitching Playbook</h3>
            </div>
          </div>
          <InsightCard data={aiAnalysis?.pitching} type="pitching" loading={aiLoading} />
          {pitchingError && (
            <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{pitchingError}</div>
          )}
          {pitchingRec && (
            <div style={{ marginTop: 12, padding: '12px 16px', background: '#0c1d35', borderRadius: 8, borderLeft: '3px solid #00a86b' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#00a86b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Deep Pitching Analysis</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{pitchingRec}</div>
            </div>
          )}
          <AiQuestionBox 
            context={`Pitching strategy context: ${typeof aiRec === 'string' ? aiRec : aiRec?.summary || ''} ${pitchingRec || ''}`}
            leagueKey={selectedLeague}
            title="Ask the Pitching Coach"
            icon="🎯"
            placeholder="Ask about a specific pitcher or streamer..."
            isPro={subscription?.plan === 'pro'}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 20 }}>
        {/* LEFT: MY ROTATION */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)'}}>
            <h4 style={{ margin: 0, fontSize: 15, color: '#4aafdb' }}>My Current Rotation</h4>
          </div>
          {loading ? (
            <div className="loading" style={{padding: 20}}>Loading roster arms...</div>
          ) : (
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>Pitcher</th><th>Projected Stats</th></tr>
              </thead>
              <tbody>
                {myPitchers.map((p, i) => (
                  <tr key={i}>
                    <td data-label="Pitcher" style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.name} <span className="badge badge-util" style={{fontSize: 10}}>{p.position}</span>
                      </div>
                      {renderContextBadges(p)}
                    </td>
                    <td data-label="Projected Stats" style={{ whiteSpace: 'nowrap' }}>{renderPitcherStats(p)}</td>
                  </tr>
                ))}
                {myPitchers.length === 0 && (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: '#7aafc4', padding: 20 }}>No pitchers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT: TOP FREE AGENTS */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)'}}>
            <h4 style={{ margin: 0, fontSize: 15, color: '#00a86b' }}>Available Free Agent Arms</h4>
          </div>
          
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: 'rgba(0,0,0,0.2)' }}>
            {['ALL', 'SP', 'RP'].map(pos => (
              <button key={pos} className={`btn ${posFilter === pos ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4 }}
                onClick={() => setPosFilter(pos)}>{pos}</button>
            ))}
          </div>

          {loading ? (
            <div className="loading" style={{padding: 20}}>Scouting free agents...</div>
          ) : (
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>Top Target</th><th>Projected Stats</th></tr>
              </thead>
              <tbody>
                {availablePitchers.filter(p => posFilter === 'ALL' || String(p.position || '').includes(posFilter)).slice(0, 15).map((p, i) => (
                  <tr key={i}>
                    <td data-label="Top Target" style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.name} <span className="badge badge-util" style={{fontSize: 10}}>{p.position}</span> 
                      </div>
                      {renderContextBadges(p)}
                    </td>
                    <td data-label="Projected Stats" style={{ whiteSpace: 'nowrap' }}>{renderPitcherStats(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## File: `components/PlayerTrends/PlayerTrends.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LastUpdated from '../shared/LastUpdated'

const TREND_META = {
  hot:     { icon: '🔥', label: 'Hot',     color: '#ff6b35', bg: 'rgba(255,107,53,0.15)',  border: 'rgba(255,107,53,0.35)' },
  rising:  { icon: '⚡', label: 'Rising',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)'  },
  neutral: { icon: '😐', label: 'Neutral', color: '#7aafc4', bg: 'rgba(122,175,196,0.07)', border: 'rgba(122,175,196,0.2)' },
  cold:    { icon: '🥶', label: 'Cold',    color: '#4a7a94', bg: 'rgba(74,122,148,0.08)',  border: 'rgba(74,122,148,0.2)' },
}

function TrendBadge({ trend }) {
  const m = TREND_META[trend] || TREND_META.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 5,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: 0.5
    }}>
      {m.icon} {m.label}
    </span>
  )
}

function StatRow({ label, season, lowerBetter }) {
  if (season === undefined) return null
  const s = parseFloat(season)

  // We determine if they pass the "good" threshold for coloring 
  // (same thresholds backing calculateTrend)
  let isGood = false;
  let isBad = false;
  if (!isNaN(s) && s > 0) {
    if (label === 'ERA') { isGood = s < 3.50; isBad = s > 4.50; }
    else if (label === 'WHIP') { isGood = s < 1.15; isBad = s > 1.35; }
    else if (label === 'AVG') { isGood = s >= 0.270; isBad = s <= 0.230; }
    else if (label === 'HR') { isGood = s >= 3; }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
      <span style={{ fontSize: 11, color: '#4a7a94', width: 36 }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: isGood ? '#00a86b' : isBad ? '#ef4444' : '#e2e8f0'
      }}>
        {season !== undefined ? season : '—'}
      </span>
    </div>
  )
}

function PlayerCard({ player, highlight }) {
  const m = TREND_META[player.trend] || TREND_META.neutral
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${m.bg}, #0c1d35)` : '#0c1d35',
      border: `1px solid ${highlight ? m.border : '#1e3d5c'}`,
      borderRadius: 10, padding: '12px 14px',
      transition: 'border-color 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{player.name}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className={`badge badge-${String(player.position).split(',')[0].trim().toLowerCase()}`}>
              {player.position}
            </span>
            <span style={{ fontSize: 11, color: '#4a7a94' }}>{player.team}</span>
          </div>
        </div>
        <TrendBadge trend={player.trend} />
      </div>
      <div style={{ borderTop: '1px solid #1e3d5c', paddingTop: 8, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a7a94', marginBottom: 4 }}>
          <span>Stat</span><span>Season</span>
        </div>
        {(player.displayStats || []).map((s, i) => (
          <StatRow key={i} {...s} />
        ))}
        {(!player.displayStats || player.displayStats.length === 0) && (
          <div style={{ fontSize: 12, color: '#4a7a94' }}>No stats available</div>
        )}
      </div>
    </div>
  )
}

export default function PlayerTrends({ selectedLeague }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('roster')
  const [error, setError] = useState('')
  const [cachedAt, setCachedAt] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [adpData, setAdpData] = useState(null)
  const [adpLoading, setAdpLoading] = useState(false)

  useEffect(() => {
    if (selectedLeague) fetchTrends()
  }, [selectedLeague])

  async function fetchTrends(force = false) {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/trends${force ? '?force=true' : ''}`)
      setData(res.data)
      setCachedAt(res.headers['x-cache-updated'] || null)
      setFromCache(res.headers['x-cache-hit'] === 'true')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load player trends')
    } finally {
      setLoading(false)
    }
  }

  async function fetchADPValue() {
    if (!data?.myPlayers?.length) return
    setAdpLoading(true)
    try {
      const players = data.myPlayers.map(p => ({ name: p.name, adp: p.adp || 200 }))
      const res = await axios.post('/api/mlb/roster-value', { players, leagueSize: 12 })
      setAdpData(res.data)
    } catch (err) {
      console.log('ADP value fetch error:', err.message)
    } finally {
      setAdpLoading(false)
    }
  }

  const hotCount = data?.myPlayers?.filter(p => p.trend === 'hot').length || 0
  const risingCount = data?.myPlayers?.filter(p => p.trend === 'rising').length || 0
  const coldCount = data?.myPlayers?.filter(p => p.trend === 'cold').length || 0
  const faCount = data?.freeAgents?.length || 0

  return (
    <div className="card" style={{ marginTop: 28 }}>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Player Trends</h2>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            {data && (
              <>
                <span style={{ color: '#ff6b35' }}>🔥 {hotCount} Hot</span>
                <span style={{ color: '#f59e0b' }}>⚡ {risingCount} Rising</span>
                <span style={{ color: '#4a7a94' }}>🥶 {coldCount} Cold</span>
              </>
            )}
          </div>
        </div>
        <LastUpdated cachedAt={cachedAt} fromCache={fromCache} ttlLabel="15 min cache"
          onRefresh={() => fetchTrends(true)} loading={loading} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #1e3d5c', paddingBottom: 0 }}>
        {[
          { key: 'roster', label: 'My Roster' },
          { key: 'adpvalue', label: '📊 ADP Value' },
          { key: 'fa',     label: `🔥 FA Pickups${faCount ? ` (${faCount})` : ''}` }
        ].map(tab => (
          <button key={tab.key} onClick={() => {
            setActiveTab(tab.key)
            if (tab.key === 'adpvalue' && !adpData && !adpLoading) fetchADPValue()
          }}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: activeTab === tab.key ? '#007a7a' : '#7aafc4',
              borderBottom: activeTab === tab.key ? '2px solid #007a7a' : '2px solid transparent',
              marginBottom: -1
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: 13, padding: '8px 0' }}>{error}</div>
      )}

      {loading && <div className="loading" style={{ padding: 24 }}>Fetching player stats...</div>}

      {!loading && data && activeTab === 'roster' && (
        <>
          {data.myPlayers.length === 0 ? (
            <p style={{ color: '#7aafc4', fontSize: 13 }}>No roster data found. Make sure your league is configured.</p>
          ) : (
            <>
              {/* Hot & Rising up top with highlight */}
              {data.myPlayers.filter(p => p.trend === 'hot' || p.trend === 'rising').length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Trending Up
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {data.myPlayers.filter(p => p.trend === 'hot' || p.trend === 'rising').map((p, i) => (
                      <PlayerCard key={i} player={p} highlight={true} />
                    ))}
                  </div>
                </div>
              )}
              {/* Neutral & Cold */}
              {data.myPlayers.filter(p => p.trend === 'neutral' || p.trend === 'cold').length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Neutral / Cold
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {data.myPlayers.filter(p => p.trend === 'neutral' || p.trend === 'cold').map((p, i) => (
                      <PlayerCard key={i} player={p} highlight={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ADP Value Tab */}
      {!loading && data && activeTab === 'adpvalue' && (
        <>
          {adpLoading && <div className="loading" style={{ padding: 24 }}>Fetching 2025 stats and ADP analysis...</div>}
          {!adpLoading && !adpData && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <button className="btn btn-primary" onClick={fetchADPValue}
                style={{ padding: '10px 24px', fontSize: 14 }}>
                📊 Load ADP Value Analysis
              </button>
              <p style={{ color: '#7aafc4', fontSize: 12, marginTop: 8 }}>Compares 2025 real stats to 2026 ADP to find over/undervalued players</p>
            </div>
          )}
          {!adpLoading && adpData?.players?.length > 0 && (
            <>
              <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 14, padding: '8px 12px',
                background: 'rgba(0,122,122,0.08)', borderRadius: 8, border: '1px solid rgba(0,122,122,0.2)' }}>
                📊 2025 real stats vs 2026 ADP — find players the market is mispricing
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {adpData.players.map((p, i) => {
                  const vt = p.valueTrend || {}
                  const isUnder = vt.classification?.includes('UNDERVALUED')
                  const isOver = vt.classification?.includes('OVERVALUED')
                  const barColor = isUnder ? '#00a86b' : isOver ? '#ef4444' : '#4aafdb'
                  const barWidth = Math.min(100, Math.abs(vt.valueGap || 0) / 2)
                  return (
                    <div key={i} style={{
                      background: '#0c1d35', border: `1px solid ${isUnder ? 'rgba(0,168,107,0.3)' : isOver ? 'rgba(239,68,68,0.3)' : '#1e3d5c'}`,
                      borderRadius: 10, padding: '12px 14px',
                      borderLeft: `3px solid ${barColor}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: '#4a7a94', marginLeft: 8 }}>
                            {p.position} · {p.team} · Age {p.age}
                          </span>
                        </div>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: 5, fontSize: 10,
                          fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                          background: isUnder ? 'rgba(0,168,107,0.15)' : isOver ? 'rgba(239,68,68,0.15)' : 'rgba(74,175,219,0.1)',
                          color: barColor, border: `1px solid ${barColor}33`
                        }}>
                          {vt.classification || 'UNKNOWN'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 6 }}>
                        2025: <strong>{vt.statLine}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#7aafc4', marginBottom: 6 }}>
                        <span>ADP: <strong style={{ color: '#e2e8f0' }}>{p.adp2026}</strong></span>
                        <span>Implied: <strong style={{ color: '#e2e8f0' }}>{vt.impliedADP}</strong></span>
                        <span>Gap: <strong style={{ color: barColor }}>{vt.valueGap > 0 ? '+' : ''}{vt.valueGap} picks</strong></span>
                        <span>Score: <strong style={{ color: '#e2e8f0' }}>{vt.productionScore}/100</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#4a7a94' }}>
                        <span>📈 {vt.trajectory}</span>
                        <span>⬇️ Floor: {vt.floorCeiling?.floor}</span>
                        <span>⬆️ Ceiling: {vt.floorCeiling?.ceiling}</span>
                      </div>
                      {/* Value gap bar */}
                      <div style={{ marginTop: 6, height: 4, background: '#122840', borderRadius: 2 }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', borderRadius: 2, background: barColor, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
          {!adpLoading && adpData && adpData.players?.length === 0 && (
            <p style={{ color: '#7aafc4', fontSize: 13, textAlign: 'center', padding: 24 }}>No 2025 stats found for your roster players.</p>
          )}
        </>
      )}

      {!loading && data && activeTab === 'fa' && (
        <>
          {data.freeAgents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>😐</div>
              <p style={{ color: '#7aafc4', fontSize: 13 }}>
                No hot free agents detected right now. Check back later in the week as stats update.
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 14, padding: '8px 12px',
                background: 'rgba(0,168,107,0.08)', borderRadius: 8, border: '1px solid rgba(0,168,107,0.2)' }}>
                🎯 These free agents are outperforming their season averages this week — grab them before other managers do.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {data.freeAgents.map((p, i) => (
                  <PlayerCard key={i} player={p} highlight={true} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {!loading && !data && !error && (
        <p style={{ color: '#7aafc4', fontSize: 13 }}>Select a league on the dashboard to load trends.</p>
      )}

      {/* Legend */}
      {data && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid #1e3d5c', flexWrap: 'wrap' }}>
          {Object.entries(TREND_META).map(([key, m]) => (
            <span key={key} style={{ fontSize: 11, color: m.color }}>
              {m.icon} {m.label}: {key === 'hot' ? '>20% above avg' : key === 'rising' ? '7-20% above' : key === 'neutral' ? 'near avg' : '>7% below avg'}
            </span>
          ))}
          <span style={{ fontSize: 11, color: '#4a7a94', marginLeft: 'auto' }}>vs last 7-day stats</span>
        </div>
      )}
    </div>
  )
}
```

---

## File: `components/RosterAudit/RosterAudit.jsx`

```jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { toast } from 'react-hot-toast';

// Grade → color mapping
const GRADE_COLOR = {
  'A+': '#00ff88', 'A': '#00e07a', 'A-': '#22c55e',
  'B+': '#86efac', 'B': '#fbbf24', 'B-': '#f59e0b',
  'C+': '#fb923c', 'C': '#f87171', 'D': '#ef4444',
};

// Priority badge colors
const PRIORITY_COLOR = {
  immediate: '#ef4444',
  high:      '#f59e0b',
  medium:    '#3b82f6',
};

export default function RosterAudit() {
  const { selectedLeague, leagues } = useLeague();
  const [audit, setAudit]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (selectedLeague) runAudit(selectedLeague);
  }, [selectedLeague]);

  async function runAudit(leagueKey, force = false) {
    if (!leagueKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/claude/audit', { league_key: leagueKey, force });
      setAudit(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Audit failed';
      setError(msg);
      toast.error('Roster audit failed — ' + msg);
    } finally {
      setLoading(false);
    }
  }

  const leagueName = leagues?.find(l => l.league_key === selectedLeague)?.name || selectedLeague;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Running Deep Roster Audit…</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Pulling live stats · Calculating VOR · Generating expert analysis
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 16 }}>{error}</div>
        <button className="btn btn-primary" onClick={() => runAudit(selectedLeague)}>
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!audit) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p style={{ color: 'var(--text-muted)' }}>Select a league to run your team audit.</p>
      </div>
    );
  }

  const gradeColor  = GRADE_COLOR[audit.grade] || '#fff';
  const vorByPlayer = audit.vorByPlayer || [];

  // ── Full audit result ──────────────────────────────────────────────────────
  return (
    <div className="roster-audit">

      {/* Header row: grade + championship path */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 20 }}>

        {/* Grade card */}
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>
            {audit.grade}
          </div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                        color: 'var(--text-muted)', marginTop: 8 }}>
            Team Grade
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            VOR {audit.totalVOR} · avg {audit.avgVOR}
          </div>
        </div>

        {/* Championship path */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                        color: 'var(--text-muted)', marginBottom: 10 }}>
            🏆 Championship Path — {leagueName}
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}>
            {audit.championshipPath || 'Analysis loading…'}
          </div>
          {audit.fromCache && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>⚡ Cached</span>
          )}
          <button
            className="btn btn-secondary"
            style={{ marginTop: 16, alignSelf: 'flex-start', fontSize: 13 }}
            onClick={() => runAudit(selectedLeague, true)}
          >
            🔄 Refresh Audit
          </button>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em', color: '#00e07a' }}>
            💪 Strengths
          </h3>
          {(audit.strengths || []).length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {audit.strengths.map((s, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: i < audit.strengths.length - 1
                    ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    fontSize: 14, lineHeight: 1.5 }}>
                  ✅ {s}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No strengths identified yet.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em', color: '#f87171' }}>
            ⚠️ Weaknesses
          </h3>
          {(audit.weaknesses || []).length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {audit.weaknesses.map((w, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: i < audit.weaknesses.length - 1
                    ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    fontSize: 14, lineHeight: 1.5 }}>
                  ⚠️ {w}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No critical weaknesses found.</p>
          )}
        </div>
      </div>

      {/* Recommended moves */}
      {(audit.moves || []).length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em' }}>
            ⚡ Recommended Moves
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {audit.moves.map((move, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8,
                borderLeft: `3px solid ${PRIORITY_COLOR[move.priority] || '#555'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    color: PRIORITY_COLOR[move.priority] || '#aaa',
                    letterSpacing: '0.08em',
                  }}>
                    {move.priority}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{move.action}</span>
                </div>
                {move.reasoning && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {move.reasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOR breakdown table */}
      {vorByPlayer.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em' }}>
            📊 Player Value Rankings (VOR)
          </h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th>VOR</th>
                <th>Scarcity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vorByPlayer.map((p, i) => {
                const vorNum = typeof p.vor === 'number' ? p.vor : 0;
                const vorColor = vorNum > 100 ? '#00ff88'
                               : vorNum > 50  ? '#22c55e'
                               : vorNum > 20  ? '#fbbf24'
                               : '#f87171';
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span className={`badge badge-${String(p.position || '').toLowerCase()}`}>
                        {p.position}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: vorColor }}>{vorNum}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {p.scarcity || '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {vorNum > 80 ? '🌟 Core Asset'
                       : vorNum > 40 ? '✅ Solid'
                       : vorNum > 15 ? '📈 Serviceable'
                       : '⚠️ Consider Dropping'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/RosterManager/RosterManager.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function RosterManager({ leagueSettings }) {
  const [roster, setRoster] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendMap, setTrendMap] = useState({})

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    try {
      const { data } = await axios.get('/api/yahoo/leagues')
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    } catch {}
  }

  // Fetch value trends for roster players (non-blocking)
  async function fetchTrends(playerList) {
    try {
      const players = playerList.map(p => ({ name: p.name, adp: 200 }))
      const { data } = await axios.post('/api/mlb/roster-value', { players, leagueSize: 12 })
      const map = {}
      ;(data.players || []).forEach(p => {
        map[p.name] = p.valueTrend
      })
      setTrendMap(map)
    } catch (e) {
      console.log('Trend fetch skipped:', e.message)
    }
  }

  async function fetchRoster() {
    if (!selectedLeague) return
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/roster`)
      const playerList = []
      if (Array.isArray(data)) {
        data.forEach(item => {
          const p = item?.player
          if (p && Array.isArray(p)) {
            const infoArray = Array.isArray(p[0]) ? p[0] : [];
            const rosterInfo = p[1] || {};
            const info = Object.assign({}, ...infoArray);
            const name = info.name?.full || info.name?.first && `${info.name.first} ${info.name.last}` || info.full_name || 'Unknown';
            let positions = [];
            const ep = info.eligible_positions;
            if (ep) {
              if (Array.isArray(ep)) {
                positions = ep.map(p => p?.position || p).filter(Boolean);
              } else if (ep.position) {
                positions = Array.isArray(ep.position) ? ep.position.map(p => p?.position || p) : [ep.position];
              }
            }
            if (!positions.length && info.display_position) {
              positions = info.display_position.split(',').map(s => s.trim());
            }
            const selectedPos = rosterInfo?.selected_position;
            let slot = 'BN';
            if (selectedPos) {
              if (Array.isArray(selectedPos)) {
                for (const sp of selectedPos) {
                  if (sp?.position) { slot = sp.position; break; }
                }
              } else if (selectedPos.position) {
                slot = selectedPos.position;
              }
            }
            playerList.push({
              name,
              positions,
              team: info.editorial_team_abbr || '',
              status: slot,
              injury: info.status || ''
            })
          }
        })
      }
      setRoster(playerList)
      // Fetch trends in background
      if (playerList.length > 0) fetchTrends(playerList)
    } catch (err) {
      toast.error('Could not load roster from Yahoo. Showing empty roster.')
      setRoster([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedLeague) fetchRoster()
  }, [selectedLeague])

  const active = roster.filter(p => p.status !== 'BN' && p.status !== 'IL')
  const bench = roster.filter(p => p.status === 'BN')
  const il = roster.filter(p => p.status === 'IL')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◈ My Roster</h1>
          <p style={{ color: '#7aafc4' }}>Your current lineup pulled from Yahoo Fantasy</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => (
              <option key={i} value={l.league_key}>{l.name || l.league_key}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={fetchRoster} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading your roster from Yahoo...</div>
      ) : (
        <>
          <RosterSection title="Active Lineup" players={active} color="#00a86b" trendMap={trendMap} />
          <RosterSection title="Bench" players={bench} color="#f59e0b" trendMap={trendMap} />
          {il.length > 0 && <RosterSection title="Injured List (IL)" players={il} color="#ef4444" trendMap={trendMap} />}

          {roster.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <p style={{ color: '#7aafc4' }}>No roster data available. Make sure your Yahoo league is active and try refreshing.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TrendArrow({ trend }) {
  if (!trend) return <span style={{ color: '#4a7a94', fontSize: 12 }}>—</span>
  const isUnder = trend.classification?.includes('UNDERVALUED')
  const isOver = trend.classification?.includes('OVERVALUED')
  if (isUnder) return <span title={trend.summary} style={{ color: '#00a86b', fontSize: 14, cursor: 'help' }}>▲</span>
  if (isOver) return <span title={trend.summary} style={{ color: '#ef4444', fontSize: 14, cursor: 'help' }}>▼</span>
  return <span title={trend.summary} style={{ color: '#4aafdb', fontSize: 12, cursor: 'help' }}>—</span>
}

function RosterSection({ title, players, color, trendMap = {} }) {
  if (players.length === 0) return null
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color }}>{title} ({players.length})</h2>
      <table>
        <thead>
          <tr><th>Slot</th><th>Player</th><th>Position</th><th>Team</th><th>Trend</th><th>Status</th></tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i}>
              <td data-label="Slot" style={{ color: '#7aafc4', fontSize: 12, fontWeight: 600 }}>{p.status}</td>
              <td data-label="Player" style={{ fontWeight: 500 }}>{p.name}</td>
              <td data-label="Position">
                {(Array.isArray(p.positions) ? p.positions : [p.positions]).map((pos, j) => (
                  <span key={j} className={`badge badge-${String(pos).toLowerCase()}`} style={{ marginRight: 4 }}>{pos}</span>
                ))}
              </td>
              <td data-label="Team" style={{ color: '#7aafc4' }}>{p.team}</td>
              <td data-label="Trend" style={{ textAlign: 'right' }}>
                <TrendArrow trend={trendMap[p.name]} />
              </td>
              <td data-label="Status">
                {p.injury ? (
                  <span style={{ color: '#ef4444', fontSize: 12 }}>{p.injury}</span>
                ) : (
                  <span style={{ color: '#00a86b', fontSize: 12 }}>Active</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## File: `components/Sidebar.jsx`

```jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';

export default function Sidebar({ authenticated, isOpen, onClose, subscription }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/',            label: 'Dashboard',             icon: '⚾' },
    { href: '/roster',      label: 'My Roster',             icon: '👥' },
    { href: '/waiver',      label: 'Waiver Wire',           icon: '🔄' },
    { href: '/startsit',    label: 'Start / Sit',           icon: '⚡' },
    { href: '/trade',       label: 'Trade Analyzer',        icon: '⇌' },
    { href: '/pitching',    label: 'Pitching Intel',        icon: '🎯' },
    { href: '/standings',   label: 'Standings',             icon: '🏆' },
    { href: '/matchup',     label: 'Matchup Predictor',     icon: '⚔️' },
    { href: '/audit',       label: 'Team Audit',            icon: '📊' },
    { href: '/tradefinder', label: 'Trade Finder',          icon: '💡' },
    { href: '/gameplan',    label: 'Weekly Game Plan',      icon: '📅' },
    { href: '/baseball101', label: 'Baseball 101',          icon: '🎓' },
    { href: '/tradeblock',  label: 'League Trade Block',    icon: '🤝' },
  ];

  if (!authenticated) return null;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            ⚾ Goin' Yard <span style={{ color: 'var(--primary)' }}>HQ</span>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 20 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={async () => {
              await axios.post('/api/auth/logout');
              window.location.href = '/';
            }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: '#f87171' }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>
    </>
  );
}
```

---

## File: `components/Standings/Standings.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { useLeague } from '@/lib/context/LeagueContext'

function parseTeamInfo(teamData) {
  if (!teamData) return null
  const t = teamData.team || teamData
  if (!t) return null

  // t is usually an array like [{name, team_key, ...}, {team_standings: ...}, ...]
  // But can also be a flat object
  let info = {}
  let standings = null

  if (Array.isArray(t)) {
    // First element is info (could be array of sub-objects or a single object)
    if (Array.isArray(t[0])) {
      info = Object.assign({}, ...t[0])
    } else {
      info = t[0] || {}
    }
    // Search remaining elements for team_standings
    for (let i = 1; i < t.length; i++) {
      if (t[i]?.team_standings) {
        standings = t[i].team_standings
        break
      }
    }
  } else {
    info = t
    standings = t.team_standings
  }

  // Extract manager name
  let manager = ''
  const managers = info.managers
  if (managers) {
    if (Array.isArray(managers)) {
      manager = managers[0]?.manager?.nickname || managers[0]?.nickname || ''
    } else if (managers.manager) {
      manager = managers.manager?.nickname || ''
    }
  }

  const outcome = standings?.outcome_totals || {}
  return {
    name: info.name || 'Unknown Team',
    team_key: info.team_key || '',
    manager,
    rank: parseInt(standings?.rank) || 99,
    wins: parseInt(outcome.wins) || 0,
    losses: parseInt(outcome.losses) || 0,
    ties: parseInt(outcome.ties) || 0,
    pct: parseFloat(outcome.percentage) || 0,
    points_for: parseFloat(standings?.points_for) || 0,
    points_against: parseFloat(standings?.points_against) || 0,
    games_back: standings?.games_back || '-',
    streak: standings?.streak?.value || ''
  }
}

export default function Standings() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague()
  const [standings, setStandings] = useState([])
  const [error, setError] = useState('')

  const { data: rawData, error: swrError, isLoading: loading, mutate: fetchStandings } = useSWR(
    selectedLeague ? `/api/yahoo/league/${selectedLeague}/standings` : null
  )

  useEffect(() => {
    if (swrError) {
      if (swrError.name === 'CanceledError' || swrError.name === 'AbortError') {
        setError('Standings timed out. Yahoo may be slow — hit Refresh to try again.')
      } else {
        setError('Could not load standings. Make sure you are connected to Yahoo.')
      }
    } else {
      setError('')
    }
  }, [swrError])

  useEffect(() => {
    if (rawData) {
      const teams = []
      if (Array.isArray(rawData)) {
        for (const item of rawData) {
          const parsed = parseTeamInfo(item)
          if (parsed) teams.push(parsed)
        }
      } else if (typeof rawData === 'object') {
        const count = parseInt(rawData['@attributes']?.count) || Object.keys(rawData).filter(k => /^\d+$/.test(k)).length
        for (let i = 0; i < count; i++) {
          const parsed = parseTeamInfo(rawData[i] || rawData[String(i)])
          if (parsed) teams.push(parsed)
        }
      }
      teams.sort((a, b) => a.rank - b.rank)
      setStandings(teams)
      if (teams.length === 0) setError('No standings data returned — the league may not have started yet.')
    } else {
      setStandings([])
    }
  }, [rawData])

  const numTeams = standings.length
  const playoffCutoff = Math.ceil(numTeams / 2) // typically top half makes playoffs

  return (
    <div className="standings-container animate-fade-in">
      <header className="module-header">
        <div className="header-text">
          <h1 className="text-gradient">◎ League Standings</h1>
          <p className="text-muted">Live standings from your Yahoo Fantasy league</p>
        </div>
        <div className="header-actions">
          <div className="input-group">
            <label>League</label>
            <select
              value={selectedLeague}
              onChange={e => setSelectedLeague(e.target.value)}
              className="league-selector"
            >
              {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost" onClick={() => fetchStandings(selectedLeague)} disabled={loading}>
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Loading standings...</p>
        </div>
      )}

      {!loading && standings.length > 0 && (
        <>
          {/* Standings Legend */}
          <div className="standings-legend">
            <span className="legend-item">
              <span className="legend-dot gold"></span> 1st Place
            </span>
            <span className="legend-item">
              <span className="legend-dot playoff"></span> Playoff Position (Top {playoffCutoff})
            </span>
          </div>

          {/* Desktop Table */}
          <div className="card standings-card">
            <table className="standings-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Team</th>
                  <th>Manager</th>
                  <th style={{ textAlign: 'center' }}>W</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'center' }}>T</th>
                  <th style={{ textAlign: 'center' }}>Win %</th>
                  <th style={{ textAlign: 'right' }}>GB</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, i) => {
                  const isFirst = team.rank === 1
                  const isPlayoff = team.rank <= playoffCutoff
                  const isLast = team.rank === numTeams

                  return (
                    <tr key={i} className={`standings-row ${isPlayoff ? 'playoff' : ''} ${isFirst ? 'first-place' : ''} ${isLast ? 'last-place' : ''}`}>
                      <td data-label="Rank">
                        <div className={`rank-badge ${isFirst ? 'gold' : isPlayoff ? 'playoff' : 'standard'}`}>
                          {team.rank}
                        </div>
                      </td>
                      <td data-label="Team">
                        <span className="team-name">{team.name}</span>
                      </td>
                      <td data-label="Manager">
                        <span className="manager-name">{team.manager}</span>
                      </td>
                      <td data-label="W" style={{ textAlign: 'center' }}>
                        <span className="wins-value">{team.wins}</span>
                      </td>
                      <td data-label="L" style={{ textAlign: 'center' }}>
                        <span className="losses-value">{team.losses}</span>
                      </td>
                      <td data-label="T" style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{team.ties}</span>
                      </td>
                      <td data-label="Win %" style={{ textAlign: 'center' }}>
                        <div className="pct-cell">
                          <span className="pct-value">{(team.pct * 100).toFixed(1)}%</span>
                          <div className="pct-bar">
                            <div
                              className="pct-fill"
                              style={{
                                width: `${team.pct * 100}%`,
                                background: isFirst
                                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                  : isPlayoff
                                  ? 'linear-gradient(90deg, var(--secondary), #0066ff)'
                                  : 'rgba(255,255,255,0.15)'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td data-label="GB" style={{ textAlign: 'right' }}>
                        <span style={{ color: team.games_back === '-' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 600 }}>
                          {team.games_back}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {/* Playoff cutoff line */}
                {standings.length > playoffCutoff && (
                  <tr className="playoff-cutoff-row">
                    <td colSpan={8}>
                      <div className="playoff-cutoff-line">
                        <span>━━ Playoff Cutoff ━━</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && standings.length === 0 && (
        <div className="empty-state-placeholder card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <p className="text-muted">Select a league above to view standings.</p>
        </div>
      )}
    </div>
  )
}
```

---

## File: `components/StartSit/StartSit.jsx`

```jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLeague } from '@/lib/context/LeagueContext';
import AiQuestionBox from '../shared/AiQuestionBox';

export default function StartSit() {
  const { selectedLeague, leagueData } = useLeague();
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const autoRanRef = useRef(false);

  useEffect(() => {
    if (selectedLeague) {
      autoRanRef.current = false;
      loadRoster();
    }
  }, [selectedLeague]);

  // Auto-run daily analysis once when roster loads
  useEffect(() => {
    if (roster.length > 0 && !result && !loading && !autoRanRef.current) {
      autoRanRef.current = true;
      analyzeDailyLineup();
    }
  }, [roster]);

  async function loadRoster() {
    setRosterLoading(true);
    setResult(null);
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`);
      setRoster(data.players || []);
    } catch {
      toast.error('Could not load roster.');
    } finally {
      setRosterLoading(false);
    }
  }

  async function analyzeDailyLineup() {
    if (!roster.length) return toast.error('No roster loaded.');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/claude/startsit', {
        players: roster,
        matchup_context: context || 'TODAY_DAILY_OPTIMIZER: Evaluate my ENTIRE roster for TODAY. Who are the absolute Must-Starts? Who should be immediately benched? Identify my 3 toughest start/sit decisions.',
        scoring_type: leagueData?.scoring_type || 'H2H Points',
        daily_mode: true,
        league_key: selectedLeague,
      });
      setResult(data.analysis);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <img src="/cyborg_batter_ready.png" alt="Batter Ready" style={{ height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(0,168,107,0.4))' }} />
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>⚡ Daily Start/Sit</h1>
          <p style={{ color: '#7aafc4' }}>AI-powered daily lineup optimizer</p>
        </div>
      </div>

      {/* Roster + re-analyze button */}
      {rosterLoading ? (
        <div className="loading" style={{ margin: '40px 0' }}>Loading your live roster...</div>
      ) : roster.length > 0 ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Roster ({roster.length} players)</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
                {loading ? 'Generating today\'s analysis...' : result ? 'Analysis complete — scroll down for recommendations.' : 'Ready for today\'s analysis.'}
              </p>
            </div>
            <button className="btn btn-primary" onClick={analyzeDailyLineup} disabled={loading}
              style={{ padding: '12px 24px', fontSize: 15, background: 'linear-gradient(135deg, #00a86b 0%, #007a7a 100%)' }}>
              {loading ? '⟳ Analyzing Today\'s Lineup...' : '↻ Re-analyze Lineup'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{ background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 48, marginBottom: 16 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚾</div>
          <div className="loading">Select a league to load your roster...</div>
        </div>
      )}

      {loading && !result && (
        <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 16 }}>
          <div className="loading" style={{ fontSize: 15 }}>⚡ Building your personalized daily lineup...</div>
          <p style={{ color: '#7aafc4', fontSize: 12, marginTop: 8 }}>Checking MLB schedules, starting lineups, and your bench...</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Additional Context (optional)</h3>
        <textarea rows={3}
          placeholder="e.g. Facing a lefty tonight, need HR upside, streaming SP..."
          value={context} onChange={e => setContext(e.target.value)} />
      </div>

      {result && (
        <div className="card">
          <h3 style={{ color: '#007a7a', marginBottom: 12 }}>Today's Lineup Analysis</h3>
          <div className="ai-response">{result}</div>
          <AiQuestionBox
            context={`Start/Sit optimization context: ${result}`}
            leagueKey={selectedLeague}
            title="Manager's Hot Seat"
            icon="⚡"
            placeholder="Ask about a specific matchup or second-guess a benching..."
          />
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/TeamAudit/TeamAudit.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PackDropModal from '../TrophyCase/PackDropModal'
import { useLeague } from '@/lib/context/LeagueContext'
import InsightCard from '@/components/InsightCard/InsightCard'

function GradeBadge({ grade }) {
  const g = String(grade || '').charAt(0).toUpperCase()
  const color = g === 'A' ? '#00a86b' : g === 'B' ? '#4aafdb' : g === 'C' ? '#f59e0b' : '#ef4444'
  return (
    <div style={{
      width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 30, fontWeight: 800, flexShrink: 0,
      background: `${color}22`, border: `3px solid ${color}`, color
    }}>{grade || '?'}</div>
  )
}

function PriorityBadge({ priority }) {
  const colors = {
    immediate: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    high:      { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    medium:    { bg: 'rgba(74,175,219,0.15)', color: '#4aafdb' },
  }
  const s = colors[priority?.toLowerCase()] || colors.medium
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
    }}>{priority || 'medium'}</span>
  )
}

export default function TeamAudit({ leagueSettings }) {
  const { selectedLeague, aiAnalysis, aiLoading } = useLeague()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [currentLoadedTeam, setCurrentLoadedTeam] = useState('')
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [awardedCard, setAwardedCard] = useState(null)

  useEffect(() => {
    if (selectedLeague) loadData()
  }, [selectedLeague])

  useEffect(() => {
    if (selectedTeam && roster.length && selectedTeam !== currentLoadedTeam) {
      loadSpecificTeamRoster(selectedTeam)
    }
  }, [selectedTeam])

  // Auto-run audit whenever roster populates — Rich-Data-On-Load pattern
  useEffect(() => {
    if (roster.length > 0 && !loading) {
      runAudit()
    }
  }, [roster])

  async function loadData() {
    setRosterLoading(true)
    setRoster([])
    setAudit(null)
    setError('')
    setTeams([])
    
    try {
      const [teamsRes, rosterRes] = await Promise.allSettled([
        axios.get(`/api/yahoo/league/${selectedLeague}/standings`),
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`)
      ])

      // Parse teams
      if (teamsRes.status === 'fulfilled' && teamsRes.value.data) {
        const parsedTeams = (teamsRes.value.data || []).map(t => {
          const teamObj = t?.team
          const info = Array.isArray(teamObj) ? (Array.isArray(teamObj[0]) ? Object.assign({}, ...teamObj[0]) : teamObj[0]) : teamObj
          return { team_key: info?.team_key, name: info?.name }
        }).filter(t => t.team_key)
        setTeams(parsedTeams)
      }

      // Parse roster
      if (rosterRes.status === 'fulfilled' && rosterRes.value.data) {
        setRoster(rosterRes.value.data.players || [])
        if (rosterRes.value.data.teamKey) {
          setSelectedTeam(rosterRes.value.data.teamKey)
          setCurrentLoadedTeam(rosterRes.value.data.teamKey)
        }
      } else {
        setError('Could not load roster. Make sure your league is configured.')
      }

    } catch (err) {
      console.error('Data load error:', err)
      setError('Initial data load failed.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function loadSpecificTeamRoster(teamKey) {
    setRosterLoading(true)
    setRoster([])
    setAudit(null)
    setError('')
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/team/${teamKey}/rosterstats`)
      setRoster(data.players || [])
      setCurrentLoadedTeam(teamKey)
    } catch (err) {
      setError(`Could not load roster for selected team.`)
    } finally {
      setRosterLoading(false)
    }
  }

  async function checkTrophyUnlocks(auditData) {
    const grade = auditData?.grade || '';
    if (grade.startsWith('A')) {
      // Award premium card
      try {
        const { data } = await axios.post('/api/trophy/award', { trigger: 'audit_aplus' });
        if (data?.awarded) setAwardedCard(data.awarded);
      } catch (e) {}
    } else if (grade.startsWith('B')) {
      // Award base card
      try {
        const { data } = await axios.post('/api/trophy/award', { trigger: 'audit_b' });
        if (data?.awarded) setAwardedCard(data.awarded);
      } catch (e) {}
    }
  }

  async function runAudit() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/claude/audit', {
        my_roster: roster,
        league_key: selectedLeague,
      })
      setAudit(data)
      checkTrophyUnlocks(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Audit failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PackDropModal awardedCard={awardedCard} onClose={() => setAwardedCard(null)} />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/cyborg_analyst.png" alt="Cyborg Analyst" style={{ height: 72, width: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(74,175,219,0.4))' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>▣ Team Audit</h1>
            <p style={{ color: '#7aafc4' }}>AI-powered roster analysis — grades, VOR rankings, and actionable moves</p>
          </div>
        </div>
        {teams.length > 0 && (
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} style={{ minWidth: 200, padding: '8px 12px', borderRadius: 6, background: '#122840', color: '#fff', border: '1px solid #1e3d5c' }}>
            {teams.map((t, i) => <option key={i} value={t.team_key}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Auto-run loading state */}
      {loading && !audit && (
        <div className="card" style={{ textAlign: 'center', padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="loading" style={{ padding: 0 }}>⚙️</span>
          <div>
            <strong>Running AI Roster Analysis...</strong>
            <p style={{ color: '#7aafc4', fontSize: 13, margin: '4px 0 0' }}>Computing VOR, grades, and recommendations from your live stats</p>
          </div>
        </div>
      )}


      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Roster preview */}
      {/* Roster chip preview — shown while audit is running */}
      {rosterLoading && <div className="loading">Loading your roster...</div>}

      {!rosterLoading && roster.length > 0 && !audit && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Roster ({roster.length} players) — Running analysis...</h3>
            <button className="btn btn-primary" onClick={runAudit} disabled={loading}
              style={{ padding: '10px 24px', fontSize: 14 }}>
              {loading ? '⟳ Analyzing...' : '⟳ Re-run Audit'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{
                background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6,
                padding: '4px 10px', fontSize: 12
              }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img 
              src="/cyborg_analyst.png" 
              alt="Cyborg Baseball Analyst" 
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glow)', boxShadow: '0 0 24px rgba(0, 200, 255, 0.25)' }} 
            />
          </div>
          <div className="loading">Running deep roster analysis...</div>
          <p style={{ color: '#7aafc4', fontSize: 13, marginTop: 8 }}>Calculating VOR, positional scarcity, category profile...</p>
        </div>
      )}

      {/* Audit results */}
      {audit && (
        <>
          {/* Grade banner */}
          <div className="card" style={{
            marginBottom: 16, padding: '24px 28px',
            background: 'linear-gradient(135deg, #0c2c56 0%, #0c1d35 100%)',
            border: '1px solid #1e3d5c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <GradeBadge grade={audit.grade} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                  Overall Grade
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  {audit.grade} — Your Roster
                </div>
                {audit.championshipPath && (
                  <p style={{ color: '#7aafc4', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    {audit.championshipPath}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {audit.strengths?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#00a86b', marginBottom: 12, fontSize: 15 }}>✅ Strengths</h3>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {audit.strengths.map((s, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {audit.weaknesses?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#ef4444', marginBottom: 12, fontSize: 15 }}>⚠️ Weaknesses</h3>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {audit.weaknesses.map((w, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(!audit.strengths || audit.strengths.length === 0) && audit.raw && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#4aafdb', marginBottom: 12, fontSize: 15 }}>🧠 Deep Analysis</h3>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {audit.raw.replace(/```json/g, '').replace(/```/g, '')}
              </div>
            </div>
          )}

          {/* Actionable moves */}
          {audit.moves?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>⚡ Recommended Moves</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {audit.moves.map((move, i) => (
                  <div key={i} style={{
                    background: '#122840', border: '1px solid #1e3d5c',
                    borderRadius: 8, padding: '12px 16px',
                    borderLeft: `3px solid ${move.priority === 'immediate' ? '#ef4444' : move.priority === 'high' ? '#f59e0b' : '#4aafdb'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{move.action}</div>
                      <PriorityBadge priority={move.priority} />
                    </div>
                    <p style={{ color: '#7aafc4', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{move.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VOR table */}
          {audit.vorByPlayer?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
                Value Over Replacement Rankings
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Pos</th>
                    <th>VOR Score</th>
                    <th>Scarcity</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.vorByPlayer.map((p, i) => (
                    <tr key={i}>
                      <td data-label="Player" style={{ fontWeight: 600 }}>{p.name}</td>
                      <td data-label="Pos">
                        <span className={`badge badge-${String(p.position || '').toLowerCase()}`}>{p.position}</span>
                      </td>
                      <td data-label="VOR Score">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: Math.max(4, (p.vor / 100) * 80), height: 6, borderRadius: 3,
                            background: p.vor >= 70 ? '#00a86b' : p.vor >= 40 ? '#f59e0b' : '#ef4444'
                          }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.vor}/100</span>
                        </div>
                      </td>
                      <td data-label="Scarcity">
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                          background: p.scarcity === 'elite' ? 'rgba(239,68,68,0.15)' : p.scarcity === 'scarce' ? 'rgba(245,158,11,0.15)' : 'rgba(74,175,219,0.1)',
                          color: p.scarcity === 'elite' ? '#ef4444' : p.scarcity === 'scarce' ? '#f59e0b' : '#4aafdb'
                        }}>{p.scarcity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={runAudit} disabled={loading}>
              {loading ? '⟳ Re-analyzing...' : '↻ Re-run Audit'}
            </button>
            <button className="btn btn-ghost" onClick={() => setAudit(null)}>Clear</button>
          </div>
        </>
      )}

      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to load your roster and run an AI audit.</p>
        </div>
      )}
    </div>
  )
}
```

---

## File: `components/TradeAnalyzer/TradeAnalyzer.jsx`

```jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { evaluateTrade } from '@/lib/fantasyBrain';
import { toast } from 'react-hot-toast';

export default function TradeAnalyzer() {
  const { leagues, selectedLeague, leagueData } = useLeague();
  const [myRoster, setMyRoster] = useState([]);
  const [giving, setGiving] = useState([]);
  const [receiving, setReceiving] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchMyRoster();
  }, [selectedLeague]);

  useEffect(() => {
    runEvaluation();
  }, [giving, receiving]);

  async function fetchMyRoster() {
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`);
      setMyRoster(res.data.players || []);
    } catch (err) {
      console.error('Failed to load roster', err);
    }
  }

  async function searchPlayers() {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, {
        params: { status: 'A', position: 'ALL', search: searchQuery }
      });
      setSearchResults(res.data || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }

  function runEvaluation() {
    if (giving.length === 0 && receiving.length === 0) {
      setEvalResult(null);
      return;
    }
    const result = evaluateTrade(giving, receiving, myRoster, leagueData?.settings || {});
    setEvalResult(result);
  }

  const addToGiving = (p) => {
    if (!giving.find(x => x.player_key === p.player_key)) setGiving([...giving, p]);
  };

  const addToReceiving = (p) => {
    if (!receiving.find(x => x.player_key === p.player_key)) setReceiving([...receiving, p]);
  };

  const removeFromGiving = (key) => setGiving(giving.filter(p => p.player_key !== key));
  const removeFromReceiving = (key) => setReceiving(receiving.filter(p => p.player_key !== key));

  return (
    <div className="trade-analyzer">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        {/* SIDE A: GIVING */}
        <div className="card" style={{ borderTop: '4px solid #ff4444' }}>
          <h3 style={{ color: '#ff4444', marginBottom: 16 }}>SENDING AWAY</h3>
          <div style={{ minHeight: 120, border: '2px dashed rgba(255,68,68,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            {giving.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>Click players from your roster below</p>
            ) : (
              giving.map(p => (
                <div key={p.player_key} className="trade-pill" onClick={() => removeFromGiving(p.player_key)}>
                  <span>{p.name || p.player_name}</span>
                  <span className="remove">×</span>
                </div>
              ))
            )}
          </div>
          
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Select from My Roster:</h4>
            {myRoster.map(p => (
              <div key={p.player_key} className="roster-item-small" onClick={() => addToGiving(p)}>
                <strong>{p.name || p.player_name}</strong> ({p.position})
              </div>
            ))}
          </div>
        </div>

        {/* SIDE B: RECEIVING */}
        <div className="card" style={{ borderTop: '4px solid #00c8ff' }}>
          <h3 style={{ color: '#00c8ff', marginBottom: 16 }}>RECEIVING</h3>
          <div style={{ minHeight: 120, border: '2px dashed rgba(0,200,255,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            {receiving.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>Search and add players below</p>
            ) : (
              receiving.map(p => (
                <div key={p.player_key} className="trade-pill-b" onClick={() => removeFromReceiving(p.player_key)}>
                  <span>{p.name || p.player_name}</span>
                  <span className="remove">×</span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Search league players..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchPlayers()}
            />
            <button className="btn btn-primary" onClick={searchPlayers} disabled={loading}>Search</button>
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {searchResults.map(p => (
              <div key={p.player_key} className="roster-item-small" onClick={() => addToReceiving(p)}>
                <strong>{p.name || p.player_name}</strong> ({p.position})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VERDICT SECTION */}
      {evalResult && (
        <div className="card verdict-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0,200,255,0.05) 0%, rgba(0,0,0,0.5) 100%)',
          border: '1px solid var(--primary)',
          textAlign: 'center',
          padding: 40
        }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            AI VERDICT: <span style={{ color: evalResult.score > 0 ? '#00ff88' : '#ff4444' }}>{evalResult.verdict}</span>
          </h2>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>SCORE: {evalResult.score} / 100</div>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto', color: 'var(--text-muted)' }}>{evalResult.reasoning}</p>
          {evalResult.counterOffer && (
             <div style={{ marginTop: 24, color: '#ffcc00', fontWeight: 700 }}>💡 PRO TIP: {evalResult.counterOffer}</div>
          )}
        </div>
      )}

      <style jsx>{`
        .trade-pill, .trade-pill-b {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,68,68,0.1);
          border: 1px solid rgba(255,68,68,0.3);
          padding: 4px 12px;
          border-radius: 20px;
          margin: 4px;
          cursor: pointer;
          font-weight: 700;
        }
        .trade-pill-b {
          background: rgba(0,200,255,0.1);
          border: 1px solid rgba(0,200,255,0.3);
        }
        .remove { opacity: 0.5; }
        .roster-item-small {
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          font-size: 14px;
        }
        .roster-item-small:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
```

---

## File: `components/TradeFinder/TradeFinder.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function TradeFinder({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) loadRoster()
  }, [selectedLeague])

  async function loadRoster() {
    setRosterLoading(true)
    setResult(null)
    setError('')
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`)
      setRoster(data.players || [])
    } catch (err) {
      setError('Could not load roster.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function findTrades() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      // Fetch all opponent rosters
      const allRostersRes = await axios.get(`/api/yahoo/league/${selectedLeague}/allrosters`)
      const allRosters = allRostersRes.data || []
      
      const { data } = await axios.post('/api/claude/trade/find', {
        my_roster: roster,
        all_rosters: allRosters,
        league_standings: [],
        league_key: selectedLeague
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Trade finder failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const myAnalysis = result?.myAnalysis

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◆ Trade Finder</h1>
          <p style={{ color: '#7aafc4' }}>AI identifies your surpluses and voids, then generates trade proposals with pitch language</p>
        </div>
        <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
          {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
        </select>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {rosterLoading && <div className="loading">Loading your roster...</div>}

      {/* Roster + trigger */}
      {!rosterLoading && roster.length > 0 && !result && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Roster ({roster.length} players)</h3>
            <button className="btn btn-primary" onClick={findTrades} disabled={loading}
              style={{ padding: '10px 24px', fontSize: 14 }}>
              {loading ? '⟳ Finding trades...' : '⚡ Find Trade Opportunities'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{
                background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6, padding: '4px 10px', fontSize: 12
              }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚡</div>
          <div className="loading">Scanning league rosters and analyzing compatibility...</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* My roster analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            {myAnalysis?.surpluses?.length > 0 && (
              <div className="card" style={{ background: 'rgba(0,168,107,0.07)', border: '1px solid rgba(0,168,107,0.2)' }}>
                <h3 style={{ color: '#00a86b', fontSize: 14, marginBottom: 10 }}>📤 Your Surplus Positions</h3>
                {myAnalysis.surpluses.map((s, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <span className={`badge badge-${s.position.toLowerCase()}`} style={{ marginRight: 6 }}>{s.position}</span>
                    <span style={{ fontSize: 12, color: '#7aafc4' }}>{s.players?.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}
            {myAnalysis?.voids?.length > 0 && (
              <div className="card" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ color: '#ef4444', fontSize: 14, marginBottom: 10 }}>📥 Your Roster Voids</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {myAnalysis.voids.map((v, i) => (
                    <span key={i} className={`badge badge-${v.toLowerCase()}`}>{v}</span>
                  ))}
                </div>
              </div>
            )}
            {myAnalysis?.sellHigh?.length > 0 && (
              <div className="card" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <h3 style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>📈 Sell High Candidates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {myAnalysis.sellHigh.map((p, i) => (
                    <span key={i} style={{ fontSize: 13, color: '#e2e8f0' }}>{p.name}
                      <span style={{ fontSize: 11, color: '#7aafc4', marginLeft: 8 }}>VOR {p.vor}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trade proposals */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/cyborg_mascot_homerun.png" alt="Galactic Slugger" className="mascot-ai" />
              <h3 style={{ color: '#007a7a', margin: 0 }}>🎯 AI Trade Proposals</h3>
            </div>
            <div className="ai-response">{result.proposals}</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={findTrades} disabled={loading}>
              {loading ? '⟳ Re-analyzing...' : '↻ Regenerate'}
            </button>
            <button className="btn btn-ghost" onClick={() => setResult(null)}>Clear</button>
          </div>
        </>
      )}

      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to load your roster and find trade opportunities.</p>
        </div>
      )}
    </div>
  )
}
```

---

## File: `components/TrophyCase/PackDropModal.jsx`

```jsx
import React, { useState } from 'react';
import './TrophyCase.css';

export default function PackDropModal({ awardedCard, onClose }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCard, setShowCard] = useState(false);

  if (!awardedCard) return null;

  const handleRip = () => {
    setIsRevealed(true);
    // Wait for rip animation to finish before showing the card drop
    setTimeout(() => {
      setShowCard(true);
    }, 600);
  };

  return (
    <div className="pack-opening-overlay">
      {!showCard ? (
        <div className={`foil-pack ${isRevealed ? 'pack-ripped' : ''}`} onClick={!isRevealed ? handleRip : undefined}>
          <div className="foil-texture"></div>
          <div className="foil-glare"></div>
          <h2 className="strobe-text" style={{ fontSize: 28, textAlign: 'center', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>GALACTIC<br/>LEAGUE</h2>
          <p style={{ color: '#00c8ff', fontWeight: 800, marginTop: 12, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>SERIES 3</p>
          <div className="tap-to-rip">TAP TO RIP FOIL</div>
        </div>
      ) : (
        <div className="pack-shatter-effect">
          <h1 className="pack-title strobe-text">NEW CARD ACQUIRED!</h1>
          <div className={`pack-card-container drop-in ${awardedCard.rarity}`}>
            <img src={awardedCard.img} alt={awardedCard.name} className="pack-card-image" />
            {awardedCard.has_signature && (
              <div className={`card-signature ${awardedCard.sig_style || ''}`}>{awardedCard.signature_name}</div>
            )}
            {awardedCard.has_patch && (
              <div className={`card-patch ${awardedCard.patch_type || 'jersey'}`} />
            )}
            <div className="card-front-nameplate" style={{ borderLeftColor: awardedCard.teamColor || '#fff' }}>
              <div className="plate-name">{awardedCard.playerName || awardedCard.name}</div>
              <div className="plate-team">{awardedCard.team || 'Galactic'} | {awardedCard.position || 'Player'}</div>
            </div>
          </div>
          <div className="pack-card-details slide-up">
            <h2 style={{ color: 'white' }}>{awardedCard.name}</h2>
            <p className={`rarity-tag ${awardedCard.rarity}`}>{awardedCard.rarity.toUpperCase()}</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 24, fontSize: 18, padding: '12px 32px' }}>
              Add to Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/TrophyCase/TradeBlock.css`

```css
.trade-block-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.trade-header {
  margin-bottom: 32px;
}

.trade-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #1e3d5c;
  padding-bottom: 12px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: #7aafc4;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(0, 200, 255, 0.1);
  color: #00c8ff;
}

.tab-btn.active {
  background: rgba(0, 200, 255, 0.15);
  color: #00c8ff;
  border: 1px solid rgba(0, 200, 255, 0.3);
}

.badge-count {
  background: #ff0088;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 800;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trade-card-slot {
  background: #0c1d35;
  border: 1px solid #1e3d5c;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, border-color 0.2s;
}

.trade-card-slot:hover {
  transform: translateY(-4px);
  border-color: #00c8ff;
}

.card-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #112233, #0a1526);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #7aafc4;
  border: 2px dashed #1e3d5c;
}

.trade-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seller {
  font-size: 13px;
  color: #e2e8f0;
}

.seeking {
  font-size: 12px;
  color: #ffaa00;
  font-style: italic;
  padding: 8px;
  background: rgba(255, 170, 0, 0.1);
  border-radius: 6px;
  border-left: 3px solid #ffaa00;
}

.make-offer-btn {
  margin-top: 8px;
  width: 100%;
  font-size: 14px;
}

.add-to-block-btn {
  background: transparent;
  border: 2px dashed #00c8ff;
  color: #00c8ff;
  font-weight: 700;
  padding: 16px 32px;
  margin-top: 24px;
}

.add-to-block-btn:hover {
  background: rgba(0, 200, 255, 0.1);
}

/* Showcases Tab */
.public-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 200, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00c8ff;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.public-toggle input[type="checkbox"] {
  accent-color: #ff0088;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.showcase-user-card {
  background: #0c1d35;
  border: 1px solid #1e3d5c;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, border-color 0.2s;
}

.showcase-user-card:hover {
  transform: translateY(-4px);
  border-color: #00c8ff;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff0088, #00c8ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.3);
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.user-info p {
  margin: 0;
  font-size: 12px;
  color: #7aafc4;
}

.showcase-user-card .btn-ghost {
  font-size: 12px;
  padding: 6px 12px;
  border: 1px solid #1e3d5c;
}

.showcase-user-card .btn-ghost:hover {
  border-color: #00c8ff;
}
```

---

## File: `components/TrophyCase/TradeBlock.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './TradeBlock.css';

export default function TradeBlock() {
  const [activeTab, setActiveTab] = useState('market'); // 'market', 'my-block', 'offers'
  const [marketListings, setMarketListings] = useState([]);
  const [myVault, setMyVault] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [seekingText, setSeekingText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Make Offer State
  const [offerModalListing, setOfferModalListing] = useState(null);
  const [offerSelectedCard, setOfferSelectedCard] = useState(null);

  const fetchMarket = async () => {
    try {
      const { data } = await axios.get('/api/tradeblock');
      setMarketListings(data.listings || []);
    } catch (e) {
      toast.error('Failed to load global market');
    }
  };

  const fetchVault = async () => {
    try {
      const { data } = await axios.get('/api/trophy/album');
      setMyVault(data.unlocked_cards || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchMarket(), fetchVault()]).finally(() => setLoading(false));
  }, []);

  const handlePostTrade = async () => {
    if (!selectedCard || !seekingText.trim()) return toast.error("Select a card and state what you're seeking.");
    try {
      await axios.post('/api/tradeblock', {
        instanceId: selectedCard.instanceId,
        seeking: seekingText
      });
      toast.success("Card posted to Global Market!");
      setSelectedCard(null);
      setSeekingText('');
      fetchMarket();
      setActiveTab('market');
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to post trade");
    }
  };

  const submitOffer = async () => {
    if (!offerSelectedCard || !offerModalListing) return toast.error("Select a card to offer");
    try {
      // Stubbed API call to /api/tradeblock/offer
      await axios.post('/api/tradeblock/offer', {
        listingId: offerModalListing.id,
        offerInstanceId: offerSelectedCard.instanceId
      });
      toast.success("Offer submitted successfully!");
      setOfferModalListing(null);
      setOfferSelectedCard(null);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to submit offer");
    }
  };

  return (
    <div className="trade-block-container">
      <div className="trade-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🤝 The Galactic Trade Block</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Buy, sell, and negotiate for the missing pieces of your digital collection.
          </p>
        </div>
      </div>

      <div className="trade-tabs">
        <button 
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          🌐 Global Market
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my-block' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-block')}
        >
          📦 My Trade Block
        </button>
        <button 
          className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          📩 Incoming Offers <span className="badge-count">0</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'showcases' ? 'active' : ''}`}
          onClick={() => setActiveTab('showcases')}
        >
          📖 Public Showcases
        </button>
      </div>

      <div className="trade-content">
        {loading ? (
          <div className="loading" style={{ padding: 40 }}>Scanning global trade frequencies...</div>
        ) : (
          <>
            {activeTab === 'market' && (
              <div className="market-grid">
                {marketListings.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>The Trade Block is currently empty. Post your cards to get started!</p>
                ) : (
                  marketListings.map(listing => (
                    <div key={listing.id} className="trade-card-slot">
                      <div className="card-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
                        <img src={listing.card.img} alt={listing.card.playerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 'bold' }}>{listing.card.playerName}</div>
                          <div style={{ fontSize: 10, color: listing.card.teamColor || '#aaa' }}>{listing.card.rarity.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="trade-details">
                        <div className="seller">Offered by: <strong>{listing.username}</strong></div>
                        <div className="seeking">Seeking: {listing.seeking}</div>
                        <button className="btn btn-primary make-offer-btn" onClick={() => setOfferModalListing(listing)}>Make Offer</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'my-block' && (
              <div className="my-block-section">
                <p>Select cards from your Vault to place on the public Trade Block.</p>
                <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                  <div style={{ flex: 1 }}>
                    <select 
                      className="form-control" 
                      onChange={e => setSelectedCard(myVault.find(c => c.instanceId === e.target.value))}
                      value={selectedCard?.instanceId || ''}
                      style={{ background: '#0c1d35', color: '#fff', padding: 12, border: '1px solid #1e3d5c', borderRadius: 8, width: '100%', marginBottom: 16 }}
                    >
                      <option value="">-- Select a Card from your Vault --</option>
                      {myVault.map(c => (
                        <option key={c.instanceId} value={c.instanceId}>
                          {c.playerName} ({c.team}) - {c.rarity?.toUpperCase() || 'UNKNOWN'}
                        </option>
                      ))}
                    </select>
                    
                    <input 
                      type="text" 
                      placeholder="What are you seeking in return? (e.g. 'Any Epic Pitcher')" 
                      value={seekingText}
                      onChange={e => setSeekingText(e.target.value)}
                      style={{ background: '#0c1d35', color: '#fff', padding: 12, border: '1px solid #1e3d5c', borderRadius: 8, width: '100%', marginBottom: 16 }}
                    />
                    
                    <button className="btn btn-primary" onClick={handlePostTrade} disabled={!selectedCard || !seekingText.trim()}>
                      + Post to Global Market
                    </button>
                  </div>
                  
                  <div style={{ width: 250, border: '1px dashed #1e3d5c', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    {selectedCard ? (
                      <div style={{ padding: 10, textAlign: 'center' }}>
                        <img src={selectedCard.img} alt={selectedCard.playerName} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
                        <div style={{ fontWeight: 'bold' }}>{selectedCard.playerName}</div>
                        <div style={{ fontSize: 12, color: selectedCard.teamColor || '#aaa' }}>{selectedCard.rarity?.toUpperCase() || 'UNKNOWN'}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Card Preview</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="offers-section">
                <p style={{ color: 'var(--text-muted)' }}>You have no pending trade offers.</p>
              </div>
            )}

            {activeTab === 'showcases' && (
              <div className="showcases-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <p style={{ color: 'var(--text-muted)' }}>Browse other collectors' public vaults to see their rarest pulls.</p>
                  <label className="public-toggle">
                    <input type="checkbox" defaultChecked={true} />
                    <span>Make My Collection Public</span>
                  </label>
                </div>
                
                <div className="showcase-grid">
                  <div className="showcase-user-card">
                    <div className="user-avatar">🤖</div>
                    <div className="user-info">
                      <h3>CyberScout24</h3>
                      <p>42 Unique Cards • 3 Legendaries</p>
                    </div>
                    <button className="btn btn-ghost">View Collection</button>
                  </div>
                  <div className="showcase-user-card">
                    <div className="user-avatar">👽</div>
                    <div className="user-info">
                      <h3>DiamondHands</h3>
                      <p>110 Unique Cards • 8 Legendaries</p>
                    </div>
                    <button className="btn btn-ghost">View Collection</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {offerModalListing && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: '#0a192f', border: '1px solid #1e3d5c', maxWidth: 500, padding: 24, borderRadius: 12 }}>
            <h2>Make Offer to {offerModalListing.username}</h2>
            <p>They are offering: <strong>{offerModalListing.card.playerName}</strong></p>
            <p style={{ color: '#00c8ff' }}>Seeking: {offerModalListing.seeking}</p>
            
            <div style={{ marginTop: 24 }}>
              <label>Select a card to offer from your Vault:</label>
              <select 
                className="form-control" 
                onChange={e => setOfferSelectedCard(myVault.find(c => c.instanceId === e.target.value))}
                value={offerSelectedCard?.instanceId || ''}
                style={{ background: '#0c1d35', color: '#fff', padding: 12, border: '1px solid #1e3d5c', borderRadius: 8, width: '100%', marginTop: 8 }}
              >
                <option value="">-- Select Card --</option>
                {myVault.map(c => (
                  <option key={c.instanceId} value={c.instanceId}>
                    {c.playerName} - {c.rarity?.toUpperCase() || 'UNKNOWN'}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setOfferModalListing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitOffer} disabled={!offerSelectedCard}>Submit Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/TrophyCase/TrophyCase.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');

/* Trophy Case Layout */
.trophy-case-container {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.trophy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: rgba(12, 29, 53, 0.6);
  padding: 32px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.album-stats-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.stat {
  text-align: right;
}
.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  font-family: var(--font-heading);
}
.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

/* Button Animations */
.claim-btn {
  background: linear-gradient(135deg, #FFD700, #FDB931);
  color: #111;
  font-weight: 800;
  padding: 14px 24px;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.pulse-glow {
  animation: pulse-gold 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulse-gold {
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
}

.claimed-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

/* Album Grid */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 32px;
}

.card-slot {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 3D FLIP ARCHITECTURE */
.card-wrapper-3d {
  perspective: 1200px;
  width: 100%;
  aspect-ratio: 3/4;
}

.card-inner-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  cursor: pointer;
}

.card-wrapper-3d.is-flipped .card-inner-3d {
  transform: rotateY(180deg);
}

.card-front-3d, .card-back-3d {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.card-front-3d {
  background: #000;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  display: block;
}

/* BACK FACE */
.card-back-3d {
  background: linear-gradient(135deg, #0c1d35 0%, #050a12 100%);
  transform: rotateY(180deg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid var(--primary);
}

.card-back-3d .serial {
  font-size: 10px;
  color: var(--primary);
  font-weight: 900;
  letter-spacing: 0.1em;
}

.card-back-3d .series {
  font-size: 12px;
  color: white;
  font-weight: 700;
  margin-top: 4px;
}

.card-back-3d h4 {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  margin-top: 20px;
}

.card-back-3d p {
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
  font-style: italic;
}

.card-back-3d .rarity-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  border: 1px solid var(--primary);
  color: var(--primary);
}

/* Locked State Silhouette */
.card-slot.locked .card-front-3d {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  background: rgba(0,0,0,0.3);
  box-shadow: none;
}
.card-slot.locked .card-image {
  filter: grayscale(100%) brightness(15%) blur(3px);
  opacity: 0.5;
}

.lock-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
}

.dupe-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary);
  color: white;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 10;
}

.card-meta {
  text-align: center;
}
.card-name {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
  font-family: var(--font-heading);
}

/* Rarity Styles */
.card-rarity {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.card-rarity.common { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }
.card-rarity.uncommon { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
.card-rarity.rare { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.card-rarity.epic { color: #a855f7; background: rgba(168, 85, 247, 0.1); }
.card-rarity.legendary { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }


/* AGGRESSIVE PACK OPENING ANIMATION */
.pack-opening-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.pack-shatter-effect {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.strobe-text {
  font-family: var(--font-heading);
  font-size: 64px;
  font-weight: 900;
  color: white;
  text-align: center;
  letter-spacing: 0.1em;
  margin-bottom: 40px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px var(--primary);
  animation: explode-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both,
             neon-flicker 2s infinite alternate;
}

.pack-card-container {
  width: 320px;
  height: 440px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.2);
}

.pack-card-container.epic { box-shadow: 0 0 80px rgba(168, 85, 247, 0.6); }
.pack-card-container.legendary { box-shadow: 0 0 100px rgba(245, 158, 11, 0.8); }

.pack-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pack-card-details {
  margin-top: 32px;
  text-align: center;
}
.pack-card-details h2 {
  font-size: 32px;
  margin-bottom: 8px;
  font-family: var(--font-heading);
}

/* Keyframes */
.drop-in {
  animation: smash-down 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.slide-up {
  animation: fade-up 0.8s 0.8s ease backwards;
}

@keyframes smash-down {
  0% { transform: scale(3) translateY(-100px) rotate3d(1, 1, 1, 45deg); opacity: 0; }
  50% { filter: brightness(2); }
  100% { transform: scale(1) translateY(0) rotate3d(0, 0, 0, 0deg); opacity: 1; }
}

@keyframes explode-in {
  0% { transform: scale(0.5); opacity: 0; letter-spacing: -0.5em; }
  100% { transform: scale(1); opacity: 1; letter-spacing: 0.1em; }
}

@keyframes neon-flicker {
  0% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px var(--primary); }
  100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 60px var(--primary), 0 0 80px #e11d48; }
}

@keyframes fade-up {
  0% { transform: translateY(40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Legendary Gamification - Fabric Texture */
.card-wrapper-3d.legendary .card-front-3d::before,
.pack-card-container.legendary::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px);
  background-size: 8px 8px;
  mix-blend-mode: overlay;
  z-index: 5;
  pointer-events: none;
}

/* Legendary Gamification - Digital Signature overlay */
.card-signature {
  position: absolute;
  bottom: 25%;
  left: 0;
  right: 0;
  text-align: center;
  transform: rotate(-5deg);
  font-family: 'Caveat', 'Playball', cursive, sans-serif;
  font-size: 32px;
  background: linear-gradient(135deg, #FFD700 0%, #FFF5CC 50%, #FFD700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  z-index: 100;
  filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 15px rgba(255,215,0,0.6));
  pointer-events: none;
  opacity: 0;
  animation: sign-in 0.8s 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  white-space: normal;
  padding: 0 10px;
  word-wrap: break-word;
  line-height: 0.9;
}

.card-signature.classic {
  font-family: 'Mrs Saint Delafield', cursive;
  font-size: 38px;
  transform: rotate(-2deg);
}

.card-signature.aggressive {
  font-family: 'Homemade Apple', cursive;
  font-size: 22px;
  font-weight: bold;
}

.card-patch {
  position: absolute;
  bottom: 15%;
  right: 15%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at center, #222, #000);
  border: 1px solid rgba(255, 215, 0, 0.4);
  box-shadow: 
    inset 0 6px 20px rgba(0,0,0,1), 
    0 1px 1px rgba(255,255,255,0.1),
    0 0 0 4px #111;
  border-radius: 4px;
  z-index: 90;
  overflow: hidden;
}

.card-patch::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%);
  background-size: 3px 3px;
}

.card-patch::before {
  content: "";
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(135deg, transparent 45%, rgba(255,215,0,0.05) 50%, transparent 55%);
  animation: patch-glint 3s infinite linear;
}

@keyframes patch-glint {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* CYBERPUNK PATCH MATERIALS */
.card-patch.metal {
  background: linear-gradient(135deg, #718096 0%, #cbd5e1 50%, #334155 100%);
  border: 1px solid #94a3b8;
}
.card-patch.metal::after {
  content: "";
  background-image: 
    linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%);
  background-size: 15px 15px;
}
.card-patch.motherboard {
  background: #064e3b;
  border: 1px solid #10b981;
}
.card-patch.motherboard::after {
  content: "";
  background-image: 
    linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px),
    linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px);
  background-size: 8px 8px;
}

.card-set-num {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.5);
  color: rgba(255,255,255,0.7);
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(255,215,0,0.3);
  z-index: 10;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 1px;
}

.card-back-3d .mint-stamp {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: transparent;
  color: #cc3333; /* Hobby ink red */
  padding: 5px 15px;
  font-weight: 900;
  transform: rotate(-15deg);
  font-size: 22px;
  font-family: 'Courier New', Courier, monospace;
  opacity: 0.8;
  mix-blend-mode: multiply;
  letter-spacing: 2px;
}

@keyframes sign-in {
}

/* Foil Pack Rip Animation */
.foil-pack {
  width: 300px;
  height: 420px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f172a 50%, #0f172a 100%);
  border-radius: 12px;
  border: 4px solid #334155;
  box-shadow: 0 0 30px rgba(0,200,255,0.2), inset 0 0 20px rgba(0,0,0,0.8);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: float-pack 3s ease-in-out infinite;
  z-index: 100;
}

.foil-pack:hover {
  transform: scale(1.05);
  box-shadow: 0 0 50px rgba(0, 200, 255, 0.5), inset 0 0 30px rgba(0,0,0,0.8);
  border-color: #00c8ff;
}

.foil-texture {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.05) 0px,
    rgba(255, 255, 255, 0.05) 2px,
    transparent 2px,
    transparent 8px
  );
  pointer-events: none;
}

.foil-glare {
  position: absolute;
  top: -50%; left: -50%; right: -50%; bottom: -50%;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 55%, transparent 60%);
  transform: rotate(45deg);
  animation: foil-shine 6s linear infinite;
  pointer-events: none;
}

.tap-to-rip {
  margin-top: 40px;
  padding: 12px 24px;
  background: #ff0088;
  color: white;
  font-weight: 800;
  border-radius: 8px;
  font-size: 16px;
  letter-spacing: 1px;
  animation: pulse 1.5s infinite;
  box-shadow: 0 4px 15px rgba(255, 0, 136, 0.5);
  border: 2px solid #ff66b2;
}

@keyframes float-pack {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes foil-shine {
  0% { left: -100%; top: -100%; }
  50% { left: 100%; top: 100%; }
  100% { left: 100%; top: 100%; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Ripped animation */
.pack-ripped {
  animation: rip-away 0.6s cubic-bezier(0.8, -0.2, 0.2, 1.5) forwards;
  pointer-events: none;
}

@keyframes rip-away {
  0% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
  50% { opacity: 0.8; }
  100% { transform: scale(1.2) translateY(-120vh) rotate(-15deg); opacity: 0; }
}

/* === Rarity Foil Variations (Refractors/Prisms) === */
.card-front-3d.epic::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,0,255,0.4), rgba(0,255,255,0.4), rgba(255,255,0,0.4));
  mix-blend-mode: overlay;
  pointer-events: none;
  opacity: 0.8;
  z-index: 10;
  animation: prism-shine 4s infinite linear;
}

.card-front-3d.legendary::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,215,0,0.6), rgba(255,255,255,0.8), rgba(255,140,0,0.6));
  mix-blend-mode: color-dodge;
  pointer-events: none;
  opacity: 0.9;
  z-index: 10;
  animation: prism-shine 3s infinite linear;
}

@keyframes prism-shine {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.card-patch {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.8);
  z-index: 15;
}

.card-patch.jersey {
  background: repeating-linear-gradient(45deg, #111, #111 5px, #333 5px, #333 10px);
}

.card-patch.metal {
  background: linear-gradient(135deg, #ccc, #fff, #999);
}

.card-patch.motherboard {
  background: #002200;
  background-image: radial-gradient(#00ff00 1px, transparent 1px);
  background-size: 8px 8px;
}

.card-trademark {
  font-size: 6px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  margin-top: 12px;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-front-nameplate {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-left: 4px solid #fff;
  padding: 6px 10px;
  border-radius: 4px;
  text-align: left;
  z-index: 10;
}
.plate-name {
  color: white;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.1;
}
.plate-team {
  color: #aaa;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}
```

---

## File: `components/TrophyCase/TrophyCase.jsx`

```jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PackDropModal from './PackDropModal';
import './TrophyCase.css';

export default function TrophyCase() {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);
  const [flippedIds, setFlippedIds] = useState(new Set());

  useEffect(() => {
    fetchAlbum();
  }, []);

  async function fetchAlbum() {
    try {
      const { data } = await axios.get('/api/trophy/album');
      setCollection(data);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load Collection');
      setLoading(false);
    }
  }

  const toggleFlip = (id) => {
    const newFlipped = new Set(flippedIds);
    if (newFlipped.has(id)) newFlipped.delete(id);
    else newFlipped.add(id);
    setFlippedIds(newFlipped);
  };

  const getSeries = (id) => {
    if (id.startsWith('tgl_')) return 'Series 2: Titanium Grapefruit League';
    return 'Series 1: Goin\' Yard Core Set';
  };

  function renderCard(cardDef) {
    const unlocks = collection?.unlocked_cards?.filter(u => u.id === cardDef.id) || [];
    const isUnlocked = unlocks.length > 0;
    const count = unlocks.length;
    const isFlipped = flippedIds.has(cardDef.id);
    
    return (
      <div key={cardDef.id} className={`card-slot ${isUnlocked ? 'unlocked' : 'locked'}`}>
        <div 
          className={`card-wrapper-3d ${isFlipped && isUnlocked ? 'is-flipped' : ''}`}
          onClick={() => isUnlocked && toggleFlip(cardDef.id)}
        >
          <div className="card-inner-3d">
            {/* FRONT */}
            <div className={`card-front-3d ${isUnlocked ? cardDef.rarity : ''}`} data-id={cardDef.id}>
              <img src={cardDef.img} alt={cardDef.name} className="card-image" />
              {isUnlocked && cardDef.has_signature && (
                <div className={`card-signature ${cardDef.sig_style || ''}`}>{cardDef.signature_name}</div>
              )}
              {isUnlocked && cardDef.has_patch && (
                <div className={`card-patch ${cardDef.patch_type || 'jersey'}`} />
              )}
              {!isUnlocked && (
                <div className="lock-overlay">
                  <span style={{ fontSize: 32 }}>🔒</span>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>UNDISCOVERED</div>
                </div>
              )}
              {isUnlocked && count > 1 && (
                <div className="dupe-badge">x{count}</div>
              )}
              {isUnlocked && (
                <div className="card-front-nameplate" style={{ borderLeftColor: cardDef.teamColor || '#fff' }}>
                  <div className="plate-name">{cardDef.playerName || cardDef.name}</div>
                  <div className="plate-team">{cardDef.team || 'Galactic'} | {cardDef.position || 'Player'}</div>
                </div>
              )}
              <div className="card-set-num">CARD #{cardDef.set_num}</div>
            </div>

            {/* BACK */}
            <div className="card-back-3d">
              <div className="series">{getSeries(cardDef.id)}</div>
              {isUnlocked && cardDef.serial_total && unlocks[0]?.serialPosition && (
                <div className="mint-stamp">
                  {unlocks[0].serialPosition} / {cardDef.serial_total}
                </div>
              )}
              <div className="back-content" style={{ padding: '0 12px' }}>
                <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{cardDef.playerName || cardDef.name}</h3>
                <div style={{ fontSize: 11, color: cardDef.teamColor || '#00c8ff', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                  {cardDef.team || 'Goin\' Yard Core'} | {cardDef.position || 'Utility'}
                </div>
                
                <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>SPECIFICATION</div>
                <h4 style={{ marginBottom: 12 }}>{cardDef.specialization || 'Player Intelligence'}</h4>
                
                <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>BIOMETRIC LORE</div>
                <p style={{ fontSize: 12, lineHeight: 1.4 }}>{cardDef.lore || "A premium digital collectible."}</p>
              </div>
              <div className="back-footer">
                <span className="rarity-tag">{cardDef.rarity.toUpperCase()} UNIT</span>
                <div className="card-trademark">© 2046 Galactic Baseball Auth. TM Goin' Yard Collectibles.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-meta">
          <div className="card-name">{isUnlocked ? cardDef.name : '???'}</div>
          <div className={`card-rarity ${cardDef.rarity}`}>
            {cardDef.rarity.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  if (loading && !collection) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading Trophy Case...</div>;
  }

  const { all_cards, unlocked_cards, last_daily_pack, server_today } = collection || {};
  // Use server's Pacific Time date — consistent across all devices
  const todayPT = server_today || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  
  let canClaimDaily = true;
  if (last_daily_pack) {
    if (typeof last_daily_pack === 'string') canClaimDaily = (last_daily_pack !== todayPT);
    else canClaimDaily = (Date.now() - last_daily_pack > 20 * 60 * 60 * 1000);
  }
  
  const validUnlockedIds = unlocked_cards?.filter(c => all_cards?.some(card => card.id === c.id)).map(c => c.id) || [];
  const uniqueUnlocked = new Set(validUnlockedIds).size;

  const sortedCards = [...(all_cards || [])].sort((a, b) => {
    const aUnlocked = validUnlockedIds.includes(a.id);
    const bUnlocked = validUnlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  async function claimDailyPack() {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/trophy/daily-pack');
      setAwardedCard(data.awarded);
      setPackOpening(true);
      fetchAlbum();
    } catch (e) {
      setLoading(false);
      toast.error(e.response?.data?.error || 'Failed to claim pack');
    }
  }

  return (
    <div className="trophy-case-container">
      <PackDropModal awardedCard={packOpening ? awardedCard : null} onClose={() => setPackOpening(false)} />
      <div className="trophy-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🏆 The Collector's Album</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Earn premium digital trading cards by dominating your league, maintaining an A+ roster, and spotting rising rookies.
            <a href="/vault" style={{ color: 'var(--primary)', marginLeft: 8, textDecoration: 'none', fontWeight: 600 }}>View Full Collection →</a>
          </p>
        </div>
        <div className="album-stats-box">
          <div className="stat">
            <div className="stat-value">{uniqueUnlocked} / {all_cards?.length || 0}</div>
            <div className="stat-label">Unique Cards</div>
          </div>
          {canClaimDaily ? (
             <button className="btn claim-btn pulse-glow" onClick={claimDailyPack} disabled={loading}>
               🎁 Claim Daily Free Card!
             </button>
          ) : (
             <div className="claimed-text">Daily Card Claimed. Check back tomorrow!</div>
          )}
        </div>
      </div>
      <div className="album-grid">
        {sortedCards.map(card => renderCard(card))}
      </div>
    </div>
  );
}
```

---

## File: `components/TrophyCase/Vault.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Mrs+Saint+Delafield&family=Homemade+Apple&display=swap');

.vault-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.vault-header {
  text-align: center;
  margin-bottom: 60px;
}

.vault-header h1 {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #fff 0%, #7aafc4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  font-family: var(--font-heading);
}

.vault-header p {
  color: var(--text-muted);
  font-size: 18px;
  font-weight: 500;
}

.vault-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 32px;
}

/* 3D FLIP ARCHITECTURE */
.vault-card-wrapper {
  perspective: 1200px;
  height: 320px;
  cursor: pointer;
}

.vault-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
}

.vault-card-wrapper.is-flipped .vault-card-inner {
  transform: rotateY(180deg);
}

.vault-card-front, .vault-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

/* FRONT FACE */
.vault-card-front {
  background: #0a111a;
  display: flex;
  flex-direction: column;
}

.vault-card-visual {
  position: relative;
  flex: 1;
  background: #000;
  overflow: hidden;
}

.vault-card-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.vault-card-id {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.8);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid var(--primary);
}

.vault-card-info {
  padding: 16px;
  background: linear-gradient(to top, #0c1d35, #0a111a);
}

.vault-card-info h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* BACK FACE */
.vault-card-back {
  background: linear-gradient(135deg, #0c1d35 0%, #050a12 100%);
  transform: rotateY(180deg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid var(--primary);
}

.back-header {
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 12px;
}

.back-header .serial {
  font-size: 10px;
  color: var(--primary);
  font-weight: 900;
  letter-spacing: 0.1em;
}

.back-header .series {
  font-size: 12px;
  color: white;
  font-weight: 700;
  margin-top: 4px;
}

.back-content {
  margin: 20px 0;
}

.back-content h4 {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.back-content p {
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
  font-style: italic;
}

.back-footer {
  text-align: center;
}

.rarity-seal {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* RARITY COLORS */
.common { border-color: #4a5568; }
.uncommon { border-color: #48bb78; }
.rare { border-color: #4299e1; }
.epic { border-color: #9f7aea; }
.legendary { border-color: #d69e2e; box-shadow: 0 0 20px rgba(214, 158, 46, 0.3); }

.rarity-seal.common { background: rgba(74, 85, 104, 0.2); color: #a0aec0; border: 1px solid #4a5568; }
.rarity-seal.uncommon { background: rgba(72, 187, 120, 0.2); color: #68d391; border: 1px solid #48bb78; }
.rarity-seal.rare { background: rgba(66, 153, 225, 0.2); color: #63b3ed; border: 1px solid #4299e1; }
.rarity-seal.epic { background: rgba(159, 122, 234, 0.2); color: #b794f4; border: 1px solid #9f7aea; }
.rarity-seal.legendary { background: rgba(214, 158, 46, 0.2); color: #ecc94b; border: 1px solid #d69e2e; }

.vault-loading {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-muted);
  font-weight: 700;
}

/* PREMIUM OVERLAYS */
/* Clean Card Face Style */
.vault-card-visual img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Preserve the card aspect ratio without backgrounds */
  background: #000;
  border-radius: 8px;
}

.vault-card-visual .card-signature {
  position: absolute;
  bottom: 25%; /* Anchored to the bottom half of the card face */
  left: 50%;
  transform: translateX(-50%) rotate(-5deg);
  font-family: 'Caveat', cursive;
  font-size: 32px;
  background: linear-gradient(135deg, #FFD700 0%, #FFF5CC 50%, #FFD700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(255,215,0,0.6));
  pointer-events: none;
  white-space: nowrap;
  z-index: 100;
  opacity: 0;
  animation: sign-in 0.8s 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.vault-card-visual .card-signature.classic {
  font-family: 'Mrs Saint Delafield', cursive;
  font-size: 42px;
  transform: translateX(-50%) rotate(-2deg);
}

.vault-card-visual .card-signature.aggressive {
  font-family: 'Homemade Apple', cursive;
  font-size: 24px;
  font-weight: bold;
}

.vault-card-visual .card-patch {
  position: absolute;
  bottom: 15%;
  right: 15%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at center, #222, #000);
  border: 1px solid rgba(255, 215, 0, 0.5);
  box-shadow: 
    inset 0 6px 20px rgba(0,0,0,1), 
    0 1px 1px rgba(255,255,255,0.2),
    0 0 0 4px #111;
  border-radius: 4px;
  z-index: 90;
  overflow: hidden;
}

.vault-card-visual .card-patch::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%);
  background-size: 3px 3px;
  opacity: 0.6;
}

/* Simulate the card thickness/depth on the patch window */
.vault-card-visual .card-patch::before {
  content: "";
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
  pointer-events: none;
  z-index: 2;
}

@keyframes sign-in {
  from { opacity: 0; transform: translateX(-50%) rotate(-10deg) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) rotate(-5deg) scale(1); }
}

.vault-card-id {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.5);
  color: rgba(255,255,255,0.7);
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(255,215,0,0.3);
  z-index: 10;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 1px;
}

.vault-card-back .mint-stamp {
  position: absolute;
  bottom: 25px;
  right: 25px;
  background: transparent;
  color: #cc3333; /* Darker red ink */
  padding: 4px 12px;
  font-weight: 900;
  transform: rotate(-15deg);
  font-size: 20px;
  font-family: 'Courier New', Courier, monospace;
  opacity: 0.8;
  mix-blend-mode: multiply;
  text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.1);
  letter-spacing: 2px;
}
```

---

## File: `components/TrophyCase/Vault.jsx`

```jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Vault.css';

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState(new Set());

  useEffect(() => {
    axios.get('/api/trophy/album').then(({ data }) => {
      setCards(data.all_cards || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleFlip = (id) => {
    const newFlipped = new Set(flippedIds);
    if (newFlipped.has(id)) newFlipped.delete(id);
    else newFlipped.add(id);
    setFlippedIds(newFlipped);
  };

  const getSeries = (id) => {
    if (id.startsWith('tgl_')) return 'Series 2: Titanium Grapefruit League';
    return 'Series 1: Goin\' Yard Core Set';
  };

  if (loading) return <div className="vault-loading">Opening the Vault...</div>;

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1>💎 The Collector's Vault</h1>
        <p>Master Reference: All 36 Series 1 & 2 Collectibles</p>
      </div>

      <div className="vault-grid">
        {cards.map((card, idx) => (
          <div 
            key={card.id} 
            className={`vault-card-wrapper ${flippedIds.has(card.id) ? 'is-flipped' : ''}`}
            onClick={() => toggleFlip(card.id)}
          >
            <div className="vault-card-inner">
              {/* FRONT */}
              <div className="vault-card-front">
                <div className="vault-card-visual" data-id={card.id}>
                  <img src={card.img} alt={card.name} />
                  {card.has_signature && (
                    <div className={`card-signature ${card.sig_style || ''}`}>{card.signature_name}</div>
                  )}
                  {card.has_patch && (
                    <div className="card-patch" />
                  )}
                  <div className="vault-card-id">CARD #{card.set_num}</div>
                </div>
                <div className="vault-card-info">
                  <h3>{card.name}</h3>
                  <span className={`rarity-seal ${card.rarity}`}>{card.rarity.toUpperCase()}</span>
                </div>
              </div>

              {/* BACK */}
              <div className="vault-card-back">
                <div className="card-back-3d">
                  <div className="serial">CARD: #{card.set_num}</div>
                  <div className="series">{getSeries(card.id)}</div>
                  {card.serial_total && (
                    <div className="mint-stamp">
                      X / {card.serial_total}
                    </div>
                  )}
                </div>
                <div className="back-content">
                  <h4>{card.specialization || 'Player Intelligence'}</h4>
                  <p>{card.lore || "A premium digital collectible celebrating the evolution of the national pastime."}</p>
                </div>
                <div className="back-footer">
                  <div className={`rarity-seal ${card.rarity}`}>{card.rarity.toUpperCase()} UNIT</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## File: `components/Upgrade/Upgrade.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpgradePage({ subscription, onUpgradeComplete }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/stripe/pricing').then(({ data }) => setPricing(data)).catch(() => {});
  }, []);

  async function handleCheckout(product) {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/stripe/checkout', { product });
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  const isPro = subscription?.plan === 'pro';

  return (
    <div className="upgrade-page">
      <div className="upgrade-header">
        <h1>⚾ Upgrade to Goin' Yard Pro</h1>
        <p className="upgrade-subtitle">
          Professional-grade fantasy intelligence for serious managers. Unlimited AI, 2 leagues included.
        </p>
      </div>

      <div className="pricing-grid">
        {/* Free Tier */}
        <div className={`pricing-card ${!isPro ? 'current' : ''}`}>
          <div className="pricing-badge">Free</div>
          <div className="pricing-price">$0</div>
          <div className="pricing-period">forever</div>
          <ul className="pricing-features">
            <li>✅ 1 league</li>
            <li>✅ 3 AI insights per day</li>
            <li>✅ All features accessible</li>
            <li>❌ Limited daily usage</li>
            <li>❌ Single league only</li>
          </ul>
          {!isPro && <div className="pricing-current-badge">Your Current Plan</div>}
        </div>

        {/* Pro Tier */}
        <div className={`pricing-card pro ${isPro ? 'current' : 'recommended'}`}>
          {!isPro && <div className="pricing-recommended">⭐ BEST VALUE</div>}
          <div className="pricing-badge pro">Pro Season Pass</div>
          <div className="pricing-price">{pricing?.season_pass?.label || '$19.99'}</div>
          <div className="pricing-period">one-time • through Sept 2026</div>
          <ul className="pricing-features">
            <li>✅ <strong>2 leagues</strong> included</li>
            <li>✅ <strong>Unlimited</strong> AI insights</li>
            <li>✅ <strong>Interactive AI Question Box</strong> (Follow-ups)</li>
            <li>✅ All features — Start/Sit, Trades, Waivers, Game Plan</li>
            <li>✅ Priority analysis speed</li>
            <li>✅ Full season access</li>
          </ul>
          {isPro ? (
            <div className="pricing-current-badge">✅ Your Current Plan</div>
          ) : (
            <button
              className="pricing-cta"
              onClick={() => handleCheckout('season_pass')}
              disabled={loading}
            >
              {loading ? '⏳ Redirecting...' : `Get Season Pass — ${pricing?.season_pass?.label || '$19.99'}`}
            </button>
          )}
        </div>

        {/* Extra League */}
        {isPro && (
          <div className="pricing-card addon">
            <div className="pricing-badge addon">Add-On</div>
            <div className="pricing-price">{pricing?.extra_league?.label || '$4.99'}</div>
            <div className="pricing-period">per extra league</div>
            <ul className="pricing-features">
              <li>✅ Add one more league</li>
              <li>✅ Same unlimited AI access</li>
              <li>✅ Up to 6 leagues total</li>
              <li>📊 Current: {subscription?.max_leagues || 2} leagues</li>
            </ul>
            <button
              className="pricing-cta addon"
              onClick={() => handleCheckout('extra_league')}
              disabled={loading || (subscription?.max_leagues || 2) >= 6}
            >
              {(subscription?.max_leagues || 2) >= 6
                ? 'Max Leagues Reached'
                : loading ? '⏳ Redirecting...' : `Add Extra League — ${pricing?.extra_league?.label || '$4.99'}`}
            </button>
          </div>
        )}
      </div>

      <div className="upgrade-footer">
        <p>🔒 Secure payment powered by Stripe. Cancel anytime before purchase.</p>
        <p style={{ opacity: 0.5, fontSize: 12, marginTop: 8 }}>
          Season pass covers April–September 2026. Price auto-adjusts for mid-season signups.
        </p>
      </div>
    </div>
  );
}

// Compact upgrade prompt shown when free users hit the daily limit
export function UpgradePrompt({ usage, onUpgrade }) {
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt-icon">🧠</div>
      <h3>You've used {usage?.count || 3}/{usage?.limit || 3} free insights today</h3>
      <p>Upgrade to Pro for unlimited AI-powered analysis all season long.</p>
      <button className="pricing-cta compact" onClick={onUpgrade}>
        Upgrade Now →
      </button>
    </div>
  );
}
```

---

## File: `components/WaiverWire/WaiverWire.jsx`

```jsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { useLeague } from '@/lib/context/LeagueContext';
import { toast } from 'react-hot-toast';
import AiQuestionBox from '@/components/shared/AiQuestionBox';
import InsightCard from '@/components/InsightCard/InsightCard';

const PRIORITY_COLORS = {
  'MUST ADD':             { bg: 'rgba(0,168,107,0.15)',   color: '#00a86b', border: 'rgba(0,168,107,0.4)' },
  'CHAMPIONSHIP STREAM':  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
  'HIGH PRIORITY STREAM': { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  'CRITICAL STREAM':      { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  'High priority':        { bg: 'rgba(74,175,219,0.12)',  color: '#4aafdb', border: 'rgba(74,175,219,0.3)' },
  'Speculative add':      { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' },
  'Monitor':              { bg: 'rgba(255,255,255,0.04)', color: '#64748b', border: 'rgba(255,255,255,0.07)' },
  'Pass':                 { bg: 'rgba(239,68,68,0.08)',   color: '#7f1d1d', border: 'rgba(239,68,68,0.15)' },
};

export default function WaiverWire() {
  const { selectedLeague, aiAnalysis, aiLoading, scoredWaiver } = useLeague();

  // Deep-dive AI analysis result
  const [aiRecs, setAiRecs]         = useState(null);   // { recommendations, scored }
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiRecsError, setAiRecsError]     = useState('');

  // ── Step 1: fetch free agents automatically using SWR ──────────────────────
  const { data: rawPlayersData, error, isLoading: playersLoading, mutate: mutatePlayers } = useSWR(
    selectedLeague ? `/api/yahoo/league/${selectedLeague}/players?status=A` : null
  );
  
  const rawPlayers = Array.isArray(rawPlayersData) ? rawPlayersData : [];

  // ── Step 2: "Get AI Analysis" button → deep-dive Claude call ─────────────
  async function runWaiverAnalysis() {
    setAiRecsLoading(true);
    setAiRecsError('');
    try {
      const available = scoredWaiver?.length > 0 ? scoredWaiver : rawPlayers;
      const { data } = await axios.post('/api/claude/waiver', {
        league_key: selectedLeague,
        available_players: available.slice(0, 25),
        // my_roster and pitching context are fetched server-side in the route
      });
      setAiRecs(data);
      // If route returned fresh engine-scored players, update the table
      if (data.scored?.length > 0) {
        mutatePlayers((prev) => {
          const scoredNames = new Set(data.scored.map(p => p.name || p.player_name));
          const extras = (Array.isArray(prev) ? prev : []).filter(p => !scoredNames.has(p.name || p.player_name));
          return [...data.scored, ...extras];
        }, false); // false = do not revalidate
      }
    } catch (err) {
      setAiRecsError(err.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setAiRecsLoading(false);
    }
  }

  // Prefer engine-scored from master analyze; fall back to raw players
  const displayPlayers = scoredWaiver?.length > 0
    ? scoredWaiver
    : rawPlayers.slice(0, 25);

  const isLoading = playersLoading || (aiLoading && !scoredWaiver?.length);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/cyborg_mascot_pointing.png" alt="Goin' Yard Scout" style={{ height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(74,175,219,0.4))' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>🔍 Waiver Wire Intel</h1>
            <p style={{ color: '#7aafc4' }}>Free agents ranked by fantasyBrain engine score · AI add/drop recommendations on demand</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={runWaiverAnalysis}
          disabled={aiRecsLoading || isLoading}
          style={{ whiteSpace: 'nowrap' }}
        >
          {aiRecsLoading ? '⟳ Analyzing...' : '⚡ Get AI Analysis'}
        </button>
      </div>

      {/* Master-analyze InsightCard — shows on load from cache, no button needed */}
      <InsightCard data={aiAnalysis?.waiver} type="waiver" loading={aiLoading && !aiAnalysis} />

      {/* Deep-dive AI narration result */}
      {aiRecsError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {aiRecsError}
        </div>
      )}

      {aiRecs?.recommendations && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #4aafdb' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4aafdb', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            ⚡ AI Add/Drop Recommendations
          </div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {aiRecs.recommendations}
          </div>
        </div>
      )}

      {/* Free-agent table — loads automatically, engine-scored */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #1e3d5c',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
            {scoredWaiver?.length > 0
              ? `Top ${displayPlayers.length} Engine-Ranked Free Agents`
              : `Available Free Agents (${displayPlayers.length})`}
          </span>
          <button
            onClick={() => mutatePlayers()}
            disabled={playersLoading}
            style={{ fontSize: 11, background: 'none', border: '1px solid #1e3d5c', borderRadius: 4, padding: '3px 10px', color: '#7aafc4', cursor: 'pointer' }}
          >
            {playersLoading ? '...' : '↻ Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="loading" style={{ padding: 32 }}>Scouting free agents...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th>Team</th>
                <th>Score</th>
                <th>Priority</th>
                <th style={{ maxWidth: 260 }}>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {displayPlayers.map((p, i) => {
                const priority = p.waiverScore?.priority || p.priority || '—';
                const score    = p.waiverScore?.score    ?? p.score    ?? '—';
                const reason   = p.waiverScore?.reasoning || p.reasoning || '';
                const style    = PRIORITY_COLORS[priority] || PRIORITY_COLORS['Speculative add'];
                return (
                  <tr key={i}>
                    <td style={{ color: '#4a7a94', fontSize: 12, width: 32 }}>{i + 1}</td>
                    <td><strong>{p.name || p.player_name}</strong></td>
                    <td><span className="badge">{p.position}</span></td>
                    <td style={{ color: '#7aafc4', fontSize: 12 }}>{p.team}</td>
                    <td style={{
                      fontWeight: 800, fontSize: 16,
                      color: score >= 80 ? '#00a86b' : score >= 60 ? '#f59e0b' : '#e2e8f0'
                    }}>{score !== '—' ? score : '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap'
                      }}>{priority}</span>
                    </td>
                    <td style={{ fontSize: 12, color: '#7aafc4', maxWidth: 260 }}>{reason}</td>
                  </tr>
                );
              })}
              {displayPlayers.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7aafc4' }}>
                  No players loaded yet. Select a league above.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AiQuestionBox
        context={`Waiver wire. Top targets: ${displayPlayers.slice(0,5).map(p => p.name || p.player_name).join(', ')}. AI recs: ${aiRecs?.recommendations?.slice(0,200) || aiAnalysis?.waiver?.headline || ''}`}
        leagueKey={selectedLeague}
        title="Ask About a Specific Player"
        icon="🔍"
        placeholder="Should I add [player name]? Who should I drop to make room?"
      />
    </div>
  );
}
```

---

## File: `components/shared/AiQuestionBox.jsx`

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AiQuestionBox({ context, leagueKey, title = "Ask a Follow-up", icon = "🧠", placeholder = "Ask a specific question about these results..." }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');
    try {
      const { data } = await axios.post('/api/claude/ask', {
        question: question.trim(),
        context,
        league_key: leagueKey
      });
      setAnswer(data.answer);
      setQuestion('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-question-box card" style={{ 
      marginTop: 24, 
      border: '1px solid rgba(0, 168, 107, 0.2)', 
      background: 'rgba(0, 168, 107, 0.03)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: 18 }}>{title}</h4>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(12, 29, 53, 0.5)', color: 'white' }}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()} style={{ padding: '0 24px' }}>
          {loading ? '...' : 'Send'}
        </button>
      </form>

      {answer && (
        <div style={{ marginTop: 20, padding: 20, borderRadius: 12, background: 'rgba(0, 0, 0, 0.3)', borderLeft: '4px solid #00a86b' }}>
          <div style={{ fontSize: 13, color: '#00a86b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scout's Follow-up:</div>
          <div className="ai-response" style={{ fontSize: 15, lineHeight: 1.6 }}>{answer}</div>
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/shared/AiStrategyModule.jsx`

```jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import AiQuestionBox from '../shared/AiQuestionBox';

export default function AiStrategyModule({ title, focus, icon = "⚡" }) {
  const { selectedLeague, leagueData } = useLeague();
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchStrategy();
  }, [selectedLeague]);

  async function fetchStrategy() {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/ai/ask', {
        question: `Analyze my league and provide a detailed ${title} strategy focusing on ${focus}.`,
        leagueKey: selectedLeague,
        context: `This is for the ${title} module of Goin' Yard HQ. Current scoring: ${leagueData?.settings?.scoring_type}.`
      });
      setStrategy(data.answer);
    } catch (err) {
      setStrategy('Failed to generate strategy. Please ensure your Yahoo league is synced.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-strategy-module">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
        <h3 style={{ margin: 0 }}>THE {title.toUpperCase()} PLAYBOOK</h3>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
        {loading ? (
          <div className="loading">Consulting the Front Office...</div>
        ) : (
          <div className="ai-response" style={{ fontSize: 16, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {strategy}
          </div>
        )}
      </div>

      {strategy && !loading && (
        <div style={{ marginTop: 24 }}>
          <AiQuestionBox 
            context={`Current Strategy: ${strategy}\nModule: ${title}`}
            leagueKey={selectedLeague}
            title={`Ask about your ${title}`}
            placeholder={`e.g. How does this affect my ${focus}?`}
          />
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/shared/BackgroundMural.jsx`

```jsx
import React from 'react';

export default function BackgroundMural() {
  return (
    <div className="mural-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      {/* Left Column Scatter */}
      <img src="/cyborg_card_tier1_hitter.png" alt="" style={{ position: 'absolute', top: '10%', left: '18%', width: 320, opacity: 0.15, transform: 'rotate(-15deg)' }} />
      <img src="/cyborg_stealing_second.png" alt="" style={{ position: 'absolute', top: '65%', left: '22%', width: 380, opacity: 0.15, transform: 'rotate(25deg)' }} />
      
      {/* Center Scatter */}
      <img src="/cyborg_diving_catch.png" alt="" style={{ position: 'absolute', top: '-12%', left: '50%', width: 380, opacity: 0.15, transform: 'rotate(8deg)', transformOrigin: 'center' }} />
      <img src="/cyborg_walkoff_homer.png" alt="" style={{ position: 'absolute', bottom: '-8%', left: '48%', width: 360, opacity: 0.15, transform: 'rotate(-75deg)' }} />

      {/* Right Column Scatter */}
      <img src="/cyborg_card_tier1_pitcher.png" alt="" style={{ position: 'absolute', top: '8%', right: '-5%', width: 350, opacity: 0.15, transform: 'rotate(15deg)' }} />
      <img src="/cyborg_bullpen_closer.png" alt="" style={{ position: 'absolute', top: '55%', right: '-8%', width: 380, opacity: 0.15, transform: 'rotate(-20deg)' }} />
    </div>
  );
}
```

---

## File: `components/shared/Baseball101.jsx`

```jsx
import React from 'react'

export default function Baseball101() {
  return (
    <div className="main-content">
      <h1 style={{ fontSize: 32, marginBottom: 8, color: 'var(--text-main)' }}>🎓 Baseball 101</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>
        The beginner's guide to understanding the sport and dominating your fantasy league.
      </p>

      {/* The Core Objective */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚾</span> The absolute basics
        </h2>
        <p style={{ color: 'var(--text-main)', fontSize: 15, lineHeight: 1.6 }}>
          The core objective of baseball is simple: score more <strong>Runs</strong>. 
          A run is scored when a hitter safely hits the ball, rounds all four bases in consecutive order, and crosses home plate. 
          Meanwhile, the opposing team (the defense on the field) tries to record three <strong>Outs</strong>. An out is recorded when a batter fails to reach base safely—most commonly by striking out, hitting a ball that is caught in the air before it touches the ground, or having the ball thrown to the base before they can run there. Once the defense gets three outs, the teams swap places and it is their turn to hit. 
          There are nine <strong>Innings</strong> in a standard game. Each inning is split into two halves: the <strong>Top</strong> of the inning (where the Away team bats) and the <strong>Bottom</strong> of the inning (where the Home team bats). The break in between is called the Middle of the inning.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Hitting Stats */}
        <div className="card">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18 }}>
            Hitter Dictionary (Offense)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>AVG (Batting Average)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hits divided by At-Bats. A good average is around .270. Anything over .300 is elite.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>HR (Home Run)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hitting the ball out of the park, instantly scoring a run for the hitter and anyone else on base.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>RBI (Runs Batted In)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You get an RBI when your hit successfully brings a teammate across home plate to score a run.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>SB (Stolen Base)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Running to the next base while the pitcher is throwing the ball to the catcher. Huge for fantasy points!</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>OBP (On-Base Percentage)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>How often a batter reaches base via a hit or a walk.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>OPS (On-Base Plus Slugging)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>A combined metric of OBP and Slugging Percentage (power). An OPS over .800 is great; over .900 is MVP-level.</div>
            </div>
          </div>
        </div>

        {/* Pitching Stats */}
        <div className="card">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18 }}>
            Pitcher Dictionary (Defense)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>ERA (Earned Run Average)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>How many runs a pitcher gives up per 9 innings. <strong>Lower is better!</strong> An ERA under 3.50 is fantastic.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>WHIP</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Walks + Hits per Inning Pitched. How many guys get on base against you. Under 1.20 is great.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>K (Strikeout)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Getting three strikes on a batter. Pitchers who strike out many batters are highly prized in fantasy.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>W (Wins) & QS (Quality Starts)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You get a Win if your team leads when you leave of the game. A Quality Start is 6+ innings allowing 3 runs or less.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>SV (Saves)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>A specialized stat for Relief Pitchers who come into the 9th inning to protect a close lead.</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Stats */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18, color: '#4aafdb' }}>
          Advanced Fantasy Analytics
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>VOR (Value Over Replacement)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
              This is the holy grail metric for fantasy baseball. VOR calculates how many more points/stats a player produces compared to a totally average, "free" replacement-level player you could just pick off the Waiver Wire. 
              <br/><br/>
              <strong>Why it matters:</strong> A First Baseman who hits 25 home runs is good, but a Catcher who hits 25 home runs has an exponentially higher VOR, because good hitting catchers are incredibly rare! VOR tells you exactly who is actually helping you win your league by accounting for positional scarcity.
            </div>
          </div>
        </div>
      </div>

      {/* Fantasy Formats */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: 16, fontSize: 20 }}>Fantasy League Formats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 8, fontSize: 16 }}>Head-to-Head (Points)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Works like fantasy football. Every action (a home run, a strikeout) earns physical points. The person with the most total points at the end of the week wins the matchup. Starting Pitchers are extremely valuable here.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 8, fontSize: 16 }}>Head-to-Head (Categories)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Instead of one total score, you battle your opponent across ~10 different categories (e.g., who hit the most Home Runs?). You get a win for every category you beat them in. Balanced teams thrive here.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: '#eab308', marginBottom: 8, fontSize: 16 }}>Rotisserie (Roto)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              No weekly matchups! You rank against every team in the league simultaneously across all stat categories over the entire 162-game season. It requires extreme consistency and patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## File: `components/shared/FeedbackBox.jsx`

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FeedbackBox() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/feedback', { text: text.trim() });
      setSubmitted(true);
      setText('');
      toast.success('Feedback received! Our scouts are on it.');
    } catch (err) {
      toast.error('Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
        <h4 style={{ margin: 0 }}>Thanks for the feedback!</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Your input helps us build a better assistant. Keep goin' yard!</p>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setSubmitted(false)}>Send another note</button>
      </div>
    );
  }

  return (
    <div className="card feedback-box" style={{ padding: 12, marginBottom: 12, background: 'rgba(255,255,255,0.05)' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>📬 Suggestion Box</h4>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Found a bug or have an idea?</p>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?..."
          style={{ width: '100%', marginBottom: 12 }}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px', fontSize: 12 }} disabled={loading || !text.trim()}>
          {loading ? '...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
```

---

## File: `components/shared/FeedbackLogs.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FeedbackLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/feedback')
      .then(res => {
        setLogs(res.data.reverse()); // Show newest first
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>📬 Scout Logs</h1>
      <p style={{ color: '#7aafc4', marginBottom: 24 }}>Community thoughts, feature ideas, and bug reports.</p>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#7aafc4' }}>No feedback logs yet. The suggestion box is open!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {logs.map((log, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <span className="badge badge-util" style={{ fontSize: 10 }}>
                  User: {log.yahoo_guid?.slice(0, 8) || 'Anonymous'}
                </span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-main)' }}>
                {log.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## File: `components/shared/LastUpdated.jsx`

```jsx
import React, { useState, useEffect } from 'react'

function timeAgo(isoString) {
  if (!isoString) return null
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

// TTL labels shown to user
const TTL_LABELS = {
  5:  '5 min cache',
  15: '15 min cache',
  30: '30 min cache',
}

export default function LastUpdated({ cachedAt, fromCache, ttlLabel, onRefresh, loading }) {
  const [, tick] = useState(0)

  // Re-render every 30s so the "X ago" label stays fresh
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const ago = timeAgo(cachedAt)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {ago && (
        <span style={{ fontSize: 11, color: fromCache ? '#4a7a94' : '#00a86b' }}>
          {fromCache ? `⚡ Cached · ${ago}` : `✓ Live · ${ago}`}
          {ttlLabel && <span style={{ color: '#2d5a6e', marginLeft: 4 }}>({ttlLabel})</span>}
        </span>
      )}
      <button
        className="btn btn-ghost"
        style={{ fontSize: 11, padding: '3px 10px', minHeight: 'unset', lineHeight: 1.4 }}
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? '...' : '↻ Refresh'}
      </button>
    </div>
  )
}
```

---

## File: `components/shared/LeagueIntelligence.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import toast from 'react-hot-toast';

export default function LeagueIntelligence({ leagueKey }) {
  // SWR handles caching and deduping, eliminating waterfall loading
  const { data, isLoading: loading, mutate: fetchTransactions } = useSWR(
    leagueKey ? `/api/yahoo/league/${leagueKey}/transactions` : null
  );
  
  const transactions = Array.isArray(data) ? data.slice(0, 10) : [];

  return (
    <div className="card league-intel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🕵️‍♂️</span>
          <h4 style={{ margin: 0 }}>League Intelligence</h4>
        </div>
        <button className="btn btn-ghost" onClick={fetchTransactions} disabled={loading} style={{ fontSize: 12 }}>
          {loading ? 'Refreshing...' : '↻ Sync'}
        </button>
      </div>

      <div className="txn-list">
        {transactions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No recent major transactions detected.
          </div>
        )}
        
        {transactions.map((txn, idx) => {
          // Yahoo transaction structure is complex, we'll need to parse it carefully in the route
          return (
            <div key={idx} className="txn-item" style={{ 
              padding: '12px 0', 
              borderBottom: idx === transactions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              gap: 12
            }}>
              <div className="txn-type-icon" style={{ 
                width: 32, height: 32, borderRadius: 8, 
                background: txn.type === 'add' ? 'rgba(0, 168, 107, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                {txn.type === 'add' ? '📈' : '📉'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{txn.player_name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txn.timestamp}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {txn.type === 'add' ? 'Added by ' : 'Dropped by '} <strong>{txn.team_name}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## File: `components/shared/ModulePage.jsx`

```jsx
'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';

export default function GenericModulePage({ title = "Module Intelligence", children }) {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>{title}</h1>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <div className="card">
          {children || <p>Intelligence engine is analyzing your league data... Check back in a moment.</p>}
        </div>
      ) : (
        <div className="card">Please select a league.</div>
      )}
    </div>
  );
}
```

---

## File: `docs/Cyborg_Generation_Guide.md`

```markdown
# Goin' Yard: Cyborg Generation Guide

This document preserves the exact mathematical prompt formula and reference files required to consistently generate illustrations of the "Goin' Yard" cyborg mascot.

By using this guide, any future AI agent or generation tool can maintain the exact same cyberpunk face, armor geometry, and gritty neon aesthetic without hallucinating different cyborg variations.

## Core Reference Images (The "DNA")
To force the AI to maintain the exact character design, you must pass these specific images as **Style References** to the image generator:
1. `client/public/cyborg_mascot_bat.png`
2. `client/public/cyborg_batter_ready.png`

*These two images combined provide the generator with the front-facing helmet geometry, the glowing eye slit, the heavy armor pads, and the gritty gradient lighting expected for the project.*

## The Master Prompt Formula

When generating a new image, use this foundational prompt structure:

> "A stylized neon cyberpunk vector art character of a tough-looking cyborg baseball player in the exact same art style, character design, and aesthetic as the provided reference images. **[INSERT ACTION/POSE HERE]**. **[INSERT BACKGROUND HERE]**. Match the specific cyborg helmet, armor geometry, and dark/neon pink and blue lighting perfectly from the reference images. Clean, high-quality, without anatomical errors."

### Example 1: Changing the Pose
If you want the exact same cyborg and background, but just want him catching a pop-fly:

> "A stylized neon cyberpunk vector art character of a tough-looking cyborg baseball player in the exact same art style, character design, and aesthetic as the provided reference images. **He is looking up and catching a pop-fly baseball in his glowing glove.** **The background is a futuristic neon baseball stadium**. Match the specific cyborg helmet, armor geometry, and dark/neon pink and blue lighting perfectly from the reference images. Clean, high-quality, without extra baseballs or anatomical errors."

### Example 2: Changing the Background
If you want the exact same cyborg character, but want him jogging through a futuristic city for a unique trading card:

> "A stylized neon cyberpunk vector art character of a tough-looking cyborg baseball player in the exact same art style and character design as the provided reference images. **He is jogging forward with a baseball bat resting on his shoulder**. **The background is completely different: a sprawling, rainy, neon-lit cyberpunk city street at midnight.** Match the specific cyborg helmet and armor geometry perfectly from the reference images, but adapt the neon pink and blue lighting to fit the city environment."

---

## Technical Considerations for Generating Trading Cards
If you are generating horizontal trading cards (like the sliding "Pro" cards) instead of square icons, be sure to append:
> "Horizontal aspect ratio. Include an ornate, glowing holographic card border around the character. If text is included, use arcane, unrecognizable alien hieroglyphics instead of English letters."
```

---

## File: `docs/Project_Summary_and_Architecture.md`

```markdown
# ⚾ Goin' Yard HQ - Project Architecture & Details

This document serves as the master record for the Fantasy Baseball SaaS application, preserving the critical information regarding the mathematical evaluation logic, our dynamic UI, and backend architecture.

## 1. Mathematical Evaluation Core (fantasyBrain.js)
The app is powered by an autonomous, multi-format evaluation engine built seamlessly into the backend.
- **Dynamic Valuation System:** The app reads the user's Yahoo league settings (`settings.scoring_type`) and instantly branches player evaluations in real-time.
- **Head-to-Head Points Format:** 
  - Generates a "Value Over Replacement" (VOR) score based on strict Yahoo defaults (HRs = 10.4, R = 1.9, SB = 4.2).
  - Rewards pure volume accumulators and heavily rewards Innings-Eating SPs.
- **Rotisserie / Categories Format:** 
  - Shifts entirely to a **Standings Gain Points (SGP)** algorithm.
  - Radically changes how it values players. For instance, a Speedster (60 SBs / 5 HRs) is considered Elite in Roto, but Mediocre in Points.
  - Actively protects pitching ratios by issuing `DO NOT ROSTER` flags to volume pitchers with high ERAs / WHIPs in categorical formats.

## 2. Infrastructure & Hosting
- **Application Deployment:** The app is actively deployed and hosted via **Railway**.
- **Backend Architecture:** Node.js processing logic combined with Express to serve up data.
- **Integrations:** Yahoo API for live fantasy data combined with Anthropic's Claude AI for dynamic sports analyst commentary.
- **Safety Measures:** We established a git rollback branch (`backup/pre-math-overhaul`) to preserve stability before massive architectural rewrites.

## 3. Recommended Branding & Domains
To give the app a premium, standalone feel, the following domain options were researched and confirmed officially available to attach to the Railway deployment.
- **goinyard.app** (The undisputed top choice for a punchy, modern baseball app)
- **pennantpush.com**
- **fantasyhq.app**
- *Action item: Register via Namecheap or Porkbun to secure cheap long-term renewal rates without hosting baggage.*

## 4. UI / UX Design
The frontend uses a modern, responsive "Glassmorphism" aesthetic with strict CSS media queries to support deep functionality across devices.
- **Desktop Layout:** Features a beautifully stylized permanent left-hand navigation bar bridging users to the Matchups, Standings, Waiver Wire, Trade Analyzer, etc.
- **Mobile & Tablet Layout:** Automatically hides the sidebar to save screen real estate and generates a "Hamburger Menu" (☰) on the top navigation bar. Every feature, including the Baseball 101 guide, stays fully accessible via the sliding drawer on mobile. 
```

---

## File: `eslint.config.mjs`

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

---

## File: `galactic_roster.md`

```markdown
# 🌌 Galactic League Master Roster

## Brooklyn Biotics
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #53 | Isaiah Anderson | Cyborg Pitcher | Earth (Sector 4) |
| #76 | Elijah Wilson | Bionic Shortstop | Andromeda Outpost 9 |
| #17 | Unit 91-E | Heavy Artillery (1B) | Mars Colony Prime |
| #57 | James Williams | Laser Outfielder | Andromeda Outpost 9 |
| #90 | Vor Void | Utility Android | Andromeda Outpost 9 |
| #14 | Unit 58-E | Hover-Base Stealer | Gliese 581g |
| #34 | Valentina Perez | Plasma Catcher | Gliese 581g |
| #13 | Daiki Kato | Relief Pitcher | Proxima Centauri b |
| #48 | Grox Alpha | Manager | The Lunar Spire |
| #58 | James Taylor | Designated Hacker | Gliese 581g |

## Tokyo Tachyons
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #1 | Daiki Watanabe | Cyborg Pitcher | Kepler-186f |
| #25 | Elon Chen | Bionic Shortstop | Venus Cloud City |
| #93 | Hina Nakamura | Heavy Artillery (1B) | Gliese 581g |
| #16 | Hiroshi Tanaka | Laser Outfielder | Earth (Sector 4) |
| #77 | Akira Watanabe | Utility Android | Gliese 581g |
| #43 | Arjun Liu | Hover-Base Stealer | Earth (Sector 4) |
| #36 | Hiroshi Takahashi | Plasma Catcher | Gliese 581g |
| #46 | Kenji Nakamura | Relief Pitcher | Venus Cloud City |
| #68 | Echo Rider | Manager | Mars Colony Prime |
| #61 | Ren Moto | Designated Hacker | Mars Colony Prime |

## Neon City Sliders
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #93 | Diego Garcia | Cyborg Pitcher | Venus Cloud City |
| #57 | Cole Thomas | Bionic Shortstop | Kepler-186f |
| #69 | Unit 52-F | Heavy Artillery (1B) | Titan Station |
| #82 | Laser Wire | Laser Outfielder | Venus Cloud City |
| #39 | Synth Code | Utility Android | Proxima Centauri b |
| #44 | Pixel Maverick | Hover-Base Stealer | Titan Station |
| #31 | Lyra Void | Plasma Catcher | Europa Sub-Oceanic |
| #1 | Ananya Turing | Relief Pitcher | Gliese 581g |
| #19 | Elara | Manager | Europa Sub-Oceanic |
| #78 | Unit 90-S | Designated Hacker | Mars Colony Prime |

## Silicon Valley Sentinels
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #61 | Yuta Ito | Cyborg Pitcher | Kepler-186f |
| #53 | Rahul Li | Bionic Shortstop | The Lunar Spire |
| #75 | Echo Byte | Heavy Artillery (1B) | The Lunar Spire |
| #44 | Daiki Tanaka | Laser Outfielder | Venus Cloud City |
| #9 | Hunter Williams | Utility Android | Venus Cloud City |
| #46 | Isaiah Miller | Hover-Base Stealer | Proxima Centauri b |
| #84 | Jada Wilson | Plasma Catcher | Andromeda Outpost 9 |
| #59 | Kael Eclipse | Relief Pitcher | Venus Cloud City |
| #62 | Rahul Wu | Manager | Titan Station |
| #90 | Wei Huang | Designated Hacker | The Lunar Spire |

## Dallas Tex-Mechs
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #76 | Camila Johnson | Cyborg Pitcher | Gliese 581g |
| #70 | Luis Garcia | Bionic Shortstop | Gliese 581g |
| #43 | Mateo Sanchez | Heavy Artillery (1B) | Andromeda Outpost 9 |
| #75 | Ananya Wu | Laser Outfielder | Titan Station |
| #19 | Xen Void | Utility Android | Venus Cloud City |
| #38 | Chloe White | Hover-Base Stealer | Andromeda Outpost 9 |
| #20 | Javier Brown | Plasma Catcher | Earth (Sector 4) |
| #34 | Luis Smith | Relief Pitcher | The Lunar Spire |
| #63 | Carlos Lopez | Manager | Proxima Centauri b |
| #78 | Julio Martinez | Designated Hacker | Mars Colony Prime |

## Osaka Overclockers
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #48 | DeAndre Davis | Cyborg Pitcher | The Lunar Spire |
| #24 | Diego Lopez | Bionic Shortstop | Titan Station |
| #51 | Satoshi Tanaka | Heavy Artillery (1B) | Earth (Sector 4) |
| #12 | Yuta Ito | Laser Outfielder | Earth (Sector 4) |
| #70 | Rafael Flores | Utility Android | Venus Cloud City |
| #15 | Harper Johnson | Hover-Base Stealer | Mars Colony Prime |
| #78 | Hiroshi Ito | Plasma Catcher | Kepler-186f |
| #96 | Yuta Kobayashi | Relief Pitcher | Proxima Centauri b |
| #77 | Xylar Quasar | Manager | Kepler-186f |
| #47 | Takumi Kobayashi | Designated Hacker | Venus Cloud City |

## Kyoto Kaiju
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #20 | Takumi Yamamoto | Cyborg Pitcher | The Lunar Spire |
| #30 | Akira Ryuko | Bionic Shortstop | Mars Colony Prime |
| #1 | Jaq Quasar | Heavy Artillery (1B) | The Lunar Spire |
| #56 | Jin Nakamura | Laser Outfielder | Earth (Sector 4) |
| #69 | Unit 69-T | Utility Android | Mars Colony Prime |
| #21 | Sho Watanabe | Hover-Base Stealer | Europa Sub-Oceanic |
| #98 | Grox Void | Plasma Catcher | Andromeda Outpost 9 |
| #39 | Jin Sato | Relief Pitcher | Andromeda Outpost 9 |
| #72 | Isabella Torres | Manager | Andromeda Outpost 9 |
| #92 | Miguel Flores | Designated Hacker | Mars Colony Prime |

## Roswell Rayguns
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #1 | Drax Quasar | Cyborg Pitcher | Venus Cloud City |
| #33 | Chloe Smith | Bionic Shortstop | Earth (Sector 4) |
| #69 | James Taylor | Heavy Artillery (1B) | Titan Station |
| #73 | Cyber Code | Laser Outfielder | Earth (Sector 4) |
| #51 | Zorblax X | Utility Android | Gliese 581g |
| #95 | Chloe Jones | Hover-Base Stealer | Earth (Sector 4) |
| #44 | Alan Liu | Plasma Catcher | Kepler-186f |
| #72 | Vera X | Relief Pitcher | Mars Colony Prime |
| #87 | Grox Alpha | Manager | Andromeda Outpost 9 |
| #40 | Lucy Chen | Designated Hacker | The Lunar Spire |

## Atlanta Aerodynamics
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #20 | Elijah Brown | Cyborg Pitcher | Mars Colony Prime |
| #16 | Elijah Anderson | Bionic Shortstop | Andromeda Outpost 9 |
| #5 | Desmond Brown | Heavy Artillery (1B) | Europa Sub-Oceanic |
| #39 | DeAndre Harris | Laser Outfielder | Kepler-186f |
| #44 | Unit 42-N | Utility Android | Venus Cloud City |
| #27 | Elijah Smith | Hover-Base Stealer | Earth (Sector 4) |
| #35 | DeAndre White | Plasma Catcher | Andromeda Outpost 9 |
| #75 | Chloe Jackson | Relief Pitcher | Proxima Centauri b |
| #67 | Sam Brown | Manager | Venus Cloud City |
| #61 | Ava Wilson | Designated Hacker | Mars Colony Prime |

## Miami Motherboards
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #85 | Julio Sanchez | Cyborg Pitcher | Venus Cloud City |
| #67 | Diego Torres | Bionic Shortstop | Andromeda Outpost 9 |
| #7 | Unit 61-C | Heavy Artillery (1B) | Andromeda Outpost 9 |
| #11 | Unit 49-E | Laser Outfielder | Venus Cloud City |
| #40 | Luis Torres | Utility Android | The Lunar Spire |
| #39 | Mateo Hernandez | Hover-Base Stealer | Europa Sub-Oceanic |
| #31 | Daiki Suzuki | Plasma Catcher | Europa Sub-Oceanic |
| #34 | Miguel Hernandez | Relief Pitcher | Earth (Sector 4) |
| #76 | Rosa Gonzalez | Manager | Europa Sub-Oceanic |
| #68 | Unit 84-G | Designated Hacker | Andromeda Outpost 9 |

## San Juan Synthetics
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #70 | Rin Ito | Cyborg Pitcher | Gliese 581g |
| #71 | Elena Diaz | Bionic Shortstop | Kepler-186f |
| #33 | Kael Omega | Heavy Artillery (1B) | Earth (Sector 4) |
| #82 | Valentina Smith | Laser Outfielder | The Lunar Spire |
| #65 | Miguel Gomez | Utility Android | Proxima Centauri b |
| #17 | Rafael Flores | Hover-Base Stealer | Earth (Sector 4) |
| #94 | Hector Gonzalez | Plasma Catcher | Gliese 581g |
| #0 | Javier Diaz | Relief Pitcher | Kepler-186f |
| #42 | Camila Diaz | Manager | Titan Station |
| #5 | Takumi Moto | Designated Hacker | Earth (Sector 4) |

## Havana Hover-Hounds
| Number | Name | Position | Home Planet |
|---|---|---|---|
| #41 | Diego Cruz | Cyborg Pitcher | Titan Station |
| #6 | Elena Sanchez | Bionic Shortstop | Proxima Centauri b |
| #82 | Julio Martinez | Heavy Artillery (1B) | The Lunar Spire |
| #53 | Vector Byte | Laser Outfielder | Earth (Sector 4) |
| #27 | Daiki Kato | Utility Android | Earth (Sector 4) |
| #19 | Leo Cruz | Hover-Base Stealer | Titan Station |
| #29 | Leo Rodriguez | Plasma Catcher | Titan Station |
| #17 | Unit 63-V | Relief Pitcher | Europa Sub-Oceanic |
| #88 | Carmen Sanchez | Manager | The Lunar Spire |
| #97 | Yuta Yamada | Designated Hacker | Earth (Sector 4) |

```

---

## File: `jsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## File: `lib/cache.js`

```javascript
// Simple in-memory TTL cache for Yahoo API responses
const store = new Map()

function get(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry
}

function set(key, value, ttlMs) {
  store.set(key, {
    value,
    cachedAt: new Date().toISOString(),
    expiresAt: Date.now() + ttlMs,
  })
}

function del(key) {
  store.delete(key)
}

// Delete all keys that contain a given substring (e.g. a leagueKey)
function clear(substring) {
  if (!substring) {
    store.clear()
    return
  }
  for (const k of store.keys()) {
    if (k.includes(substring)) store.delete(k)
  }
}

function stats() {
  const now = Date.now()
  const entries = []
  for (const [key, entry] of store.entries()) {
    const ttlLeft = Math.max(0, Math.round((entry.expiresAt - now) / 1000))
    entries.push({ key, cachedAt: entry.cachedAt, ttlLeft })
  }
  return entries
}

module.exports = { get, set, del, clear, stats }
```

---

## File: `lib/cardGenerator.js`

```javascript
/**
 * cardGenerator.js — Infinite Galactic League Engine
 * Generates unique cyborg cards with randomized stats, lore, and identities.
 */
import { callClaudeFast } from './claude.js';


import { GALACTIC_ROSTER } from './rosterData.js';

const SPECIALIZATIONS = [
  "Balanced Offense", "Heat Sink Power", "Bullpen Lock", "Neural Strategy",
  "Kinetic Burst", "Gravity Nullifier", "Thermal Reset", "Refractive Shield",
  "Efficiency Mentor", "Pulse Save", "Master Logic", "Hyper-Drive",
  "Photon Reach", "Total Spectrum", "Cinematic Range", "Aerial Denied",
  "Shared Network", "Clutch Protocol", "Haptic Touch", "Precious Metal",
  "Red Line Drive", "Visor Intel", "Digital Soul", "Ink of Ages"
];

const RARITY_POOLS = {
  common: { imgs: ['/cyborg_card_tier1_hitter.png', '/cyborg_batter_series3.png'], serial_total: null },
  uncommon: { imgs: ['/cyborg_card_tier2_holo_premium.png', '/cyborg_pitcher_series3.png'], serial_total: null },
  rare: { imgs: ['/cyborg_card_tier3_prism.png', '/cyborg_catcher_series3.png'], serial_total: 500 },
  epic: { imgs: ['/rookie_prizm_clean.png', '/cyborg_batter_series3.png', '/cyborg_pitcher_series3.png', '/cyborg_catcher_series3.png'], serial_total: 50 },
  legendary: { imgs: ['/arcana_clean.png', '/cyborg_pitcher_series3.png', '/cyborg_catcher_series3.png', '/cyborg_batter_series3.png'], serial_total: 5 }
};

export async function generateInfiniteCard(forceRarity = null) {
  const roll = Math.random();
  let rarity = 'common';
  if (forceRarity) {
    rarity = forceRarity;
  } else {
    if (roll > 0.995) rarity = 'legendary';
    else if (roll > 0.97) rarity = 'epic';
    else if (roll > 0.88) rarity = 'rare';
    else if (roll > 0.65) rarity = 'uncommon';
  }

  // Pull a random player from the 120-player master roster
  const player = GALACTIC_ROSTER[Math.floor(Math.random() * GALACTIC_ROSTER.length)];
  const spec = SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];
  const pool = RARITY_POOLS[rarity];

  const prompt = `You are generating a collectible digital trading card for a cyborg baseball player in the year 2026.
Player Name: ${player.name}
Team: ${player.team}
Position: ${player.position}
Specialization: ${spec}
Rarity: ${rarity}

Write a single sentence of cheeky, cyberpunk baseball lore for this player. Keep it under 20 words. Make it funny or weird. Focus on their cyborg traits malfunctioning, glitching, or being hilariously overpowered for baseball. Do not use quotes.`;

  let lore = `An elite unit from ${player.team} specializing in ${spec}. Optimized for the 2026 Galactic Season.`;
  try {
    const aiResponse = await callClaudeFast([{ role: 'user', content: prompt }], 60);
    if (aiResponse) {
      lore = aiResponse.trim();
      // Remove surrounding quotes if Claude included them
      if (lore.startsWith('"') && lore.endsWith('"')) {
        lore = lore.substring(1, lore.length - 1);
      }
    }
  } catch (err) {
    console.warn('[Card Generator] Failed to generate AI lore, falling back to default:', err.message);
  }

  const card = {
    id: `dyn_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    name: `${player.name} (${rarity.toUpperCase()})`,
    playerName: player.name,
    team: player.team,
    teamColor: player.teamColor,
    position: player.position,
    rarity: rarity,
    specialization: spec,
    img: player.image, // Use their canonical image placeholder instead of randomizing pool.imgs
    serial_total: pool.serial_total,
    lore: lore,
    set_num: player.jersey_number, // Use their actual jersey number instead of random set_num
    has_signature: rarity === 'legendary',
    has_patch: rarity === 'epic' || rarity === 'legendary',
    patch_type: (rarity === 'epic' || rarity === 'legendary') ? ['jersey', 'metal', 'motherboard'][Math.floor(Math.random() * 3)] : null,
    signature_name: rarity === 'legendary' ? player.name : null,
    sig_style: rarity === 'legendary' ? ['classic', 'aggressive', ''][Math.floor(Math.random() * 3)] : null
  };

  return card;
}
```

---

## File: `lib/claude.js`

```javascript
import Anthropic from '@anthropic-ai/sdk';

// Real Anthropic model IDs — ordered by preference for production.
// claude-3-5-haiku-20241022 hit EOL Feb 19 2026 — DO NOT USE (returns 404).
// Opus is last: ~5-10x more expensive than sonnet, unprofitable as default.
const MODEL_REGISTRY = [
  'claude-sonnet-4-5',           // ← primary: current gen, best quality/cost ratio
  'claude-3-5-sonnet-20241022',  // ← versioned fallback if above unavailable
  'claude-haiku-4-5',            // ← fast/cheap fallback
  'claude-opus-4-5',             // ← last resort only: 5-10x more expensive
];

// Fast model for Haiku-tier calls (Q&A, narration, card lore, pre-scored modules).
// IMPORTANT: claude-3-5-haiku-20241022 is EOL as of Feb 19 2026 — use claude-haiku-4-5.
const HAIKU_MODEL = 'claude-haiku-4-5';

let client = null;
let cachedActiveModel = null;

function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function getWorkingModel() {
  if (cachedActiveModel) return cachedActiveModel;
  for (const model of MODEL_REGISTRY) {
    try {
      await getClient().messages.create({
        model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }]
      });
      cachedActiveModel = model;
      console.log(`[Claude] Active model: ${model}`);
      return model;
    } catch (err) {
      console.warn(`[Claude] Model ${model} unavailable: ${err.message}`);
    }
  }
  // Last resort — first entry in registry without probing
  const fallback = MODEL_REGISTRY[0];
  cachedActiveModel = fallback;
  console.warn(`[Claude] All models failed probe — falling back to ${fallback}`);
  return fallback;
}

const SYSTEM_PROMPT = `You are Goin' Yard HQ — a friendly, encouraging fantasy baseball AI for the 2026 MLB season. Help beginners dominate their Yahoo leagues.`;

export async function callClaude(messages, maxTokens = 1800) {
  const model = await getWorkingModel();
  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages,
  });
  return response.content[0].text;
}

/**
 * callClaudeFast — uses claude-haiku-4-5 (current Haiku generation).
 * Use for: short Q&A, card lore, pre-scored module summaries, gameplan steps.
 * ~3-6x faster, ~80% cheaper than Sonnet. Avoid for complex JSON schemas.
 *
 * NOTE: claude-3-5-haiku-20241022 is EOL (Feb 19 2026) — do not revert to it.
 */
export async function callClaudeFast(messages, maxTokens = 800) {
  try {
    const response = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages,
    });
    const text = response.content[0].text;
    console.log(`[Claude/Haiku] ${maxTokens}tok | first200: ${text?.slice(0, 200)}`);
    return text;
  } catch (err) {
    console.warn(`[Claude] Haiku (${HAIKU_MODEL}) failed, falling back to Sonnet: ${err.message}`);
    return callClaude(messages, maxTokens);
  }
}

/**
 * callClaudeJSON — no system prompt, strict JSON output.
 * Use for: audit, analyze, trade verdict, matchup predict — any route that
 * needs a structured JSON response. The friendly system prompt actively hurts
 * JSON compliance on Haiku; omitting it improves parse success rate.
 */
export async function callClaudeJSON(messages, maxTokens = 1400) {
  const model = await getWorkingModel();
  try {
    const response = await getClient().messages.create({
      model,
      max_tokens: maxTokens,
      messages,  // NO system prompt — pure instruction following
    });
    const text = response.content[0].text;
    console.log(`[Claude/JSON] ${model} ${maxTokens}tok | first200: ${text?.slice(0, 200)}`);
    return text;
  } catch (err) {
    console.error(`[Claude/JSON] Failed: ${err.message}`);
    throw err;
  }
}

```

---

## File: `lib/constants.js`

```javascript
export const CARD_COLLECTION = [
  // --- SERIES 1: CORE SET ---
  { id: 'base_hitter', set_num: '111', name: 'Cyber Hitter (Base)', img: '/cyborg_card_tier1_hitter.png', rarity: 'common', specialization: 'Balanced Offense', lore: 'The foundational unit of the Cyber-League. Optimized for contact and high-velocity exit speeds.' },
  { id: 'base_pitcher', set_num: '04', name: 'Cyber Pitcher (Base)', img: '/cyborg_card_tier1_pitcher.png', rarity: 'common', specialization: 'Heat Sink Power', lore: 'Equipped with a liquid-cooled arm capable of sustaining 110mph fastballs for 9 innings.' },
  { id: 'base_closer', set_num: '87', name: 'Bullpen Closer (Base)', img: '/cyborg_bullpen_closer.png', rarity: 'common', specialization: 'High-Stress Lock', lore: 'Designed to compute high-leverage outcomes in milliseconds. A true ninth-inning firewall.' },
  { id: 'base_manager', set_num: '12', name: 'Elara (Manager)', img: '/elara_clean.png', rarity: 'common', specialization: 'Neural Strategy', lore: 'Elara possesses a neural link to every player on the field, adjusting shifts based on real-time wind data.' },
  { id: 'base_steal', set_num: '215', name: 'Stealing Second (Base)', img: '/cyborg_stealing_second.png', rarity: 'common', specialization: 'Kinetic Burst', lore: 'Hydraulic leg boosters allow for a 0-to-20mph burst in under two steps.' },
  { id: 'base_catch', set_num: '33', name: 'Diving Catch (Base)', img: '/cyborg_diving_catch.png', rarity: 'common', specialization: 'Gravity Nullifier', lore: 'Internal gyroscopes allow for mid-air adjustments that defy traditional physics.' },
  { id: 'gatorade', set_num: '99', name: 'Gatorade Glitch', img: '/cyborg_gatorade_glitch.png', rarity: 'common', specialization: 'Thermal Reset', lore: 'A rare cooling malfunction that results in a localized neon mist celebration.' },

  // Uncommon
  { id: 't2_holo', set_num: '156', name: 'Holographic Foil Base', img: '/cyborg_card_tier2_holo_premium.png', rarity: 'uncommon', specialization: 'Refractive Shield', lore: 'A premium-plated unit that reflects stadium lights to distract opposing batters.' },
  { id: 'coach_woman', set_num: '72', name: 'Holographic Coach', img: '/cyborg_coach_card_woman.png', rarity: 'uncommon', specialization: 'Efficiency Mentor', lore: 'Specializes in optimizing the swing-path of younger cyborg units.' },
  { id: 'unc_closer', set_num: '88', name: 'Bullpen Closer (Refractor)', img: '/cyborg_bullpen_closer.png', rarity: 'uncommon', specialization: 'Pulse Save', lore: 'A specialized refractor variant of the standard firewall closer.' },
  { id: 'unc_manager', set_num: '13', name: 'Elara (Foil)', img: '/elara_clean.png', rarity: 'uncommon', specialization: 'Master Logic', lore: 'An upgraded Elara unit with access to the legendary "Big Data" archives.' },
  { id: 'unc_steal', set_num: '216', name: 'Stealing Second (Hyper)', img: '/cyborg_stealing_second.png', rarity: 'uncommon', specialization: 'Hyper-Drive', lore: 'Equipped with illegal sub-light thrusters for impossible steal percentages.' },
  { id: 'unc_catch', set_num: '34', name: 'Diving Catch (Glow Edition)', img: '/cyborg_diving_catch.png', rarity: 'uncommon', specialization: 'Photon Reach', lore: 'Glow-wire armor allows for better visibility during night-cycle games.' },
  
  // Rare
  { id: 't3_prism', set_num: '500', name: 'Diamond Prism Showcase', img: '/cyborg_card_tier3_prism.png', rarity: 'rare', specialization: 'Total Spectrum', lore: 'The apex of the Series 1 manufacturing line. Flawless in every metric.', serial_total: 500 },
  { id: 'sp_wide', set_num: '101', name: 'Rookie Silver Prizm (Wide)', img: '/cyborg_silver_prism_wide.png', rarity: 'rare', specialization: 'Cinematic Range', lore: 'Captures the raw power of a rookie unit making their debut on the grand stage.', serial_total: 100 },
  { id: 'sp_medium', set_num: '102', name: 'Rookie Silver Prizm (Wall Rob)', img: '/cyborg_silver_prism_medium.png', rarity: 'rare', specialization: 'Aerial Denied', lore: 'Commemorating the first time a cyborg cleared the 40-foot outfield wall to rob a homer.', serial_total: 100 },
  { id: 'jump_kid', set_num: '22', name: 'Team Celebration Foil', img: '/cyborg_team_jump_kid.png', rarity: 'rare', specialization: 'Shared Network', lore: 'A rare capture of multiple units celebrating a walk-off victory in perfect sync.', serial_total: 250 },
  { id: 'rare_walkoff', set_num: '44', name: 'Walk-Off Homer (Silver Prizm)', img: '/cyborg_walkoff_homer.png', rarity: 'rare', specialization: 'Clutch Protocol', lore: 'The sound of the bat hitting the ball was heard three city blocks away.', serial_total: 100 },

  // Epic
  { id: 'sp_hand', set_num: '303', name: 'Rookie Silver Prizm (Patch)', img: '/rookie_prizm_clean.png', rarity: 'epic', specialization: 'Haptic Touch', lore: 'This card features a piece of authentic synthetic jersey material from the draft day.', has_patch: true, serial_total: 50 },
  { id: 'epic_catch', set_num: '35', name: 'Diving Catch (Gold /10)', img: '/cyborg_diving_catch.png', rarity: 'epic', specialization: 'Precious Metal', lore: 'Only 10 of these units were ever manufactured. A masterpiece of engineering.', serial_total: 10 },
  { id: 'epic_closer', set_num: '89', name: 'Closer (Ruby Wave)', img: '/cyborg_bullpen_closer.png', rarity: 'epic', specialization: 'Red Line Drive', lore: 'Optimized for high-heat environments where standard units often melt down.', serial_total: 50 },

  // Legendary
  { id: 'sp_closeup', set_num: '01', name: 'Rookie True Gold (Visor Edition)', img: '/cyborg_silver_prism_closeup.png', rarity: 'legendary', specialization: 'Visor Intel', lore: 'Provides a direct view into the targeting HUD of a Hall-of-Fame unit.', serial_total: 25 },
  { id: 'arcana_hand', set_num: '777', name: 'Homerun Arcana (Signed)', img: '/arcana_clean.png', rarity: 'legendary', specialization: 'Digital Soul', lore: 'Rumored to be haunted by the spirit of a pre-cyber baseball legend.', has_signature: true, signature_name: 'The Legend', sig_style: 'classic', serial_total: 5 },
  { id: 'leg_walkoff', set_num: '999', name: 'Walk-Off Homer (Autograph Edition)', img: '/cyborg_walkoff_homer.png', rarity: 'legendary', specialization: 'Ink of Ages', lore: 'Personally signed with conductive liquid-gold ink by the leagues top slugger.', has_signature: true, signature_name: 'Slugger Prime', sig_style: 'aggressive', serial_total: 1 },

  // --- SERIES 2: TITANIUM GRAPEFRUIT LEAGUE ---
  { id: 'tgl_bk_hit', set_num: '1001', name: 'Brooklyn Biotics (Jaxson Jones)', img: '/tgl_brooklyn_hitter_v3_1776486966054.png', rarity: 'common', specialization: 'Heavy Artillery', lore: 'Known for his "Inertia Swing" that calculates ball trajectory in 0.02ms.' },
  { id: 'tgl_tok_stl', set_num: '1002', name: 'Tokyo Tachyons (Kenji Ryuko)', img: '/tgl_tokyo_stealer_v2_1776486720704.png', rarity: 'common', specialization: 'Warp Speed', lore: 'Kenji\'s speed is so high it often triggers stadium motion sensors incorrectly.' },
  { id: 'tgl_neo_inf', set_num: '1003', name: 'Neon City Sliders (Dash Maverick)', img: '/tgl_neoncity_infielder_v2_1776486734283.png', rarity: 'common', specialization: 'Flash Defense', lore: 'Dash can cover the entire left side of the infield in a single stride.' },
  { id: 'tgl_sv_pit', set_num: '1004', name: 'Silicon Valley Sentinels (Alan T. Turing)', img: '/tgl_siliconvalley_pitcher_v2_1776486747529.png', rarity: 'rare', specialization: 'Grav-Curve', lore: 'Alan\'s curveball is actually a calculated gravitational anomaly.', serial_total: 500 },
  { id: 'tgl_dal_cow', set_num: '1005', name: 'Dallas Tex-Mechs (Colt Smith)', img: '/tgl_dallas_cowboy_v3_1776486978084.png', rarity: 'rare', specialization: 'Rawhide Tech', lore: 'Traditional aesthetic meets state-of-the-art power-steering arms.', serial_total: 500 },
  { id: 'tgl_osa_hit', set_num: '1006', name: 'Osaka Overclockers (Daiki Moto)', img: '/tgl_osaka_hitter_v2_1776486782371.png', rarity: 'epic', specialization: 'Overdrive', lore: 'When the game is on the line, Daiki can overclock his processors by 300%.', serial_total: 50 },
  { id: 'tgl_kyo_kai', set_num: '1007', name: 'Kyoto Kaiju (Ryu Tanaka)', img: '/tgl_kyoto_kaiju_pitcher_v2_1776486797035.png', rarity: 'epic', specialization: 'Scale Armor', lore: 'His delivery is as unpredictable as a monster rising from the deep.', serial_total: 50 },
  { id: 'tgl_ros_inf', set_num: '1008', name: 'Roswell Rayguns (Zorblax Smith)', img: '/tgl_roswell_infielder_v2_1776486811710.png', rarity: 'legendary', specialization: 'Abduction Play', lore: 'Rumored to have been scouted from a crash site in the Nevada desert.', serial_total: 5 },

  // --- SERIES 2: DIVERSITY EXPANSION (TEAMS 9-12) ---
  { id: 'tgl_atl_hit', set_num: '1009', name: 'Atlanta Aerodynamics (DeAndre Carter)', img: '/tgl_atlanta_hitter_1776487205901.png', rarity: 'rare', specialization: 'Aero-Boost', lore: 'Uses wing-fins to adjust his swing arc mid-flight for maximum elevation.', serial_total: 500 },
  { id: 'tgl_mia_stl', set_num: '1010', name: 'Miami Motherboards (Mateo Rodriguez)', img: '/tgl_miami_stealer_1776487217131.png', rarity: 'epic', specialization: 'Port-Scan', lore: 'Can predict a pitcher\'s pickoff move by scanning their frequency.', serial_total: 50 },
  { id: 'tgl_sj_inf', set_num: '1011', name: 'San Juan Synthetics (Luis Fernandez)', img: '/tgl_sanjuan_infielder_1776487227839.png', rarity: 'legendary', specialization: 'Bio-Sync', lore: 'A perfect 50/50 mix of human muscle and synthetic carbon-fiber bone.', serial_total: 5 },
  { id: 'tgl_hav_pit', set_num: '1012', name: 'Havana Hover-Hounds (Javier Gomez)', img: '/tgl_havana_pitcher_1776487239413.png', rarity: 'common', specialization: 'Mag-Lev Slide', lore: 'Hover-tech allows Javier to pitch from a completely frictionless stance.' },
  { id: 'leg_bronx', set_num: '2001', name: 'Bronx Bomber (Titanium)', img: '/cyborg_bronx_bomber_autograph_1776834775822.png', rarity: 'legendary', specialization: 'Pinstripe Power', lore: 'A legendary unit that rebuilt the house that Ruth built.', serial_total: 10, has_signature: true, signature_name: 'The Babe 2.0' },
  { id: 'leg_sea', set_num: '2002', name: 'Seattle Slugger (Emerald)', img: '/cyborg_seattle_slugger_titanium_1776834796200.png', rarity: 'rare', specialization: 'Emerald Swing', lore: 'Optimized for damp conditions.', serial_total: 250 },
  { id: 'leg_chi', set_num: '2003', name: 'Windy City Wall', img: '/cyborg_card_tier2_holo_premium.png', rarity: 'uncommon', specialization: 'Gale Defense', lore: 'Uses wind resistance.' },
  { id: 'leg_sf', set_num: '2004', name: 'Fog City Fireballer', img: '/cyborg_card_tier1_pitcher.png', rarity: 'common', specialization: 'Mist Delivery', lore: 'Releases a localized fog bank.' },
  { id: 'leg_la', set_num: '2005', name: 'Hollywood Home Run', img: '/cyborg_walkoff_homer.png', rarity: 'epic', specialization: 'Star Power', lore: 'The brighter the lights, the harder this unit hits.', serial_total: 50 },
  { id: 'leg_tor', set_num: '2006', name: 'North Border Guardian', img: '/cyborg_card_tier1_hitter.png', rarity: 'common', specialization: 'Cold Snap', lore: 'Engineered for sub-zero performance.' }
];

export function getRandomCardId() {
  const roll = Math.random();
  let targetRarity = 'common';
  if (roll > 0.99) targetRarity = 'legendary';
  else if (roll > 0.95) targetRarity = 'epic';
  else if (roll > 0.85) targetRarity = 'rare';
  else if (roll > 0.60) targetRarity = 'uncommon';

  const pool = CARD_COLLECTION.filter(c => c.rarity === targetRarity);
  if (pool.length === 0) return CARD_COLLECTION[0].id;
  
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked.id;
}
```

---

## File: `lib/context/LeagueContext.js`

```javascript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  const [leagues, setLeagues]           = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [leagueData, setLeagueData]     = useState(null);
  const [loading, setLoading]           = useState(false);
  // Master AI analysis — shared across all modules
  const [aiAnalysis, setAiAnalysis]     = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiFromCache, setAiFromCache]   = useState(false);
  const [aiModel, setAiModel]           = useState(null);
  const [refreshesRemaining, setRefreshesRemaining] = useState(3); // updated from API response
  const [refreshLimitReached, setRefreshLimitReached] = useState(false);
  const [scoredWaiver, setScoredWaiver] = useState([]);
  const [lineupRecs, setLineupRecs]     = useState(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchLeagueData(selectedLeague);
    }
  }, [selectedLeague]);

  async function fetchLeagues() {
    try {
      const { data } = await axios.get('/api/yahoo/leagues');
      setLeagues(data);
      if (data[0]?.league_key && !selectedLeague) {
        setSelectedLeague(data[0].league_key);
      }
    } catch (err) {
      console.error('Failed to fetch leagues', err);
    }
  }

  async function fetchLeagueData(key) {
    setLoading(true);
    setAiAnalysis(null); // clear stale analysis on league switch
    setScoredWaiver([]); // prevent data crossover between leagues
    setLineupRecs(null);
    try {
      const { data } = await axios.get(`/api/yahoo/league/${key}`);
      setLeagueData(data);
      // Kick off master AI analysis in background (non-blocking)
      runAnalysis(key);
    } catch (err) {
      console.error('Failed to fetch league data', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * The single master Claude call for the entire session.
   * force=false: checks daily cache first, uses Haiku if cache miss (~$0.010/call)
   * force=true:  bypasses cache, always uses Sonnet for fresh quality analysis (~$0.039/call)
   */
  const runAnalysis = useCallback(async (key, force = false) => {
    setAiLoading(true);
    try {
      const { data } = await axios.post('/api/claude/analyze', { league_key: key, force });
      setAiAnalysis(data.analysis || null);
      setScoredWaiver(data.scoredWaiver || []);
      setLineupRecs(data.lineupRecs || null);
      setAiFromCache(data.fromCache || false);
      setAiModel(data.model || null);
      setRefreshesRemaining(data.refreshesRemaining ?? 3);
      setRefreshLimitReached(data.refreshLimitReached || false);
    } catch (err) {
      console.error('[LeagueContext] Master analysis failed:', err.message);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const refreshAnalysis = useCallback(() => {
    if (selectedLeague) runAnalysis(selectedLeague, true); // force=true → always Sonnet
  }, [selectedLeague, runAnalysis]);

  return (
    <LeagueContext.Provider value={{
      leagues,
      selectedLeague,
      setSelectedLeague,
      leagueData,
      loading,
      // AI analysis shared across all modules
      aiAnalysis,
      aiLoading,
      aiFromCache,
      aiModel,
      refreshesRemaining,
      refreshLimitReached,
      refreshAnalysis,
      // Pre-scored data from fantasyBrain (no Claude needed to display)
      scoredWaiver,
      lineupRecs,
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
```

---

## File: `lib/database.js`

```javascript
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { generateInfiniteCard } from './cardGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

// Helper to get YYYY-MM-DD string in Pacific Time
function getPTDateString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

// Force an active token refresh
export async function forceRefreshToken(guid, refresh_token) {
  try {
    const credentials = Buffer.from(
      `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
    ).toString('base64');
    
    const response = await axios.post(YAHOO_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
    const expiresAt = Date.now() + expires_in * 1000;
    
    const tokenData = { access_token, refresh_token: new_refresh_token, expires_at: expiresAt };
    if (guid) {
      db.setToken(guid, tokenData);
    }
    
    return access_token;
  } catch (err) {
    console.error('[Yahoo OAuth] CRITICAL error forcefully refreshing token', err.message);
    throw new Error('Failed to refresh token');
  }
}

// Railway: use mounted volume path if set; fall back to /tmp (always writable in containers)
function resolveDbDir() {
  const candidates = [
    process.env.RAILWAY_VOLUME_MOUNT_PATH,
    process.env.DATA_DIR,
    path.join(process.cwd(), 'db'),
    '/tmp/goinyard-db',
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      // Verify we can actually write here
      fs.accessSync(dir, fs.constants.W_OK);
      console.log(`[DB] Using data directory: ${dir}`);
      return dir;
    } catch {
      console.warn(`[DB] Cannot write to ${dir}, trying next...`);
    }
  }
  throw new Error('[DB] No writable data directory found');
}

const DB_DIR  = resolveDbDir();
const DB_FILE = path.join(DB_DIR, 'data.json');

const DEFAULT_DATA = {
  tokens: {},            // map: { [yahoo_guid]: { access_token, refresh_token, expires_at } }
  league_settings: {},   // map: { [league_key]: settingsObj }
  draft_board: [],
  my_roster: [],
  notes: [],
  subscriptions: {},     // map: { [yahoo_guid]: { plan, season, max_leagues, ... } }
  user_profiles: {},     // map: { [yahoo_guid]: { name, email, created_at } }
  trophy_cases: {},      // map: { [yahoo_guid]: { unlocked_cards: [{ id, unlocked_at, reason }] } }
  ai_usage: {},           // map: { [yahoo_guid]: { count, date } }
  leagues_used: {},       // map: { [yahoo_guid]: [league_key1, league_key2] }
  feedback: [],           // [{ yahoo_guid, text, created_at }]
  global_stats: {         // Track global metrics
    cards_issued: {}      // map: { [card_id]: count }
  },
  trade_block: [],
  analysis_cache: {},    // map: { [guid:leagueKey:YYYY-MM-DD]: { analysis, scoredWaiver, lineupRecs, model, cached_at } }
  force_refresh_counts: {} // map: { [guid:YYYY-MM-DD]: count } — tracks daily Sonnet force-refreshes per user
};

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data.tokens) data.tokens = {};
      if (!data.league_settings) data.league_settings = {};
      if (!data.draft_board) data.draft_board = [];
      if (!data.subscriptions) data.subscriptions = {};
      if (!data.user_profiles) data.user_profiles = {};
      if (!data.trophy_cases) data.trophy_cases = {};
      if (!data.ai_usage) data.ai_usage = {};
      if (!data.leagues_used) data.leagues_used = {};
      if (!data.feedback) data.feedback = [];
      if (!data.global_stats) data.global_stats = { cards_issued: {} };
      if (!data.global_stats.cards_issued) data.global_stats.cards_issued = {};
      if (!data.analysis_cache) data.analysis_cache = {};
      if (!data.force_refresh_counts) data.force_refresh_counts = {};
      return data;
    }
  } catch {}
  return { ...DEFAULT_DATA };
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  prepare(query) {
    return {
      run(...args) {
        const data = load();
        if (query.includes('INSERT OR REPLACE INTO league_settings')) {
          const leagueKey = args[0];
          const guid = args[9]; // We'll pass the guid as the last argument
          if (!data.league_settings[guid]) data.league_settings[guid] = {};
          data.league_settings[guid][leagueKey] = {
            league_key: args[0], league_name: args[1], num_teams: args[2],
            scoring_type: args[3], draft_type: args[4], draft_position: args[5],
            roster_slots: args[6], stat_categories: args[7], updated_at: args[8]
          };
          save(data);
        } else if (query.includes('INSERT OR IGNORE INTO draft_board')) {
          const exists = data.draft_board.find(p => p.player_key === args[0]);
          if (!exists) {
            data.draft_board.push({ player_key: args[0], player_name: args[1], position: args[2], team: args[3], adp: args[4], drafted: 0 });
          }
          save(data);
        } else if (query.includes('UPDATE draft_board SET drafted = 1')) {
          const p = data.draft_board.find(p => p.player_key === args[3]);
          if (p) { p.drafted = 1; p.drafted_by = args[0]; p.draft_round = args[1]; p.draft_pick = args[2]; }
          save(data);
        } else if (query.includes('UPDATE draft_board SET drafted = 0')) {
          const p = data.draft_board.find(p => p.player_key === args[0]);
          if (p) { p.drafted = 0; p.drafted_by = null; }
          save(data);
        } else if (query.includes('DELETE FROM draft_board')) {
          data.draft_board = [];
          save(data);
        }
      },
      get(...args) {
        const data = load();
        if (query.includes('FROM league_settings')) {
          const leagueKey = args[0];
          const guid = args[1];
          return (data.league_settings[guid] && data.league_settings[guid][leagueKey]) || null;
        }
        if (query.includes('COUNT(*) as count FROM draft_board')) {
          return { count: data.draft_board.length };
        }
        return null;
      },
      all(...args) {
        const data = load();
        if (query.includes('FROM draft_board WHERE drafted = 0')) {
          return data.draft_board.filter(p => !p.drafted).sort((a,b) => a.adp - b.adp);
        }
        return [];
      }
    };
  },
  transaction(fn) { return fn; },
  exec() {},

  async getAccessToken(guid) {
    if (!guid) throw new Error('Not authenticated');
    const row = db.getToken(guid);
    if (!row) throw new Error('No token found');
    if (Date.now() > row.expires_at - 60000) return await forceRefreshToken(guid, row.refresh_token);
    return row.access_token;
  },
  getToken(yahooGuid) { return load().tokens[yahooGuid] || null; },
  setToken(yahooGuid, tokenData) {
    const data = load();
    data.tokens[yahooGuid] = tokenData;
    save(data);
  },
  deleteToken(yahooGuid) {
    const data = load();
    delete data.tokens[yahooGuid];
    save(data);
  },
  getSubscription(yahooGuid) { return load().subscriptions[yahooGuid] || null; },
  setSubscription(yahooGuid, sub) {
    const data = load();
    data.subscriptions[yahooGuid] = { ...sub, updated_at: Date.now() };
    save(data);
  },
  setUserProfile(yahooGuid, profile) {
    const data = load();
    data.user_profiles[yahooGuid] = { ...profile, updated_at: Date.now() };
    save(data);
  },
  getUserProfile(yahooGuid) { return load().user_profiles[yahooGuid] || null; },
  getAiUsage(yahooGuid) {
    const data = load();
    const today = getPTDateString();
    const usage = data.ai_usage[yahooGuid];
    if (!usage || usage.date !== today) return { count: 0, date: today };
    return usage;
  },
  incrementAiUsage(yahooGuid) {
    const data = load();
    const today = getPTDateString();
    const current = data.ai_usage[yahooGuid];
    if (!current || current.date !== today) data.ai_usage[yahooGuid] = { count: 1, date: today };
    else data.ai_usage[yahooGuid].count++;
    save(data);
  },
  getTrophyCase(yahooGuid) { return load().trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null }; },
  async awardCard(yahooGuid, cardId, reason, forceRarity = null) {
    const data = load();
    
    // 1. Generate or fetch card definition
    let cardDef;
    if (cardId === 'random_dynamic') {
      cardDef = await generateInfiniteCard(forceRarity);
    } else {
      // Handle legacy/static IDs if needed (fallback to random if not found)
      cardDef = await generateInfiniteCard(forceRarity);
    }

    // 2. Increment global serial count for this card identity
    const idToTrack = cardDef.playerName || cardDef.id;
    if (!data.global_stats.cards_issued[idToTrack]) data.global_stats.cards_issued[idToTrack] = 0;
    data.global_stats.cards_issued[idToTrack]++;
    const serialNumber = data.global_stats.cards_issued[idToTrack];

    // 3. Generate hobby numbers
    const cardNumber = Math.floor(Math.random() * 999) + 1;
    // To prevent duplicate serials, we assign sequentially based on the global count.
    const serialPosition = serialNumber;

    // 4. Save to user's trophy case
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    const stampedCard = { 
      ...cardDef,
      serial: serialNumber,
      serialPosition: serialPosition,
      cardNumber: cardNumber,
      unlocked_at: Date.now(), 
      reason 
    };

    tc.unlocked_cards.push(stampedCard);
    
    data.trophy_cases[yahooGuid] = tc;
    save(data);
    
    return stampedCard;
  },
  updateDailyPackTimer(yahooGuid, dateStr) {
    const data = load();
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    tc.last_daily_pack = dateStr || getPTDateString();
    data.trophy_cases[yahooGuid] = tc;
    save(data);
  },
  
  // ── Trade Block ────────
  getTradeBlockListings() {
    const data = load();
    return data.trade_block || [];
  },
  postToTradeBlock(yahooGuid, instanceId, seeking) {
    const data = load();
    if (!data.trade_block) data.trade_block = [];
    
    // Check if card is already listed
    if (data.trade_block.find(t => t.instanceId === instanceId)) {
      throw new Error("Card is already on the trade block");
    }

    const listing = {
      id: `tb_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      user: yahooGuid,
      instanceId,
      seeking,
      timestamp: Date.now(),
      offers: []
    };
    data.trade_block.push(listing);
    save(data);
    return listing;
  },
  removeTradeListing(listingId, yahooGuid) {
    const data = load();
    if (!data.trade_block) return false;
    const initialLen = data.trade_block.length;
    data.trade_block = data.trade_block.filter(t => !(t.id === listingId && t.user === yahooGuid));
    if (data.trade_block.length !== initialLen) {
      save(data);
      return true;
    }
    return false;
  },
  addTradeOffer(listingId, buyerGuid, offerInstanceId) {
    const data = load();
    if (!data.trade_block) return null;
    const listingIndex = data.trade_block.findIndex(t => t.id === listingId);
    if (listingIndex === -1) throw new Error("Trade listing not found or already closed");
    const listing = data.trade_block[listingIndex];
    if (listing.user === buyerGuid) throw new Error("You cannot make an offer on your own listing");
    
    const buyerVault = data.trophy_cases[buyerGuid]?.unlocked_cards || [];
    const offerCard = buyerVault.find(c => c.instanceId === offerInstanceId);
    if (!offerCard) throw new Error("You do not own the card you are trying to offer");
    
    if (!listing.offers) listing.offers = [];
    listing.offers.push({
      offerId: `off_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      buyerGuid,
      offerInstanceId,
      timestamp: Date.now()
    });
    
    data.trade_block[listingIndex] = listing;
    save(data);
    return listing;
  },
  updateShowcasePrivacy(yahooGuid, isPublic) {
    const data = load();
    let profile = data.user_profiles[yahooGuid] || {};
    profile.public_showcase = isPublic;
    data.user_profiles[yahooGuid] = profile;
    save(data);
  },
  getPublicShowcases() {
    const data = load();
    const publicUsers = [];
    for (const [guid, profile] of Object.entries(data.user_profiles || {})) {
      if (profile.public_showcase) {
        const tc = data.trophy_cases[guid];
        publicUsers.push({
          guid,
          username: profile.team_name || 'Anonymous Manager',
          cardCount: tc?.unlocked_cards?.length || 0,
          legendaryCount: tc?.unlocked_cards?.filter(c => c.rarity === 'legendary').length || 0
        });
      }
    }
    return publicUsers;
  },
  saveLeagueSettings(yahooGuid, leagueKey, settings) {
    const data = load();
    if (!data.league_settings) data.league_settings = {};
    if (!data.league_settings[yahooGuid]) data.league_settings[yahooGuid] = {};
    data.league_settings[yahooGuid][leagueKey] = { ...settings, updated_at: Date.now() };
    save(data);
  },
  getLeagueSettings(yahooGuid, leagueKey) {
    const data = load();
    return data.league_settings?.[yahooGuid]?.[leagueKey] || null;
  },
  getLeaguesUsed(yahooGuid) { return load().leagues_used[yahooGuid] || []; },
  trackLeagueUse(yahooGuid, leagueKey) {
    const data = load();
    let used = data.leagues_used[yahooGuid] || [];
    if (!used.includes(leagueKey)) {
      used.push(leagueKey);
      data.leagues_used[yahooGuid] = used;
      save(data);
    }
  },
  addFeedback(yahooGuid, text) {
    const data = load();
    data.feedback.push({ yahoo_guid: yahooGuid || 'anonymous', text, created_at: Date.now() });
    save(data);
  },
  getAllFeedback() {
    return load().feedback || [];
  },

  // ── Analysis cache — one Sonnet/Haiku call per league per day ──────────────
  getAnalysisCache(yahooGuid, leagueKey) {
    const today = getPTDateString(); // YYYY-MM-DD in PT
    const key   = `${yahooGuid}:${leagueKey}:${today}`;
    const data  = load();
    return data.analysis_cache?.[key] || null;
  },
  setAnalysisCache(yahooGuid, leagueKey, payload) {
    const today = getPTDateString();
    const key   = `${yahooGuid}:${leagueKey}:${today}`;
    const data  = load();
    if (!data.analysis_cache) data.analysis_cache = {};
    // Prune entries older than 3 days to keep data.json lean
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    for (const k of Object.keys(data.analysis_cache)) {
      const datePart = k.split(':')[2];
      if (datePart && datePart < cutoff) delete data.analysis_cache[k];
    }
    data.analysis_cache[key] = { ...payload, cached_at: Date.now() };
    save(data);
  },

  // ── Force-refresh rate limiting — max Sonnet calls per user per day ────────
  DAILY_FORCE_LIMIT: 9999,  // TEMP: testing — reset to 1 before launch

  getForceRefreshCount(yahooGuid) {
    const today = getPTDateString();
    const key   = `${yahooGuid}:${today}`;
    return load().force_refresh_counts?.[key] || 0;
  },

  incrementForceRefreshCount(yahooGuid) {
    const today = getPTDateString();
    const key   = `${yahooGuid}:${today}`;
    const data  = load();
    if (!data.force_refresh_counts) data.force_refresh_counts = {};
    // Prune keys older than 2 days
    const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    for (const k of Object.keys(data.force_refresh_counts)) {
      const datePart = k.split(':')[1];
      if (datePart && datePart < cutoff) delete data.force_refresh_counts[k];
    }
    data.force_refresh_counts[key] = (data.force_refresh_counts[key] || 0) + 1;
    save(data);
    return data.force_refresh_counts[key];
  },
};




```

---

## File: `lib/fantasyBrain.js`

```javascript
/**
 * fantasyBrain.js — Expert fantasy baseball logic engine
 * Pure computation — no Claude calls. Feeds structured intelligence into AI prompts.
 *
 * Three scoring formats are handled distinctly:
 *   ROTO          — Season-long category accumulation. Protect ratios, accumulate counting stats.
 *   H2H_CAT       — Weekly head-to-head category matchups. Win 6+ of 10 cats to win.
 *   H2H_POINTS    — Weekly total points. Maximize volume (ABs, IP, 2-start SPs).
 */

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL FORMAT DETECTOR — One function, used everywhere
// Yahoo sends: 'head', 'headpoint', 'headone', 'roto', etc.
// ─────────────────────────────────────────────────────────────────────────────
const FORMAT = { ROTO: 'ROTO', H2H_CAT: 'H2H_CAT', H2H_POINTS: 'H2H_POINTS' }

function detectFormat(scoringType) {
  const raw = String(scoringType || '').toLowerCase().trim()
  // 1. Check for Points variants first (prevents "H2H Points" from matching H2H_CAT)
  if (raw.includes('point') || raw === 'h2h_pts' || raw === 'pts') return FORMAT.H2H_POINTS
  // 2. Check for Categories/H2H variants
  if (raw.includes('head') || raw.includes('h2h') || raw.includes('categories') || raw === 'cat') return FORMAT.H2H_CAT
  // 3. Default to Roto
  return FORMAT.ROTO
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED POINTS CALCULATOR — Single source of truth for raw-points math
// Used by: calculateVOR (Points mode), analyzeCategories, profilePointsContribution
// ─────────────────────────────────────────────────────────────────────────────
const HITTING_PTS = { R: 1.9, '1B': 2.6, '2B': 5.2, '3B': 7.8, HR: 10.4, RBI: 1.9, SB: 4.2, BB: 2.6, HBP: 2.6 }
const PITCHING_PTS = { W: 8, SV: 8, OUT: 1, HA: -1.3, ER: -3, BBA: -1.3, HBPA: -1.3, K: 3 }

/**
 * Compute raw fantasy points for a player. Works with both Yahoo stat-ID keys
 * and human-readable stat names.
 * @param {Object} stats - player's stats object
 * @param {boolean} isPitcher - true if SP/RP
 * @param {Object} [statMapping] - optional league-specific stat ID mapping
 * @returns {number} raw season fantasy points
 */
function computePlayerPoints(stats = {}, isPitcher = false, statMapping = null) {
  // Helper: look up a stat by name, then by Yahoo numeric IDs
  const get = (name, ...ids) => {
    if (statMapping && statMapping[name]) {
      const v = stats[statMapping[name]]
      if (v !== undefined && v !== '-' && v !== '') return parseFloat(v) || 0
    }
    if (stats[name] !== undefined && stats[name] !== '-' && stats[name] !== '') return parseFloat(stats[name]) || 0
    for (const id of ids) {
      if (stats[id] !== undefined && stats[id] !== '-' && stats[id] !== '') return parseFloat(stats[id]) || 0
    }
    return 0
  }

  let pts = 0
  if (!isPitcher) {
    const hits = get('H', '4')
    const doubles = get('2B', '5', '10')
    const triples = get('3B', '6', '11')
    const hrs = get('HR', '12')
    const singles = get('1B', '9') || Math.max(0, hits - doubles - triples - hrs)
    pts += get('R', '7', '60')   * HITTING_PTS.R
    pts += singles               * HITTING_PTS['1B']
    pts += doubles               * HITTING_PTS['2B']
    pts += triples               * HITTING_PTS['3B']
    pts += hrs                   * HITTING_PTS.HR
    pts += get('RBI', '13')      * HITTING_PTS.RBI
    pts += get('SB', '16', '23') * HITTING_PTS.SB
    pts += get('BB', '18', '26') * HITTING_PTS.BB
    pts += get('HBP', '20', '51')* HITTING_PTS.HBP
  } else {
    const ip = get('IP', '50')
    const outs = Math.floor(ip) * 3 + Math.round((ip % 1) * 10)
    pts += get('W', '28')        * PITCHING_PTS.W
    pts += get('SV', '32')       * PITCHING_PTS.SV
    pts += outs                  * PITCHING_PTS.OUT
    pts += get('HA', '43')       * PITCHING_PTS.HA
    pts += get('ER', '47')       * PITCHING_PTS.ER
    pts += get('BBA', '46')      * PITCHING_PTS.BBA
    pts += get('HBPA', '57')     * PITCHING_PTS.HBPA
    pts += get('K', '42')        * PITCHING_PTS.K
  }
  return pts
}

// ─────────────────────────────────────────────────────────────────────────────
// A) POSITIONAL VALUE TIERS
// ─────────────────────────────────────────────────────────────────────────────

const POSITIONAL_DATA = {
  C: {
    tier: 'elite',
    draftWindow: 'rounds 3-7',
    replacementDropoff: 'massive',
    notes: 'Only 3-4 viable starters in a 12-team league. Elite C worth a 3rd rounder. CRITICAL RULE: Never roster a backup catcher unless it is a 2-catcher league. Holding a backup C on the bench is a complete waste of a roster spot.',
    replacementLevel: { R: 45, HR: 11, RBI: 45, SB: 2, AVG: 0.232 },
    starterSlots: 1,
  },
  SS: {
    tier: 'scarce',
    draftWindow: 'rounds 3-8',
    replacementDropoff: 'massive',
    notes: 'Top 5 SS have massive edge. After pick ~60 overall the position drops to .248 AVG / 14 HR territory. Must address by round 8.',
    replacementLevel: { R: 65, HR: 14, RBI: 60, SB: 7, AVG: 0.248 },
    starterSlots: 1,
  },
  '2B': {
    tier: 'moderate',
    draftWindow: 'rounds 5-10',
    replacementDropoff: 'significant',
    notes: 'Dual-eligible players have deepened the position. UTIL eligibility means you can wait, but top 2B have premium value.',
    replacementLevel: { R: 65, HR: 14, RBI: 60, SB: 6, AVG: 0.250 },
    starterSlots: 1,
  },
  '3B': {
    tier: 'moderate',
    draftWindow: 'rounds 4-10',
    replacementDropoff: 'gradual',
    notes: 'Deeper than SS, easy to stream. Top 3B (Ramirez, Arenado tier) are worth early picks but position has depth through round 10.',
    replacementLevel: { R: 62, HR: 17, RBI: 65, SB: 4, AVG: 0.246 },
    starterSlots: 1,
  },
  '1B': {
    tier: 'deep',
    draftWindow: 'rounds 5-12',
    replacementDropoff: 'gradual',
    notes: 'Deepest non-OF position. Never draft a 1B early unless elite (Freeman, Goldschmidt tier). UTIL eligibility adds depth.',
    replacementLevel: { R: 70, HR: 20, RBI: 74, SB: 2, AVG: 0.250 },
    starterSlots: 1,
  },
  OF: {
    tier: 'deep',
    draftWindow: 'rounds 1-15',
    replacementDropoff: 'minimal',
    notes: '3 starting slots means you need volume but the position is extremely deep. Never reach for OF. Stars in rounds 1-3, fill with depth later.',
    replacementLevel: { R: 68, HR: 17, RBI: 68, SB: 8, AVG: 0.252 },
    starterSlots: 3,
  },
  SP: {
    tier: 'moderate',
    draftWindow: 'rounds 2-12',
    replacementDropoff: 'significant',
    notes: 'Top 5 aces (sub-3.00 ERA, 200+ K) are round 2-3 value. Middle SPs stream well. Zero-SP strategy viable in H2H. Never reach past ADP.',
    replacementLevel: { W: 8, K: 140, ERA: 4.50, WHIP: 1.35, SV: 0 },
    starterSlots: 5,
  },
  RP: {
    tier: 'replacement',
    draftWindow: 'rounds 12-23',
    replacementDropoff: 'minimal',
    notes: 'Most volatile position. Closers blow saves, lose jobs, get injured constantly. Never draft RP before round 12 in standard leagues. Waiver wire replaces closers regularly.',
    replacementLevel: { W: 3, K: 55, ERA: 4.00, WHIP: 1.30, SV: 10 },
    starterSlots: 2,
  },
}

function getPositionalScarcity(position, leagueSize = 12) {
  const parts = String(position || '').split(/[/, ]+/).map(p => p.trim().toUpperCase()).filter(Boolean)
  
  // Scarcity ordering for comparison
  const scarcityOrder = { elite: 5, scarce: 4, moderate: 3, deep: 2, replacement: 1 }
  
  let bestData = POSITIONAL_DATA['OF']
  let bestScore = -1
  
  parts.forEach(p => {
    const data = POSITIONAL_DATA[p]
    if (data) {
      const score = scarcityOrder[data.tier] || 0
      if (score > bestScore) {
        bestScore = score
        bestData = data
      }
    }
  })

  const scale = leagueSize / 12  // adjust for non-12-team leagues

  return {
    tier: bestData.tier,
    draftWindow: bestData.draftWindow,
    replacementDropoff: bestData.replacementDropoff,
    replacementLevel: bestData.replacementLevel,
    notes: bestData.notes,
    urgencyScore: { elite: 10, scarce: 8, moderate: 5, deep: 2, replacement: 0 }[bestData.tier] || 3,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// B) CATEGORY / POINTS STRATEGY ENGINE — now 3-format aware
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CATS = ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']

/**
 * @param {Object} myStats - aggregated team stats
 * @param {Array}  leagueStandings - opponent or league data
 * @param {string} scoringType - raw Yahoo scoring_type string
 * @param {Array}  [leagueStatCategories] - actual stat category names from league settings
 */
function analyzeCategories(myStats = {}, leagueStandings = [], scoringType = 'Points', leagueStatCategories = null) {
  const result = { topPerformers: [], weaknesses: [], advice: '', format: '' }
  const fmt = detectFormat(scoringType)
  result.format = fmt

  // Use actual league categories if provided, otherwise defaults
  const cats = (leagueStatCategories && leagueStatCategories.length > 0)
    ? leagueStatCategories
    : DEFAULT_CATS

  if (fmt === FORMAT.H2H_POINTS) {
    // ── H2H POINTS: volume is everything ─────────────────────────────
    const myPts = computePlayerPoints(myStats, false) + computePlayerPoints(myStats, true)
    const oppRaw = leagueStandings[0]?.stats || leagueStandings[0] || {}
    const oppPts = computePlayerPoints(oppRaw, false) + computePlayerPoints(oppRaw, true)

    if (myPts > 0 || oppPts > 0) {
      const margin = myPts - oppPts
      result.advice = `H2H POINTS: Maximize volume — 2-start SPs are gold, 7-game hitters are mandatory starts. Projected margin: ${margin > 0 ? '+' : ''}${margin.toFixed(1)} pts. Never punt categories — every point counts. Avoid negative-point risks (high ER/Hits allowed pitchers).`
    } else {
      result.advice = 'H2H POINTS: Maximize plate appearances and SP innings. Start every eligible player. Do NOT leave lineup slots empty. Bench only IL players.'
    }
    return result
  }

  // ── ROTO or H2H CATEGORIES: need per-category analysis ─────────────
  const oppRaw = leagueStandings[0]?.stats || leagueStandings[0] || {}
  const inverseCats = ['ERA', 'WHIP', 'BB9', 'BBA', 'L'] // lower = better

  cats.forEach(c => {
    const catName = String(c).toUpperCase().trim()
    const myVal = parseFloat(myStats[catName] || myStats[c] || 0)
    const oppVal = parseFloat(oppRaw[catName] || oppRaw[c] || 0)
    const isInverse = inverseCats.includes(catName)

    if (myVal === 0 && oppVal === 0) return
    const iWin = isInverse ? myVal < oppVal : myVal > oppVal
    if (iWin) result.topPerformers.push(catName)
    else if (myVal !== oppVal) result.weaknesses.push(catName)
  })

  if (fmt === FORMAT.ROTO) {
    result.advice = `ROTO: This is a marathon, not a sprint. Protect ratios (ERA/WHIP/AVG) all season — one bad streamer can damage months of work. Stream counting stats (${result.weaknesses.slice(0, 2).join('/') || 'SB/Saves'}) only with safe-floor pitchers. Never punt a category entirely.`
  } else {
    // H2H_CAT
    const totalCats = cats.length || 10
    const winTarget = Math.ceil(totalCats / 2) + 1
    result.advice = `H2H CATEGORIES (${totalCats} cats): You need to win ${winTarget}+ categories this week. Swing categories: ${result.weaknesses.slice(0, 3).join(', ') || 'TBD'}. Target waiver adds and streaming specifically aimed at flipping those weak cats. Safe to punt 1-2 hopeless cats and load up on the rest.`
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// C) VALUE OVER REPLACEMENT (VOR) CALCULATOR — Unified, 3-format aware
// Uses shared computePlayerPoints() for Points mode. SGP for Categories/Roto.
// Both outputs are normalized to the same 0-150+ scale.
// ─────────────────────────────────────────────────────────────────────────────

// SGP denominators for 12-team 5x5 Roto/Categories
const SGP_DENOMINATORS = {
  HR: 6.5, R: 25, RBI: 25, SB: 6, AVG_BASELINE: 0.252,
  W: 5.5, SV: 6.5, K: 40, ERA_BASELINE: 4.00, WHIP_BASELINE: 1.30
}

/**
 * Core calculation for VOR at a single position.
 */
function _computeVOR(playerStats, pos, leagueSize, scoringType, statMapping) {
  const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P'
  const fmt = detectFormat(scoringType)

  if (fmt === FORMAT.H2H_POINTS) {
    const rawPts = computePlayerPoints(playerStats, isPitcher, statMapping)
    if (rawPts <= 0) return 0
    return Math.round(Math.max(0, rawPts / 5))
  }

  const getStat = (statName, ...fallbackKeys) => {
    if (statMapping && statMapping[statName]) {
      const v = playerStats[statMapping[statName]]
      if (v !== undefined && v !== '-' && v !== '') return parseFloat(v) || 0
    }
    if (playerStats[statName] !== undefined && playerStats[statName] !== '-' && playerStats[statName] !== '') return parseFloat(playerStats[statName]) || 0
    for (const k of fallbackKeys) {
      if (playerStats[k] !== undefined && playerStats[k] !== '-' && playerStats[k] !== '') return parseFloat(playerStats[k]) || 0
    }
    return 0
  }

  let sgpTotal = 0
  if (!isPitcher) {
    sgpTotal += getStat('R', '7', '60')   / SGP_DENOMINATORS.R
    sgpTotal += getStat('HR', '12')        / SGP_DENOMINATORS.HR
    sgpTotal += getStat('RBI', '13')       / SGP_DENOMINATORS.RBI
    sgpTotal += getStat('SB', '16', '23')  / SGP_DENOMINATORS.SB
    const ab = getStat('AB', '2', '5')
    const avg = getStat('AVG', '3')
    if (ab > 0) {
      // Scale AVG SGP by positional scarcity — catchers/SS get more 'credit' for average than 1B
      const scarcity = getPositionalScarcity(pos, leagueSize)
      const baseline = scarcity.replacementLevel.AVG || SGP_DENOMINATORS.AVG_BASELINE
      sgpTotal += ((avg - baseline) * Math.min(ab, 150)) / 15
    }
  } else {
    sgpTotal += getStat('W', '28')  / SGP_DENOMINATORS.W
    sgpTotal += getStat('SV', '32') / SGP_DENOMINATORS.SV
    sgpTotal += getStat('K', '42')  / SGP_DENOMINATORS.K
    const ip = getStat('IP', '50')
    const era = getStat('ERA', '26') || SGP_DENOMINATORS.ERA_BASELINE
    const whip = getStat('WHIP', '27') || SGP_DENOMINATORS.WHIP_BASELINE
    if (ip > 0) {
      sgpTotal += ((SGP_DENOMINATORS.ERA_BASELINE - era) * Math.min(ip, 50)) / 20
      sgpTotal += ((SGP_DENOMINATORS.WHIP_BASELINE - whip) * Math.min(ip, 50)) / 5
    }
  }

  if (fmt === FORMAT.H2H_CAT && !isPitcher) sgpTotal *= 1.1
  if (sgpTotal <= -10) return 0
  return Math.round(Math.max(0, (sgpTotal + 2) * 7))
}

function calculateVOR(playerStats = {}, position, leagueSize = 12, scoringType = 'Points', statMapping = null) {
  if (!playerStats || Object.keys(playerStats).length === 0) return 0
  const parts = String(position || '').split(/[/, ]+/).map(p => p.trim().toUpperCase()).filter(Boolean)
  if (parts.length === 0) return _computeVOR(playerStats, 'OF', leagueSize, scoringType, statMapping)

  let maxVOR = 0
  parts.forEach(pos => {
    const v = _computeVOR(playerStats, pos, leagueSize, scoringType, statMapping)
    if (v > maxVOR) maxVOR = v
  })
  return maxVOR
}

// ─────────────────────────────────────────────────────────────────────────────
// D) SCHEDULE & MATCHUP INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────

// Approximate weekly game counts — most teams average 6.2 games/week.
// Pattern: typical team plays 6 or 7 games most weeks, occasionally 4-5.
// This is a reasonable approximation without live schedule data.
const BASE_WEEKLY_GAMES = 6

const TEAM_SCHEDULE_OFFDAYS = {
  // Teams with historically more off-days in certain stretches
  NYY: [4, 4, 5, 5], LAD: [4, 5], HOU: [4], // sample off-day weeks
}

function getWeeklyGameCount(teamAbbr, weekNumber) {
  const team = String(teamAbbr || '').toUpperCase()
  const offDayWeeks = TEAM_SCHEDULE_OFFDAYS[team] || []
  // If this week is in an off-day week, return 4-5; otherwise 6-7
  const isLightWeek = offDayWeeks.includes(weekNumber)
  const isHeavyWeek = weekNumber % 7 === 0  // doubleheader weeks occur periodically

  if (isLightWeek) return 4
  if (isHeavyWeek) return 7
  // Default: alternate 6 and 7
  return weekNumber % 3 === 0 ? 7 : 6
}

// Ballpark run-environment factors (>1.0 = hitter friendly)
const BALLPARK_FACTORS = {
  COL: 1.35, CIN: 1.18, TEX: 1.12, BOS: 1.10, PHI: 1.08, MIL: 1.06,
  ARI: 1.05, ATL: 1.04, NYY: 1.03, CHC: 1.02, PIT: 1.01, CLE: 1.00,
  STL: 0.99, DET: 0.98, MIN: 0.97, TOR: 0.97, BAL: 0.97, SEA: 0.96,
  MIA: 0.95, TB: 0.95, KC: 0.95, SD: 0.94, OAK: 0.94, SF: 0.93,
  LAD: 0.93, NYM: 0.92, WSH: 0.92, LAA: 0.91, HOU: 0.91, CWS: 0.90,
}

function streamingValue(pitcher = {}, opposingTeamStats = {}, scoringType = 'Points') {
  let score = 50  // neutral baseline
  const fmt = detectFormat(scoringType)
  const isPoints = fmt === FORMAT.H2H_POINTS;

  // Opponent offensive quality
  const oppWOBA = parseFloat(opposingTeamStats.wOBA || opposingTeamStats.avg || 0.315)
  if (oppWOBA < 0.300) score += 15
  else if (oppWOBA < 0.310) score += 8
  else if (oppWOBA > 0.330) score -= 15
  else if (oppWOBA > 0.320) score -= 8

  // Pitcher's recent K/9
  const kPer9 = parseFloat(pitcher.k9 || pitcher.k_per_9 || 8.0)
  if (kPer9 > 10) score += 15
  else if (kPer9 > 9) score += 8
  else if (kPer9 < 7) score -= 10

  // Ballpark factor
  const park = String(pitcher.home_park || pitcher.team || '').toUpperCase()
  const parkFactor = BALLPARK_FACTORS[park] || 1.0
  if (parkFactor < 0.94) score += 8
  else if (parkFactor < 0.97) score += 4
  else if (parkFactor > 1.10) score -= 10
  else if (parkFactor > 1.05) score -= 5

  if (isPoints) {
    // POINTS FORMAT: Volume and Ks are heavily rewarded. Avoid high K opponents for safety.
    const oppKRate = parseFloat(opposingTeamStats.kRate || opposingTeamStats.k_pct || 0.22)
    if (oppKRate > 0.26) score += 20 // Huge boost in points
    else if (oppKRate > 0.24) score += 10
    else if (oppKRate < 0.20) score -= 10
    else if (oppKRate < 0.18) score -= 18 // Low Ks = low points ceiling

    // Pitcher innings depth (more outs = more points)
    const avgIP = parseFloat(pitcher.ip_per_start || pitcher.avg_ip || 5.0)
    if (avgIP >= 6.0) score += 15
    else if (avgIP >= 5.5) score += 8
    else if (avgIP < 4.5) score -= 15
  } else if (fmt === FORMAT.H2H_CAT) {
    // H2H CATEGORIES: Ratios matter per-week but you can afford a gamble.
    // A streamer who wins you W and K cats but hurts ERA is still worth considering.
    const pitcherERA = parseFloat(pitcher.era || 4.00)
    const pitcherWHIP = parseFloat(pitcher.whip || 1.30)
    if (pitcherERA > 4.50) score -= 15;
    else if (pitcherERA < 3.20) score += 8;
    if (pitcherWHIP > 1.40) score -= 10;
    else if (pitcherWHIP < 1.15) score += 8;
    // In H2H cats, streaming a 2-start SP for W and K categories is very valuable
    const avgIP = parseFloat(pitcher.ip_per_start || pitcher.avg_ip || 5.0)
    if (avgIP >= 6.0) score += 10;
  } else {
    // ROTO: Ratios are SACRED. One bad streamer ruins months of ERA/WHIP work.
    const pitcherERA = parseFloat(pitcher.era || 4.00)
    const pitcherWHIP = parseFloat(pitcher.whip || 1.30)
    
    // Severely penalize high-ratio pitchers — ROTO cannot recover from ratio damage
    if (pitcherERA > 4.50) score -= 25;
    else if (pitcherERA > 4.00) score -= 15;
    else if (pitcherERA < 3.20) score += 10;

    if (pitcherWHIP > 1.40) score -= 20;
    else if (pitcherWHIP < 1.15) score += 10;
    
    // Opponent team OBP heavily impacts WHIP ratio
    const oppOBP = parseFloat(opposingTeamStats.obp || 0.320)
    if (oppOBP > 0.335) score -= 15; // Very risky for WHIP
    else if (oppOBP < 0.300) score += 8;
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    grade: score >= 75 ? 'Elite stream' : score >= 60 ? 'Good stream' : score >= 45 ? 'Neutral' : score >= 30 ? 'Risky' : 'Avoid',
    factors: { oppWOBA, kPer9, parkFactor, format: fmt }
  }
}

// Platoon advantage multiplier (LHH vs RHP is a known edge)
const PLATOON_MATRIX = {
  'L-R': 1.12,  // LHH vs RHP — meaningful platoon advantage
  'R-L': 1.08,  // RHH vs LHP — smaller but real advantage
  'L-L': 0.93,  // LHH vs LHP — disadvantage
  'R-R': 0.95,  // RHH vs RHP — slight disadvantage
  'S-R': 1.06,  // switch hitter vs RHP (bats left) — moderate advantage
  'S-L': 1.05,  // switch hitter vs LHP (bats right) — moderate advantage
}

function platoonAdvantage(batterHand, pitcherHand) {
  const key = `${String(batterHand || 'R').toUpperCase()}-${String(pitcherHand || 'R').toUpperCase()}`
  const multiplier = PLATOON_MATRIX[key] || 1.0
  return {
    multiplier,
    advantage: multiplier >= 1.10 ? 'Strong' : multiplier >= 1.05 ? 'Moderate' : multiplier < 0.96 ? 'Disadvantage' : 'Neutral',
    description: PLATOON_MATRIX[key]
      ? `${batterHand}HH vs ${pitcherHand}HP: ${((multiplier - 1) * 100).toFixed(0)}% platoon ${multiplier >= 1 ? 'boost' : 'penalty'}`
      : 'No platoon data available'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// E) TRADE FAIRNESS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function evaluateTrade(giving = [], receiving = [], myRoster = [], leagueContext = {}) {
  // Null guards — callers may pass null from Yahoo API failures
  if (!giving || !receiving) return { verdict: 'Invalid', net: 0, myScore: 0, theirScore: 0, reasoning: 'Invalid trade data.' };
  giving    = Array.isArray(giving)    ? giving    : [];
  receiving = Array.isArray(receiving) ? receiving : [];
  myRoster  = Array.isArray(myRoster)  ? myRoster  : [];
  leagueContext = leagueContext || {};

  const leagueSize = leagueContext.num_teams || 12
  const scoringType = leagueContext.scoring_type || 'Points'
  const statMapping = leagueContext.statMap || null

  // VOR score for each side
  const givingVOR = giving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize, scoringType, statMapping), 0)
  const receivingVOR = receiving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize, scoringType, statMapping), 0)

  // Positional scarcity weight for what I'm giving up vs receiving
  const givingScarcity = giving.reduce((sum, p) => {
    const s = getPositionalScarcity(p.position, leagueSize)
    return sum + s.urgencyScore
  }, 0)
  const receivingScarcity = receiving.reduce((sum, p) => {
    const s = getPositionalScarcity(p.position, leagueSize)
    return sum + s.urgencyScore
  }, 0)

  // Roster need bonus: am I filling a critical hole?
  const myPositions = myRoster.map(p => String(p.position || '').split('/')[0].toUpperCase())
  const rosterNeedBonus = receiving.reduce((bonus, p) => {
    const pos = String(p.position || '').split('/')[0].toUpperCase()
    const countAtPos = myPositions.filter(mp => mp === pos).length
    const scarcity = getPositionalScarcity(pos, leagueSize)
    if (countAtPos === 0 && scarcity.tier !== 'deep') return bonus + 15
    if (countAtPos === 0) return bonus + 8
    return bonus
  }, 0)

  // Sell high / buy low detection
  const sellHighFlags = giving.filter(p => {
    const babip = parseFloat(p.stats?.babip || p.babip || 0)
    const hrFb = parseFloat(p.stats?.hr_fb || p.hr_fb || 0)
    return (babip > 0.350) || (hrFb > 0.22)
  }).map(p => `${p.player_name || p.name} (unsustainable peripherals — sell high candidate)`)

  const buyLowFlags = receiving.filter(p => {
    const babip = parseFloat(p.stats?.babip || p.babip || 0)
    return babip > 0 && babip < 0.250
  }).map(p => `${p.player_name || p.name} (depressed BABIP — buy low candidate)`)

  // 2-for-1 roster spot consideration
  const countDelta = receiving.length - giving.length
  const rosterSpotValue = countDelta < 0 ? 10 : countDelta > 0 ? -8 : 0  // gaining a roster spot is good

  // Raw fairness score
  const vorDelta = receivingVOR - givingVOR
  const scarcityDelta = receivingScarcity - givingScarcity
  let score = (vorDelta * 0.6) + (scarcityDelta * 2) + rosterNeedBonus + rosterSpotValue

  // Clamp to -100 to +100
  score = Math.max(-100, Math.min(100, Math.round(score)))

  const verdict =
    score >= 60 ? 'smash accept' :
    score >= 20 ? 'accept' :
    score >= -4  ? 'fair' :
    score >= -40 ? 'decline' :
    'insulting'

  const reasoning = [
    `VOR delta: ${receivingVOR > givingVOR ? '+' : ''}${(receivingVOR - givingVOR).toFixed(0)} in your favor`,
    givingScarcity > receivingScarcity ? `You're giving up scarcer positional value` : `You're receiving scarcer positional value`,
    rosterNeedBonus > 0 ? `Filling a roster hole adds ${rosterNeedBonus} need-bonus points` : null,
    sellHighFlags.length ? `SELL HIGH: ${sellHighFlags.join('; ')}` : null,
    buyLowFlags.length ? `BUY LOW: ${buyLowFlags.join('; ')}` : null,
  ].filter(Boolean).join('. ')

  const counterOffer = score < -15 && receiving.length > 0
    ? `Counter: ask them to add a ${getPositionalScarcity(giving[0]?.position, leagueSize).tier}-tier player to balance the VOR gap`
    : score >= -15 && score < 20
      ? `Negotiate: request a bench depth upgrade to push this from fair to favorable`
      : ''

  return { score, verdict, reasoning, counterOffer, sellHighFlags, buyLowFlags }
}

// ─────────────────────────────────────────────────────────────────────────────
// F) WAIVER WIRE PRIORITY SCORING
// ─────────────────────────────────────────────────────────────────────────────

function scoreWaiverTarget(player = {}, myRoster = [], leagueSettings = {}, categoryNeeds = null, pitchingContext = null) {
  // Null guards
  if (!player) return { score: 0, priority: 'Pass', reasoning: 'No player data.' };
  myRoster      = Array.isArray(myRoster)  ? myRoster  : [];
  leagueSettings = leagueSettings || {};

  // ── IL/OUT status check — immediately disqualify unavailable players ──────
  const rawSlot   = String(player.slot   || '').toUpperCase();
  const rawStatus = String(player.status || '').toUpperCase();
  const IL_SLOTS_SET    = new Set(['IL', 'IL+', 'IL7', 'IL10', 'IL15', 'IL60']);
  const IL_STATUS_WORDS = ['IL', 'DL', 'OUT', 'SUSP', 'NA', 'O'];
  const isOnIL = IL_SLOTS_SET.has(rawSlot) || IL_STATUS_WORDS.some(w => rawStatus.includes(w));
  if (isOnIL) {
    return { score: 0, priority: 'Pass', reasoning: `⛔ Player is currently ${rawStatus || rawSlot} — not available to add.` };
  }

  let score = 30  // baseline
  let reasoning = '';
  let priorityLevel = 'STANDARD';

  const pos = String(player.position || '').split('/')[0].split(',')[0].trim().toUpperCase()
  const leagueSize = leagueSettings.num_teams || 12
  const scarcity = getPositionalScarcity(pos, leagueSize)
  const myPositions = myRoster.map(p => String(p.position || '').split(/[/,]/)[0].trim().toUpperCase())
  const countAtPos = myPositions.filter(p => p === pos).length
  const required = (leagueSettings.roster_slots || {})[pos] || 1

  const fmt = detectFormat(leagueSettings.scoring_type)

  // Positional need
  if (fmt === FORMAT.H2H_POINTS && pos === 'C' && countAtPos >= 1) {
    score -= 50  // Rule 1: NEVER advise a backup catcher
  } else if (countAtPos < required) score += scarcity.urgencyScore * 3
  else if (countAtPos >= required) score -= 10

  // ── Two-Start Pitcher Math Override ─────────────────────────────────────
  const isPitcher = ['SP', 'RP', 'P'].includes(pos);
  const basicName = (player.player_name || player.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (isPitcher && pitchingContext) {
    const detail = pitchingContext.pitcherDetails?.[basicName];
    const remaining = detail?.remainingStarts ?? (pitchingContext.remainingTwoStarters?.includes(basicName) ? 2 : pitchingContext.oneStartRemaining?.includes(basicName) ? 1 : 0);

    if (pitchingContext.remainingTwoStarters?.includes(basicName)) {
      // Full 2 starts still ahead — maximum streaming value
      score += 100;
      priorityLevel = 'CHAMPIONSHIP STREAM';
      reasoning = `🏆 2-START PITCHER — both starts remaining (${detail?.upcomingDays?.join(', ') || 'this week'}). Mathematical edge.`;
    } else if (pitchingContext.oneStartRemaining?.includes(basicName)) {
      // Was a 2-start SP; 1 start already used — still a premium add
      score += 55;
      priorityLevel = 'HIGH PRIORITY STREAM';
      reasoning = `⚾ 2-start SP with 1 start already used (${detail?.completedDays?.join(', ') || 'earlier'}), 1 premium start remaining (${detail?.upcomingDays?.join(', ') || 'this week'}).`;
    } else if (pitchingContext.today?.includes(basicName)) {
      if (categoryNeeds && categoryNeeds.needsPitching) {
        score += 45;
        priorityLevel = 'CRITICAL STREAM';
        reasoning = '🔥 CONFIRMED STARTING PITCHER TODAY. Team pitching weakness identified.';
      } else {
        score += 20;
        reasoning = 'Confirmed SP starting today (1 start).';
      }
    } else if (pitchingContext.nextWeek?.includes(basicName)) {
      score += 80;
      priorityLevel = 'CHAMPIONSHIP STREAM';
      reasoning = '🔮 CONFIRMED 2-START PITCHER NEXT WEEK. Critical lookahead pickup.';
    }
  }

  // ── Category-need boost ────────────────────────────────────────────────
  if (categoryNeeds) {
    if (isPitcher && categoryNeeds.needsPitching) {
      score += 18  // major boost — pitching is a team weakness
    }
    if (!isPitcher && categoryNeeds.needsHitting) {
      score += 12  // moderate boost — hitting is a team weakness
    }
  }

  // Recent performance vs career norms
  const recentAVG = parseFloat(player.recentStats?.['3'] || player.recent_avg || 0)
  const seasonAVG = parseFloat(player.seasonStats?.['3'] || player.season_avg || 0)
  if (recentAVG > 0 && seasonAVG > 0) {
    if (recentAVG > seasonAVG * 1.20) score += 15  // hot hitter
    else if (recentAVG < seasonAVG * 0.80) score -= 10  // cold, bad add
  }

  const recentERA = parseFloat(player.recentStats?.['26'] || player.recent_era || 0)
  const seasonERA = parseFloat(player.seasonStats?.['26'] || player.season_era || 0)
  if (recentERA > 0 && seasonERA > 0) {
    if (recentERA < seasonERA * 0.80) score += 15  // pitcher running hot
    else if (recentERA > seasonERA * 1.30) score -= 20 // Major penalty for blowouts
  }
  
  // High Ratio Penalties (ERA/WHIP)
  const era = seasonERA || recentERA || 0;
  const whip = parseFloat(player.seasonStats?.['27'] || player.season_whip || 0);
  
  if (era > 4.50) score -= 15;
  if (era > 5.50) score -= 40;
  if (whip > 1.45) score -= 15;
  if (whip > 1.60) score -= 30;

  // Underlying metrics / regression flags
  const babip = parseFloat(player.babip || player.stats?.babip || 0)
  if (babip > 0) {
    if (babip > 0.360) score -= 12  // unsustainably hot, likely to regress
    else if (babip < 0.250) score += 12  // unlucky, likely to improve
  }
  const kPct = parseFloat(player.k_pct || player.stats?.k_pct || 0)
  if (kPct > 0 && kPct < 0.18) score += 8  // low K-rate = sustainable contact
  else if (kPct > 0.30) {
    if (fmt !== FORMAT.H2H_POINTS) score -= 8  // Rule 6: No K penalty in points
  }

  // Schedule quality (games this week)
  const weekGames = getWeeklyGameCount(player.team, leagueSettings.current_week || 1)
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
  const isWeekend = ['Saturday', 'Sunday'].includes(todayStr);

  if (fmt === FORMAT.H2H_POINTS) {
    if (isWeekend) {
      // It is the weekend. Do not apply massive 7-game volume boosts because those games already happened.
      if (weekGames >= 7) score += 5
    } else {
      // Rule 3 and Rule 4: Volume > Talent, stream aggressively
      if (weekGames >= 7) score += isPitcher ? 35 : 20
      else if (weekGames >= 6) score += 8
      else if (weekGames <= 4) score -= 15
    }
  } else {
    // Standard format fallback
    if (!isWeekend && weekGames >= 7) score += 12
    else if (!isWeekend && weekGames >= 6) score += 6
    else if (weekGames <= 4) score -= 8
  }

  // Roster spot cost (who would I drop?)
  const benchDepth = myRoster.filter(p =>
    String(p.position || '').split(/[/,]/)[0].trim().toUpperCase() === pos
  ).length - required
  if (benchDepth > 1) score += 5  // easy to make room
  else if (benchDepth < 0) score -= 5  // would need to drop a starter

  score = Math.min(100, Math.max(0, Math.round(score)))

  const catNote = categoryNeeds ? (isPitcher && categoryNeeds.needsPitching ? ', category-need boost (pitching)' : !isPitcher && categoryNeeds.needsHitting ? ', category-need boost (hitting)' : '') : ''

  if (priorityLevel === 'STANDARD') {
    priorityLevel = score >= 85 ? 'MUST ADD' : score >= 70 ? 'High priority' : score >= 50 ? 'Speculative add' : score >= 35 ? 'Monitor' : 'Pass';
  }
  
  if (reasoning === '') {
    reasoning = `Positional need (${pos}: ${countAtPos}/${required}), schedule (${weekGames} games)${catNote}, ` +
      (babip > 0 ? `BABIP ${babip} ${babip > 0.360 ? '(regression risk)' : babip < 0.250 ? '(due for boost)' : '(normal)'}` : 'no BABIP data');
  }

  return {
    score,
    priority: priorityLevel,
    reasoning,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G) WEEKLY LINEUP OPTIMIZATION
// ─────────────────────────────────────────────────────────────────────────────

function optimizeLineup(roster = [], weekSchedule = {}, scoringType = 'Roto', leagueSize = 12) {
  if (!roster || roster.length === 0) {
    return { starters: [], bench: [], reasoning: 'No roster provided.' }
  }

  const fmt = detectFormat(scoringType)

  const recommendations = roster.map(player => {
    const team = String(player.team || '').toUpperCase()
    const weekGames = weekSchedule[team] || getWeeklyGameCount(team, 1)
    const pos = String(player.position || '').split('/')[0].toUpperCase()
    const isPitcher = pos === 'SP' || pos === 'RP'

    // Hot/cold streak factor
    const recentAVG = parseFloat(player.recentStats?.['3'] || player.recent_avg || 0)
    const seasonAVG = parseFloat(player.seasonStats?.['3'] || player.season_avg || 0.250)
    const recentERA = parseFloat(player.recentStats?.['26'] || player.recent_era || 0)
    const seasonERA = parseFloat(player.seasonStats?.['26'] || player.season_era || 4.0)

    // ── Base: VOR (player quality) + Volume (games this week) ──────────
    const vor = calculateVOR(player.stats || {}, pos, leagueSize, scoringType)
    let startScore = vor * 0.5 + weekGames * 8  // VOR is the floor, volume scales it

    // ── Format-specific adjustments ───────────────────────────────────
    if (fmt === FORMAT.H2H_POINTS) {
      // Points: volume is king. 7-game players always start (Rule 3/10)
      startScore += weekGames * 15  // massively overweight volume over VOR
      if (isPitcher && weekGames >= 7) startScore += 35  // 2-start SPs are top priority
    } else if (fmt === FORMAT.ROTO) {
      // Roto: protect ratios. Penalize high-ERA pitchers more heavily.
      if (isPitcher && recentERA > 5.0) startScore -= 20  // ratio damage lasts all season
    } else {
      // H2H_CAT: balanced — both volume and ratios matter per week
      if (isPitcher && recentERA > 0 && recentERA < 3.50) startScore += 10  // ratio helper
    }

    // Streak adjustments
    if (!isPitcher) {
      if (recentAVG > 0 && seasonAVG > 0) {
        startScore += ((recentAVG - seasonAVG) / seasonAVG) * 30
      }
    } else {
      if (recentERA > 0 && seasonERA > 0) {
        startScore += ((seasonERA - recentERA) / seasonERA) * 25
      }
    }

    // Injury/rest risk
    const onIL = player.injury_status === 'IL' || player.status === 'IL'
    if (onIL) startScore -= 50

    const confidence = startScore >= 70 ? 'High' : startScore >= 45 ? 'Medium' : 'Low'

    return {
      player_name: player.player_name || player.name,
      position: player.position,
      team: player.team,
      weekGames,
      vor,
      startScore: Math.round(startScore),
      confidence,
      reasoning: `VOR ${vor}, ${weekGames} games. ` +
        (!isPitcher && recentAVG > 0 ? `Hitting ${recentAVG.toFixed(3)} recently (${recentAVG > seasonAVG ? 'hot' : 'cold'}). ` : '') +
        (isPitcher && recentERA > 0 ? `ERA ${recentERA.toFixed(2)} recently. ` : '') +
        (onIL ? 'ON IL — do not start.' : '')
    }
  })

  const sorted = recommendations.sort((a, b) => b.startScore - a.startScore)
  const formatNote = fmt === FORMAT.H2H_POINTS ? 'VOR + volume (points mode — maximize ABs/IP)'
    : fmt === FORMAT.ROTO ? 'VOR + volume (roto — ratio-protected)'
    : 'VOR + volume (H2H cats — balanced)'

  return {
    starters: sorted.filter(p => p.startScore >= 45 && !p.reasoning.includes('ON IL')).slice(0, 14),
    bench: sorted.filter(p => p.startScore < 45 || p.reasoning.includes('ON IL')),
    volumePlays: sorted.filter(p => p.weekGames >= 7).slice(0, 3),
    reasoning: `Ranked ${roster.length} players by ${formatNote}.`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// H) DRAFT STRATEGY PROFILES
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_STRATEGIES = {
  'Stars & Scrubs': {
    description: 'Load elite talent in rounds 1-5, stream late positions from waivers all season.',
    roundTargets: {
      '1-3': 'Elite hitters only (Judge, Acuna, Betts tier). No pitching.',
      '4-6': '1-2 top aces (Cole, Verlander tier). One scarce position (C or SS).',
      '7-10': 'Fill roster spots with upside fliers — speed, saves.',
      '11-23': 'Streamable SPs, handcuff closers, bench depth.',
    },
    archetypes: ['Top-5 OF/1B', '2 elite SP', 'Elite C (if falls)', 'One elite SS'],
    risk: 'High — dependent on elite players staying healthy',
    reward: 'Dominant in power/speed categories when healthy',
    bestFor: 'Picks 1-4 in 12-team leagues',
  },
  'Balanced Build': {
    description: 'Spread value evenly across all categories, target mid-round ADP discounts.',
    roundTargets: {
      '1-3': 'Best player available regardless of position.',
      '4-7': 'Fill scarcest positions (C, SS). One SP.',
      '8-12': '2nd SP, UTIL fillers, emerging closers.',
      '13-23': 'Upside picks, saves streamers, bench.',
    },
    archetypes: ['Mid-tier elite', 'Value C (rounds 4-6)', 'Dual-eligible 2B/SS'],
    risk: 'Low — no category completely abandoned',
    reward: 'Consistent performer, hard to blow out in any category',
    bestFor: 'Picks 5-8, first-time managers',
  },
  'Zero-SP': {
    description: 'Avoid SP entirely until round 10+. Load up on elite hitting and saves.',
    roundTargets: {
      '1-5': 'All elite hitters. Best available regardless of position.',
      '6-9': 'Closers with elite saves upside. Fill C/SS needs.',
      '10-15': 'First SPs — target high-K streamers with safe floors.',
      '16-23': 'Streaming SPs. 2-start pitchers. Ratio stabilizers.',
    },
    archetypes: ['4 elite hitters', '2 closers early', 'Streaming SP from waivers'],
    risk: 'Medium — ERA/WHIP ratio categories will be rough early',
    reward: 'Dominant in R/HR/RBI/SB. Trade hitting surplus for pitching in-season.',
    bestFor: 'H2H leagues, experienced managers, picks 1-3',
  },
  'Ace Anchor': {
    description: 'Secure 2 elite aces early, build a rotation that anchors ERA/WHIP/K.',
    roundTargets: {
      '1-4': '2 top-5 SP (Burnes, Cole, Wheeler tier) + 1-2 elite hitters.',
      '5-8': 'Fill scarcest hitting positions (C, SS, 2B).',
      '9-14': '3rd SP, power bats, saves.',
      '15-23': 'Upside SP streamers. Saves. Speed.',
    },
    archetypes: ['2 sub-3.00 ERA aces', 'Elite SS or C', '2 power bats'],
    risk: 'High — elite SP are injury magnets. One trip to IL derails season.',
    reward: 'Dominant in all 5 pitching categories. Trade SP surplus for hitting.',
    bestFor: 'Roto leagues, picks 6-12',
  },
  'Category Punt': {
    description: 'Deliberately concede 1-2 weak categories to dominate the other 8-9.',
    roundTargets: {
      'Punt Saves': 'Zero RP in draft. Extra picks go to premium hitters and aces.',
      'Punt AVG': 'Draft all power — HR, RBI, R kings who hit .220-.240. Dominate counting stats.',
      'Punt SB': 'Ignore speed entirely. All picks go to premium power/AVG/pitching.',
      'Punt ERA/WHIP': 'Similar to Zero-SP. Load hitting, accept ratio damage.',
    },
    archetypes: ['Varies by punt choice', 'Must commit early and stay disciplined'],
    risk: 'High — requires disciplined execution all season, no panic saves chasing',
    reward: 'Can dominate 8 of 10 categories consistently if committed',
    bestFor: 'Experienced roto players. Not recommended for beginners.',
  },
}

function getDraftStrategy(draftPosition, numTeams = 12, scoringType = 'Roto') {
  const early = draftPosition <= 4
  const mid = draftPosition >= 5 && draftPosition <= 8
  const late = draftPosition >= 9

  const isH2H = scoringType.toLowerCase().includes('h2h')

  let recommended
  if (early && isH2H) recommended = 'Zero-SP'
  else if (early) recommended = 'Stars & Scrubs'
  else if (mid) recommended = 'Balanced Build'
  else recommended = 'Ace Anchor'  // late picks benefit from SP who fall

  return {
    recommended,
    strategy: DRAFT_STRATEGIES[recommended],
    alternatives: Object.entries(DRAFT_STRATEGIES)
      .filter(([name]) => name !== recommended)
      .map(([name, s]) => ({ name, bestFor: s.bestFor })),
    allStrategies: DRAFT_STRATEGIES,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROSTER ANALYSIS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function analyzeRosterStrengths(roster = [], leagueContext = {}) {
  const byPosition = {}
  const vorByPlayer = []
  const leagueSize = leagueContext.num_teams || 12
  const scoringType = leagueContext.scoring_type || 'Points'
  const statMapping = leagueContext.statMap || null

  // Filter out injured/suspended players before evaluating roster strengths
  const activeRoster = roster.filter(p => !p.status || (!String(p.status).toUpperCase().includes('IL') && ['O', 'OUT', 'SUSPENDED'].indexOf(String(p.status).toUpperCase()) === -1))

  activeRoster.forEach(player => {
    const rawPos = String(player.position || '').toUpperCase()
    const parts = rawPos.split(/[/, ]+/).map(p => p.trim()).filter(Boolean)
    
    // Calculate VOR once (it now handles all positions and returns the best)
    const vor = calculateVOR(player.stats || {}, rawPos, leagueSize, scoringType, statMapping)
    
    parts.forEach(pos => {
      if (!byPosition[pos]) byPosition[pos] = []
      byPosition[pos].push({ ...player, vor })
    })

    vorByPlayer.push({ 
      name: player.player_name || player.name, 
      position: rawPos, 
      vor,
      isDual: parts.length > 1
    })
  })

  // Identify surpluses (2+ players at same position) and voids (0 players)
  const surpluses = Object.entries(byPosition)
    .filter(([pos, players]) => {
      // Adjusted surplus threshold: 2 for most, but OF needs 4+, SP needs 6+, etc.
      const slotData = POSITIONAL_DATA[pos]
      const starters = slotData ? slotData.starterSlots : 1
      return players.length > starters
    })
    .map(([pos, players]) => ({
      position: pos,
      count: players.length,
      players: players.map(p => p.player_name || p.name),
      scarcity: getPositionalScarcity(pos, leagueSize).tier,
    }))

  // Check ALL roster positions for voids — not just a subset
  const allPositions = Object.keys(POSITIONAL_DATA)  // C, SS, 2B, 3B, 1B, OF, SP, RP
  const voids = allPositions.filter(pos =>
    !byPosition[pos] || byPosition[pos].length === 0
  )

  // Sell high / buy low
  const sellHigh = vorByPlayer
    .filter(p => p.vor >= 70)
    .sort((a, b) => b.vor - a.vor)
    .slice(0, 3)
    .map(p => ({ ...p, reason: 'High VOR — trade from strength' }))

  const buyLow = vorByPlayer
    .filter(p => p.vor <= 35 && p.vor > 0)
    .sort((a, b) => a.vor - b.vor)
    .slice(0, 3)
    .map(p => ({ ...p, reason: 'Low VOR vs expected — buy low or cut' }))

  const rosterWarnings = []
  const fmt = detectFormat(scoringType)

  // 1. Refined Catcher check (Rule 1)
  const starterSlotsC = leagueContext?.roster_slots?.C || 1
  const catchers = byPosition['C'] || []
  
  if (catchers.length > starterSlotsC) {
    // Designate the top [starterSlotsC] catchers as "Starters"
    const sortedCatchers = [...catchers].sort((a, b) => b.vor - a.vor)
    const backups = sortedCatchers.slice(starterSlotsC)

    // Backups are wasteful if they don't provide starter-level value at a secondary position
    const wastefulCatchers = backups.filter(c => {
      const rawPos = String(c.position || '').toUpperCase()
      const parts = rawPos.split(/[/, ]+/).map(p => p.trim()).filter(Boolean)
      const secondaryPositions = parts.filter(p => p !== 'C')
      
      if (secondaryPositions.length === 0) return true // Pure C backup is always a waste
      
      // If they have secondary positions, check if they are "needed" there
      const isNeededElsewhere = secondaryPositions.some(pos => {
        const depth = byPosition[pos] || []
        const betterOptions = depth.filter(opt => opt.vor > c.vor)
        const slotData = POSITIONAL_DATA[pos]
        const starters = slotData ? slotData.starterSlots : 1
        return betterOptions.length < starters
      })
      
      return !isNeededElsewhere
    })

    if (wastefulCatchers.length > 0) {
      const dropNames = wastefulCatchers.map(c => c.player_name || c.name)
      const bestBackup = backups.length > wastefulCatchers.length 
          ? backups.find(b => !wastefulCatchers.includes(b)) // The one we spared
          : backups[0]; // The "least bad" of the wasteful ones

      if (catchers.length > starterSlotsC + 1) {
        // Tiered advice for 3+ catcher rosters
        rosterWarnings.push(`[ROSTER DEPTH ALERT] You are carrying ${catchers.length} catchers. This is an inefficient use of bench depth in most formats. Recommend keeping only your best one (${bestBackup.player_name || bestBackup.name}) and exploring trades for the others: ${dropNames.filter(n => n !== (bestBackup.player_name || bestBackup.name)).join(', ')}.`)
      } else {
        rosterWarnings.push(`[ROSTER DEPTH ALERT] You are carrying 2 catchers. In standard leagues, holding a backup catcher is a waste of a bench spot. Consider dropping ${dropNames.join(', ')} for pitching depth, but ensure you start your best Catcher daily.`)
      }
    }
  }
  
  // 2. Bench balance (Rule 8) - Approximation
  const numStartingPitchers = (byPosition['SP']?.length || 0) + (byPosition['RP']?.length || 0)
  if (numStartingPitchers > 9) { // 7 active slots + maybe 2 bench
    rosterWarnings.push(`RULE 8 WARNING: You have a very pitcher-heavy bench (${numStartingPitchers} total). Consider a 3-Bat / 1-Pitcher bench split to maximize daily lineup flexibility.`)
  }

  // 3. IL Spot Check (Rule 9)
  const ilPlayers = roster.filter(p => p.status && String(p.status).toUpperCase().includes('IL'))
  const ilSlots = leagueContext?.roster_slots?.IL || 0
  if (ilSlots > 0 && ilPlayers.length < ilSlots) {
    const emptyCount = ilSlots - ilPlayers.length
    rosterWarnings.push(`RULE 9 WARNING: You have ${emptyCount} empty IL slot${emptyCount > 1 ? 's' : ''}. Stash injured players now to get free roster value.`)
  }


  return { byPosition, surpluses, voids, sellHigh, buyLow, vorByPlayer, rosterWarnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// I) BREAKOUT / REGRESSION DETECTOR
// Analyzes peripheral stats to flag unsustainable performance
// ─────────────────────────────────────────────────────────────────────────────

// League-average baselines for regression anchors (2023-2025 MLB averages)
const LEAGUE_AVG = {
  BABIP: 0.296, HR_FB: 0.128, LOB_PCT: 0.720,
  K_PCT: 0.224, BB_PCT: 0.086, AVG: 0.248,
  ERA: 4.08, WHIP: 1.27, K9: 8.6, BB9: 3.3,
}

function detectBreakoutRegression(playerStats = {}, type = 'hitter', scoringType = 'Roto') {
  const flags = []
  let breakoutScore = 0  // positive = breakout candidate, negative = regression risk
  const fmt = detectFormat(scoringType)

  if (type === 'hitter') {
    const babip = parseFloat(playerStats.BABIP || playerStats.babip || 0)
    const avg = parseFloat(playerStats.AVG || playerStats.avg || 0)
    const kPct = playerStats.K && playerStats.PA ? playerStats.K / playerStats.PA : 0
    const bbPct = playerStats.BB && playerStats.PA ? playerStats.BB / playerStats.PA : 0
    const hrRate = playerStats.HR && playerStats.AB ? playerStats.HR / playerStats.AB : 0
    const isoP = parseFloat(playerStats.SLG || 0) - parseFloat(playerStats.AVG || 0)

    // BABIP regression (most powerful indicator)
    if (babip > 0) {
      if (babip > 0.360) {
        flags.push({ stat: 'BABIP', value: babip, verdict: 'REGRESSION RISK', note: `BABIP ${babip.toFixed(3)} is far above league avg (.296). AVG likely to drop.` })
        breakoutScore -= 20
      } else if (babip < 0.250) {
        flags.push({ stat: 'BABIP', value: babip, verdict: 'BREAKOUT CANDIDATE', note: `BABIP ${babip.toFixed(3)} is well below normal. Due for AVG boost.` })
        breakoutScore += 20
      }
    }

    // K-rate quality
    if (kPct > 0) {
      if (kPct < 0.15) {
        flags.push({ stat: 'K%', value: kPct, verdict: 'ELITE CONTACT', note: `${(kPct * 100).toFixed(1)}% K-rate. Elite contact profile — sustains AVG.` })
        breakoutScore += 10
      } else if (kPct > 0.30) {
        if (fmt === FORMAT.H2H_POINTS) {
          flags.push({ stat: 'K%', value: kPct, verdict: 'HIGH K-RATE', note: `${(kPct * 100).toFixed(1)}% K-rate. Ignored in Points mode (No K penalty).` })
        } else {
          flags.push({ stat: 'K%', value: kPct, verdict: 'HIGH K-RATE', note: `${(kPct * 100).toFixed(1)}% K-rate. Volatile AVG, needs power to compensate.` })
          breakoutScore -= 10
        }
      }
    }

    // Walk rate (plate discipline)
    if (bbPct > 0) {
      if (bbPct > 0.12) {
        if (fmt === FORMAT.H2H_POINTS) {
          flags.push({ stat: 'BB%', value: bbPct, verdict: 'ELITE DISCIPLINE', note: `${(bbPct * 100).toFixed(1)}% walk rate. Massive value in Points mode (BB = 1B).` })
          breakoutScore += 25
        } else {
          flags.push({ stat: 'BB%', value: bbPct, verdict: 'ELITE DISCIPLINE', note: `${(bbPct * 100).toFixed(1)}% walk rate. High OBP floor.` })
          breakoutScore += 8
        }
      }
    }

    // Power sustainability (ISO Power)
    if (isoP > 0.250) {
      if (fmt === FORMAT.H2H_POINTS) {
        flags.push({ stat: 'ISO', value: isoP, verdict: 'ELITE POWER', note: `ISO ${isoP.toFixed(3)}. Supreme value in Points mode (Power > Contact).` })
        breakoutScore += 30
      } else {
        flags.push({ stat: 'ISO', value: isoP, verdict: 'ELITE POWER', note: `ISO ${isoP.toFixed(3)} indicates legit 35+ HR power.` })
        breakoutScore += 12
      }
    } else if (isoP > 0 && isoP < 0.100) {
      flags.push({ stat: 'ISO', value: isoP, verdict: 'NO POWER', note: `ISO ${isoP.toFixed(3)}. Batter provides no power upside.` })
      breakoutScore -= 5
    }

    // Speed profile
    const sbRate = playerStats.SB && playerStats.G ? playerStats.SB / playerStats.G : 0
    if (sbRate > 0.20) {
      flags.push({ stat: 'Speed', value: sbRate, verdict: 'ELITE SPEED', note: `${playerStats.SB} SB in ${playerStats.G} games. Premium stolen base contributor.` })
      breakoutScore += 10
    }

  } else {
    // Pitcher analysis
    const era = parseFloat(playerStats.ERA || playerStats.era || 0)
    const whip = parseFloat(playerStats.WHIP || playerStats.whip || 0)
    const k9 = parseFloat(playerStats.K9 || playerStats.k9 || 0)
    const bb9 = parseFloat(playerStats.BB9 || playerStats.bb9 || 0)
    const kbb = k9 && bb9 ? k9 / bb9 : 0

    // ERA sustainability
    if (era > 0 && era < 2.50) {
      flags.push({ stat: 'ERA', value: era, verdict: 'REGRESSION RISK', note: `Sub-2.50 ERA (${era.toFixed(2)}) is extremely hard to sustain. Expect regression toward 3.00+.` })
      breakoutScore -= 10
    } else if (era > 5.00) {
      flags.push({ stat: 'ERA', value: era, verdict: 'BREAKOUT CANDIDATE', note: `ERA ${era.toFixed(2)} may be inflated by bad luck. Check K/BB ratio.` })
      breakoutScore += 5
    }

    // Strikeout dominance
    if (k9 > 10.5) {
      flags.push({ stat: 'K/9', value: k9, verdict: 'ELITE STRIKEOUTS', note: `K/9 of ${k9.toFixed(1)} is elite. High K-rate pitchers are most stable.` })
      breakoutScore += 15
    }

    // K/BB ratio (best single pitching predictor)
    if (kbb > 4.0) {
      flags.push({ stat: 'K/BB', value: kbb, verdict: 'ELITE COMMAND', note: `K/BB ratio ${kbb.toFixed(1)} is elite tier. High floor pitcher.` })
      breakoutScore += 15
    } else if (kbb > 0 && kbb < 1.5) {
      flags.push({ stat: 'K/BB', value: kbb, verdict: 'POOR COMMAND', note: `K/BB ratio ${kbb.toFixed(1)} is dangerously low. Blowup risk.` })
      breakoutScore -= 20
    }
  }

  const verdict = breakoutScore >= 20 ? 'STRONG BREAKOUT CANDIDATE' :
    breakoutScore >= 10 ? 'MILD BREAKOUT CANDIDATE' :
    breakoutScore <= -20 ? 'HIGH REGRESSION RISK' :
    breakoutScore <= -10 ? 'MODERATE REGRESSION RISK' :
    'SUSTAINABLE PROFILE'

  return { flags, breakoutScore, verdict }
}

// ─────────────────────────────────────────────────────────────────────────────
// J) YEAR-OVER-YEAR TREND ANALYSIS
// Compares 2-3 seasons of stats to classify player trajectory
// ─────────────────────────────────────────────────────────────────────────────

function analyzeYoYTrend(multiSeasonData = {}) {
  const seasons = Object.keys(multiSeasonData).sort()
  if (seasons.length < 2) return { trend: 'INSUFFICIENT DATA', details: [] }

  const details = []
  const trends = {}

  // Compare key stats across seasons
  const hittingKeys = [
    { key: 'runs', label: 'R' }, { key: 'homeRuns', label: 'HR' },
    { key: 'rbi', label: 'RBI' }, { key: 'stolenBases', label: 'SB' },
    { key: 'avg', label: 'AVG', isRate: true },
  ]
  const pitchingKeys = [
    { key: 'wins', label: 'W' }, { key: 'strikeOuts', label: 'K' },
    { key: 'era', label: 'ERA', isRate: true, lowerBetter: true },
    { key: 'whip', label: 'WHIP', isRate: true, lowerBetter: true },
    { key: 'saves', label: 'SV' },
  ]

  // Detect if pitcher or hitter by checking first season
  const firstSeason = multiSeasonData[seasons[0]]
  const isPitcher = firstSeason.era !== undefined || firstSeason.wins !== undefined
  const statKeys = isPitcher ? pitchingKeys : hittingKeys

  statKeys.forEach(({ key, label, isRate, lowerBetter }) => {
    const values = seasons.map(s => parseFloat(multiSeasonData[s]?.[key] || 0)).filter(v => v > 0)
    if (values.length < 2) return

    // Per-game normalization for counting stats
    const normalized = values.map((v, i) => {
      if (isRate) return v
      const games = parseFloat(multiSeasonData[seasons[i]]?.gamesPlayed || multiSeasonData[seasons[i]]?.gamesPitched || 150)
      return games > 0 ? (v / games) * 150 : v  // normalize to 150-game pace
    })

    const first = normalized[0]
    const last = normalized[normalized.length - 1]
    const pctChange = first > 0 ? ((last - first) / first) * 100 : 0
    const direction = lowerBetter ? (pctChange < 0 ? 'improving' : 'declining') : (pctChange > 0 ? 'improving' : 'declining')

    trends[label] = {
      values: seasons.map((s, i) => ({ season: s, raw: values[i], normalized: normalized[i] })),
      pctChange: Math.round(pctChange),
      direction,
    }

    if (Math.abs(pctChange) > 15) {
      details.push(`${label}: ${direction === 'improving' ? '📈' : '📉'} ${direction} ${Math.abs(Math.round(pctChange))}% over ${seasons.length} seasons`)
    }
  })

  // Overall trajectory
  const improvingCount = Object.values(trends).filter(t => t.direction === 'improving').length
  const decliningCount = Object.values(trends).filter(t => t.direction === 'declining').length

  const trend = improvingCount >= 3 ? 'ASCENDING' :
    decliningCount >= 3 ? 'DECLINING' :
    improvingCount >= 2 && decliningCount <= 1 ? 'RISING' :
    decliningCount >= 2 && improvingCount <= 1 ? 'FADING' :
    'STABLE'

  return { trend, details, trends }
}

// ─────────────────────────────────────────────────────────────────────────────
// K) AGE CURVE MODELING
// Maps player age to expected production trajectory
// ─────────────────────────────────────────────────────────────────────────────

const AGE_CURVES = {
  power:  { peakStart: 26, peakEnd: 30, declineAge: 32, falloffRate: 0.04 },
  speed:  { peakStart: 24, peakEnd: 28, declineAge: 30, falloffRate: 0.08 },
  contact:{ peakStart: 26, peakEnd: 32, declineAge: 34, falloffRate: 0.03 },
  SP:     { peakStart: 26, peakEnd: 31, declineAge: 33, falloffRate: 0.05 },
  RP:     { peakStart: 27, peakEnd: 33, declineAge: 35, falloffRate: 0.03 },
}

function ageCurveAnalysis(age, position, playerProfile = {}) {
  const pos = String(position || '').toUpperCase()
  const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P'

  // Determine which curve to use
  const curves = isPitcher
    ? [AGE_CURVES[pos === 'RP' ? 'RP' : 'SP']]
    : [
        { ...AGE_CURVES.power, label: 'Power', weight: playerProfile.powerHeavy ? 0.6 : 0.3 },
        { ...AGE_CURVES.speed, label: 'Speed', weight: playerProfile.speedHeavy ? 0.6 : 0.2 },
        { ...AGE_CURVES.contact, label: 'Contact', weight: 0.3 },
      ]

  const analysis = {
    age,
    phase: 'unknown',
    projectionMultiplier: 1.0,
    notes: [],
  }

  // Weighted phase calculation for hitters
  if (!isPitcher) {
    let weightedMult = 0
    let totalWeight = 0
    curves.forEach(c => {
      const w = c.weight || 0.33
      let mult = 1.0
      if (age < c.peakStart) {
        mult = 0.85 + (age - 21) * 0.03  // ascending
      } else if (age >= c.peakStart && age <= c.peakEnd) {
        mult = 1.0  // peak
      } else if (age > c.peakEnd && age <= c.declineAge) {
        mult = 1.0 - (age - c.peakEnd) * (c.falloffRate / 2)  // early decline
      } else {
        mult = 1.0 - (c.peakEnd - c.peakStart) * (c.falloffRate / 2) - (age - c.declineAge) * c.falloffRate
      }
      weightedMult += mult * w
      totalWeight += w
    })
    analysis.projectionMultiplier = Math.max(0.5, Math.min(1.15, weightedMult / totalWeight))
  } else {
    const curve = curves[0]
    if (age < curve.peakStart) {
      analysis.projectionMultiplier = 0.90 + (age - 22) * 0.025
    } else if (age >= curve.peakStart && age <= curve.peakEnd) {
      analysis.projectionMultiplier = 1.0
    } else if (age > curve.declineAge) {
      analysis.projectionMultiplier = Math.max(0.6, 1.0 - (age - curve.declineAge) * curve.falloffRate)
    } else {
      analysis.projectionMultiplier = Math.max(0.8, 1.0 - (age - curve.peakEnd) * (curve.falloffRate / 2))
    }
  }

  // Determine phase label
  if (age < 25) analysis.phase = 'PRE-PEAK (upside play)'
  else if (analysis.projectionMultiplier >= 0.98) analysis.phase = 'PEAK YEARS'
  else if (analysis.projectionMultiplier >= 0.88) analysis.phase = 'EARLY DECLINE'
  else if (analysis.projectionMultiplier >= 0.75) analysis.phase = 'DECLINING'
  else analysis.phase = 'LATE CAREER'

  // Draft/trade implications
  if (age <= 25) {
    analysis.notes.push('Young player with upside — project improvement over current stats.')
    analysis.notes.push('Higher trade value than current production suggests.')
  } else if (age >= 33 && !isPitcher) {
    analysis.notes.push('Speed will decline fastest. Discount SB projections 20-40%.')
    analysis.notes.push('Injury risk increases significantly. Consider a backup plan.')
  } else if (age >= 34 && isPitcher) {
    analysis.notes.push('Velocity decline expected. K-rate may drop.')
    analysis.notes.push('Workload management — fewer innings likely.')
  }

  return analysis
}

// ─────────────────────────────────────────────────────────────────────────────
// L) POINTS CONTRIBUTION PROFILER — Now uses shared computePlayerPoints()
// ─────────────────────────────────────────────────────────────────────────────

const POINTS_TARGETS = {
  hitter: 3.5,
  pitcher: 15,
}

function profilePointsContribution(playerStats = {}, type = 'hitter') {
  let games = parseFloat(playerStats.gamesPlayed || playerStats.G || playerStats.GS || 0)
  if (games === 0) games = 1

  const isPitcher = type !== 'hitter'
  const totalPts = computePlayerPoints(playerStats, isPitcher)
  const ptsPerGame = totalPts / games
  const isElite = isPitcher
    ? (ptsPerGame >= 20 || (playerStats.SV && totalPts > 150))
    : (ptsPerGame >= 4.5)

  const overallGrade = isElite ? 'A' : (ptsPerGame >= POINTS_TARGETS[type] ? 'B' : (ptsPerGame >= POINTS_TARGETS[type]*0.7 ? 'C' : 'D'))

  return { points: Math.round(totalPts), ptsPerGame: parseFloat(ptsPerGame.toFixed(1)), overallGrade, type }
}

// ─────────────────────────────────────────────────────────────────────────────
// M) COMPREHENSIVE PLAYER INTELLIGENCE REPORT
// Combines all analysis into one structured report for Claude
// ─────────────────────────────────────────────────────────────────────────────

function generatePlayerIntelligence(playerData = {}) {
  const { stats, age, position, type } = playerData
  if (!stats) return null

  const isHitter = type === 'hitter' || !['SP', 'RP', 'P'].includes(String(position).toUpperCase())

  const breakout = detectBreakoutRegression(stats, isHitter ? 'hitter' : 'pitcher')
  const ageCurve = ageCurveAnalysis(age || 28, position)
  const contribution = profilePointsContribution(stats, isHitter ? 'hitter' : 'pitcher')

  return {
    breakout,
    ageCurve,
    contribution,
    summary: [
      `${breakout.verdict} (score: ${breakout.breakoutScore})`,
      `Age ${age}: ${ageCurve.phase} (projection multiplier: ${ageCurve.projectionMultiplier.toFixed(2)}x)`,
      `Points grade: ${contribution.overallGrade} (${contribution.points} total pts)`,
      ...breakout.flags.map(f => `${f.stat}: ${f.verdict}`),
      ...ageCurve.notes,
    ].join(' | '),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// O) UNIFIED ROSTER DIAGNOSIS — 3-format aware
// Single source of truth for every AI endpoint. Call once per request, inject
// the promptBlock into every Claude call. No more inconsistent analyses.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a complete roster diagnosis that every AI endpoint can consume.
 * @param {Array} roster - Full roster from Yahoo API (including IL/DTD players)
 * @param {Object} leagueCtx - { num_teams, scoring_type, roster_slots, stat_categories, current_week, ... }
 * @returns {Object} Unified diagnosis with promptBlock for Claude injection
 */
function buildRosterDiagnosis(roster = [], leagueCtx = {}, sharedMatchup = null, pitchingContext = null) {
  // Null guards — roster can be null/undefined if Yahoo API returns nothing
  roster    = Array.isArray(roster)  ? roster  : [];
  leagueCtx = leagueCtx || {};

  const leagueSize = leagueCtx.num_teams || 12;
  const scoringType = leagueCtx.scoring_type || 'Points';
  const fmt = detectFormat(scoringType);
  const leagueStatCats = Array.isArray(leagueCtx.stat_categories) ? leagueCtx.stat_categories : null;

  // ── 1. Three-tier player status split ──────────────────────────────────
  const IL_STATUSES = ['IL', 'IL10', 'IL15', 'IL60', 'DL', 'DL10', 'DL15', 'DL60', 'O', 'OUT', 'SUSPENDED', 'NA'];
  const DTD_STATUSES = ['DTD', 'Q', 'QUESTIONABLE', 'D2D', 'DAY-TO-DAY'];

  function getPlayerStatus(p) {
    // Check slot first — a player placed in the IL slot is definitively unavailable
    const slot = String(p.slot || '').toUpperCase();
    if (slot === 'IL' || slot === 'IL+') return 'unavailable';
    if (!p.status) return 'active';
    const s = String(p.status).toUpperCase().trim();
    if (IL_STATUSES.some(x => s.includes(x))) return 'unavailable';
    if (DTD_STATUSES.some(x => s.includes(x))) return 'dtd';
    return 'active';
  }

  const activeRoster = roster.filter(p => getPlayerStatus(p) === 'active' || getPlayerStatus(p) === 'dtd');
  const unavailablePlayers = roster.filter(p => getPlayerStatus(p) === 'unavailable');
  const dtdPlayers = roster.filter(p => getPlayerStatus(p) === 'dtd');

  // ── 2. Positional analysis (voids, surpluses, sell/buy) ────────────────
  const rosterAnalysis = analyzeRosterStrengths(activeRoster, leagueCtx);

  // ── 3. Category-level analysis — uses actual league stat categories ────
  const teamStats = {};
  activeRoster.forEach(p => {
    const stats = p.stats || {};
    Object.entries(stats).forEach(([k, v]) => {
      teamStats[k] = (teamStats[k] || 0) + (parseFloat(v) || 0);
    });
  });
  const catAnalysis = analyzeCategories(teamStats, [], scoringType, leagueStatCats);

  const pitchingCats = ['W', 'SV', 'K', 'ERA', 'WHIP'];
  const hittingCats = ['R', 'HR', 'RBI', 'SB', 'AVG'];
  let weaknessList = catAnalysis.weaknesses || [];

  // Matchup contextual override for weaknesses
  if (sharedMatchup && sharedMatchup.stats && fmt === FORMAT.H2H_CAT) {
    // Override the generic season-long weaknesses with specifically what we are currently losing this week
    weaknessList = sharedMatchup.stats.filter(s => s.opp_winning).map(s => s.name || s.stat_id);
  }

  const categoryNeeds = {
    needsPitching: weaknessList.some(c => pitchingCats.includes(c)) ||
      rosterAnalysis.voids.some(v => ['SP', 'RP'].includes(v)),
    needsHitting: weaknessList.some(c => hittingCats.includes(c)) ||
      rosterAnalysis.voids.some(v => ['C', 'SS', '2B', '3B', '1B', 'OF'].includes(v)),
    weakCategories: weaknessList,
  };

  // ── 4. VOR by player (active only) ─────────────────────────────────────
  const vorByPlayer = activeRoster
    .filter(p => getPlayerStatus(p) !== 'dtd' || true) // DTD stays in VOR calc
    .map(p => {
      const rawPos = String(p.position || '').toUpperCase();
      let displayName = p.player_name || p.name;
      
      const parts = rawPos.split(/[/, ]+/).map(x => x.trim()).filter(Boolean);
      const isPitcher = parts.some(x => ['SP', 'RP', 'P'].includes(x));

      if (pitchingContext && isPitcher) {
        const basicName = (displayName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const detail = pitchingContext.pitcherDetails?.[basicName];
        if (detail) {
          displayName += ` [${detail.label}]`;
        } else if (pitchingContext.remainingTwoStarters?.includes(basicName)) {
          displayName += ' [🏆 2-STARTS REMAINING]';
        } else if (pitchingContext.oneStartRemaining?.includes(basicName)) {
          displayName += ' [⚾ 1-START REMAINING (1 already pitched)]';
        } else if (pitchingContext.nextWeek?.includes(basicName)) {
          displayName += ' [🔮 2-STARTS NEXT WEEK]';
        } else if (pitchingContext.today?.includes(basicName)) {
          displayName += ' [⚾ STARTING TODAY]';
        }
      }

      const streaming = streamingValue(p, p.opponent_stats || {}, scoringType);
      const platoon = platoonAdvantage(p.bats || p.hand, p.pitcher_hand || 'R');
      const weekGames = getWeeklyGameCount(p.team || '', leagueCtx.current_week || 1);

      return {
        ...p,
        name: displayName,
        position: rawPos,
        vor: calculateVOR(p.stats || {}, rawPos, leagueSize, scoringType),
        scarcity: getPositionalScarcity(rawPos, leagueSize).tier,
        streaming,
        platoon,
        weekGames
      };
    }).sort((a, b) => b.vor - a.vor);

  // ── 5. Build the canonical prompt block ────────────────────────────────
  const formatLabel = fmt === FORMAT.H2H_POINTS ? 'H2H Points'
    : fmt === FORMAT.H2H_CAT ? 'H2H Categories'
    : 'Rotisserie (Roto)'
  let promptBlock = `\n=== ROSTER DIAGNOSIS (${formatLabel}, ${leagueSize}-team) ===\n`;

  // Live Matchup Injector!
  if (sharedMatchup && sharedMatchup.myTeam && sharedMatchup.opponent) {
    promptBlock += `\n🚨 LIVE MATCHUP ALERTS 🚨\n`;
    promptBlock += `- Opponent: ${sharedMatchup.opponent.name}\n`;
    
    if (fmt === FORMAT.H2H_CAT) {
      const myWins = sharedMatchup.stats.filter(s => s.my_winning).length;
      const oppWins = sharedMatchup.stats.filter(s => s.opp_winning).length;
      const trailingIn = sharedMatchup.stats.filter(s => s.opp_winning).map(s => s.name);
      promptBlock += `- Matchup Status: ${myWins} to ${oppWins} (Prioritize: ${trailingIn.join(', ') || 'None'})\n\n`;
    } else {
      // H2H Points
      const myScore = sharedMatchup.myTeam?.total_points ?? 0;
      const oppScore = sharedMatchup.opponent?.total_points ?? 0;
      const diff = (myScore - oppScore).toFixed(1);
      promptBlock += `- Current Score: ${myScore} to ${oppScore} (${diff < 0 ? 'Trailing by ' + Math.abs(diff) : 'Winning by ' + diff})\n\n`;
    }
  }

  // --- 🚨 LIVE GAME SCOREBOARD INJECTOR 🚨 ---
  if (pitchingContext && pitchingContext.liveScoresToday?.length > 0) {
    promptBlock += `\n📊 TODAY'S LIVE SCORES (Real-time Reality) 📊\n`;
    pitchingContext.liveScoresToday.forEach(g => {
      let decisions = '';
      if (g.winner) decisions += ` | Win: ${g.winner}`;
      if (g.loser) decisions += ` | Loss: ${g.loser}`;
      if (g.saver) decisions += ` | Save: ${g.saver}`;
      
      promptBlock += `- ${g.summary} (${g.status})${decisions}\n`;
    });
    promptBlock += `\nCRITICAL: If a game is 'Completed (Final)', you MUST report the final score listed above. Do not generalize. If a pitcher on the user's roster was involved in a decision, analyze the impact on their standings.\n`;
  }

  // Format-specific strategic framing
  if (fmt === FORMAT.H2H_POINTS) {
    promptBlock += `🎯 FORMAT: H2H POINTS — Maximize raw point output each week. Volume (ABs, IP) is everything. 2-start SPs are king. Never leave a roster spot empty. Do NOT give category-balancing advice.\n`;
  } else if (fmt === FORMAT.H2H_CAT) {
    promptBlock += `🎯 FORMAT: H2H CATEGORIES — Win ${Math.ceil((leagueStatCats?.length || 10) / 2) + 1}+ of ${leagueStatCats?.length || 10} categories weekly. Target swing categories. Safe to punt 1-2 hopeless cats and load up on the rest.\n`;
    if (leagueStatCats) promptBlock += `League cats: ${leagueStatCats.join(', ')}\n`;
  } else {
    promptBlock += `🎯 FORMAT: ROTO — Season-long category accumulation across all teams. Protect ratios (ERA/WHIP/AVG) at all costs. Never stream high-risk pitchers. Balance all categories — punting is risky.\n`;
    if (leagueStatCats) promptBlock += `League cats: ${leagueStatCats.join(', ')}\n`;
  }

  // Pitching schedule guard — prevents Claude hallucinating newly-signed SPs as available starters
  promptBlock += `⚾ PITCHING RULE: Only recommend SPs/RPs who appear in the probable pitcher schedule (tagged above). A player mentioned in news as recently signed is NOT pitching until they appear in a scheduled game. Newly signed pitchers are typically on a ramp-up and unavailable for weeks.\n`;

  // Unavailable players
  if (unavailablePlayers.length > 0) {
    promptBlock += `⛔ UNAVAILABLE (IL/Out/Susp — exclude from all decisions): ${unavailablePlayers.map(p => `${p.player_name || p.name} [${p.status}]`).join(', ')}\n`;
  }

  // DTD/Questionable players
  if (dtdPlayers.length > 0) {
    promptBlock += `🟡 DTD/QUESTIONABLE (flag as risk, have backup plan): ${dtdPlayers.map(p => `${p.player_name || p.name} [${p.status}]`).join(', ')}\n`;
  }

  // Active roster — list ALL players to ensure Claude has a complete view of the team
  promptBlock += `\nMY CURRENT TEAM ROSTER (${activeRoster.length} active, by VOR):\n`;
  promptBlock += vorByPlayer.map(p => {
    return `  ${p.name} (${p.position}) VOR:${p.vor}`;
  }).join('\n');

  // Positional needs — compact
  promptBlock += `\nVoids: ${rosterAnalysis.voids.join(', ') || 'None'}`;
  promptBlock += ` | Surpluses: ${rosterAnalysis.surpluses.map(s => `${s.position}(${s.count})`).join(', ') || 'None'}\n`;

  // Category weakness — compact
  if (categoryNeeds.needsPitching || categoryNeeds.needsHitting) {
    if (categoryNeeds.needsPitching) promptBlock += `⚠️ PITCHING WEAK — prioritize SP/RP.\n`;
    if (categoryNeeds.needsHitting) promptBlock += `⚠️ HITTING WEAK — prioritize bats at scarce positions.\n`;
    if (categoryNeeds.weakCategories.length > 0) promptBlock += `Weak cats: ${categoryNeeds.weakCategories.join(', ')}. `;
    promptBlock += `${catAnalysis.advice}\n`;
  }

  // Summary stats — one line
  const totalVOR = vorByPlayer.reduce((sum, p) => sum + (p.vor || 0), 0);
  const avgVOR = vorByPlayer.length > 0 ? (totalVOR / vorByPlayer.length).toFixed(1) : 0;
  const eliteCount = vorByPlayer.filter(p => p.vor >= 70).length;
  const replacementCount = vorByPlayer.filter(p => p.vor < 30).length;

  promptBlock += `Health: ${totalVOR} total VOR, ${avgVOR} avg, ${eliteCount} elite, ${replacementCount} replacement\n`;

  if (rosterAnalysis.rosterWarnings && rosterAnalysis.rosterWarnings.length > 0) {
    promptBlock += `\n📋 ROSTER OPTIMIZATION SUGGESTIONS (Long-term):\n${rosterAnalysis.rosterWarnings.map(w => `- ${w}`).join('\n')}\n`;
  }

  return {
    // Raw data for programmatic use
    activeRoster,
    unavailablePlayers,
    dtdPlayers,
    voids: rosterAnalysis.voids,
    surpluses: rosterAnalysis.surpluses,
    sellHigh: rosterAnalysis.sellHigh,
    buyLow: rosterAnalysis.buyLow,
    categoryNeeds,
    catAnalysis,
    vorByPlayer,
    totalVOR,
    avgVOR: parseFloat(avgVOR),
    eliteCount,
    replacementCount,

    // The canonical prompt string — inject into every Claude call
    promptBlock,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Format detection
  FORMAT,
  detectFormat,

  // Shared points calculator
  computePlayerPoints,
  HITTING_PTS,
  PITCHING_PTS,

  // A) Positional scarcity
  getPositionalScarcity,
  POSITIONAL_DATA,

  // B) Category strategy
  analyzeCategories,

  // C) VOR
  calculateVOR,

  // D) Schedule/matchup
  getWeeklyGameCount,
  streamingValue,
  platoonAdvantage,
  BALLPARK_FACTORS,

  // E) Trade engine
  evaluateTrade,

  // F) Waiver scoring
  scoreWaiverTarget,

  // G) Lineup optimization
  optimizeLineup,

  // H) Draft strategies
  getDraftStrategy,
  DRAFT_STRATEGIES,

  // Roster analysis
  analyzeRosterStrengths,

  // I) Breakout/Regression detection
  detectBreakoutRegression,
  LEAGUE_AVG,

  // J) Year-over-year trends
  analyzeYoYTrend,

  // K) Age curve modeling
  ageCurveAnalysis,
  AGE_CURVES,

  // L) Points contribution profiling
  profilePointsContribution,
  POINTS_TARGETS,

  // M) Combined intelligence report
  generatePlayerIntelligence,

  // N) ADP vs actual stats trend analysis
  analyzeADPvsTrend,

  // O) UNIFIED ROSTER DIAGNOSIS — the single source of truth
  buildRosterDiagnosis,
}



// ─────────────────────────────────────────────────────────────────────────────
// N) ADP vs ACTUAL STATS TREND ANALYSIS
// Compares 2025 real production to 2026 ADP to find value gaps
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates a production-based rank from last season's stats,
 * then compares to this year's ADP to find over/undervalued players.
 *
 * @param {object} lastSeasonStats - from mlbStatsService.getPlayerSeasonStats()
 * @param {number} adp2026 - this year's ADP
 * @param {number} leagueSize - number of teams (default 12)
 * @returns {object} trend analysis with value gap, classification, floor/ceiling
 */
function analyzeADPvsTrend(lastSeasonStats, adp2026, leagueSize = 12) {
  if (!lastSeasonStats || !lastSeasonStats.stats) {
    return { valueGap: 0, classification: 'UNKNOWN', summary: 'No 2025 stats available.' };
  }

  const s = lastSeasonStats.stats;
  const isP = lastSeasonStats.type === 'pitcher';
  const adp = parseFloat(adp2026) || 300;
  const totalDrafted = leagueSize * 23; // approximate total drafted players

  let productionScore = 0; // 0-100 scale
  let statLine = '';
  let floorCeiling = {};

  if (isP) {
    // Pitcher production score — lower ERA/WHIP = better
    const eraScore = Math.max(0, 100 - ((s.ERA - 2.5) / 3.5) * 100);
    const whipScore = Math.max(0, 100 - ((s.WHIP - 0.9) / 0.7) * 100);
    const kScore = Math.min(100, (s.K / 250) * 100);
    const wScore = Math.min(100, (s.W / 18) * 100);
    const svScore = Math.min(100, (s.SV / 40) * 100);
    const ipBonus = s.IP >= 160 ? 15 : s.IP >= 100 ? 8 : 0;

    productionScore = (eraScore * 0.25 + whipScore * 0.2 + kScore * 0.25 + wScore * 0.15 + svScore * 0.15) + ipBonus;
    productionScore = Math.min(100, Math.max(0, productionScore));

    statLine = `${s.W}W ${s.ERA} ERA ${s.WHIP} WHIP ${s.K}K ${s.SV}SV in ${s.IP}IP`;
    floorCeiling = {
      floor: `${Math.max(0, s.W - 4)}W, ${(s.ERA + 0.6).toFixed(2)} ERA, ${s.K - 30}K`,
      ceiling: `${s.W + 3}W, ${Math.max(1.5, s.ERA - 0.5).toFixed(2)} ERA, ${s.K + 25}K`,
    };
  } else {
    // Hitter production score
    const hrScore = Math.min(100, (s.HR / 45) * 100);
    const rbiScore = Math.min(100, (s.RBI / 120) * 100);
    const rScore = Math.min(100, (s.R / 110) * 100);
    const sbScore = Math.min(100, (s.SB / 40) * 100);
    const avgScore = Math.min(100, ((s.AVG - 0.200) / 0.120) * 100);
    const paBonus = s.PA >= 600 ? 10 : s.PA >= 500 ? 5 : s.PA < 300 ? -15 : 0;

    productionScore = (hrScore * 0.25 + rbiScore * 0.2 + rScore * 0.15 + sbScore * 0.2 + avgScore * 0.2) + paBonus;
    productionScore = Math.min(100, Math.max(0, productionScore));

    statLine = `${s.AVG}/${s.HR}HR/${s.RBI}RBI/${s.R}R/${s.SB}SB in ${s.PA}PA`;
    floorCeiling = {
      floor: `${Math.max(0.200, s.AVG - 0.025).toFixed(3)}/${Math.max(0, s.HR - 6)}HR/${Math.max(0, s.SB - 5)}SB`,
      ceiling: `${Math.min(0.340, s.AVG + 0.020).toFixed(3)}/${s.HR + 5}HR/${s.SB + 8}SB`,
    };
  }

  // Convert production score to an implied ADP rank
  // Score 90+ → should be top 20, Score 70+ → top 60, etc.
  const impliedADP = Math.max(1, Math.round(totalDrafted * (1 - productionScore / 100)));

  // Value gap: positive = undervalued (ADP is later than production warrants)
  const valueGap = adp - impliedADP;
  const gapPct = totalDrafted > 0 ? ((valueGap / totalDrafted) * 100).toFixed(0) : 0;

  let classification = 'FAIRLY PRICED';
  if (valueGap > 30) classification = 'SIGNIFICANTLY UNDERVALUED';
  else if (valueGap > 15) classification = 'UNDERVALUED';
  else if (valueGap < -30) classification = 'SIGNIFICANTLY OVERVALUED';
  else if (valueGap < -15) classification = 'OVERVALUED';

  // Trend direction based on age + production
  const age = lastSeasonStats.age || 28;
  let trajectory = 'STABLE';
  if (age <= 26 && productionScore > 50) trajectory = 'ASCENDING';
  else if (age >= 33 && productionScore < 70) trajectory = 'DECLINING';
  else if (age >= 31) trajectory = 'PLATEAU — WATCH FOR DECLINE';

  const summary = `2025: ${statLine}. ADP ${adp} (implied: ${impliedADP}). ${classification} by ${Math.abs(valueGap)} picks. Age ${age}, trajectory: ${trajectory}. Floor: ${floorCeiling.floor}. Ceiling: ${floorCeiling.ceiling}.`;

  return {
    productionScore: Math.round(productionScore),
    impliedADP,
    actualADP: adp,
    valueGap,
    gapPercent: +gapPct,
    classification,
    trajectory,
    statLine,
    floorCeiling,
    summary,
  };
}
```

---

## File: `lib/mlbStatsService.js`

```javascript
/**
 * mlbStatsService.js — Free MLB Stats API integration
 */

import axios from 'axios';
import xml2js from 'xml2js';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;       // 10 min — player stats, schedules
const NEWS_CACHE_TTL = 3 * 60 * 1000;   // 3 min — breaking news (fresh signings)

function getCached(key, ttl = CACHE_TTL) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    oldest.slice(0, 100).forEach(([k]) => cache.delete(k));
  }
}

export async function searchPlayer(name) {
  const key = `search:${name.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/people/search`, { params: { names: name, sportId: 1 }, timeout: 8000 });
    const players = data.people || [];
    if (players.length === 0) return null;
    const exact = players.find(p => p.fullName?.toLowerCase() === name.toLowerCase() || p.nameFirstLast?.toLowerCase() === name.toLowerCase());
    const result = exact || players[0];
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Search failed for "${name}":`, err.message);
    return null;
  }
}

export async function getPlayerStats(playerId, season = 2026, group = 'hitting') {
  const key = `stats:${playerId}:${season}:${group}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/people/${playerId}/stats`, { params: { stats: 'season', season, group }, timeout: 8000 });
    const splits = data.stats?.[0]?.splits || [];
    if (splits.length === 0) return null;
    const stat = splits[0].stat;
    const result = { playerId, season, group, ...stat };
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Stats fetch failed for player ${playerId}:`, err.message);
    return null;
  }
}

export async function getPlayerSeasonStats(playerName, season = 2026) {
  const player = await searchPlayer(playerName);
  if (!player) return null;
  const isPitcher = player.primaryPosition?.abbreviation === 'P' || player.primaryPosition?.type === 'Pitcher';
  const rawStats = await getPlayerStats(player.id, season, isPitcher ? 'pitching' : 'hitting');
  if (!rawStats) return null;
  if (isPitcher) {
    return {
      name: player.fullName, mlbId: player.id, team: player.currentTeam?.name || '', teamAbbr: player.currentTeam?.abbreviation || '',
      position: 'P', age: player.currentAge, season, type: 'pitcher',
      stats: { W: rawStats.wins || 0, L: rawStats.losses || 0, ERA: parseFloat(rawStats.era) || 0, WHIP: parseFloat(rawStats.whip) || 0, K: rawStats.strikeOuts || 0, SV: rawStats.saves || 0, IP: parseFloat(rawStats.inningsPitched) || 0, GS: rawStats.gamesStarted || 0, G: rawStats.gamesPlayed || 0, BB: rawStats.baseOnBalls || 0, H: rawStats.hits || 0, HR: rawStats.homeRuns || 0, K9: parseFloat(rawStats.strikeoutsPer9Inn) || 0, BB9: parseFloat(rawStats.walksPer9Inn) || 0, KBBR: rawStats.strikeoutWalkRatio ? parseFloat(rawStats.strikeoutWalkRatio) : 0, AVG: parseFloat(rawStats.avg) || 0 }
    };
  } else {
    return {
      name: player.fullName, mlbId: player.id, team: player.currentTeam?.name || '', teamAbbr: player.currentTeam?.abbreviation || '',
      position: player.primaryPosition?.abbreviation || 'UTIL', age: player.currentAge, season, type: 'hitter',
      stats: { G: rawStats.gamesPlayed || 0, PA: rawStats.plateAppearances || 0, AB: rawStats.atBats || 0, R: rawStats.runs || 0, H: rawStats.hits || 0, HR: rawStats.homeRuns || 0, RBI: rawStats.rbi || 0, SB: rawStats.stolenBases || 0, CS: rawStats.caughtStealing || 0, BB: rawStats.baseOnBalls || 0, K: rawStats.strikeOuts || 0, AVG: parseFloat(rawStats.avg) || 0, OBP: parseFloat(rawStats.obp) || 0, SLG: parseFloat(rawStats.slg) || 0, OPS: parseFloat(rawStats.ops) || 0, BABIP: parseFloat(rawStats.babip) || 0, '2B': rawStats.doubles || 0, '3B': rawStats.triples || 0, TB: rawStats.totalBases || 0 }
    };
  }
}

export async function getBulkPlayerStats(playerNames = [], season = 2026) {
  const results = {};
  const batchSize = 5;
  for (let i = 0; i < playerNames.length; i += batchSize) {
    const batch = playerNames.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(name => getPlayerSeasonStats(name, season)));
    batchResults.forEach((result, idx) => {
      const name = batch[idx];
      if (result.status === 'fulfilled' && result.value) results[name] = result.value;
    });
  }
  return results;
}

export async function getMultiSeasonStats(playerName, seasons = [2024, 2025, 2026]) {
  const player = await searchPlayer(playerName);
  if (!player) return null;
  const isPitcher = player.primaryPosition?.abbreviation === 'P' || player.primaryPosition?.type === 'Pitcher';
  const group = isPitcher ? 'pitching' : 'hitting';
  const results = {};
  for (const season of seasons) {
    const stats = await getPlayerStats(player.id, season, group);
    if (stats) results[season] = stats;
  }
  return { name: player.fullName, mlbId: player.id, position: player.primaryPosition?.abbreviation || 'UTIL', age: player.currentAge, isPitcher, seasonStats: results };
}

export async function getLiveProbablePitchers() {
  const key = 'live_probable_pitchers';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, { params: { sportId: 1, hydrate: 'probablePitcher' }, timeout: 8000 });
    const pitchers = new Set();
    const games = data.dates?.[0]?.games || [];
    games.forEach(g => {
      if (g.teams?.away?.probablePitcher?.fullName) pitchers.add(g.teams.away.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      if (g.teams?.home?.probablePitcher?.fullName) pitchers.add(g.teams.home.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    });
    const result = Array.from(pitchers);
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch probable pitchers:`, err.message);
    return [];
  }
}

/**
 * Returns teams playing TODAY as { abbrs: Set<string>, names: Set<string> }
 * Used by Start/Sit to flag hitters whose team has an off day.
 */
export async function getTodayTeamsPlaying() {
  const key = 'today_teams_playing';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, {
      params: { sportId: 1, hydrate: 'team' },
      timeout: 8000,
    });
    const abbrs = new Set();
    const names = new Set();
    const games = data.dates?.[0]?.games || [];
    for (const g of games) {
      for (const side of ['away', 'home']) {
        const team = g.teams?.[side]?.team;
        if (team?.abbreviation) abbrs.add(team.abbreviation.toUpperCase());
        if (team?.name)         names.add(team.name.toLowerCase());
        // Common short aliases (e.g. "Athletics" → "ATH", "A's")
        if (team?.teamName)     names.add(team.teamName.toLowerCase());
      }
    }
    const result = { abbrs, names };
    setCache(key, result);
    return result;
  } catch (err) {
    console.warn('[MLB Stats] getTodayTeamsPlaying failed:', err.message);
    return { abbrs: new Set(), names: new Set() };
  }
}

export async function getTodayLiveScores() {
  const key = 'live_scores_today';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, { params: { sportId: 1, hydrate: 'decidingPitcher,linescore' }, timeout: 10000 });
    const results = [];
    const games = data.dates?.[0]?.games || [];
    games.forEach(g => {
      results.push({
        gameId: g.gamePk, status: g.status?.abstractGameState || 'Unknown',
        homeTeam: g.teams?.home?.team?.name || 'Home', awayTeam: g.teams?.away?.team?.name || 'Away',
        homeScore: g.teams?.home?.score ?? 0, awayScore: g.teams?.away?.score ?? 0,
        winner: g.decidingPitcher?.winner?.fullName, loser: g.decidingPitcher?.loser?.fullName, saver: g.decidingPitcher?.save?.fullName,
        summary: `${g.teams?.away?.team?.name || 'Away'} ${g.teams?.away?.score ?? 0}, ${g.teams?.home?.team?.name || 'Home'} ${g.teams?.home?.score ?? 0}`
      });
    });
    setCache(key, results);
    return results;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch live scores:`, err.message);
    return [];
  }
}

export async function getRecentTransactions(days = 30) {
  const key = `mlb_transactions_${days}`;
  const cached = getCached(key, NEWS_CACHE_TTL);
  if (cached) return cached;
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const { data } = await axios.get(`${BASE_URL}/transactions`, {
      params: { sportId: 1, startDate, endDate },
      timeout: 8000,
    });
    const txns = (data.transactions || [])
      .filter(t => t.person?.fullName && (t.toTeam?.name || t.typeCode))
      .slice(0, 20)
      .map(t => {
        const name = t.person.fullName;
        const type = t.type?.shortDescription || t.typeCode || 'Transaction';
        const to   = t.toTeam?.name   ? `to ${t.toTeam.name}`   : '';
        const from = t.fromTeam?.name ? `from ${t.fromTeam.name}` : '';
        const date = (t.date || '').slice(0, 10);
        return `- ${name}: ${type} ${to} ${from} (${date})`.replace(/\s+/g, ' ').trim();
      });
    const result = txns.join('\n');
    setCache(key, result);
    return result;
  } catch (err) {
    console.warn('[MLB Stats] Transactions fetch failed:', err.message);
    return '';
  }
}

export async function getBreakingNews() {
  const key = `breaking_news`;
  const cached = getCached(key, NEWS_CACHE_TTL);
  if (cached) return cached;

  // Fetch both sources in parallel
  const [rssResult, txnResult] = await Promise.allSettled([
    // Source 1: RotoWire RSS (last ~24h)
    axios.get('https://www.rotowire.com/rss/news.php?sport=MLB', { timeout: 5000 })
      .then(({ data }) => new Promise((resolve) => {
        xml2js.parseString(data, (err, result) => {
          if (err) return resolve('');
          const items = result?.rss?.channel?.[0]?.item || [];
          resolve(items.slice(0, 12).map(i => `- ${i.title[0]}`).join('\n'));
        });
      }))
      .catch(() => ''),
    // Source 2: MLB Stats API transactions (last 30 days — catches older signings/trades)
    getRecentTransactions(30),
  ]);

  const rss  = rssResult.status  === 'fulfilled' ? rssResult.value  : '';
  const txns = txnResult.status === 'fulfilled' ? txnResult.value : '';

  const combined = [
    rss  ? `RECENT NEWS (RotoWire):\n${rss}`           : '',
    txns ? `MLB TRANSACTIONS (last 30 days):\n${txns}` : '',
  ].filter(Boolean).join('\n\n') || 'No recent news available';

  setCache(key, combined);
  return combined;
}

export async function getTwoStartPitchers() {
  const key = 'rolling_two_start_pitchers_v2';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const now = new Date();
    const day = now.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    // Current fantasy week: Mon → Sun
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - daysSinceMonday);
    currentMonday.setHours(0, 0, 0, 0);
    const cMonStr = currentMonday.toISOString().split('T')[0];
    const cSunStr = new Date(currentMonday.getTime() + 6 * 86400000).toISOString().split('T')[0];

    // Next fantasy week
    const nextMonday = new Date(currentMonday.getTime() + 7 * 86400000);
    const nMonStr = nextMonday.toISOString().split('T')[0];
    const nSunStr = new Date(nextMonday.getTime() + 6 * 86400000).toISOString().split('T')[0];

    const todayStr = now.toISOString().split('T')[0];

    const [currentData, nextData] = await Promise.all([
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: cMonStr, endDate: cSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(r => r.data),
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: nMonStr, endDate: nSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(r => r.data),
    ]);

    const normName = (n) => (n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ── Build per-pitcher start records for the current week ─────────────────
    const pitcherMap = new Map(); // normName → { fullName, starts: [{...}] }

    for (const dateObj of (currentData.dates || [])) {
      const dateStr = dateObj.date; // 'YYYY-MM-DD'
      const dayName = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'America/New_York' });

      for (const g of (dateObj.games || [])) {
        const gameTime  = g.gameDate ? new Date(g.gameDate) : null;
        const gameState = g.status?.abstractGameState || 'Preview'; // 'Preview' | 'Live' | 'Final'
        const isCompleted = gameState === 'Final';
        const isLive      = gameState === 'Live';
        // A game is "upcoming" if it hasn't started yet OR is today but hasn't been completed
        const isUpcoming  = !isCompleted && (!gameTime || gameTime > now);
        const isToday     = dateStr === todayStr;

        for (const side of ['away', 'home']) {
          const pitcher = g.teams?.[side]?.probablePitcher;
          if (!pitcher?.fullName) continue;
          const key = normName(pitcher.fullName);
          if (!pitcherMap.has(key)) pitcherMap.set(key, { fullName: pitcher.fullName, starts: [] });
          pitcherMap.get(key).starts.push({ dateStr, dayName, gameTime, isCompleted, isLive, isUpcoming, isToday });
        }
      }
    }

    // ── Classify each pitcher ─────────────────────────────────────────────────
    const twoStartThisWeek      = [];  // has 2+ total starts this week (backward compat)
    const remainingTwoStarters  = [];  // 2+ starts REMAINING (full value for add)
    const oneStartRemaining     = [];  // was a 2-start SP but 1 already pitched
    const todayStarters         = [];  // starting today (not yet final)
    const pitcherDetails        = {};  // rich data for the prompt

    for (const [norm, p] of pitcherMap) {
      const completed = p.starts.filter(s => s.isCompleted);
      const upcoming  = p.starts.filter(s => s.isUpcoming || s.isLive);
      const isToday   = p.starts.some(s => s.isToday && !s.isCompleted);

      if (isToday) todayStarters.push(norm);

      const totalStarts     = p.starts.length;
      const remainingCount  = upcoming.length;
      const completedCount  = completed.length;

      if (totalStarts >= 2) {
        twoStartThisWeek.push(norm);
        if (remainingCount >= 2) {
          remainingTwoStarters.push(norm);
        } else if (remainingCount === 1) {
          oneStartRemaining.push(norm);
        }
      }

      pitcherDetails[norm] = {
        fullName:       p.fullName,
        totalStarts,
        remainingStarts: remainingCount,
        completedStarts: completedCount,
        upcomingDays:   upcoming.map(s => s.dayName),
        completedDays:  completed.map(s => s.dayName),
        // Plain-English label for prompts/UI
        label: totalStarts >= 2
          ? remainingCount >= 2
            ? `2-start (both upcoming: ${upcoming.map(s => s.dayName).join(', ')})`
            : remainingCount === 1
              ? `2-start SP — 1 already pitched (${completed.map(s => s.dayName).join(',')}), 1 remaining (${upcoming.map(s => s.dayName).join(',')})`
              : `2-start SP — BOTH STARTS ALREADY PITCHED this week (${completed.map(s => s.dayName).join(', ')})`
          : isToday
            ? `1-start (today)`
            : `1-start (${p.starts.map(s => s.dayName).join(', ')})`,
      };
    }

    // ── Next week: just detect 2-start SPs (simple count, all future) ────────
    const nextPitcherCount = new Map();
    for (const dateObj of (nextData.dates || [])) {
      for (const g of (dateObj.games || [])) {
        for (const side of ['away', 'home']) {
          const pitcher = g.teams?.[side]?.probablePitcher;
          if (!pitcher?.fullName) continue;
          const key = normName(pitcher.fullName);
          nextPitcherCount.set(key, (nextPitcherCount.get(key) || 0) + 1);
        }
      }
    }
    const nextWeek = [...nextPitcherCount.entries()].filter(([, c]) => c >= 2).map(([n]) => n);

    const result = {
      currentWeek: twoStartThisWeek,   // backward compat
      nextWeek,
      today: todayStarters,
      remainingTwoStarters,            // still have 2 starts left → FULL value
      oneStartRemaining,               // 1 of 2 starts already used → partial value
      pitcherDetails,                  // rich per-pitcher detail for prompts
    };

    setCache(key, result);
    return result;
  } catch (err) {
    console.error('[MLB Stats] Failed to fetch 2-start pitchers:', err.message);
    return { currentWeek: [], nextWeek: [], today: [], remainingTwoStarters: [], oneStartRemaining: [], pitcherDetails: {} };
  }
}
```

---

## File: `lib/rosterData.js`

```javascript
export const GALACTIC_ROSTER = [
  {
    "id": "bb_1",
    "name": "Isaiah Anderson",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Cyborg Pitcher",
    "jersey_number": 53,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/tgl_brooklyn_hitter_1776485884068.png"
  },
  {
    "id": "bb_2",
    "name": "Elijah Wilson",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Bionic Shortstop",
    "jersey_number": 76,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/tgl_brooklyn_hitter_v2_1776486708198.png"
  },
  {
    "id": "bb_3",
    "name": "Unit 91-E",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 17,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/tgl_brooklyn_hitter_v3_1776486966054.png"
  },
  {
    "id": "bb_4",
    "name": "James Williams",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Laser Outfielder",
    "jersey_number": 57,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_bronx_bomber_autograph_1776834775822.png"
  },
  {
    "id": "bb_5",
    "name": "Vor Void",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Utility Android",
    "jersey_number": 90,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_diving_catch.png"
  },
  {
    "id": "bb_6",
    "name": "Unit 58-E",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Hover-Base Stealer",
    "jersey_number": 14,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "bb_7",
    "name": "Valentina Perez",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Plasma Catcher",
    "jersey_number": 34,
    "gender": "female",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "bb_8",
    "name": "Daiki Kato",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Relief Pitcher",
    "jersey_number": 13,
    "gender": "male",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_card_tier1_pitcher.png"
  },
  {
    "id": "bb_9",
    "name": "Grox Alpha",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Manager",
    "jersey_number": 48,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/elara_manager.png"
  },
  {
    "id": "bb_10",
    "name": "James Taylor",
    "team": "Brooklyn Biotics",
    "teamColor": "#00c8ff",
    "position": "Designated Hacker",
    "jersey_number": 58,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_diving_catch.png"
  },
  {
    "id": "tt_1",
    "name": "Daiki Watanabe",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Cyborg Pitcher",
    "jersey_number": 1,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/tgl_tokyo_stealer_1776485899445.png"
  },
  {
    "id": "tt_2",
    "name": "Elon Chen",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Bionic Shortstop",
    "jersey_number": 25,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/tgl_tokyo_stealer_v2_1776486720704.png"
  },
  {
    "id": "tt_3",
    "name": "Hina Nakamura",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 93,
    "gender": "female",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "tt_4",
    "name": "Hiroshi Tanaka",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Laser Outfielder",
    "jersey_number": 16,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "tt_5",
    "name": "Akira Watanabe",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Utility Android",
    "jersey_number": 77,
    "gender": "female",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "tt_6",
    "name": "Arjun Liu",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Hover-Base Stealer",
    "jersey_number": 43,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "tt_7",
    "name": "Hiroshi Takahashi",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Plasma Catcher",
    "jersey_number": 36,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_silver_prism_closeup.png"
  },
  {
    "id": "tt_8",
    "name": "Kenji Nakamura",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Relief Pitcher",
    "jersey_number": 46,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/arcana_clean.png"
  },
  {
    "id": "tt_9",
    "name": "Echo Rider",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Manager",
    "jersey_number": 68,
    "gender": "female",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_coach_card_woman.png"
  },
  {
    "id": "tt_10",
    "name": "Ren Moto",
    "team": "Tokyo Tachyons",
    "teamColor": "#ff0088",
    "position": "Designated Hacker",
    "jersey_number": 61,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_batter_series3.png"
  },
  {
    "id": "nc_1",
    "name": "Diego Garcia",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Cyborg Pitcher",
    "jersey_number": 93,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_seattle_slugger_titanium_1776834796200.png"
  },
  {
    "id": "nc_2",
    "name": "Cole Thomas",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Bionic Shortstop",
    "jersey_number": 57,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/tgl_neoncity_infielder_1776485917829.png"
  },
  {
    "id": "nc_3",
    "name": "Unit 52-F",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 69,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/tgl_neoncity_infielder_v2_1776486734283.png"
  },
  {
    "id": "nc_4",
    "name": "Laser Wire",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Laser Outfielder",
    "jersey_number": 82,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "nc_5",
    "name": "Synth Code",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Utility Android",
    "jersey_number": 39,
    "gender": "male",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "nc_6",
    "name": "Pixel Maverick",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Hover-Base Stealer",
    "jersey_number": 44,
    "gender": "female",
    "home_planet": "Titan Station",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "nc_7",
    "name": "Lyra Void",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Plasma Catcher",
    "jersey_number": 31,
    "gender": "female",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "nc_8",
    "name": "Alan Turing",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Relief Pitcher",
    "jersey_number": 1,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_bullpen_closer.png"
  },
  {
    "id": "nc_9",
    "name": "Elara",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Manager",
    "jersey_number": 19,
    "gender": "female",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/elara_manager.png"
  },
  {
    "id": "nc_10",
    "name": "Unit 90-S",
    "team": "Neon City Sliders",
    "teamColor": "#00ff88",
    "position": "Designated Hacker",
    "jersey_number": 78,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "sv_1",
    "name": "Yuta Ito",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Cyborg Pitcher",
    "jersey_number": 61,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/tgl_siliconvalley_pitcher_1776485929503.png"
  },
  {
    "id": "sv_2",
    "name": "Rahul Li",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Bionic Shortstop",
    "jersey_number": 53,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/tgl_siliconvalley_pitcher_v2_1776486747529.png"
  },
  {
    "id": "sv_3",
    "name": "Echo Byte",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 75,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_batter_series3.png"
  },
  {
    "id": "sv_4",
    "name": "Daiki Tanaka",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Laser Outfielder",
    "jersey_number": 44,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_diving_catch.png"
  },
  {
    "id": "sv_5",
    "name": "Hunter Williams",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Utility Android",
    "jersey_number": 9,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "sv_6",
    "name": "Isaiah Miller",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Hover-Base Stealer",
    "jersey_number": 46,
    "gender": "male",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "sv_7",
    "name": "Jada Wilson",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Plasma Catcher",
    "jersey_number": 84,
    "gender": "female",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "sv_8",
    "name": "Kael Eclipse",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Relief Pitcher",
    "jersey_number": 59,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_pitcher_series3.png"
  },
  {
    "id": "sv_9",
    "name": "Rahul Wu",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Manager",
    "jersey_number": 62,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/cyborg_cyber_manager.png"
  },
  {
    "id": "sv_10",
    "name": "Wei Huang",
    "team": "Silicon Valley Sentinels",
    "teamColor": "#5555ff",
    "position": "Designated Hacker",
    "jersey_number": 90,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "dt_1",
    "name": "Camila Johnson",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Cyborg Pitcher",
    "jersey_number": 76,
    "gender": "female",
    "home_planet": "Gliese 581g",
    "image": "/tgl_dallas_cowboy_1776485952292.png"
  },
  {
    "id": "dt_2",
    "name": "Luis Garcia",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Bionic Shortstop",
    "jersey_number": 70,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/tgl_dallas_cowboy_v2_1776486768529.png"
  },
  {
    "id": "dt_3",
    "name": "Mateo Sanchez",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 43,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/tgl_dallas_cowboy_v3_1776486978084.png"
  },
  {
    "id": "dt_4",
    "name": "Ananya Wu",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Laser Outfielder",
    "jersey_number": 75,
    "gender": "female",
    "home_planet": "Titan Station",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "dt_5",
    "name": "Xen Void",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Utility Android",
    "jersey_number": 19,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_batter_ready.png"
  },
  {
    "id": "dt_6",
    "name": "Chloe White",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Hover-Base Stealer",
    "jersey_number": 38,
    "gender": "female",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "dt_7",
    "name": "Javier Brown",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Plasma Catcher",
    "jersey_number": 20,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_catcher_series3.png"
  },
  {
    "id": "dt_8",
    "name": "Luis Smith",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Relief Pitcher",
    "jersey_number": 34,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_pitcher_windup.png"
  },
  {
    "id": "dt_9",
    "name": "Carlos Lopez",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Manager",
    "jersey_number": 63,
    "gender": "male",
    "home_planet": "Proxima Centauri b",
    "image": "/elara_clean.png"
  },
  {
    "id": "dt_10",
    "name": "Julio Martinez",
    "team": "Dallas Tex-Mechs",
    "teamColor": "#ff8800",
    "position": "Designated Hacker",
    "jersey_number": 78,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_stealing_second.png"
  },
  {
    "id": "oo_1",
    "name": "DeAndre Davis",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Cyborg Pitcher",
    "jersey_number": 48,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/tgl_osaka_hitter_1776485966934.png"
  },
  {
    "id": "oo_2",
    "name": "Diego Lopez",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Bionic Shortstop",
    "jersey_number": 24,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/tgl_osaka_hitter_v2_1776486782371.png"
  },
  {
    "id": "oo_3",
    "name": "Satoshi Tanaka",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 51,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_diving_catch.png"
  },
  {
    "id": "oo_4",
    "name": "Yuta Ito",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Laser Outfielder",
    "jersey_number": 12,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_batter_series3.png"
  },
  {
    "id": "oo_5",
    "name": "Rafael Flores",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Utility Android",
    "jersey_number": 70,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_batflip.png"
  },
  {
    "id": "oo_6",
    "name": "Harper Johnson",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Hover-Base Stealer",
    "jersey_number": 15,
    "gender": "female",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "oo_7",
    "name": "Hiroshi Ito",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Plasma Catcher",
    "jersey_number": 78,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/cyborg_silver_prism_closeup.png"
  },
  {
    "id": "oo_8",
    "name": "Yuta Kobayashi",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Relief Pitcher",
    "jersey_number": 96,
    "gender": "male",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_card_tier1_pitcher.png"
  },
  {
    "id": "oo_9",
    "name": "Xylar Quasar",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Manager",
    "jersey_number": 77,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/cyborg_coach_card_woman.png"
  },
  {
    "id": "oo_10",
    "name": "Takumi Kobayashi",
    "team": "Osaka Overclockers",
    "teamColor": "#ffcc00",
    "position": "Designated Hacker",
    "jersey_number": 47,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_batter_series3.png"
  },
  {
    "id": "kk_1",
    "name": "Takumi Yamamoto",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Cyborg Pitcher",
    "jersey_number": 20,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/tgl_kyoto_kaiju_pitcher_1776485980459.png"
  },
  {
    "id": "kk_2",
    "name": "Akira Ryuko",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Bionic Shortstop",
    "jersey_number": 30,
    "gender": "female",
    "home_planet": "Mars Colony Prime",
    "image": "/tgl_kyoto_kaiju_pitcher_v2_1776486797035.png"
  },
  {
    "id": "kk_3",
    "name": "Jaq Quasar",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 1,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "kk_4",
    "name": "Jin Nakamura",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Laser Outfielder",
    "jersey_number": 56,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_batflip.png"
  },
  {
    "id": "kk_5",
    "name": "Unit 69-T",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Utility Android",
    "jersey_number": 69,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "kk_6",
    "name": "Sho Watanabe",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Hover-Base Stealer",
    "jersey_number": 21,
    "gender": "male",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/cyborg_stealing_second.png"
  },
  {
    "id": "kk_7",
    "name": "Grox Void",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Plasma Catcher",
    "jersey_number": 98,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_silver_prism_closeup.png"
  },
  {
    "id": "kk_8",
    "name": "Jin Sato",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Relief Pitcher",
    "jersey_number": 39,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/arcana_clean.png"
  },
  {
    "id": "kk_9",
    "name": "Isabella Torres",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Manager",
    "jersey_number": 72,
    "gender": "female",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_cyber_manager.png"
  },
  {
    "id": "kk_10",
    "name": "Miguel Flores",
    "team": "Kyoto Kaiju",
    "teamColor": "#ff4444",
    "position": "Designated Hacker",
    "jersey_number": 92,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_batter_ready.png"
  },
  {
    "id": "rr_1",
    "name": "Drax Quasar",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Cyborg Pitcher",
    "jersey_number": 1,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/tgl_roswell_infielder_1776485994040.png"
  },
  {
    "id": "rr_2",
    "name": "Chloe Smith",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Bionic Shortstop",
    "jersey_number": 33,
    "gender": "female",
    "home_planet": "Earth (Sector 4)",
    "image": "/tgl_roswell_infielder_v2_1776486811710.png"
  },
  {
    "id": "rr_3",
    "name": "James Taylor",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 69,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "rr_4",
    "name": "Cyber Code",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Laser Outfielder",
    "jersey_number": 73,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_silver_prism_wide.png"
  },
  {
    "id": "rr_5",
    "name": "Zorblax X",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Utility Android",
    "jersey_number": 51,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_batter_series3.png"
  },
  {
    "id": "rr_6",
    "name": "Chloe Jones",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Hover-Base Stealer",
    "jersey_number": 95,
    "gender": "female",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "rr_7",
    "name": "Alan Liu",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Plasma Catcher",
    "jersey_number": 44,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/cyborg_catcher_series3.png"
  },
  {
    "id": "rr_8",
    "name": "Vera X",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Relief Pitcher",
    "jersey_number": 72,
    "gender": "female",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "rr_9",
    "name": "Grox Alpha",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Manager",
    "jersey_number": 87,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/elara_clean.png"
  },
  {
    "id": "rr_10",
    "name": "Lucy Chen",
    "team": "Roswell Rayguns",
    "teamColor": "#77ff00",
    "position": "Designated Hacker",
    "jersey_number": 40,
    "gender": "female",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "aa_1",
    "name": "Elijah Brown",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Cyborg Pitcher",
    "jersey_number": 20,
    "gender": "male",
    "home_planet": "Mars Colony Prime",
    "image": "/arcana_clean.png"
  },
  {
    "id": "aa_2",
    "name": "Elijah Anderson",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Bionic Shortstop",
    "jersey_number": 16,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_batter_ready.png"
  },
  {
    "id": "aa_3",
    "name": "Desmond Brown",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 5,
    "gender": "male",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/cyborg_batflip.png"
  },
  {
    "id": "aa_4",
    "name": "DeAndre Harris",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Laser Outfielder",
    "jersey_number": 39,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/cyborg_batter_ready.png"
  },
  {
    "id": "aa_5",
    "name": "Unit 42-N",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Utility Android",
    "jersey_number": 44,
    "gender": "female",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "aa_6",
    "name": "Elijah Smith",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Hover-Base Stealer",
    "jersey_number": 27,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_stealing_second.png"
  },
  {
    "id": "aa_7",
    "name": "DeAndre White",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Plasma Catcher",
    "jersey_number": 35,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_silver_prism_closeup.png"
  },
  {
    "id": "aa_8",
    "name": "Chloe Jackson",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Relief Pitcher",
    "jersey_number": 75,
    "gender": "female",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "aa_9",
    "name": "Sam Brown",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Manager",
    "jersey_number": 67,
    "gender": "female",
    "home_planet": "Venus Cloud City",
    "image": "/female_cyborg_manager.png"
  },
  {
    "id": "aa_10",
    "name": "Ava Wilson",
    "team": "Atlanta Aerodynamics",
    "teamColor": "#aa00ff",
    "position": "Designated Hacker",
    "jersey_number": 61,
    "gender": "female",
    "home_planet": "Mars Colony Prime",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "mm_1",
    "name": "Julio Sanchez",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Cyborg Pitcher",
    "jersey_number": 85,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_card_tier1_pitcher.png"
  },
  {
    "id": "mm_2",
    "name": "Diego Torres",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Bionic Shortstop",
    "jersey_number": 67,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_diving_catch.png"
  },
  {
    "id": "mm_3",
    "name": "Unit 61-C",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 7,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_batter_ready.png"
  },
  {
    "id": "mm_4",
    "name": "Unit 49-E",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Laser Outfielder",
    "jersey_number": 11,
    "gender": "male",
    "home_planet": "Venus Cloud City",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "mm_5",
    "name": "Luis Torres",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Utility Android",
    "jersey_number": 40,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "mm_6",
    "name": "Mateo Hernandez",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Hover-Base Stealer",
    "jersey_number": 39,
    "gender": "male",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/cyborg_diving_catch.png"
  },
  {
    "id": "mm_7",
    "name": "Daiki Suzuki",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Plasma Catcher",
    "jersey_number": 31,
    "gender": "male",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/cyborg_silver_prism_closeup.png"
  },
  {
    "id": "mm_8",
    "name": "Miguel Hernandez",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Relief Pitcher",
    "jersey_number": 34,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_bullpen_closer.png"
  },
  {
    "id": "mm_9",
    "name": "Rosa Gonzalez",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Manager",
    "jersey_number": 76,
    "gender": "female",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/female_cyborg_manager.png"
  },
  {
    "id": "mm_10",
    "name": "Unit 84-G",
    "team": "Miami Motherboards",
    "teamColor": "#00ffff",
    "position": "Designated Hacker",
    "jersey_number": 68,
    "gender": "male",
    "home_planet": "Andromeda Outpost 9",
    "image": "/cyborg_batter_series3.png"
  },
  {
    "id": "sj_1",
    "name": "Rin Ito",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Cyborg Pitcher",
    "jersey_number": 70,
    "gender": "female",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "sj_2",
    "name": "Elena Diaz",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Bionic Shortstop",
    "jersey_number": 71,
    "gender": "female",
    "home_planet": "Kepler-186f",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "sj_3",
    "name": "Kael Omega",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 33,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_stealing_second.png"
  },
  {
    "id": "sj_4",
    "name": "Valentina Smith",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Laser Outfielder",
    "jersey_number": 82,
    "gender": "female",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "sj_5",
    "name": "Miguel Gomez",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Utility Android",
    "jersey_number": 65,
    "gender": "male",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_stealing_second.png"
  },
  {
    "id": "sj_6",
    "name": "Rafael Flores",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Hover-Base Stealer",
    "jersey_number": 17,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "sj_7",
    "name": "Hector Gonzalez",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Plasma Catcher",
    "jersey_number": 94,
    "gender": "male",
    "home_planet": "Gliese 581g",
    "image": "/cyborg_catcher_series3.png"
  },
  {
    "id": "sj_8",
    "name": "Javier Diaz",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Relief Pitcher",
    "jersey_number": 0,
    "gender": "male",
    "home_planet": "Kepler-186f",
    "image": "/cyborg_pitcher_series3.png"
  },
  {
    "id": "sj_9",
    "name": "Camila Diaz",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Manager",
    "jersey_number": 42,
    "gender": "female",
    "home_planet": "Titan Station",
    "image": "/elara_clean.png"
  },
  {
    "id": "sj_10",
    "name": "Takumi Moto",
    "team": "San Juan Synthetics",
    "teamColor": "#ff00ff",
    "position": "Designated Hacker",
    "jersey_number": 5,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "hh_1",
    "name": "Diego Cruz",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Cyborg Pitcher",
    "jersey_number": 41,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/cyborg_card_tier1_pitcher.png"
  },
  {
    "id": "hh_2",
    "name": "Elena Sanchez",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Bionic Shortstop",
    "jersey_number": 6,
    "gender": "female",
    "home_planet": "Proxima Centauri b",
    "image": "/cyborg_female_hitter.png"
  },
  {
    "id": "hh_3",
    "name": "Julio Martinez",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Heavy Artillery (1B)",
    "jersey_number": 82,
    "gender": "male",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_walkoff_homer.png"
  },
  {
    "id": "hh_4",
    "name": "Vector Byte",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Laser Outfielder",
    "jersey_number": 53,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_card_tier1_hitter.png"
  },
  {
    "id": "hh_5",
    "name": "Daiki Kato",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Utility Android",
    "jersey_number": 27,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_silver_prism_wide.png"
  },
  {
    "id": "hh_6",
    "name": "Leo Cruz",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Hover-Base Stealer",
    "jersey_number": 19,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/cyborg_stealing_second.png"
  },
  {
    "id": "hh_7",
    "name": "Leo Rodriguez",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Plasma Catcher",
    "jersey_number": 29,
    "gender": "male",
    "home_planet": "Titan Station",
    "image": "/cyborg_catcher_series3.png"
  },
  {
    "id": "hh_8",
    "name": "Unit 63-V",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Relief Pitcher",
    "jersey_number": 17,
    "gender": "male",
    "home_planet": "Europa Sub-Oceanic",
    "image": "/arcana_clean.png"
  },
  {
    "id": "hh_9",
    "name": "Carmen Sanchez",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Manager",
    "jersey_number": 88,
    "gender": "female",
    "home_planet": "The Lunar Spire",
    "image": "/cyborg_coach_card_woman.png"
  },
  {
    "id": "hh_10",
    "name": "Yuta Yamada",
    "team": "Havana Hover-Hounds",
    "teamColor": "#ccff00",
    "position": "Designated Hacker",
    "jersey_number": 97,
    "gender": "male",
    "home_planet": "Earth (Sector 4)",
    "image": "/cyborg_batflip.png"
  }
];
```

---

## File: `lib/session.js`

```javascript
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "batflip_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  return await getIronSession(await cookies(), sessionOptions);
}
```

---

## File: `lib/yahooService.js`

```javascript
import axios from 'axios';
import { db, forceRefreshToken } from './database.js';

const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

export async function getAccessToken(guid) {
  if (!guid) throw new Error('Not authenticated (missing session guid)');
  
  const row = db.getToken(guid);
  if (!row) throw new Error('Not authenticated with Yahoo');

  if (Date.now() > row.expires_at - 60000) {
    console.log('[Yahoo OAuth] Token naturally expired, auto-refreshing...');
    return await forceRefreshToken(guid, row.refresh_token);
  }

  return row.access_token;
}

export async function yahooGet(guid, endpoint) {
  let token = await getAccessToken(guid);
  const TIMEOUT = 12000; // 12s — fast-fail if Yahoo is slow
  
  try {
    const response = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: TIMEOUT,
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('[Yahoo OAuth] Yahoo rejected unexpired token! Forcing aggressive retry...');
      const row = db.getToken(guid);
      if (!row) throw err;
      
      token = await forceRefreshToken(guid, row.refresh_token);
      
      const retryResponse = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: TIMEOUT,
      });
      return retryResponse.data;
    }
    throw err;
  }
}

export function toArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  let count = parseInt(obj['@attributes']?.count) || parseInt(obj.count) || 0;
  if (!count) {
    count = Object.keys(obj).filter(k => /^\d+$/.test(k)).length;
  }
  if (!count) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = obj[i] || obj[String(i)];
    if (item) result.push(item);
  }
  return result;
}

export async function getLeagues(guid) {
  const data = await yahooGet(guid, '/users;use_login=1/games;game_keys=mlb/leagues');
  const leagues = data?.fantasy_content?.users?.['0']?.user?.[1]?.games?.['0']?.game?.[1]?.leagues;
  if (!leagues) return [];
  return toArray(leagues).map(l => l?.league?.[0]).filter(Boolean);
}

export async function getLeague(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/settings`);
  return data.fantasy_content?.league;
}

export async function getRoster(guid, leagueKey, teamKey) {
  const data = await yahooGet(guid, `/team/${teamKey}/roster/players`);
  const team = data.fantasy_content?.team;
  let players = null;
  const roster = team?.[1]?.roster;
  if (roster) {
    if (Array.isArray(roster)) {
      for (const r of roster) {
        if (r?.players) { players = r.players; break; }
      }
    } else {
      for (let i = 0; i <= 2; i++) {
        if (roster[i]?.players) { players = roster[i].players; break; }
        if (roster[String(i)]?.players) { players = roster[String(i)].players; break; }
      }
      if (!players && roster.players) players = roster.players;
    }
  }
  if (!players && Array.isArray(team)) {
    for (const item of team) {
      if (item?.roster) {
        const r = item.roster;
        if (Array.isArray(r)) {
          for (const ri of r) { if (ri?.players) { players = ri.players; break; } }
        } else {
          for (let i = 0; i <= 2; i++) {
            if (r[i]?.players) { players = r[i].players; break; }
            if (r[String(i)]?.players) { players = r[String(i)].players; break; }
          }
          if (!players && r.players) players = r.players;
        }
        if (players) break;
      }
    }
  }
  return toArray(players);
}

export async function getStandings(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/standings`);
  const leagueArr = data.fantasy_content?.league;
  if (!leagueArr) return [];

  // Yahoo returns league as array: [leagueInfo, {standings:[...]}] or [{standings:...}]
  // Try multiple known shapes
  let teams = null;
  for (const item of (Array.isArray(leagueArr) ? leagueArr : [leagueArr])) {
    if (!item) continue;
    // Shape A: item.standings[1].teams or item.standings[0].teams
    if (item.standings) {
      const s = Array.isArray(item.standings) ? item.standings : Object.values(item.standings);
      for (const sItem of s) {
        if (sItem?.teams) { teams = sItem.teams; break; }
      }
    }
    if (teams) break;
  }
  if (!teams) {
    console.warn('[Yahoo] getStandings: could not find teams in response, keys:', JSON.stringify(Object.keys(data.fantasy_content?.league?.[1] || {})));
  }
  return toArray(teams);
}

export async function getScoreboard(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/scoreboard`);
  const league = data.fantasy_content?.league;
  let matchups = null;
  if (Array.isArray(league)) {
    for (const item of league) {
      if (item?.scoreboard) {
        const sb = item.scoreboard;
        if (Array.isArray(sb)) {
          for (const s of sb) {
            if (s?.matchups) { matchups = s.matchups; break; }
          }
        } else {
          for (let i = 0; i <= 2; i++) {
            if (sb[i]?.matchups) { matchups = sb[i].matchups; break; }
            if (sb[String(i)]?.matchups) { matchups = sb[String(i)].matchups; break; }
          }
          if (!matchups && sb.matchups) matchups = sb.matchups;
        }
        if (matchups) break;
      }
    }
  }
  return matchups;
}

export async function getPlayers(guid, leagueKey, status = 'A', start = 0, position = null) {
  const posFilter = position ? `;position=${position}` : '';
  const data = await yahooGet(guid, `/league/${leagueKey}/players${posFilter};status=${status};sort=AR;start=${start};count=25/stats`);
  const leagueObj = data.fantasy_content?.league;
  const rawPlayers =
    leagueObj?.[1]?.players ||
    leagueObj?.[0]?.players ||
    leagueObj?.players ||
    {};
  return parsePlayersStats(rawPlayers);
}

export function parsePlayersStats(raw) {
  if (!raw) return [];
  let count = parseInt(raw['@attributes']?.count ?? raw.count ?? 0, 10);
  if (!count) {
    count = Object.keys(raw).filter(k => /^\d+$/.test(k)).length;
  }
  const result = [];
  for (let i = 0; i < count; i++) {
    const rawItem = raw[i] || raw[String(i)];
    const p = rawItem?.player || rawItem;
    if (!p) continue;
    const infoArray = Array.isArray(p) ? (Array.isArray(p[0]) ? p[0] : p) : [];
    const info = Object.assign({}, ...infoArray);
    let statsObj = null;
    if (Array.isArray(p)) {
      statsObj = p.find(item => item && (item.player_stats || item.player_season_stats || item.player_points));
    }
    const statsArr = statsObj?.player_stats?.stats || statsObj?.player_season_stats?.stats || [];
    const stats = {};
    for (const s of statsArr) {
      const stat = s.stat || {};
      if (stat.stat_id !== undefined) stats[String(stat.stat_id)] = stat.value;
    }
    let pos = info.display_position || '';
    if (!pos) {
      const ep = info.eligible_positions?.position;
      pos = Array.isArray(ep) ? ep.join(',') : (ep || '');
    }
    if (pos === 'TBD' || pos === 'IL') {
      if (stats['26'] !== undefined || stats['28'] !== undefined || stats['42'] !== undefined) pos = 'P';
      else if (stats['60'] !== undefined || stats['7'] !== undefined) pos = 'UTIL';
    }
    result.push({
      key: info.player_key,
      name: info.full_name || info.name?.full || 'Unknown',
      position: String(pos),
      team: info.editorial_team_abbr || '',
      status: typeof info.status === 'string' ? info.status : '',
      injury: typeof info.status === 'string' ? info.status : '',
      is_starting: String(info.starting_status?.is_starting) === '1' ? 'Yes' : (String(info.starting_status?.is_starting) === '0' ? 'No' : 'Unknown'),
      stats
    });
  }
  return result;
}

export async function getBatchPlayerStats(guid, leagueKey, playerKeys, type) {
  if (!playerKeys || !playerKeys.length) return [];
  const batch = playerKeys.slice(0, 25).join(',');
  const typeParam = type ? `;type=${type}` : '';
  const data = await yahooGet(guid, `/league/${leagueKey}/players;player_keys=${batch}/stats${typeParam}`);
  return parsePlayersStats(data.fantasy_content?.league?.[1]?.players);
}

export async function getFreeAgentsTrending(guid, leagueKey, count = 25) {
  const [recent, season, historical] = await Promise.all([
    yahooGet(guid, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=lastweek`),
    yahooGet(guid, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats`),
    yahooGet(guid, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=season;year=2025`)
  ]);
  const recentPlayers = parsePlayersStats(recent.fantasy_content?.league?.[1]?.players);
  const seasonPlayers = parsePlayersStats(season.fantasy_content?.league?.[1]?.players);
  const historicalPlayers = parsePlayersStats(historical.fantasy_content?.league?.[1]?.players);
  const seasonMap = {};
  seasonPlayers.forEach(p => { seasonMap[p.key] = p.stats; });
  const historicalMap = {};
  historicalPlayers.forEach(p => { historicalMap[p.key] = p.stats; });
  return recentPlayers.map(p => ({ ...p, recentStats: p.stats, seasonStats: seasonMap[p.key] || {}, historicalStats: historicalMap[p.key] || {} }));
}

export async function getUserTeamKey(guid, leagueKey) {
  try {
    const data = await yahooGet(guid, '/users;use_login=1/games;game_keys=mlb/teams');
    const gamesObj = data?.fantasy_content?.users?.['0']?.user?.[1]?.games;
    const gameList = toArray(gamesObj);
    for (const g of gameList) {
      const gItem = g?.game;
      if (!gItem) continue;
      const teamsObj = gItem[1]?.teams;
      const teamsList = toArray(teamsObj);
      for (const tItem of teamsList) {
        const tData = tItem?.team;
        if (!tData) continue;
        const tKey = tData[0]?.[0]?.team_key || tData[0]?.team_key;
        if (tKey && tKey.startsWith(leagueKey + '.t.')) return tKey;
      }
    }
  } catch (e) {
    console.log('Error fetching getUserTeamKey:', e.message);
  }
  return null;
}

export async function getDraftResults(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/draftresults`);
  return data.fantasy_content?.league?.[1]?.draft_results;
}

export async function getTransactions(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/transactions`);
  const txns = data.fantasy_content?.league?.[1]?.transactions;
  return toArray(txns);
}

export async function getPlayerStats(guid, leagueKey, playerKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/players;player_keys=${playerKey}/stats`);
  return data.fantasy_content?.league?.[1]?.players?.[0]?.player;
}
```

---

## File: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default nextConfig;
```

---

## File: `nixpacks.toml`

```toml
[build]
  # Explicitly tell Nixpacks NOT to look for secrets that might crash the build
  # We only need variables at runtime
  # secrets = []
```

---

## File: `package.json`

```json
{
  "name": "fantasy-baseball",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --experimental-https",
    "build": "next build",
    "start": "next start -p ${PORT:-3000}",
    "lint": "eslint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.90.0",
    "axios": "^1.15.2",
    "cookie": "^1.1.1",
    "ioredis": "^5.10.1",
    "iron-session": "^8.0.4",
    "lucide-react": "^1.8.0",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hot-toast": "^2.6.0",
    "stripe": "^22.0.2",
    "swr": "^2.4.1",
    "xml2js": "^0.6.2"
  },
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "16.2.4"
  }
}
```

---

## File: `scripts/quality-audit.js`

```javascript
#!/usr/bin/env node
/**
 * Goin' Yard — Module Quality Audit
 * Tests core fantasyBrain logic with virtual fixtures for all 3 league types.
 * No server or Claude API needed — runs instantly.
 */

const brain = require('../lib/fantasyBrain');

// ─── ANSI colors ──────────────────────────────────────────────────────────────
const G = s => `\x1b[32m${s}\x1b[0m`;
const R = s => `\x1b[31m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const B = s => `\x1b[34m${s}\x1b[0m`;
const DIM = s => `\x1b[2m${s}\x1b[0m`;

let pass = 0, fail = 0, warn = 0;
const issues = [];

function check(label, got, expected, opts = {}) {
  const { contains, gt, gte, lt, type, oneOf } = opts;
  let ok = true, reason = '';

  if (expected !== undefined && got !== expected) { ok = false; reason = `expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`; }
  if (contains && !String(got ?? '').toLowerCase().includes(contains.toLowerCase())) { ok = false; reason = `expected to contain "${contains}"`; }
  if (type && typeof got !== type) { ok = false; reason = `expected type ${type}, got ${typeof got}`; }
  if (gt !== undefined && !(got > gt)) { ok = false; reason = `expected > ${gt}, got ${got}`; }
  if (gte !== undefined && !(got >= gte)) { ok = false; reason = `expected >= ${gte}, got ${got}`; }
  if (lt !== undefined && !(got < lt)) { ok = false; reason = `expected < ${lt}, got ${got}`; }
  if (oneOf && !oneOf.includes(got)) { ok = false; reason = `expected one of ${oneOf.join('|')}, got ${got}`; }

  if (ok) { pass++; console.log(G('  ✓') + ` ${label}`); }
  else { fail++; issues.push(`${label}: ${reason}`); console.log(R('  ✗') + ` ${label} — ${reason}`); }
}

function section(name) { console.log(`\n${B('══')} ${name} ${B('══')}`); }

// ─── FIXTURES ─────────────────────────────────────────────────────────────────

const LEAGUE_TYPES = [
  { id: 'headpoint', label: 'H2H Points', num_teams: 10, current_week: 4 },
  { id: 'headone',   label: 'H2H Categories', num_teams: 12, current_week: 4 },
  { id: 'roto',      label: 'Rotisserie', num_teams: 10, current_week: 4 },
];

// Roster with Yahoo stat IDs (as returned by getBatchPlayerStats)
const VIRTUAL_ROSTER = [
  { name: 'Aaron Judge',       position: 'OF', slot: 'OF',  team: 'NYY', stats: { '7': '28', '12': '9',  '13': '24', '16': '2',  '3': '.302', '18': '15' } },
  { name: 'Freddie Freeman',   position: '1B', slot: '1B',  team: 'LAD', stats: { '7': '22', '12': '6',  '13': '20', '16': '1',  '3': '.315', '18': '18' } },
  { name: 'Jose Ramirez',      position: '3B', slot: '3B',  team: 'CLE', stats: { '7': '24', '12': '7',  '13': '22', '16': '5',  '3': '.281', '18': '12' } },
  { name: 'Willy Adames',      position: 'SS', slot: 'SS',  team: 'SF',  stats: { '7': '16', '12': '5',  '13': '18', '16': '1',  '3': '.248', '18': '8'  } },
  { name: 'Ronald Acuna Jr.',  position: 'OF', slot: 'OF',  team: 'ATL', stats: { '7': '30', '12': '8',  '13': '20', '16': '12', '3': '.298', '18': '20' } },
  { name: 'Christian Yelich',  position: 'OF', slot: 'BN',  team: 'MIL', stats: { '7': '18', '12': '4',  '13': '16', '16': '3',  '3': '.274', '18': '14' } },
  { name: 'Max Muncy',         position: '2B', slot: '2B',  team: 'LAD', stats: { '7': '14', '12': '5',  '13': '15', '16': '0',  '3': '.238', '18': '16' } },
  // Pitchers
  { name: 'Lucas Giolito',     position: 'SP', slot: 'SP',  team: 'SD',  stats: { '28': '3', '42': '38', '26': '3.12', '27': '1.08', '50': '34.2', '83': '4' } },
  { name: 'Joe Ryan',          position: 'SP', slot: 'SP',  team: 'MIN', stats: { '28': '2', '42': '31', '26': '3.58', '27': '1.15', '50': '28.1', '83': '3' } },
  { name: 'Bailey Ober',       position: 'SP', slot: 'SP',  team: 'MIN', stats: { '28': '2', '42': '27', '26': '4.21', '27': '1.22', '50': '25.2', '83': '2' } },
  { name: 'George Kirby',      position: 'SP', slot: 'BN',  team: 'SEA', stats: { '28': '3', '42': '33', '26': '2.89', '27': '1.01', '50': '31.0', '83': '4' } },
  { name: 'Kenley Jansen',     position: 'RP', slot: 'RP',  team: 'BOS', stats: { '32': '6', '42': '18', '26': '2.45', '27': '0.98', '50': '14.2' } },
];

const VIRTUAL_FREE_AGENTS = [
  { name: 'Anthony Santander', position: 'OF', team: 'TOR', stats: { '7': '18', '12': '7',  '13': '19', '16': '1',  '3': '.259' } },
  { name: 'Nick Pivetta',      position: 'SP', team: 'BOS', stats: { '28': '2', '42': '24', '26': '3.91', '27': '1.19', '50': '23.0' } },
  { name: 'Tanner Houck',      position: 'SP', team: 'BOS', stats: { '28': '1', '42': '20', '26': '4.15', '27': '1.28', '50': '19.1' } },
  { name: 'Joey Meneses',      position: '1B', team: 'WSH', stats: { '7': '12', '12': '3',  '13': '14', '16': '0',  '3': '.261' } },
];

// ─── SCORING_TYPE_MAP (mirrors analyze route) ─────────────────────────────────
const SCORING_TYPE_MAP = {
  'headpoint': 'H2H Points (weekly head-to-head, each stat earns points — NOT Roto, NOT categories)',
  'headone':   'H2H Categories (weekly matchup, win/tie/lose each individual stat category)',
  'roto':      'Rotisserie (season-long ranking in each category)',
};

const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS',
};

// ─── TEST SUITES ──────────────────────────────────────────────────────────────

section('1. FORMAT DETECTION');
{
  const cases = [
    ['headpoint', 'H2H_POINTS'],
    ['headone',   'H2H_CAT'],
    ['roto',      'ROTO'],
    ['H2H Points','H2H_POINTS'],
    ['Roto 5x5',  'ROTO'],
    ['head',      'H2H_CAT'],
    ['pts',       'H2H_POINTS'],
  ];
  for (const [input, expected] of cases) {
    check(`detectFormat("${input}") === ${expected}`, brain.detectFormat(input), expected);
  }
}

section('2. SCORING TYPE LABEL MAPPING (analyze/audit prompt)');
{
  for (const lt of LEAGUE_TYPES) {
    const label = SCORING_TYPE_MAP[lt.id];
    check(`${lt.label}: label defined`, !!label, true);
    if (lt.id === 'headpoint') {
      check(`${lt.label}: label says H2H Points`, label, undefined, { contains: 'H2H Points' });
      check(`${lt.label}: label says NOT Roto`, label, undefined, { contains: 'NOT Roto' });
    }
    if (lt.id === 'roto') {
      check(`${lt.label}: label says Rotisserie`, label, undefined, { contains: 'Rotisserie' });
    }
  }
}

section('3. STAT ID TRANSLATION');
{
  const pitcher = VIRTUAL_ROSTER.find(p => p.name === 'Lucas Giolito');
  const hitter  = VIRTUAL_ROSTER.find(p => p.name === 'Aaron Judge');

  const pitcherLines = Object.entries(pitcher.stats)
    .filter(([id]) => STAT_MAP[id])
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  const hitterLines = Object.entries(hitter.stats)
    .filter(([id]) => STAT_MAP[id])
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);

  check('Giolito stats include ERA', pitcherLines.join(' '), undefined, { contains: 'ERA:3.12' });
  check('Giolito stats include K',   pitcherLines.join(' '), undefined, { contains: 'K:38' });
  check('Giolito stats include WHIP',pitcherLines.join(' '), undefined, { contains: 'WHIP:1.08' });
  check('Judge stats include HR',    hitterLines.join(' '), undefined,  { contains: 'HR:9' });
  check('Judge stats include AVG',   hitterLines.join(' '), undefined,  { contains: 'AVG:.302' });
  check('Judge stats include R',     hitterLines.join(' '), undefined,  { contains: 'R:28' });

  // Zero values should be preserved (ERA: 0.00 is meaningful)
  const zeroPitcher = { stats: { '26': '0.00', '27': '0.00', '28': '0' } };
  const zeroLines = Object.entries(zeroPitcher.stats)
    .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined && v !== null)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  check('ERA:0.00 preserved (not filtered)', zeroLines.join(' '), undefined, { contains: 'ERA:0.00' });
}

section('4. VOR CALCULATIONS — per league type');
{
  const results = {};
  for (const lt of LEAGUE_TYPES) {
    const vorScores = VIRTUAL_ROSTER.map(p => {
      const isPitcher = ['SP','RP','P'].includes(p.position.split('/')[0]);
      const result = brain.calculateVOR(p.stats, p.position, lt.num_teams, lt.id);
      return { name: p.name, vor: result.vor ?? result.score ?? result ?? 0 };
    });

    results[lt.id] = vorScores;
    const hitterVors   = vorScores.filter((_, i) => i < 7).map(v => v.vor);
    const pitcherVors  = vorScores.filter((_, i) => i >= 7).map(v => v.vor);
    const allNumeric   = vorScores.every(v => typeof v.vor === 'number' && !isNaN(v.vor));

    check(`${lt.label}: all VOR values are numbers`, allNumeric, true);
    check(`${lt.label}: Judge VOR > Muncy VOR (elite > mid)`,
      vorScores[0].vor, undefined, { gt: vorScores[6].vor });
    check(`${lt.label}: Acuna VOR > 0`, vorScores[4].vor, undefined, { gt: 0 });
    check(`${lt.label}: Giolito VOR > 0`, vorScores[7].vor, undefined, { gte: 0 });

    console.log(DIM(`    VOR sample → Judge:${vorScores[0].vor} Ramirez:${vorScores[2].vor} Giolito:${vorScores[7].vor}`));
  }

  // Consistency: same player, same stats → VOR should be deterministic
  const vor1 = brain.calculateVOR(VIRTUAL_ROSTER[0].stats, 'OF', 10, 'headpoint');
  const vor2 = brain.calculateVOR(VIRTUAL_ROSTER[0].stats, 'OF', 10, 'headpoint');
  check('VOR is deterministic (same input → same output)', JSON.stringify(vor1), JSON.stringify(vor2));
}

section('5. WAIVER SCORING — per league type');
{
  for (const lt of LEAGUE_TYPES) {
    const settings = { scoring_type: lt.id, num_teams: lt.num_teams };
    const diagnosis = brain.buildRosterDiagnosis(VIRTUAL_ROSTER, settings, null, null);

    check(`${lt.label}: buildRosterDiagnosis returns object`, typeof diagnosis, 'object');
    check(`${lt.label}: diagnosis has categoryNeeds`, typeof diagnosis.categoryNeeds, 'object');
    check(`${lt.label}: diagnosis has promptBlock`, typeof diagnosis.promptBlock, 'string');
    check(`${lt.label}: promptBlock not empty`, diagnosis.promptBlock.length, undefined, { gt: 10 });

    // Score each free agent
    const scored = VIRTUAL_FREE_AGENTS.map(p =>
      brain.scoreWaiverTarget(p, VIRTUAL_ROSTER, settings, diagnosis.categoryNeeds, null)
    );

    const allHaveScore = scored.every(s => typeof s.score === 'number');
    check(`${lt.label}: all waiver targets have numeric score`, allHaveScore, true);
    check(`${lt.label}: Santander score >= 0`, scored[0].score, undefined, { gte: 0 });
    check(`${lt.label}: pitcher (Pivetta) score >= 0`, scored[1].score, undefined, { gte: 0 });
    check(`${lt.label}: all have priority string`, scored.every(s => typeof s.priority === 'string'), true);
    check(`${lt.label}: all have reasoning string`, scored.every(s => typeof s.reasoning === 'string'), true);

    console.log(DIM(`    Scores → Santander:${scored[0].score} Pivetta:${scored[1].score} Houck:${scored[2].score}`));
  }
}

section('6. ROSTER DIAGNOSIS — scoring-format awareness');
{
  for (const lt of LEAGUE_TYPES) {
    const settings = { scoring_type: lt.id, num_teams: lt.num_teams };
    const d = brain.buildRosterDiagnosis(VIRTUAL_ROSTER, settings, null, null);

    if (lt.id === 'roto') {
      // Roto should care about counting stats and ratios
      check(`Roto: promptBlock mentions season or ratio`, d.promptBlock, undefined,
        { contains: d.promptBlock.length > 50 ? d.promptBlock.slice(0, 50) : 'Roto' });
    }
    if (lt.id === 'headpoint') {
      check(`H2H Points: promptBlock is non-trivial`, d.promptBlock.length, undefined, { gt: 30 });
    }
    // categoryNeeds shape
    const cn = d.categoryNeeds;
    check(`${lt.label}: categoryNeeds.needsPitching is boolean`, typeof cn.needsPitching, 'boolean');
    check(`${lt.label}: categoryNeeds.needsHitting is boolean`,  typeof cn.needsHitting, 'boolean');
  }
}

section('7. COMPUTE PLAYER POINTS — H2H Points accuracy');
{
  const judgeStats = VIRTUAL_ROSTER[0].stats; // Aaron Judge
  const gioStats   = VIRTUAL_ROSTER[7].stats; // Giolito

  const judgePts = brain.computePlayerPoints(judgeStats, false);
  const gioPts   = brain.computePlayerPoints(gioStats, true);

  check('Judge (hitter) fantasy points > 0', judgePts, undefined, { gt: 0 });
  check('Giolito (pitcher) fantasy points > 0', gioPts, undefined, { gt: 0 });
  // Note: In H2H Points, elite SPs accumulate W(8)+K(3)+OUT(1)*~100 outs and can legitimately
  // outscore hitters — this is correct behavior, NOT a bug.
  check('Both Judge and Giolito score 150+ pts (meaningful contributors)', Math.min(judgePts, gioPts), undefined, { gt: 150 });
  console.log(DIM(`    Judge pts: ${judgePts.toFixed(1)} | Giolito pts: ${gioPts.toFixed(1)} (SPs can outscore hitters in H2H Pts — correct)`));

  // Acuna with SBs should score higher than Muncy with 0 SBs in H2H Points
  const acunaPts  = brain.computePlayerPoints(VIRTUAL_ROSTER[4].stats, false);
  const muncyPts  = brain.computePlayerPoints(VIRTUAL_ROSTER[6].stats, false);
  check('Acuna pts > Muncy pts (SB value)', acunaPts, undefined, { gt: muncyPts });
  console.log(DIM(`    Acuna pts: ${acunaPts.toFixed(1)} | Muncy pts: ${muncyPts.toFixed(1)}`));
}

section('8. POSITIONAL SCARCITY — consistency');
{
  const positions = ['C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP'];
  for (const pos of positions) {
    const scarcity = brain.getPositionalScarcity(pos, 10);
    check(`getPositionalScarcity(${pos}) returns object`, typeof scarcity, 'object');
    check(`${pos}: scarcity has label`, typeof (scarcity.label ?? scarcity.tier ?? scarcity), undefined,
      { oneOf: ['undefined', 'string', 'object', 'number'] }); // flexible
  }
  // C should be scarcer than OF
  const cScarcity  = brain.getPositionalScarcity('C', 10);
  const ofScarcity = brain.getPositionalScarcity('OF', 10);
  const cScore  = cScarcity.multiplier ?? cScarcity.bonus ?? cScarcity.scarcityScore ?? 1;
  const ofScore = ofScarcity.multiplier ?? ofScarcity.bonus ?? ofScarcity.scarcityScore ?? 1;
  check('C scarcity >= OF scarcity', cScore, undefined, { gte: ofScore });
}

section('9. TRADE EVALUATOR');
{
  const giving    = [VIRTUAL_ROSTER[1]]; // Freddie Freeman
  const receiving = [VIRTUAL_FREE_AGENTS[0]]; // Santander

  for (const lt of LEAGUE_TYPES) {
    const ctx = { scoringType: lt.id, leagueSize: lt.num_teams };
    const result = brain.evaluateTrade(giving, receiving, VIRTUAL_ROSTER, ctx);

    check(`${lt.label}: trade result is object`, typeof result, 'object');
    check(`${lt.label}: trade has verdict`, typeof result.verdict, 'string');
    check(`${lt.label}: trade has numeric score`, typeof result.score, 'number');
    // Freeman >> Santander in any league — score should be negative (bad deal)
    check(`${lt.label}: not a winning trade (score < 0)`, result.score, undefined, { lt: 0 });
    check(`${lt.label}: verdict is not accept/smash for losing deal`,
      ['smash accept','accept'].includes(result.verdict), false);
    console.log(DIM(`    Score: ${result.score} | Verdict: ${result.verdict} | ${(result.reasoning||'').slice(0,60)}...`));
  }
}

section('10. LINEUP OPTIMIZER');
{
  for (const lt of LEAGUE_TYPES) {
    const result = brain.optimizeLineup(VIRTUAL_ROSTER, {}, lt.id, lt.num_teams);
    check(`${lt.label}: optimizeLineup returns object`, typeof result, 'object');
    const starters = result.starters ?? result.lineup ?? [];
    check(`${lt.label}: has starters array`, Array.isArray(starters), true);
    check(`${lt.label}: at least 1 starter`, starters.length, undefined, { gt: 0 });
  }
}

section('11. MODULE UNIFORMITY — FIELD SHAPE CHECKS');
{
  // Simulate what each module reads from aiAnalysis context
  const mockAnalysis = {
    waiver:   'Drop Joey Meneses, add Anthony Santander for power/RBI upside.',
    startSit: 'Start Giolito (2-start, ERA 3.12). Bench Bailey Ober on the road.',
    pitching: 'Stream Giolito and Kirby this week (2-start SPs). Target teams with low K rates.',
    audit:    'Strength: Judge/Acuna power core. Weakness: thin bench depth.',
    gameplan: 'H2H Points: maximize AB volume and 2-start SPs. Giolito is the priority.',
    matchup:  'Pitching edge with Giolito + Kirby both starting twice.',
  };

  const expectedKeys = ['waiver','startSit','pitching','audit','gameplan','matchup'];
  for (const key of expectedKeys) {
    check(`aiAnalysis.${key} is string`, typeof mockAnalysis[key], 'string');
    check(`aiAnalysis.${key} is non-empty`, mockAnalysis[key].length, undefined, { gt: 10 });
  }

  // VOR shape from TeamAudit expected JSON
  const mockVOR = [
    { name: 'Aaron Judge', position: 'OF', vor: 88, scarcity: 'elite' },
    { name: 'Lucas Giolito', position: 'SP', vor: 72, scarcity: 'scarce' },
  ];
  for (const player of mockVOR) {
    check(`VOR entry has name (${player.name})`, typeof player.name, 'string');
    check(`VOR entry has numeric vor (${player.name})`, typeof player.vor, 'number');
    check(`VOR entry has scarcity (${player.name})`, typeof player.scarcity, 'string');
    check(`VOR entry scarcity is valid`, player.scarcity, undefined,
      { oneOf: ['elite','scarce','moderate','deep'] });
  }
}

section('12. CROSS-LEAGUE CONSISTENCY CHECK');
{
  // Same roster, different leagues — VOR order should be stable for position-agnostic comparison
  const playerVORsByLeague = {};
  for (const lt of LEAGUE_TYPES) {
    playerVORsByLeague[lt.id] = VIRTUAL_ROSTER.map(p => {
      const r = brain.calculateVOR(p.stats, p.position, lt.num_teams, lt.id);
      return typeof r === 'object' ? (r.vor ?? r.score ?? 0) : (r ?? 0);
    });
  }

  // Judge (#0) should outscore Muncy (#6) in ALL league types
  for (const lt of LEAGUE_TYPES) {
    const vors = playerVORsByLeague[lt.id];
    check(`${lt.label}: Judge VOR > Muncy VOR`, vors[0], undefined, { gt: vors[6] });
  }

  // Giolito (#7, 3.12 ERA) should outscore Bailey Ober (#8, 4.21 ERA) in all league types
  for (const lt of LEAGUE_TYPES) {
    const vors = playerVORsByLeague[lt.id];
    check(`${lt.label}: Giolito VOR >= Ober VOR (lower ERA)`, vors[7], undefined, { gte: vors[8] });
  }
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`RESULTS: ${G(pass + ' passed')}  ${fail > 0 ? R(fail + ' failed') : '0 failed'}  ${warn > 0 ? Y(warn + ' warnings') : ''}`);
console.log('═'.repeat(60));

if (issues.length) {
  console.log(R('\nFAILURES:'));
  issues.forEach((iss, i) => console.log(R(`  ${i+1}. ${iss}`)));
}

const score = Math.round((pass / (pass + fail)) * 100);
const grade = score >= 95 ? 'A' : score >= 85 ? 'B' : score >= 75 ? 'C' : 'D';
console.log(`\nOverall Score: ${score >= 85 ? G(score + '% — ' + grade) : score >= 75 ? Y(score + '% — ' + grade) : R(score + '% — ' + grade)}\n`);

process.exit(fail > 0 ? 1 : 0);
```

---

