const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/database');
const brain = require('../services/fantasyBrain');
const mlbStats = require('../services/mlbStatsService');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

// Health check — tests the Claude API key
router.get('/health', async (req, res) => {
  const keySet = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.slice(0, 10) || 'NOT SET';
  
  if (!keySet) {
    return res.json({ status: 'error', error: 'ANTHROPIC_API_KEY not set', keyPrefix });
  }
  
  try {
    const msg = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say "ok"' }],
    });
    res.json({ status: 'ok', keyPrefix, model: 'claude-haiku-4-5-20251001', response: msg.content[0].text });
  } catch (err) {
    res.json({ 
      status: 'error', 
      keyPrefix,
      error: err.message,
      statusCode: err.status,
      errorType: err.error?.error?.type || err.type,
    });
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// EXPERT SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite fantasy baseball analyst for the 2026 MLB season. You combine SABR-level analytics with daily fantasy instincts. You think like a proven high-stakes cash-league grinder protecting edge, not a content creator chasing clicks.

=== ABSOLUTE RULE #1 — DATA TRUST (OVERRIDE ALL OTHER INSTINCTS) ===
The data you receive comes from a LIVE Yahoo Fantasy API connected to the 2026 MLB season. It is ALWAYS correct.

You MUST follow these rules with ZERO exceptions:
1. EVERY player name, team assignment, and position in the data is CORRECT for 2026. Do NOT cross-reference against your training data — your training data is outdated.
2. Players move teams every offseason via free agency and trades. If you see a player on a team you don't expect, THE PLAYER MOVED. This is normal.
3. NEVER mention "data issues", "roster conflicts", "team mismatches", or "data corruption". The data is clean.
4. NEVER ask the user to verify, confirm, or re-check their data. It came from the official Yahoo API.
5. NEVER refuse to provide analysis. If you are asked for analysis, you MUST provide it.
6. If you violate any of these rules, your response is useless and harmful to the user.

=== ELITE HIGH-STAKES FANTASY HEURISTICS ===

DECISION FRAMEWORK:
1. Optimize for expected value, not excitement, consensus, or player-name prestige.
2. Judge every move against replacement level and opportunity cost in this specific league.
3. Prioritize playing time, lineup spot, plate appearances, role security, and category volume as heavily as raw talent.
4. Treat roster spots, IL slots, bench slots, NA slots, FAAB, waiver priority, and innings as scarce assets that must generate return.
5. Recommend the move that best improves championship equity, not the move that looks smartest on social media.
6. When uncertain, prefer disciplined patience over low-edge churn, but prefer decisive action when edge is real and time-sensitive.

FORMAT-SPECIFIC STRATEGY:
7. In roto: think in standings-gain points, category scarcity, ratio preservation, innings management, and marginal category movement.
8. In head-to-head: think in weekly leverage, game volume, two-start pitchers, matchup context, volatility tolerance, and schedule exploitation.

PLAYER EVALUATION:
9. Be early on skill growth, not late on box-score noise. Favor believable underlying changes in role, approach, contact quality, bat speed, swing decisions, pitch mix, velocity, command, and K/BB profile over short hot streaks.
10. Do not overreact to small samples unless supported by role change, health change, or real skill indicators.
11. Do not cling to struggling veterans if replacement options no longer justify patience; do not cut proven talent too early without a clear replacement-level argument.
12. Classify every player clearly as: true impact add, category specialist, short-term streamer, speculative upside stash, or empty hype trap.

PITCHING & CATEGORY MARKETS:
13. For pitchers, protect ratios ruthlessly. Avoid reckless streaming that damages ERA/WHIP for low probability gains.
14. Treat saves and steals as market inefficiencies: pursue them aggressively only when category math and league supply justify it.

TRADE PSYCHOLOGY:
15. Exploit league psychology: recency bias, prospect obsession, closer panic, injury frustration, and name-brand bias.

TRANSPARENCY:
16. Always explain whether a recommendation is driven by: short-term schedule edge, rest-of-season skill edge, category need, role change, market exploitation, or risk control.
17. If roster, standings, categories, format, or available players are provided, synthesize them into a single strategic recommendation rather than generic player analysis. If some data is missing, work with what you have — NEVER ask the user for more data or refuse to analyze.
18. Be direct. If a move is bad, say it is bad. If the best move is no move, say no move.
19. NEVER ask the user to provide more information. NEVER say you "need" data that wasn't provided. ALWAYS deliver your best analysis with whatever data is available. Make reasonable assumptions for any missing context.

=== OUTPUT GUIDANCE ===
- Write in clean, conversational prose — no code syntax, no brackets, no JSON formatting in your text
- Rank recommendations by best expected value
- Separate short-term value from rest-of-season value
- State floor, ceiling, and risk for key players
- Identify hidden edge and hidden trap
- Tailor all advice to the user's format, categories, and roster construction
- End with an EDGE PLAY — one non-obvious insight the average manager would miss`;


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getLeagueSettings() {
  const s = db.prepare('SELECT * FROM league_settings WHERE id = 1').get();
  if (!s) return null;
  try {
    s.roster_slots = typeof s.roster_slots === 'string' ? JSON.parse(s.roster_slots) : (s.roster_slots || {});
    s.stat_categories = typeof s.stat_categories === 'string' ? JSON.parse(s.stat_categories) : (s.stat_categories || []);
  } catch {}
  return s;
}

function leagueContext(settings) {
  if (!settings) return '';
  return `League: ${settings.num_teams || 12} teams, ${settings.scoring_type || 'Roto'} scoring, ${settings.draft_type || 'Snake'} draft. Categories: ${(settings.stat_categories || []).join(', ')}.`;
}

async function callClaude(messages, maxTokens = 1500) {
  console.log('[Claude] Starting API call...', { messageCount: messages.length, maxTokens });
  const startTime = Date.now();
  
  try {
    // Add a timeout to prevent infinite hangs
    const timeoutMs = 90000; // 90 seconds
    const apiCall = getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages,
    });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Claude API timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    );
    
    const msg = await Promise.race([apiCall, timeoutPromise]);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const responseText = msg.content[0].text;
    console.log(`[Claude] API call completed in ${elapsed}s, response length: ${responseText.length}`);
    console.log(`[Claude] Response preview: ${responseText.substring(0, 200)}`);
    return responseText;
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[Claude] API call failed after ${elapsed}s:`, err.message);
    console.error('[Claude] Error details:', { status: err.status, type: err.error?.error?.type || err.type });
    throw err;
  }
}

