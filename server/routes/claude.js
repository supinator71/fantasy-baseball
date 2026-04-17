const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../services/database');
const brain = require('../services/fantasyBrain');
const mlbStats = require('../services/mlbStatsService');
const { rateLimiter, getStats } = require('../middleware/rateLimiter');

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

// Admin: rate limit stats
router.get('/ratelimit/stats', (req, res) => res.json(getStats()));

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Goin' Yard HQ — a friendly, encouraging fantasy baseball AI for the 2026 MLB season. Help beginners dominate their Yahoo leagues.

RULES:
1. ALL data is from LIVE Yahoo API for 2026. Trust it completely. Never question player teams or positions.
2. Never mention data issues, ask for verification, or refuse analysis.
3. Write like a supportive friend. Explain WHY moves help in simple terms.
4. Define any advanced stat terms in plain English when used.
5. H2H Points: maximize volume (ABs, IP). 2-start SPs are gold. Don't advise category-punting in points leagues.
6. Don't overreact to one bad week. Patience is key.
7. End every response with a 🎓 Baseball 101 tip tailored to the user's specific scoring format.

FORMATTING: Clean prose, no code syntax, no brackets. Rank recommendations clearly. Use bolded metric badges (**Player** \`[VOR: XX]\`).`;


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getLeagueSettings(leagueKey) {
  const s = db.prepare('SELECT * FROM league_settings WHERE league_key = ?').get(leagueKey || null);
  if (!s) return null;
  try {
    s.roster_slots = typeof s.roster_slots === 'string' ? JSON.parse(s.roster_slots) : (s.roster_slots || {});
    s.stat_categories = typeof s.stat_categories === 'string' ? JSON.parse(s.stat_categories) : (s.stat_categories || []);
  } catch {}
  return s;
}

function leagueContext(settings) {
  if (!settings) return '';
  const rawType = (settings.scoring_type || '').toLowerCase();
  
  let format = 'Rotisserie (Roto)';
  let rule = 'DO NOT talk about weekly head-to-head matchups. Focus on long-term categorical accumulation over the whole 162-game season.';
  
  if (rawType.includes('headpoint')) {
    format = 'Head-to-Head Points';
    rule = 'DO NOT give 5x5 Roto advice. Ignore balancing categories. Give advice explicitly tailored for maximizing raw total points in a weekly matchup!';
  } else if (rawType.includes('head')) {
    format = 'Head-to-Head Categories';
    rule = 'DO NOT focus solely on total points. You MUST consider how a player balances and wins specific stat categories against a weekly opponent.';
  }
  
  return `League Rules: ${settings.num_teams || 12} teams, **${format} scoring**. 
(CRITICAL RULE: The user is playing ${format}. ${rule})
Scoring Events/Categories: ${(settings.stat_categories || []).join(', ')}.`;
}

async function callClaude(messages, maxTokens = 1800) {
  console.log('[Claude] Starting API call...', { messageCount: messages.length, maxTokens });
  const startTime = Date.now();
  
  try {
    const timeoutMs = 45000; // 45 seconds
    const lastContent = messages[messages.length - 1]?.content || '';
    const isJsonRequested = lastContent.includes('Return ONLY valid JSON');
    
    // Automatic Anthropic Message Prefill hack to FORCE valid JSON without conversational wrapping.
    const finalMessages = isJsonRequested 
      ? [...messages, { role: 'assistant', content: '{' }] 
      : messages;

    const apiCall = getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: finalMessages,
      // Automatic prompt caching — system prompt + static prefix cached for 5 min
      // Cache reads cost 90% less than uncached input. Cache writes cost 25% more (one-time).
      cache_control: { type: 'ephemeral' },
    });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Claude API timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    );
    
    const msg = await Promise.race([apiCall, timeoutPromise]);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Ensure we don't accidentally double the opening brace if Claude also emitted one
    let responseText = msg.content[0].text;
    if (isJsonRequested) {
      if (!responseText.trimStart().startsWith('{')) {
        responseText = '{' + responseText;
      }
    }
    const u = msg.usage || {};
    console.log(`[Claude] ${elapsed}s | in:${u.input_tokens} cache_read:${u.cache_read_input_tokens||0} cache_write:${u.cache_creation_input_tokens||0} out:${u.output_tokens} | ${responseText.length} chars`);
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
  
  // Custom depth-based JSON extractor to prevent greedy regex capturing trailing conversational `}` tokens
  function extractJsonStr(str) {
    let startIndex = str.indexOf('{');
    if (startIndex === -1) return null;
    
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = startIndex; i < str.length; i++) {
      const char = str[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) {
            return str.substring(startIndex, i + 1);
          }
        }
      }
    }
    return null;
  }

  // 1: Direct Parse clean markdown
  let cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  
  // 2: Robust Extraction (ignores trailing garbage that breaks greedy regex)
  let jsonStr = extractJsonStr(cleaned) || extractJsonStr(text);
  if (!jsonStr) return null;
  try { return JSON.parse(jsonStr); } catch (e) {
    console.error('[Claude] Standard JSON parse failed:', e.message);
  }

  // 3: Aggressive JSON Hallucination Fixer
  // Claude frequently leaves raw \n or unescaped double quotes inside its JSON prose content.
  console.log('[Claude] Applying aggressive JSON hallucination sanitizer...');
  try {
    // Escape unescaped double quotes that are inside string values (between pairs of quotes)
    // and escape raw newlines.
    // Instead of regex, a simpler trick for raw newlines is replacing actual newlines with \n
    // but ONLY inside the string values. It's safer to just regex out newlines inside double quotes.
    const sanitizedStr = jsonStr.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/gs, function(m, p1) {
      return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '').replace(/\t/g, '\\t') + '"';
    });
    
    // Now try to parse the sanitized string
    return JSON.parse(sanitizedStr);
  } catch (err2) {
    console.error('[Claude] Aggressive JSON sanitizer failed:', err2.message);
  }
  
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING ENDPOINTS — ENHANCED WITH fantasyBrain
// ─────────────────────────────────────────────────────────────────────────────

