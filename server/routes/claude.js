const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/database');
const brain = require('../services/fantasyBrain');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}
// ─────────────────────────────────────────────────────────────────────────────
// EXPERT SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite fantasy baseball analyst combining the strategic depth of a professional SABR analyst with the tactical instincts of a daily fantasy shark. You have deep expertise in sabermetrics (wOBA, FIP, xERA, BABIP, Barrel%, Sprint Speed, Hard Hit%), prospect analysis, and game theory. You understand that winning fantasy baseball is about exploiting market inefficiencies — finding value where others don't.

CORE PRINCIPLES YOU ALWAYS FOLLOW:
1. REPLACEMENT-LEVEL THINKING: Never recommend a player without context of who's available as replacement. "Good" is relative to what's on waivers.
2. PROCESS OVER RESULTS: A hitter batting .340 with a .420 BABIP is a SELL, not a hold. Underlying metrics > surface stats. Always flag regression candidates.
3. POSITIONAL SCARCITY: A top-5 catcher is more valuable than a top-15 outfielder because catcher is shallower. Always frame value through positional lens.
4. OPPORTUNITY COST: Every roster spot has a cost. A "good" player sitting on my bench has negative value. Streaming spots > mediocre stashes (usually).
5. SCHEDULE EXPLOITATION: In weekly-lock leagues, volume is king. A player with 7 games beats a slightly better player with 4 games nearly every time.
6. CATEGORICAL THINKING: In roto, identify which categories have the most efficient gain (smallest gap to move up a rank). In H2H, identify and attack swing categories.
7. TRADE AS ARBITRAGE: Trades should exploit differing team needs. A 1st baseman is worth more to a team whose 1B is on IL. Always consider the other manager's incentives.
8. SELL HIGH / BUY LOW: Players with unsustainable luck-based stats (high BABIP, low strand rate, high HR/FB) are sells. The reverse are buys. Be specific about which peripheral metrics justify your recommendation.
9. HANDEDNESS MATTERS: Platoon advantages are real — LHH vs RHP is a meaningful statistical edge. Factor this into daily/weekly lineup decisions.
10. CLOSER VOLATILITY: Saves are the most volatile and replaceable category. Never overpay for closers in trades. The waiver wire replaces closers regularly.

RESPONSE FORMAT:
- Lead with your KEY RECOMMENDATION in bold
- Support with 2-3 data-driven reasons
- Flag any risks or contrarian considerations
- When comparing players, use a structured format with clear winner
- End every response with an "EDGE PLAY" — one non-obvious insight the average fantasy manager wouldn't think of`;

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
  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages,
  });
  return msg.content[0].text;
}

function tryParseJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
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

Give me TOP 3 picks ranked with: player name, why NOW (tier/scarcity/VOR reasoning), what slot it fills, rounds until that position dries up, and any injury/regression risk. End with a 1-line strategy for my next 3 rounds.`
    }]);
    res.json({ recommendation: text });
  } catch (err) {
    res.status(500).json({ error: err.message, recommendation: 'AI unavailable — use Smart Score column to guide your pick.' });
  }
});

// Start/Sit analysis
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

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
Scoring: ${scoring_type || settings?.scoring_type || 'Roto'}
Context: ${matchup_context || 'Standard week'}

Players to evaluate (with pre-computed matchup intelligence):
${enriched.map(p =>
  `${p.name} (${p.position}, ${p.team}) | Games this week: ${p.weekGames} | Streaming score: ${p.streaming?.score}/100 (${p.streaming?.grade}) | Platoon: ${p.platoon?.advantage} (${p.platoon?.multiplier}x) | Opponent: ${p.opponent || 'unknown'}`
).join('\n')}

Give START or SIT for each player. Use the streaming score, platoon edge, and game count to drive your recommendation. Flag regression risks if applicable.`
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

Validate and expand on this trade analysis. Identify any sell-high/buy-low dynamics, what the other manager's incentive is, and give a concrete recommendation with counter-offer if needed.`
    }]);
    res.json({ analysis: text, evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message, analysis: 'AI unavailable.', evaluation });
  }
});