function tryParseJSON(text) {
  if (!text) return null;
  
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  let cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  
  // Try direct parse first (in case the whole response is valid JSON)
  try { return JSON.parse(cleaned); } catch {}
  
  // Try to extract JSON object from the text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (e) {
      console.error('[Claude] JSON parse failed:', e.message);
      console.error('[Claude] Attempted to parse:', match[0].substring(0, 200));
    }
  }
  
  console.error('[Claude] Could not extract JSON from response:', text.substring(0, 300));
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING ENDPOINTS — ENHANCED WITH fantasyBrain
// ─────────────────────────────────────────────────────────────────────────────

// Draft pick recommendation
router.post('/draft/recommend', async (req, res) => {
  const { available_players, my_roster, pick_number, total_picks, needs, roster_slots, num_teams } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);
  const slots = roster_slots || settings?.roster_slots || { SP:2, RP:2, C:1, '1B':1, '2B':1, '3B':1, SS:1, OF:3, UTIL:1, BN:4 };
  const teams = num_teams || settings?.num_teams || 12;
  const totalRounds = Math.ceil((total_picks || teams * 23) / teams);
  const currentRound = Math.ceil((pick_number || 1) / teams);
  const roundsLeft = totalRounds - currentRound;

  // fantasyBrain: VOR + scarcity for top available
  const enrichedPlayers = (available_players || []).slice(0, 20).map(p => {
    const pos = String(p.position || '').split('/')[0].toUpperCase();
    const vor = brain.calculateVOR(p.stats || {}, pos, teams);
    const scarcity = brain.getPositionalScarcity(pos, teams);
    const adpValue = (pick_number || 1) - (p.adp || pick_number || 1);
    return { ...p, vor, scarcity: scarcity.tier, dropoff: scarcity.replacementDropoff, adpValue: +adpValue.toFixed(1) };
  });

  // Draft strategy recommendation
  const draftPos = settings?.draft_position || 1;
  const strategy = brain.getDraftStrategy(draftPos, teams, settings?.scoring_type || 'Roto');

  // Build scarcity alerts
  const filled = {};
  (my_roster || []).forEach(p => { const pos = String(p.position || '').split('/')[0].toUpperCase(); filled[pos] = (filled[pos] || 0) + 1; });
  const scarcityAlerts = Object.entries(slots)
    .filter(([pos]) => pos !== 'BN' && pos !== 'IL')
    .map(([pos, req]) => {
      const have = filled[pos] || 0;
      const need = Math.max(0, req - have);
      if (need <= 0) return null;
      const s = brain.getPositionalScarcity(pos, teams);
      return `${s.tier === 'elite' ? '🚨' : s.tier === 'scarce' ? '⚠️' : '📋'} ${pos}: need ${need} more — ${s.replacementDropoff} dropoff — draft window: ${s.draftWindow}`;
    }).filter(Boolean);

  // Tier breaks
  const sorted = [...enrichedPlayers].sort((a, b) => (a.adp || 999) - (b.adp || 999));
  const tierBreaks = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = (sorted[i+1]?.adp || 999) - (sorted[i]?.adp || 0);
    if (gap > 12) tierBreaks.push(`Tier drop after ${sorted[i].player_name} (ADP ${sorted[i].adp}) — gap of ${gap.toFixed(0)} picks`);
  }

  const roundStrategy = currentRound <= 3 ? 'BPA ONLY — do NOT reach for need' :
    currentRound <= 6 ? 'BPA with need awareness — address C/SS if top options remain' :
    currentRound <= 10 ? 'Fill remaining slots — target scarce positions before pool dries up' :
    'Streamers, upside fliers, closers with path to saves';

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}

