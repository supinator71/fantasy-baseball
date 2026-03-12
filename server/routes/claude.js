const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/database');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an elite fantasy baseball expert with deep knowledge of MLB players, statistics, and strategy.
You provide concise, actionable fantasy baseball advice tailored to the user's specific league settings.
Always consider: player injuries, recent performance trends, schedule, ballpark factors, and positional scarcity.
Be direct and confident in your recommendations. Format responses clearly with bullet points when listing multiple items.`;

function getLeagueContext() {
  const settings = db.prepare('SELECT * FROM league_settings WHERE id = 1').get();
  if (!settings) return '';
  return `League context: ${settings.num_teams} teams, ${settings.scoring_type} scoring, ${settings.draft_type} draft.`;
}

// Positional scarcity multipliers (expert consensus for snake drafts)
const SCARCITY = {
  C:   2.0,  // catastrophic dropoff after top 5-6
  SS:  1.8,  // scarce — 8-10 good options only
  '2B': 1.4,
  '3B': 1.3,
  SP:  1.2,  // injury risk but need 5+ starters
  OF:  0.85, // deep — 40+ viable options
  '1B': 0.8, // deep
  RP:  0.6,  // mostly streamable, take late
}

// Which positions can fill a UTIL slot (non-pitchers)
const UTIL_ELIGIBLE = new Set(['C','1B','2B','3B','SS','OF'])

// Expert advice by round range
function roundStrategy(round, totalRounds) {
  if (round <= 3)  return 'BEST PLAYER AVAILABLE — do NOT reach for positional need this early. Elite talent > position.'
  if (round <= 6)  return 'BPA with need awareness. Address C or SS if top options remain — their dropoffs are steep after round 8.'
  if (round <= 10) return 'Fill remaining starting slots. Prioritize positions where the talent pool is about to dry up.'
  if (round <= 15) return 'Roster construction phase. Target streamable SPs, closing opportunities, and multi-position eligibility.'
  return 'Late round fliers — upside plays, injured returnees, prospects with call-up potential, streaming SPs.'
}

function buildScarcityAnalysis(availablePlayers, rosterSlots, myRoster) {
  // Count how many good options remain per position (within top 150 ADP)
  const posPool = {}
  availablePlayers.forEach(p => {
    const pos = String(p.position || '').split('/')[0].split(',')[0].trim().toUpperCase()
    if (!posPool[pos]) posPool[pos] = []
    if ((p.adp || 999) <= 150) posPool[pos].push(p)
  })

  // Count current fills per position
  const filled = {}
  ;(myRoster || []).forEach(p => {
    const pos = String(p.position || '').split('/')[0].split(',')[0].trim().toUpperCase()
    filled[pos] = (filled[pos] || 0) + 1
  })

  const analysis = []
  const slots = rosterSlots || {}
  for (const [pos, required] of Object.entries(slots)) {
    if (pos === 'BN' || pos === 'IL') continue
    const have = filled[pos] || 0
    const need = Math.max(0, required - have)
    const remaining = (posPool[pos] || []).length
    if (need > 0 && pos !== 'UTIL') {
      const scarcity = SCARCITY[pos] || 1.0
      let urgency = scarcity >= 1.8 ? '🚨 CRITICAL' : scarcity >= 1.3 ? '⚠️ URGENT' : '📋 NEEDED'
      analysis.push(`${urgency} ${pos}: need ${need} more, only ${remaining} quality options left in pool (scarcity: ${scarcity}x)`)
    }
  }
  return analysis
}

// Draft pick recommendation
router.post('/draft/recommend', async (req, res) => {
  const { available_players, my_roster, pick_number, total_picks, needs, roster_slots, num_teams } = req.body;
  const leagueCtx = getLeagueContext();
  const settings = db.prepare('SELECT * FROM league_settings WHERE id = 1').get();
  const slots = roster_slots || (settings?.roster_slots ? JSON.parse(settings.roster_slots) : { SP:2, RP:2, C:1, '1B':1, '2B':1, '3B':1, SS:1, OF:3, UTIL:1, BN:4 });
  const teams = num_teams || settings?.num_teams || 12;

  const totalRounds = Math.ceil(total_picks / teams);
  const currentRound = Math.ceil(pick_number / teams);
  const roundsLeft = totalRounds - currentRound;

  // Build positional fill status
  const filled = {};
  (my_roster || []).forEach(p => {
    const pos = String(p.position || '').split('/')[0].split(',')[0].trim().toUpperCase();
    filled[pos] = (filled[pos] || 0) + 1;
  });

  // Roster status summary
  const rosterStatus = Object.entries(slots)
    .filter(([pos]) => pos !== 'BN' && pos !== 'IL')
    .map(([pos, req]) => {
      const have = filled[pos] || 0;
      const need = Math.max(0, req - have);
      return `${pos}: ${have}/${req} filled${need > 0 ? ` (need ${need})` : ' ✓'}`
    }).join(' | ');

  // Scarcity analysis
  const scarcityAlerts = buildScarcityAnalysis(available_players, slots, my_roster);

  // Find tier breaks (ADP gaps > 12 between consecutive players)
  const sorted = [...available_players].sort((a, b) => (a.adp || 999) - (b.adp || 999));
  const tierBreaks = [];
  for (let i = 0; i < Math.min(sorted.length - 1, 25); i++) {
    const gap = (sorted[i+1]?.adp || 999) - (sorted[i]?.adp || 0);
    if (gap > 12) tierBreaks.push(`After ${sorted[i].player_name} (ADP ${sorted[i].adp}), tier drop of ${gap.toFixed(0)} ADP spots before ${sorted[i+1].player_name}`);
  }

  // Multi-position players (fill 2 needs)
  const multiPos = available_players
    .filter(p => String(p.position || '').includes('/'))
    .slice(0, 8)
    .map(p => `${p.player_name} (${p.position}) — fills multiple roster spots`);

  // Format top available with value context
  const topAvailable = available_players.slice(0, 20).map(p => {
    const pos = String(p.position || '').split('/')[0].split(',')[0].trim().toUpperCase();
    const have = filled[pos] || 0;
    const req = slots[pos] || 0;
    const posStatus = req > 0 && have >= req ? '[POSITION FULL]' : req > 0 && have < req ? '[NEED]' : '';
    const value = pick_number - (p.adp || pick_number);
    const valueStr = value > 5 ? `(+${value.toFixed(0)} value)` : value < -5 ? `(${value.toFixed(0)} reach)` : '(fair value)';
    return `${p.player_name} | ${p.position} | ${p.team} | ADP ${p.adp} ${valueStr} ${posStatus}`;
  }).join('\n');

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueCtx}

=== DRAFT SITUATION ===
Pick #${pick_number} | Round ${currentRound} of ${totalRounds} | ${roundsLeft} rounds remaining
Round strategy: ${roundStrategy(currentRound, totalRounds)}

=== MY ROSTER (${(my_roster||[]).length} players) ===
${my_roster?.length ? my_roster.map(p => `${p.player_name} (${p.position})`).join(', ') : 'Empty — first pick'}

=== ROSTER SLOT STATUS ===
${rosterStatus}

=== POSITIONAL URGENCY ===
${scarcityAlerts.length ? scarcityAlerts.join('\n') : 'No critical positional needs yet.'}

=== TIER BREAKS (act before these drop) ===
${tierBreaks.length ? tierBreaks.slice(0, 4).join('\n') : 'No major tier breaks in top available.'}

=== MULTI-POSITION VALUE ===
${multiPos.length ? multiPos.join('\n') : 'None in top available.'}

=== TOP AVAILABLE PLAYERS ===
${topAvailable}

=== YOUR EXPERT RECOMMENDATION ===
Give me your TOP 3 picks ranked. For each:
1. Player name + position
2. Why NOW (tier timing, scarcity, value)
3. What positional slot it fills and how many rounds until that position dries up
4. Any risk to be aware of

Then a 1-line summary of overall draft strategy for my next 3 rounds.`
      }]
    });
    res.json({ recommendation: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start/Sit analysis
router.post('/startsit', async (req, res) => {
  const { players, matchup_context, scoring_type } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
Scoring: ${scoring_type}
Matchup context: ${matchup_context}
Players to evaluate: ${JSON.stringify(players)}

Give me clear START or SIT recommendations for each player with brief reasoning.`
      }]
    });
    res.json({ analysis: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trade analysis
router.post('/trade', async (req, res) => {
  const { giving, receiving, my_roster, their_roster } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
Trade proposal:
GIVING: ${JSON.stringify(giving)}
RECEIVING: ${JSON.stringify(receiving)}
My full roster: ${JSON.stringify(my_roster)}
Their full roster: ${JSON.stringify(their_roster)}

Analyze this trade. Is it fair? Should I accept, reject, or counter? What counter would be fair?`
      }]
    });
    res.json({ analysis: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Waiver wire recommendations
router.post('/waiver', async (req, res) => {
  const { available_players, my_roster, drop_candidates } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
My current roster: ${JSON.stringify(my_roster)}
Players I could drop: ${JSON.stringify(drop_candidates)}
Available on waiver wire: ${JSON.stringify(available_players)}

What waiver wire moves should I make this week? Give me the top 3 add/drop recommendations.`
      }]
    });
    res.json({ recommendations: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// General fantasy question
router.post('/ask', async (req, res) => {
  const { question, context } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
${context ? `Additional context: ${context}` : ''}
Question: ${question}`
      }]
    });
    res.json({ answer: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Draft strategy overview
router.post('/draft/strategy', async (req, res) => {
  const { draft_position, num_teams, scoring_type, roster_slots, stat_categories } = req.body;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a complete draft strategy for:
- Draft position: ${draft_position} of ${num_teams} teams
- Scoring: ${scoring_type}
- Roster slots: ${JSON.stringify(roster_slots)}
- Categories: ${JSON.stringify(stat_categories)}

Cover: early round strategy, positional priority, when to target closers, when to load up on pitching, late round sleepers to target, and positions to avoid early.`
      }]
    });
    res.json({ strategy: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Matchup prediction
router.post('/matchup/predict', async (req, res) => {
  const { my_team, opponent, stat_categories, week } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
Week ${week || 'current'} fantasy baseball matchup prediction needed.

MY TEAM: ${my_team?.name || 'My Team'}
Stats so far this week: ${JSON.stringify(my_team?.stats || [])}

OPPONENT: ${opponent?.name || 'Opponent'}
Their stats so far this week: ${JSON.stringify(opponent?.stats || [])}

Scoring categories: ${JSON.stringify(stat_categories || ['R','HR','RBI','SB','AVG','W','SV','K','ERA','WHIP'])}

Using these current stats as a baseline, project the full week's outcome. Return ONLY valid JSON (no markdown, no code blocks):
{
  "categories": [
    { "name": "R", "my_proj": 52, "opp_proj": 45, "winner": "me", "confidence": "high", "note": "brief note" }
  ],
  "projected_wins": 6,
  "projected_losses": 4,
  "projected_ties": 0,
  "overall_confidence": "medium",
  "lineup_recommendations": "Specific actionable lineup changes to maximize category wins this week. Name players and specific moves.",
  "key_matchups": "The 2-3 most competitive categories and what to focus on to swing them.",
  "summary": "You are projected to win 6-4 with medium confidence"
}
Include all scoring categories. For ERA/WHIP lower is better. Be realistic and specific.`
      }]
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return res.json(JSON.parse(jsonMatch[0])); } catch {}
    }
    res.json({ summary: text.split('\n')[0], raw: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