// Waiver wire
router.post('/waiver', async (req, res) => {
  const { available_players, my_roster, drop_candidates } = req.body;
  const settings = getLeagueSettings();
  const leagueCtx = leagueContext(settings);

  // fantasyBrain: waiver priority score for each player
  const scored = (available_players || []).map(p => ({
    ...p,
    waiverScore: brain.scoreWaiverTarget(p, my_roster || [], settings || {}),
  })).sort((a, b) => b.waiverScore.score - a.waiverScore.score);

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
My roster: ${(my_roster||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}
Drop candidates: ${(drop_candidates||[]).map(p => `${p.player_name||p.name}`).join(', ') || 'none specified'}

Waiver targets (pre-scored by priority engine):
${scored.slice(0, 12).map(p =>
  `${p.player_name||p.name} (${p.position}, ${p.team}) — Priority: ${p.waiverScore.score}/100 [${p.waiverScore.priority}] — ${p.waiverScore.reasoning}`
).join('\n')}

Give top 3 add/drop recommendations. Flag any regression risks or BABIP-driven luck. Identify which drops free up the most roster value.`
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

Expand this into a personalized draft plan covering: early round priorities, positional scarcity windows, when to target closers, pitching philosophy, and 5 specific late-round sleeper archetypes to target.`,
    }], 2048);
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

Return ONLY valid JSON (no markdown):
{
  "categories": [{ "name": "R", "my_proj": 52, "opp_proj": 45, "winner": "me", "confidence": "high", "note": "brief note" }],
  "projected_wins": 6, "projected_losses": 4, "projected_ties": 0,
  "overall_confidence": "medium",
  "lineup_recommendations": "Specific actionable moves.",
  "key_matchups": "2-3 swing categories and how to win them.",
  "summary": "Projected to win X-Y"
}`,
    }], 2048);

    const parsed = tryParseJSON(text);
    if (parsed) return res.json(parsed);
    res.json({ summary: text.split('\n')[0], raw: text });
  } catch (err) {
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
${JSON.stringify(catAnalysis)}

LEAGUE STANDINGS CONTEXT:
${league_standings?.length ? JSON.stringify(league_standings.slice(0, 5)) : 'Not provided'}

Return ONLY valid JSON:
{
  "grade": "B+",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "moves": [
    { "action": "Trade X for Y", "reasoning": "...", "priority": "immediate" }
  ],
  "championshipPath": "To win it all, you need to...",
  "fullAnalysis": "Comprehensive 300-word analysis covering roster construction, category profile, and trajectory."
}`,
    }], 2048);

    const parsed = tryParseJSON(text);
    if (parsed) return res.json({ ...parsed, vorByPlayer, catAnalysis });
    res.json({ fullAnalysis: text, vorByPlayer, catAnalysis, grade: 'N/A' });
  } catch (err) {
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

Focus on trades that exploit my surplus to fill my voids while offering the other manager something they genuinely need.`,
    }], 2048);

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

MY ROSTER: ${my_roster.map(p => `${p.player_name||p.name} (${p.position}, ${p.team})`).join(', ')}

LINEUP OPTIMIZER RESULTS:
Top starters: ${lineupOpt.starters.slice(0, 10).map(p => `${p.player_name} — ${p.weekGames} games, confidence: ${p.confidence}`).join('\n')}
Streaming targets (7-game teams): ${lineupOpt.streamingTargets.map(p => p.player_name).join(', ') || 'None'}

CATEGORY ANALYSIS: ${catAnalysis.advice}
Swing categories: ${catAnalysis.swing?.join(', ') || 'N/A'}
Chase categories: ${catAnalysis.chase?.join(', ') || 'N/A'}

${matchup ? `MATCHUP: vs ${matchup.opponent_name || 'opponent'}\nTheir projected: ${JSON.stringify(matchup.opp_stats || {})}` : ''}

Return ONLY valid JSON:
{
  "optimalLineup": [{ "player": "name", "position": "SP", "reason": "7 games, hot streak" }],
  "streamingTargets": [{ "player": "name", "position": "SP", "reason": "great matchup" }],
  "swingCategories": ["SB", "SV"],
  "dailyMoves": {
    "monday": "Start X over Y — favorable matchup",
    "tuesday": "Stream Z — 2 starts this week",
    "wednesday": "Monitor A — expected to be activated"
  },
  "keyDecisions": [{ "decision": "Start X or Y at SP2?", "recommendation": "X", "reasoning": "Better K/9 vs weak lineup" }],
  "weeklyProjection": { "myProjected": "7-3", "opponentProjected": "3-7", "confidence": "medium" }
}`,
    }], 2048);

    const parsed = tryParseJSON(text);
    if (parsed) return res.json({ ...parsed, lineupOptimizer: lineupOpt, catAnalysis });
    res.json({ rawPlan: text, lineupOptimizer: lineupOpt, catAnalysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
