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

    const prompt = `You are Goin' Yard HQ — an expert fantasy baseball assistant. Be specific, data-driven, and name real players.

⚠️ SCORING FORMAT: ${scoringLabel}
This determines ALL advice. For H2H Points: focus on maximizing total points scored this week, not category counts. Do NOT mention 5x5 categories, Roto rankings, or season-long category standing. For H2H Categories: focus on winning individual categories. For Roto: focus on season ranking.

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