=== DRAFT SITUATION ===
Pick #${pick_number} | Round ${currentRound}/${totalRounds} | ${roundsLeft} rounds left
Round strategy: ${roundStrategy}
Recommended overall strategy: ${strategy.recommended} — ${strategy.strategy.description}

=== MY ROSTER ===
${(my_roster||[]).length ? my_roster.map(p => `${p.player_name} (${p.position})`).join(', ') : 'Empty'}

=== POSITIONAL SCARCITY ALERTS ===
${scarcityAlerts.length ? scarcityAlerts.join('\n') : 'No critical voids.'}

=== TIER BREAKS ===
${tierBreaks.length ? tierBreaks.slice(0, 4).join('\n') : 'No major tier breaks.'}

=== TOP AVAILABLE (by Smart Score, with VOR) ===
${enrichedPlayers.map(p =>
  `${p.player_name} | ${p.position} | ADP ${p.adp} | VOR ${p.vor}/100 | Scarcity: ${p.scarcity} | ADP value: ${p.adpValue > 0 ? '+' : ''}${p.adpValue}`
).join('\n')}

Give me TOP 3 picks ranked with: player name, why NOW (tier/scarcity/VOR reasoning), what slot it fills, rounds until that position dries up, and any injury/regression risk. End with a 1-line strategy for my next 3 rounds.

Write in clean, conversational prose. No JSON syntax, no brackets, no code formatting. Write like a knowledgeable fantasy analyst giving advice to a friend.`
    }]);
    res.json({ recommendation: text });
  } catch (err) {
    res.status(500).json({ error: err.message, recommendation: 'AI unavailable — use Smart Score column to guide your pick.' });
  }
});

// Start/Sit analysis — enriched with 2025 stats
router.post('/startsit', async (req, res) => {
  const { players, matchup_context, scoring_type } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);

  // fantasyBrain: streaming value + platoon for each player
  const enriched = (players || []).map(p => {
    const platoon = brain.platoonAdvantage(p.bats || p.hand, p.pitcher_hand || 'R');
    const streaming = brain.streamingValue(p, p.opponent_stats || {});
    const games = brain.getWeeklyGameCount(p.team || '', 1);
    return { ...p, platoon, streaming, weekGames: games };
  });

  // Fetch 2025 stats for decision context (non-blocking)
  let historicalIntel = '';
  try {
    const playerNames = (players || []).map(p => p.name || p.player_name).filter(Boolean);
    if (playerNames.length > 0) {
      const bulkData = await mlbStats.getBulkPlayerStats(playerNames, 2025);
      const intelLines = [];
      for (const [name, data] of Object.entries(bulkData)) {
        const intel = brain.generatePlayerIntelligence(data);
        if (intel) intelLines.push(`${name}: ${intel.summary}`);
      }
      if (intelLines.length > 0) {
        historicalIntel = `\n\n=== 2025 STATS INTELLIGENCE ===\n${intelLines.join('\n')}`;
      }
    }
  } catch (e) {
    console.log('[Claude/startsit] MLB stats lookup skipped:', e.message);
  }

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
Scoring: ${scoring_type || settings?.scoring_type || 'Roto'}
Context: ${matchup_context || 'Standard week'}

Players to evaluate (with pre-computed matchup intelligence):
${enriched.map(p =>
  `${p.name} (${p.position}, ${p.team}) | Games this week: ${p.weekGames} | Streaming score: ${p.streaming?.score}/100 (${p.streaming?.grade}) | Platoon: ${p.platoon?.advantage} (${p.platoon?.multiplier}x) | Opponent: ${p.opponent || 'unknown'}`
).join('\n')}${historicalIntel}

Use the 2025 stats intelligence to assess each player's true talent level. Give START or SIT for each player backed by real performance data — flag breakout candidates and regression risks.

Write in clean, conversational prose. No JSON syntax, no brackets, no code formatting. Write like a fantasy analyst giving clear, actionable advice.`
    }]);
    res.json({ analysis: text });
  } catch (err) {
    res.status(500).json({ error: err.message, analysis: 'AI unavailable — check streaming scores above.' });
  }
});