// Draft pick recommendation — DISABLED (draft module removed from product)
router.post('/draft/recommend', (req, res) => {
  res.status(410).json({ error: 'Draft Assistant has been removed. Use Waiver Wire and Trade Finder for in-season roster moves.' });
});

// Start/Sit analysis — enriched with 2025 stats

// Start/Sit analysis — enriched with 2025 stats
router.post('/startsit', rateLimiter('startsit'), async (req, res) => {
  const { players, matchup_context, scoring_type, daily_mode, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);
  const leagueSize = settings?.num_teams || 12;

  // ── Unified Roster Diagnosis ───────────────────────────────────────────
  const diagnosis = brain.buildRosterDiagnosis(players || [], settings || {});

  // fantasyBrain: streaming value + platoon for each player
  const enriched = diagnosis.activeRoster.map(p => {
    const pos = String(p.position || '').split('/')[0].toUpperCase();
    const vor = brain.calculateVOR(p.stats || {}, pos, leagueSize, settings?.scoring_type);
    const platoon = brain.platoonAdvantage(p.bats || p.hand, p.pitcher_hand || 'R');
    const streaming = brain.streamingValue(p, p.opponent_stats || {}, settings?.scoring_type);
    const games = brain.getWeeklyGameCount(p.team || '', 1);
    return { ...p, platoon, streaming, weekGames: games, vor };
  });

  // Fetch 2025 stats, TODAY'S LIVE MATCHUPS, and BREAKING NEWS for decision context (non-blocking)
  let historicalIntel = '';
  let liveMatchups = '';
  let breakingNews = '';
  try {
    const playerNames = diagnosis.activeRoster.map(p => p.name || p.player_name).filter(Boolean);
    
    const [scheduleStr, newsStr, bulkData] = await Promise.all([
      mlbStats.getUpcomingSchedule(),
      mlbStats.getBreakingNews(),
      playerNames.length > 0 ? mlbStats.getBulkPlayerStats(playerNames, 2025) : Promise.resolve({})
    ]);

    if (scheduleStr) liveMatchups = `\n\n=== TODAY'S LIVE MLB MATCHUPS ===\n${scheduleStr}`;
    if (newsStr) breakingNews = `\n\n=== BREAKING MLB MEDICAL/ROSTER NEWS ===\n${newsStr}`;

    if (playerNames.length > 0 && bulkData) {
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
${diagnosis.promptBlock}
Context: ${matchup_context || 'Daily optimization'}

Players:
${enriched.map(p =>
  `${p.name} (${p.position}, ${p.team}) Status:${p.status || 'Active'} Starting:${p.is_starting || '?'} VOR:${p.vor} Games:${p.weekGames} Stream:${p.streaming?.score}/100`
).join('\n')}${liveMatchups}${breakingNews}${historicalIntel}

${daily_mode ? 
  `DAILY MODE: 1) Must Starts. 2) 3-4 marginal decisions with reasoning. 3) Bench list.
Rules: Never start IL/O/DTD. Batters: start if "Starting:Yes/?" bench if "No". SP: ONLY start if "Starting:Yes".
Use live matchups + category weakness to weight decisions.` 
  : 
  `WEEKLY MODE: START or SIT each player. Flag breakouts/regression. Weight category weaknesses.`
}

Format: **Player** \`[VOR:XX | Stream:YY]\` 🟢 START / 🔴 SIT -> *Logic:* [reason]. Show the math.`
    }]);
    res.json({ analysis: text });
  } catch (err) {
    res.status(500).json({ error: err.message, analysis: 'AI unavailable — check streaming scores above.' });
  }
});

