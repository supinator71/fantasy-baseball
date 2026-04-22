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