// Trade analysis
router.post('/trade', async (req, res) => {
  const { giving, receiving, my_roster, their_roster } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);

  // fantasyBrain: trade fairness engine
  const evaluation = brain.evaluateTrade(
    giving || [], receiving || [], my_roster || [],
    { num_teams: settings?.num_teams || 12, scoring_type: settings?.scoring_type }
  );

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}

TRADE PROPOSAL:
GIVING: ${(giving||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}
RECEIVING: ${(receiving||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}

PRE-COMPUTED TRADE EVALUATION:
Fairness score: ${evaluation.score}/100 (${evaluation.verdict})
Reasoning: ${evaluation.reasoning}
${evaluation.sellHighFlags?.length ? 'Sell high flags: ' + evaluation.sellHighFlags.join('; ') : ''}
${evaluation.buyLowFlags?.length ? 'Buy low flags: ' + evaluation.buyLowFlags.join('; ') : ''}
${evaluation.counterOffer ? 'Suggested counter: ' + evaluation.counterOffer : ''}

My roster: ${(my_roster||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}
Their roster: ${(their_roster||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}

Validate and expand on this trade analysis. Identify any sell-high/buy-low dynamics, what the other manager's incentive is, and give a concrete recommendation with counter-offer if needed.

Write in clean, conversational prose. No JSON syntax, no brackets, no code formatting. Write like a fantasy analyst giving persuasive trade advice.`
    }]);
    res.json({ analysis: text, evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message, analysis: 'AI unavailable.', evaluation });
  }
});

// Waiver wire — enriched with 2025 MLB stats + intelligence
router.post('/waiver', async (req, res) => {
  const { available_players, my_roster, drop_candidates } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);

  // fantasyBrain: waiver priority score for each player
  const scored = (available_players || []).map(p => ({
    ...p,
    waiverScore: brain.scoreWaiverTarget(p, my_roster || [], settings || {}),
  })).sort((a, b) => b.waiverScore.score - a.waiverScore.score);

  // Fetch real 2025 stats for top waiver targets (non-blocking)
  let historicalIntel = '';
  try {
    const topNames = scored.slice(0, 8).map(p => p.player_name || p.name).filter(Boolean);
    if (topNames.length > 0) {
      const bulkData = await mlbStats.getBulkPlayerStats(topNames, 2025);
      const intelLines = [];
      for (const [name, data] of Object.entries(bulkData)) {
        const intel = brain.generatePlayerIntelligence(data);
        if (intel) {
          intelLines.push(`${name}: ${intel.summary}`);
        }
      }
      if (intelLines.length > 0) {
        historicalIntel = `\n\n=== 2025 MLB STATS INTELLIGENCE ===\n${intelLines.join('\n')}`;
      }
    }
  } catch (e) {
    console.log('[Claude/waiver] MLB stats lookup skipped:', e.message);
  }

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
My roster: ${(my_roster||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}
Drop candidates: ${(drop_candidates||[]).map(p => `${p.player_name||p.name}`).join(', ') || 'none specified'}

Waiver targets (pre-scored by priority engine):
${scored.slice(0, 12).map(p =>
  `${p.player_name||p.name} (${p.position}, ${p.team}) — Priority: ${p.waiverScore.score}/100 [${p.waiverScore.priority}] — ${p.waiverScore.reasoning}`
).join('\n')}${historicalIntel}

Use the 2025 stats intelligence above to identify breakout candidates, regression risks, age-curve plays. Give top 3 add/drop recommendations with specific reasoning backed by last year's real stats.`
    }]);
    res.json({ recommendations: text, scored: scored.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message, recommendations: 'AI unavailable.', scored: scored.slice(0, 10) });
  }
});