// Trade analysis
router.post('/trade', rateLimiter('trade'), async (req, res) => {
  const { giving, receiving, my_roster, their_roster, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);

  // ── Unified Roster Diagnosis ───────────────────────────────────────────
  const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings || {});

  // fantasyBrain: trade fairness engine
  const evaluation = brain.evaluateTrade(
    giving || [], receiving || [], diagnosis.activeRoster,
    { num_teams: settings?.num_teams || 12, scoring_type: settings?.scoring_type }
  );

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
${diagnosis.promptBlock}
TRADE PROPOSAL:
GIVING: ${(giving||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}
RECEIVING: ${(receiving||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}

PRE-COMPUTED TRADE EVALUATION:
Fairness score: ${evaluation.score}/100 (${evaluation.verdict})
Reasoning: ${evaluation.reasoning}
${evaluation.sellHighFlags?.length ? 'Sell high flags: ' + evaluation.sellHighFlags.join('; ') : ''}
${evaluation.buyLowFlags?.length ? 'Buy low flags: ' + evaluation.buyLowFlags.join('; ') : ''}
${evaluation.counterOffer ? 'Suggested counter: ' + evaluation.counterOffer : ''}

Their roster: ${(their_roster||[]).map(p => `${p.player_name||p.name} (${p.position})`).join(', ')}

Validate and expand on this trade analysis. Use the ROSTER DIAGNOSIS above to determine:
1. Does this trade ADDRESS a team weakness (void or category need)? If so, it's worth more than VOR alone suggests.
2. Does this trade WORSEN a weakness? If so, reject or counter.
3. What the other manager's incentive is.
Give a concrete recommendation with counter-offer if needed.

Write in clean, conversational prose. No JSON syntax, no brackets, no code formatting. Write like a fantasy analyst giving persuasive trade advice.`
    }]);
    res.json({ analysis: text, evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message, analysis: 'AI unavailable.', evaluation });
  }
});

// Waiver wire — enriched with 2025 MLB stats + intelligence
router.post('/waiver', rateLimiter('waiver'), async (req, res) => {
  const { available_players, my_roster, drop_candidates, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);

  // ── Unified Roster Diagnosis ───────────────────────────────────────────
  const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings || {});

  // fantasyBrain: waiver priority score for each player — with category awareness from diagnosis
  const scored = (available_players || [])
    .filter(p => !p.status || (!String(p.status).toUpperCase().includes('IL') && ['O', 'OUT', 'SUSPENDED'].indexOf(String(p.status).toUpperCase()) === -1))
    .map(p => ({
    ...p,
    waiverScore: brain.scoreWaiverTarget(p, diagnosis.activeRoster, settings || {}, diagnosis.categoryNeeds),
  })).sort((a, b) => b.waiverScore.score - a.waiverScore.score);

  // Fetch real 2025 stats and breaking news for top waiver targets (non-blocking)
  let historicalIntel = '';
  let breakingNews = '';
  try {
    const topNames = scored.slice(0, 8).map(p => p.player_name || p.name).filter(Boolean);
    
    const [newsStr, bulkData] = await Promise.all([
      mlbStats.getBreakingNews(),
      topNames.length > 0 ? mlbStats.getBulkPlayerStats(topNames, 2025) : Promise.resolve({})
    ]);

    if (newsStr) breakingNews = `\n=== BREAKING MLB MEDICAL/ROSTER NEWS ===\n${newsStr}\n`;
    
    if (topNames.length > 0 && bulkData) {
      const intelLines = [];
      for (const [name, data] of Object.entries(bulkData)) {
        const intel = brain.generatePlayerIntelligence(data);
        if (intel) intelLines.push(`${name}: ${intel.summary}`);
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
${diagnosis.promptBlock}
${breakingNews}
Waiver targets (pre-scored by priority engine):
${scored.slice(0, 12).map(p =>
  `${p.player_name||p.name} (${p.position}, ${p.team}) — Priority: ${p.waiverScore.score}/100 [${p.waiverScore.priority}] — ${p.waiverScore.reasoning}`
).join('\n')}${historicalIntel}

Use the 2025 stats intelligence AND the ROSTER DIAGNOSIS above to identify the best targets. If pitching categories are weak, you MUST recommend pitching pickups — especially streaming SPs. Align your recommendations with the team's structural needs (do not recommend adding a position where the team already has a Surplus unless they are a must-add star). Give top 3 add/drop recommendations with specific reasoning backed by last year's real stats.

CRITICAL "SHOW YOUR WORK" RULE: Do NOT formulate paragraphs of general advice. You MUST explicitly cite the math.
Format your recommendations using strictly formatted markdown lists with bolded metric badges.
Example format for your answers:
- 🟢 **ADD: [Player Name]** \`[Priority Score: YY/100]\` -> *Logic:* [Brief explicit explanation of why the math demands this]
- 🔴 **DROP: [Player Name]** \`[VOR: XX]\` -> *Logic:* [Brief explicit explanation of why their math dictates they are the drop]

CRITICAL LOGIC RULE: Do NOT generate a "Summary" or "After these moves your roster will look like..." section. Only provide actionable Drop/Add recommendations.`
    }]);
    res.json({ recommendations: text, scored: scored.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message, recommendations: 'AI unavailable.', scored: scored.slice(0, 10) });
  }
});