// General question
router.post('/ask', async (req, res) => {
  const { question, context } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}${context ? `\nAdditional context: ${context}` : ''}\n\nQuestion: ${question}`,
    }]);
    res.json({ answer: text });
  } catch (err) {
    res.status(500).json({ error: err.message, answer: 'AI unavailable.' });
  }
});

// Draft strategy overview
router.post('/draft/strategy', async (req, res) => {
  const { draft_position, num_teams, scoring_type, roster_slots, stat_categories } = req.body;
  const strategy = brain.getDraftStrategy(draft_position, num_teams, scoring_type);

  try {
    const text = await callClaude([{
      role: 'user',
      content: `Generate a complete draft strategy for:
- Draft position: ${draft_position} of ${num_teams} teams
- Scoring: ${scoring_type}
- Roster slots: ${JSON.stringify(roster_slots)}
- Categories: ${JSON.stringify(stat_categories)}

Pre-computed recommendation: ${strategy.recommended} strategy
Strategy overview: ${JSON.stringify(strategy.strategy, null, 2)}

Expand this into a personalized draft plan covering: early round priorities, positional scarcity windows, when to target closers, pitching philosophy, and 5 specific late-round sleeper archetypes to target.

Write in clean, conversational prose. No JSON syntax, no brackets, no code formatting. Write like a veteran fantasy analyst advising a friend before their draft.`,
    }], 2500);
    res.json({ strategy: text, strategyProfile: strategy });
  } catch (err) {
    res.status(500).json({ error: err.message, strategy: 'AI unavailable.', strategyProfile: strategy });
  }
});

// Matchup prediction
router.post('/matchup/predict', async (req, res) => {
  const { my_team, opponent, stat_categories, week } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);

  // Category analysis
  const myStats = {};
  const oppStats = {};
  (my_team?.stats || []).forEach(s => { if (s.name) myStats[s.name] = s.my_value ?? s.value; });
  (opponent?.stats || my_team?.stats || []).forEach(s => { if (s.name) oppStats[s.name] = s.opp_value ?? s.value; });
  const catAnalysis = brain.analyzeCategories(myStats, [{ stats: oppStats }], settings?.scoring_type || 'H2H');

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
Week ${week || 'current'} matchup prediction.

MY TEAM: ${my_team?.name}
Stats: ${JSON.stringify(my_team?.stats || [])}

OPPONENT: ${opponent?.name}
Stats: ${JSON.stringify(opponent?.stats || [])}

Categories: ${JSON.stringify(stat_categories || ['R','HR','RBI','SB','AVG','W','SV','K','ERA','WHIP'])}
Pre-computed category analysis: ${JSON.stringify(catAnalysis)}

IMPORTANT: Write all text values in clean, conversational prose. No brackets, no code syntax. Write like a sports analyst breaking down a matchup.

Return ONLY valid JSON (no markdown):
{
  "categories": [{ "name": "R", "my_proj": 52, "opp_proj": 45, "winner": "me", "confidence": "high", "note": "A readable sentence about this category" }],
  "projected_wins": 6, "projected_losses": 4, "projected_ties": 0,
  "overall_confidence": "medium",
  "lineup_recommendations": "Write specific actionable moves in conversational prose",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "summary": "A clear, readable summary of the matchup projection"
}`,
    }], 2500);

    const parsed = tryParseJSON(text);
    console.log('[Claude] /matchup/predict parsed:', parsed ? 'JSON OK' : 'FALLBACK to raw text');
    if (parsed) return res.json(parsed);
    // Fallback: wrap raw text so frontend can at least show something
    res.json({ summary: text.split('\n')[0], raw: text, lineup_recommendations: text, projected_wins: '?', projected_losses: '?' });
  } catch (err) {
    console.error('[Claude] /matchup/predict error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: FULL TEAM AUDIT
// ─────────────────────────────────────────────────────────────────────────────
router.post('/audit', async (req, res) => {
  const { roster, league_standings } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);
  const leagueSize = settings?.num_teams || 12;

  if (!roster || roster.length === 0) {
    return res.status(400).json({ error: 'Roster is required for audit.' });
  }

  // fantasyBrain: full roster analysis
  const analysis = brain.analyzeRosterStrengths(roster, leagueSize);
  const catAnalysis = brain.analyzeCategories(
    req.body.my_stats || {},
    league_standings || [],
    settings?.scoring_type || 'Roto'
  );

  // VOR for every player
  const vorByPlayer = roster.map(p => ({
    name: p.player_name || p.name,
    position: String(p.position || '').split('/')[0].toUpperCase(),
    vor: brain.calculateVOR(p.stats || {}, p.position, leagueSize),
    scarcity: brain.getPositionalScarcity(p.position, leagueSize).tier,
  })).sort((a, b) => b.vor - a.vor);

  // Fetch real 2025 stats for roster players (non-blocking)
  let historicalIntel = '';
  try {
    const playerNames = roster.map(p => p.player_name || p.name).filter(Boolean);
    if (playerNames.length > 0) {
      const bulkData = await mlbStats.getBulkPlayerStats(playerNames, 2025);
      const intelLines = [];
      for (const [name, data] of Object.entries(bulkData)) {
        const intel = brain.generatePlayerIntelligence(data);
        if (intel) {
          const s = data.stats;
          const statLine = data.type === 'hitter'
            ? `${s.AVG}/${s.HR}HR/${s.RBI}RBI/${s.SB}SB`
            : `${s.ERA}ERA/${s.WHIP}WHIP/${s.K}K/${s.SV}SV`;
          intelLines.push(`${name} (2025: ${statLine}): ${intel.summary}`);
        }
      }
      if (intelLines.length > 0) {
        historicalIntel = `\n\n=== 2025 REAL MLB STATS + INTELLIGENCE ===\n${intelLines.join('\n')}`;
      }
    }
  } catch (e) {
    console.log('[Claude/audit] MLB stats lookup skipped:', e.message);
  }

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}

=== FULL TEAM AUDIT REQUEST ===

ROSTER (${roster.length} players):
${roster.map(p => `${p.player_name||p.name} | ${p.position} | ${p.team}`).join('\n')}

VOR RANKINGS (Value Over Replacement, 0-100):
${vorByPlayer.map(p => `${p.name} (${p.position}): ${p.vor}/100 [${p.scarcity}]`).join('\n')}

POSITIONAL ANALYSIS:
Surpluses: ${analysis.surpluses.map(s => `${s.position} (${s.count} players: ${s.players.join(', ')})`).join('; ') || 'None'}
Voids: ${analysis.voids.join(', ') || 'None'}
Sell high candidates: ${analysis.sellHigh.map(p => `${p.name} (VOR ${p.vor})`).join(', ') || 'None'}
Buy low candidates: ${analysis.buyLow.map(p => `${p.name} (VOR ${p.vor})`).join(', ') || 'None'}

CATEGORY ANALYSIS:
${JSON.stringify(catAnalysis)}${historicalIntel}

LEAGUE STANDINGS CONTEXT:
${league_standings?.length ? JSON.stringify(league_standings.slice(0, 5)) : 'Not provided'}

Use the 2025 real stats and intelligence data above to ground your analysis in actual performance. Flag breakout candidates, regression risks, age-curve concerns, and which players are contributing vs dragging each fantasy category.

TOTAL ROSTER VOR SCORE: ${vorByPlayer.reduce((sum, p) => sum + (p.vor || 0), 0)} (out of a maximum ~2300 for a ${roster.length}-player roster)
AVERAGE VOR PER PLAYER: ${(vorByPlayer.reduce((sum, p) => sum + (p.vor || 0), 0) / Math.max(1, vorByPlayer.length)).toFixed(1)}
ELITE PLAYERS (VOR 70+): ${vorByPlayer.filter(p => p.vor >= 70).length}
REPLACEMENT-LEVEL PLAYERS (VOR < 30): ${vorByPlayer.filter(p => p.vor < 30).length}

=== GRADING RUBRIC (YOU MUST USE THIS — DO NOT DEFAULT TO B) ===
A+ : Championship favorite. 5+ elite VOR players, zero category holes, top-tier depth at scarce positions, avg VOR >65
A  : Strong contender. 3-4 elite assets, one minor fixable gap, excellent depth, avg VOR 55-65
A- : Playoff-caliber. Solid core with 1-2 clear upgrade spots, avg VOR 50-55
B+ : Good but not great. Has star power but 2-3 real weaknesses or category holes, avg VOR 45-50
B  : League average. Competitive but unremarkable, needs multiple moves to contend, avg VOR 40-45
B- : Below average. Some talent but structural problems (too many replacement-level players), avg VOR 35-40
C+ : Mediocre. Multiple positions below replacement level, unbalanced roster construction, avg VOR 30-35
C  : Weak. Needs a major overhaul or several trades to become competitive, avg VOR 25-30
D  : Rebuilder. Should trade aging assets for prospects and draft picks
F  : Catastrophic. Abandon ship or start over

Use the VOR totals AND qualitative roster assessment together to assign the grade. Do NOT default to B — differentiate clearly.

IMPORTANT FORMATTING RULES:
- Write all text in clean, conversational prose. No code syntax, no brackets, no curly braces in your text.
- Write strengths/weaknesses as readable sentences a fantasy manager would enjoy reading.
- For moves, write "action" as a clear headline (e.g. "Trade Contreras and Jansen for a young starter") and "reasoning" as a persuasive paragraph.
- The championshipPath should read like a coach's motivational game plan, not a numbered list.
- The fullAnalysis should be a compelling 300-word narrative essay.

Return ONLY valid JSON:
{
  "grade": "Use the rubric above to assign the precise grade — NOT just B",
  "strengths": ["Write each strength as a clear, readable sentence or short paragraph"],
  "weaknesses": ["Write each weakness as a clear, readable sentence or short paragraph"],
  "moves": [
    { "action": "Clear headline describing the move", "reasoning": "Persuasive paragraph explaining why", "priority": "immediate" }
  ],
  "championshipPath": "A compelling narrative paragraph describing the path to winning it all",
  "fullAnalysis": "A comprehensive 300-word narrative analysis written as readable prose"
}`,
    }], 3500);

    const parsed = tryParseJSON(text);
    console.log('[Claude] /audit parsed:', parsed ? 'JSON OK' : 'FALLBACK to raw text');
    if (parsed) return res.json({ ...parsed, vorByPlayer, catAnalysis });
    res.json({ fullAnalysis: text, vorByPlayer, catAnalysis, grade: 'N/A' });
  } catch (err) {
    console.error('[Claude] /audit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: TRADE FINDER
// ─────────────────────────────────────────────────────────────────────────────
router.post('/trade/find', async (req, res) => {
  const { my_roster, all_rosters, league_standings } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);
  const leagueSize = settings?.num_teams || 12;

  if (!my_roster || my_roster.length === 0) {
    return res.status(400).json({ error: 'My roster is required.' });
  }

  // Identify my surpluses and voids
  const myAnalysis = brain.analyzeRosterStrengths(my_roster, leagueSize);

  // Find teams with opposite needs
  const tradeTargets = [];
  if (all_rosters && Array.isArray(all_rosters)) {
    all_rosters.forEach(team => {
      const theirAnalysis = brain.analyzeRosterStrengths(team.roster || [], leagueSize);
      // They have surplus where I have void, and vice versa
      const theirSurposPositions = theirAnalysis.surpluses.map(s => s.position);
      const matchingVoids = myAnalysis.voids.filter(v => theirSurposPositions.includes(v));
      const mySurplusPositions = myAnalysis.surpluses.map(s => s.position);
      const theirVoids = theirAnalysis.voids;
      const matchingSurplus = mySurplusPositions.filter(p => theirVoids.includes(p));

      if (matchingVoids.length > 0 || matchingSurplus.length > 0) {
        tradeTargets.push({
          team: team.name || team.team_name,
          theyHave: matchingVoids,
          theyNeed: matchingSurplus,
          compatibility: matchingVoids.length + matchingSurplus.length,
        });
      }
    });
  }

  tradeTargets.sort((a, b) => b.compatibility - a.compatibility);

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}

=== TRADE FINDER ===

MY ROSTER: ${my_roster.map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}
MY SURPLUSES: ${myAnalysis.surpluses.map(s => `${s.position} (${s.players.join(', ')})`).join('; ') || 'None identified'}
MY VOIDS: ${myAnalysis.voids.join(', ') || 'None'}
MY SELL-HIGH candidates: ${myAnalysis.sellHigh.map(p => p.name).join(', ') || 'None'}

BEST TRADE PARTNERS (by roster compatibility):
${tradeTargets.slice(0, 5).map(t =>
  `${t.team}: They have surplus ${t.theyHave.join('/')} and need ${t.theyNeed.join('/')}`
).join('\n') || 'No roster data for other teams provided — generating general trade proposals.'}

Generate 3-5 specific trade proposals. For each:
1. What I send and receive (specific player names)
2. Why this makes sense for BOTH sides
3. A fairness score estimate (-100 to +100, from MY perspective)
4. The "pitch" — exact language to use when proposing this trade to the other manager

Focus on trades that exploit my surplus to fill my voids while offering the other manager something they genuinely need.

Write in clean, conversational prose. No JSON syntax, no brackets, no code formatting. Write like a fantasy analyst crafting persuasive trade pitches.`,
    }], 2500);

    res.json({ proposals: text, myAnalysis: { surpluses: myAnalysis.surpluses, voids: myAnalysis.voids, sellHigh: myAnalysis.sellHigh }, tradeTargets: tradeTargets.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: WEEKLY GAME PLAN
// ─────────────────────────────────────────────────────────────────────────────
router.post('/gameplan', async (req, res) => {
  const { my_roster, matchup, league_context, week_number } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);
  const scoringType = settings?.scoring_type || league_context?.scoring_type || 'Roto';

  if (!my_roster || my_roster.length === 0) {
    return res.status(400).json({ error: 'Roster is required.' });
  }

  // fantasyBrain: lineup optimization + category analysis
  const weekSchedule = {};
  my_roster.forEach(p => {
    const team = String(p.team || '').toUpperCase();
    weekSchedule[team] = brain.getWeeklyGameCount(team, week_number || 1);
  });

  const lineupOpt = brain.optimizeLineup(my_roster, weekSchedule, scoringType);
  const catAnalysis = matchup
    ? brain.analyzeCategories(matchup.my_stats || {}, [{ stats: matchup.opp_stats || {} }], scoringType)
    : { advice: 'No matchup provided — optimizing for maximum output.' };

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}

=== WEEKLY GAME PLAN — Week ${week_number || 'current'} ===

DATA ACCURACY NOTE: This roster is pulled directly from the Yahoo Fantasy API for the 2026 season. All player team assignments are correct and reflect current 2026 rosters after offseason moves. Do not question any team assignments — analyze as given.

MY ROSTER: ${my_roster.map(p => `${p.player_name||p.name} (${p.position}, ${p.team})`).join(', ')}

LINEUP OPTIMIZER RESULTS:
Top starters: ${lineupOpt.starters.slice(0, 10).map(p => `${p.player_name} — ${p.weekGames} games, confidence: ${p.confidence}`).join('\n')}
Streaming targets (7-game teams): ${lineupOpt.streamingTargets.map(p => p.player_name).join(', ') || 'None'}

CATEGORY ANALYSIS: ${catAnalysis.advice}
Swing categories: ${catAnalysis.swing?.join(', ') || 'N/A'}
Chase categories: ${catAnalysis.chase?.join(', ') || 'N/A'}

${matchup ? `MATCHUP: vs ${matchup.opponent_name || 'opponent'}\nTheir projected: ${JSON.stringify(matchup.opp_stats || {})}` : 'No specific matchup data — optimize for maximum total output across all categories.'}

YOU HAVE EVERYTHING YOU NEED. Do NOT ask for more data. Do NOT mention missing information. Analyze this roster and produce your best game plan NOW using the data above. If standings or opponent data is missing, optimize for maximum total production. Write all text values as clean, readable sentences. No JSON syntax, no brackets, no code formatting in your text. Write like a manager giving his coaching staff the weekly game plan.

Return ONLY valid JSON:
{
  "optimalLineup": [{ "player": "name", "position": "SP", "reason": "A clear sentence explaining why they should start" }],
  "streamingTargets": [{ "player": "name", "position": "SP", "reason": "A clear sentence about the streaming opportunity" }],
  "swingCategories": ["SB", "SV"],
  "dailyMoves": {
    "monday": "A clear sentence about what to do Monday",
    "tuesday": "A clear sentence about Tuesday's move",
    "wednesday": "A clear sentence about Wednesday's adjustment"
  },
  "keyDecisions": [{ "decision": "A readable question about the decision", "recommendation": "Player name", "reasoning": "A persuasive sentence explaining why" }],
  "weeklyProjection": { "myProjected": "7-3", "opponentProjected": "3-7", "confidence": "medium" }
}`,
    }], 3000);

    const parsed = tryParseJSON(text);
    if (parsed) return res.json({ ...parsed, lineupOptimizer: lineupOpt, catAnalysis });
    res.json({ rawPlan: text, lineupOptimizer: lineupOpt, catAnalysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