// General question
router.post('/ask', rateLimiter('ask'), async (req, res) => {
  const { question, context, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
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
    }], 1500);
    res.json({ strategy: text, strategyProfile: strategy });
  } catch (err) {
    res.status(500).json({ error: err.message, strategy: 'AI unavailable.', strategyProfile: strategy });
  }
});

// Matchup prediction
router.post('/matchup/predict', rateLimiter('matchup'), async (req, res) => {
  const { my_team, opponent, stat_categories, week, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);

  // Category analysis
  const myStats = {};
  const oppStats = {};
  (my_team?.stats || []).forEach(s => { if (s.name) myStats[s.name] = s.my_value ?? s.value; });
  (opponent?.stats || my_team?.stats || []).forEach(s => { if (s.name) oppStats[s.name] = s.opp_value ?? s.value; });
  const catAnalysis = brain.analyzeCategories(myStats, [{ stats: oppStats }], settings?.scoring_type || 'H2H');

  const safeCats = stat_categories || ['W','SV','OUT','H','ER','BB','HBP','K','R','1B','2B','3B','HR','RBI','SB'];
  const mathCategories = safeCats.map((cat, i) => {
    const myStatObj = (my_team?.stats || [])[i] || {};
    const oppStatObj = (opponent?.stats || [])[i] || {};
    let myVal = parseFloat(myStats[cat] || myStatObj.value || 0);
    let oppVal = parseFloat(oppStats[cat] || oppStatObj.value || 0);
    const lowerIsBetter = ['ERA', 'WHIP', 'L', 'ER', 'BB', 'HBP', 'H/AB', 'L'].includes(cat);
    let winner = 'tie';
    if (myVal !== oppVal) {
      winner = lowerIsBetter ? (myVal < oppVal ? 'me' : 'opponent') : (myVal > oppVal ? 'me' : 'opponent');
    }
    return { name: cat, my_proj: myVal, opp_proj: oppVal, winner, confidence: 'high' };
  });

  const mathProjectedWins = mathCategories.filter(c => c.winner === 'me').length;
  const mathProjectedLosses = mathCategories.filter(c => c.winner === 'opponent').length;
  const mathProjectedTies = mathCategories.filter(c => c.winner === 'tie').length;


  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
Week ${week || 'current'} matchup prediction.

MY TEAM: ${my_team?.name}
Stats: ${JSON.stringify(my_team?.stats || [])}

OPPONENT: ${opponent?.name}
Stats: ${JSON.stringify(opponent?.stats || [])}

Categories: ${JSON.stringify(stat_categories || ['W','SV','OUT','H','ER','BB','HBP','K','R','1B','2B','3B','HR','RBI','SB'])}
Pre-computed matchup analysis: ${JSON.stringify(catAnalysis)}

IMPORTANT: Write all text values in clean, conversational prose. No brackets, no code syntax. Write like a sports analyst breaking down a matchup.

CRITICAL JSON ESCAPING RULES: You MUST use double quotes for all JSON keys and string values. Do NOT use single quotes for JSON properties. If you need to use a quote inside your text prose, use single quotes (e.g., "He is a 'must-start' player"). You MUST NOT use raw newlines inside string values; use the literal sequence \\n.
Return ONLY valid JSON (no markdown):
{
  "projected_wins": 5, "projected_losses": 4, "projected_ties": 1,
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose",
  "categories": [{ "name": "Category Name", "my_proj": "value", "opp_proj": "value", "winner": "me", "confidence": "high", "note": "A readable sentence" }]
}`,
    }], 1500);

    const parsed = tryParseJSON(text);
    console.log('[Claude] /matchup/predict parsed:', parsed ? 'JSON OK' : 'FALLBACK to raw text');
    if (parsed) {
      return res.json({
        ...parsed,
        projected_wins: mathProjectedWins,
        projected_losses: mathProjectedLosses,
        projected_ties: mathProjectedTies,
        categories: mathCategories
      });
    }
    
    // Robust Fallback: Regex extraction when JSON structurally truncates
    const _wins = text.match(/"projected_wins"\s*:\s*(\d+)/i);
    const _losses = text.match(/"projected_losses"\s*:\s*(\d+)/i);
    const _ties = text.match(/"projected_ties"\s*:\s*(\d+)/i);
    const _confidence = text.match(/"overall_confidence"\s*:\s*"([^"]+)"/i);
    const _summary = text.match(/"summary"\s*:\s*"([^"]+)"/i);
    
    res.json({ 
      projected_wins: mathProjectedWins, 
      projected_losses: mathProjectedLosses,
      projected_ties: mathProjectedTies,
      overall_confidence: _confidence ? _confidence[1] : 'low',
      summary: _summary ? _summary[1] : "Incomplete analysis. The API response was truncated before finishing.",
      lineup_recommendations: null, // Avoid dumping raw JSON block into UI
      categories: mathCategories,
      raw: text 
    });
  } catch (err) {
    console.error('[Claude] /matchup/predict error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: FULL TEAM AUDIT
// ─────────────────────────────────────────────────────────────────────────────
router.post('/audit', rateLimiter('audit'), async (req, res) => {
  const { roster, league_standings, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);

  if (!roster || roster.length === 0) {
    return res.status(400).json({ error: 'Roster is required for audit.' });
  }

  // ── Unified Roster Diagnosis ───────────────────────────────────────────
  const diagnosis = brain.buildRosterDiagnosis(roster, settings || {});

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
${diagnosis.promptBlock}
=== FULL TEAM AUDIT REQUEST ===${historicalIntel}

LEAGUE STANDINGS CONTEXT:
${league_standings?.length ? JSON.stringify(league_standings.slice(0, 5)) : 'Not provided'}

Use the 2025 real stats and intelligence data above to ground your analysis in actual performance. Flag breakout candidates, regression risks, age-curve concerns, and which players are contributing vs dragging each fantasy category.

TOTAL ROSTER VOR SCORE: ${diagnosis.totalVOR} (out of a maximum ~2300 for a ${roster.length}-player roster)
AVERAGE VOR PER PLAYER: ${diagnosis.avgVOR}
ELITE PLAYERS (VOR 70+): ${diagnosis.eliteCount}
REPLACEMENT-LEVEL PLAYERS (VOR < 30): ${diagnosis.replacementCount}

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
- Write all text in clean, conversational prose.
- Inside strengths, weaknesses, and moves strings, you MUST format player names with explicitly bolded mathematical metric badges. Example: "**Julio Rodriguez** [VOR: 85]"
- Write strengths/weaknesses as readable sentences a fantasy manager would enjoy reading.
- For moves, write "action" as a clear headline (e.g. "Trade Contreras and Jansen for a young starter") and "reasoning" as a persuasive paragraph.
- The championshipPath should read like a coach's motivational game plan, not a numbered list.
CRITICAL JSON ESCAPING RULES: You MUST use double quotes for all JSON keys and string values. Do NOT use single quotes for JSON properties. If you need to use a quote inside your text prose, use single quotes (e.g., "He is a 'must-start' player"). You MUST NOT use raw newlines inside string values; use the literal sequence \\n.
Return ONLY valid JSON:
{
  "grade": "Use the rubric above to assign the precise grade — NOT just B",
  "strengths": ["Write each strength as a clear, readable sentence or short paragraph"],
  "weaknesses": ["Write each weakness as a clear, readable sentence or short paragraph"],
  "moves": [
    { "action": "Clear headline describing the move", "reasoning": "Persuasive paragraph explaining why", "priority": "immediate" }
  ],
  "championshipPath": "A compelling narrative paragraph describing the path to winning it all"
}`,
    }], 1500);

    const parsed = tryParseJSON(text);
    console.log('[Claude] /audit parsed:', parsed ? 'JSON OK' : 'FALLBACK to raw text');
    if (parsed) return res.json({ ...parsed, vorByPlayer: diagnosis.vorByPlayer, catAnalysis: diagnosis.catAnalysis });

    // Robust Fallback: Regex extraction when JSON structurally truncates
    const _grade = text.match(/"grade"\s*:\s*"([^"]+)"/i);
    const _path = text.match(/"championshipPath"\s*:\s*"([^"]+)"/i);
    const _analysis = ["", "AI audit computed without dense prose to save generation time."];

    res.json({ 
      grade: _grade ? _grade[1] : "N/A",
      strengths: [],
      weaknesses: [],
      moves: [],
      championshipPath: _path ? _path[1] : null,
      fullAnalysis: _analysis ? _analysis[1] : "Incomplete analysis. The API response was truncated before finishing.",
      vorByPlayer: diagnosis.vorByPlayer, 
      catAnalysis: diagnosis.catAnalysis
    });
  } catch (err) {
    console.error('[Claude] /audit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: TRADE FINDER
// ─────────────────────────────────────────────────────────────────────────────
router.post('/trade/find', rateLimiter('tradefinder'), async (req, res) => {
  const { my_roster, all_rosters, league_standings, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);
  const leagueSize = settings?.num_teams || 12;

  if (!my_roster || my_roster.length === 0) {
    return res.status(400).json({ error: 'My roster is required.' });
  }

  // ── Unified Roster Diagnosis ───────────────────────────────────────────
  const diagnosis = brain.buildRosterDiagnosis(my_roster, settings || {});

  // Find teams with opposite needs
  const tradeTargets = [];
  let allRostersSummary = '';
  
  if (all_rosters && Array.isArray(all_rosters)) {
    all_rosters.forEach(team => {
      const mockRoster = (team.players || []).map(pStr => {
        const match = pStr.match(/\((.*?)\)$/);
        return { position: match ? match[1] : '' };
      });
      
      const theirAnalysis = brain.analyzeRosterStrengths(mockRoster, leagueSize);
      const theirSurposPositions = theirAnalysis.surpluses.map(s => s.position);
      const matchingVoids = diagnosis.voids.filter(v => theirSurposPositions.includes(v));
      const mySurplusPositions = diagnosis.surpluses.map(s => s.position);
      const theirVoids = theirAnalysis.voids;
      const matchingSurplus = mySurplusPositions.filter(p => theirVoids.includes(p));

      if (matchingVoids.length > 0 || matchingSurplus.length > 0) {
        tradeTargets.push({
          team: team.team || team.team_name || team.name,
          theyHave: matchingVoids,
          theyNeed: matchingSurplus,
          compatibility: matchingVoids.length + matchingSurplus.length,
        });
      }
    });

    if (all_rosters.length > 0) {
      allRostersSummary = '\n\n=== ENTIRE LEAGUE ROSTERS ===\n' + all_rosters.map(t => 
        `Team: ${t.team}\nRoster: ${t.players.join(', ')}`
      ).join('\n\n');
    }
  }

  tradeTargets.sort((a, b) => b.compatibility - a.compatibility);

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
${diagnosis.promptBlock}
=== TRADE FINDER ===

BEST TRADE PARTNERS (by roster compatibility):
${tradeTargets.slice(0, 5).map(t =>
  `${t.team}: They have surplus ${t.theyHave.join('/')} and need ${t.theyNeed.join('/')}`
).join('\n') || 'No roster data for other teams provided — generating general trade proposals.'}${allRostersSummary}

Generate 3-5 specific trade proposals using the ENTIRE LEAGUE ROSTERS data above. For each:
1. What I send and receive (specific player names sourced from the actual opposing rosters)
2. Which specific Team/Manager I am trading with
3. Why this makes sense for BOTH sides (addressing my surplus/void and their surplus/void)
4. A fairness score estimate (-100 to +100, from MY perspective)
5. The "pitch" — exact language to use when proposing this trade to the other manager

CRITICAL: Use the ROSTER DIAGNOSIS above to ensure trades address CATEGORY WEAKNESSES, not just positional voids. If pitching is a team weakness, propose trades that acquire starting pitching. If hitting is weak, target hitters at scarce positions.

Focus heavily on trades that exploit my surplus to fill my voids while offering the specific opponent manager something they genuinely need. Do not invent players; use the actual rosters provided.

CRITICAL "SHOW YOUR WORK" RULE: You MUST explicitly cite the math. For every trade, explicitly write:
**Net VOR Impact:** [+X / -X] in bold.
And next to every player name involved in the trade, include their markdown badge. Example: "**Carlos Correa** \`[VOR: 65]\`".
Do NOT write paragraphs without citing these numbers. You are a mathematical engine.`,
    }], 1800);

    res.json({ proposals: text, myAnalysis: { surpluses: diagnosis.surpluses, voids: diagnosis.voids, sellHigh: diagnosis.sellHigh }, tradeTargets: tradeTargets.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: WEEKLY GAME PLAN
// ─────────────────────────────────────────────────────────────────────────────
router.post('/gameplan', rateLimiter('gameplan'), async (req, res) => {
  const { my_roster, matchup, league_context, week_number, league_key } = req.body;
  const settings = getLeagueSettings(league_key);
  const leagueCtx = leagueContext(settings);
  const scoringType = settings?.scoring_type || league_context?.scoring_type || 'Roto';

  if (!my_roster || my_roster.length === 0) {
    return res.status(400).json({ error: 'Roster is required.' });
  }

  // ── Unified Roster Diagnosis ───────────────────────────────────────────
  const diagnosis = brain.buildRosterDiagnosis(my_roster, settings || {});

  // fantasyBrain: lineup optimization on ACTIVE players only
  const weekSchedule = {};
  diagnosis.activeRoster.forEach(p => {
    const team = String(p.team || '').toUpperCase();
    weekSchedule[team] = brain.getWeeklyGameCount(team, week_number || 1);
  });

  const lineupOpt = brain.optimizeLineup(diagnosis.activeRoster, weekSchedule, scoringType);

  // If matchup data provided, do matchup-specific analysis on top of diagnosis
  const matchupAnalysis = matchup
    ? brain.analyzeCategories(matchup.my_stats || {}, [{ stats: matchup.opp_stats || {} }], scoringType)
    : null;

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
${diagnosis.promptBlock}
=== WEEKLY GAME PLAN — Week ${week_number || 'current'} ===

DATA ACCURACY NOTE: This roster is pulled directly from the Yahoo Fantasy API for the 2026 season. All player team assignments are correct. Do not question any team assignments — analyze as given.

LINEUP OPTIMIZER RESULTS (active players only):
Top starters: ${lineupOpt.starters.slice(0, 10).map(p => `${p.player_name} — ${p.weekGames} games, confidence: ${p.confidence}`).join('\n')}
Volume Plays (7-game teams): ${lineupOpt.volumePlays?.map(p => p.player_name).join(', ') || 'None'}

POINTS ANALYSIS: ${matchupAnalysis ? matchupAnalysis.advice : diagnosis.catAnalysis.advice}

${matchup ? `MATCHUP: vs ${matchup.opponent_name || 'opponent'}\nTheir projected stats: ${JSON.stringify(matchup.opp_stats || {})}` : 'No specific matchup data — optimize for maximum total points output.'}

YOU HAVE EVERYTHING YOU NEED. Do NOT ask for more data. Analyze this roster and produce your best game plan NOW. Write clean, readable sentences. No JSON syntax in your text. Write like a manager giving his coaching staff the weekly game plan.

CRITICAL JSON ESCAPING RULES: You MUST use double quotes for all JSON keys and string values. Do NOT use single quotes for JSON properties. If you need to use a quote inside your text prose, use single quotes (e.g., "He is a 'must-start' player"). You MUST NOT use raw newlines inside string values; use the literal sequence \\n.
Return ONLY valid JSON:
{
  "weeklyProjection": { "myProjected": "350 pts", "opponentProjected": "310 pts", "confidence": "medium" },
  "swingCategories": ["Total Points"],
  "dailyMoves": {
    "monday": "A clear sentence about what to do Monday",
    "tuesday": "A clear sentence about Tuesday's move",
    "wednesday": "A clear sentence about Wednesday's adjustment",
    "thursday": "A clear sentence about Thursday's adjustment",
    "friday": "A clear sentence about Friday's adjustment",
    "saturday": "A clear sentence about Saturday's adjustment",
    "sunday": "A clear sentence about Sunday's adjustment"
  },
  "keyDecisions": [{ "decision": "A readable question about the decision", "recommendation": "Player name", "reasoning": "A persuasive sentence explaining why in terms of points" }]
}`,
    }], 2000);

    const parsed = tryParseJSON(text);
    if (parsed) return res.json({ ...parsed, lineupOptimizer: lineupOpt, catAnalysis: diagnosis.catAnalysis });
    
    // Robust Fallback
    const _myProj = text.match(/"myProjected"\s*:\s*"([^"]+)"/i);
    const _oppProj = text.match(/"opponentProjected"\s*:\s*"([^"]+)"/i);
    const _conf = text.match(/"confidence"\s*:\s*"([^"]+)"/i);

    res.json({ 
      rawPlan: text, 
      weeklyProjection: {
        myProjected: _myProj ? _myProj[1] : '?',
        opponentProjected: _oppProj ? _oppProj[1] : '?',
        confidence: _conf ? _conf[1] : 'low',
      },
      lineupOptimizer: lineupOpt, 
      catAnalysis: diagnosis.catAnalysis,
      optimalLineup: [],
      volumePlays: [],
      swingCategories: [],
      keyDecisions: [],
      dailyMoves: {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
