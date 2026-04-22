import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
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

function playerILTag(p) {
  const slot   = String(p.slot   || '').toUpperCase();
  const status = String(p.status || '').toUpperCase();
  if (IL_SLOTS.has(slot) || [...IL_STATUSES].some(s => status.includes(s))) return ' [⛔IL-UNAVAILABLE]';
  if ([...DTD_STATUSES].some(s => status.includes(s))) return ' [⚠️DTD]';
  return '';
}

function buildPlayerLine(p) {
  const stats = p.stats || {};
  const parts = Object.entries(stats)
    .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined && v !== null)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  const statStr = parts.length ? parts.join(' ') : 'no stats yet this season';
  const slot = p.slot || 'BN';
  const team = p.team ? `, ${p.team}` : '';
  const ilTag = playerILTag(p);
  return `  • ${p.name} (${p.position}${team}) [${slot}]${ilTag} — ${statStr}`;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { league_key } = await request.json();
    if (!league_key) return NextResponse.json({ error: 'league_key required' }, { status: 400 });

    const settings = db.getLeagueSettings(guid, league_key) || {};

    // ── Fetch all needed data in parallel ─────────────────────────────────────
    const [teamKey, pitching, freeAgents, newsRaw] = await Promise.all([
      yahoo.getUserTeamKey(guid, league_key),
      mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [] })),
      yahoo.getPlayers(guid, league_key, 'A', 0, null).catch(() => []),
      mlbStats.getBreakingNews().catch(() => ''),
    ]);

    // Fetch roster (needs teamKey first)
    let roster = [];
    if (teamKey) {
      try {
        const rosterRaw = await yahoo.getRoster(guid, league_key, teamKey);
        const playerKeys = [];
        for (const item of (rosterRaw || [])) {
          const p = item?.player;
          if (Array.isArray(p)) {
            const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
            if (info.player_key) playerKeys.push(info.player_key);
          }
        }
        if (playerKeys.length) {
          roster = await yahoo.getBatchPlayerStats(guid, league_key, playerKeys, null);
        }
      } catch (e) {
        console.warn('[analyze] roster fetch failed:', e.message);
      }
    }

    // ── Build human-readable roster summary ───────────────────────────────────
    const hitters  = roster.filter(p => !PITCHER_SLOTS.has(String(p.position || '').split('/')[0]));
    const pitchers = roster.filter(p =>  PITCHER_SLOTS.has(String(p.position || '').split('/')[0]));

    const rosterBlock = [
      'HITTERS:',
      ...(hitters.length ? hitters.map(buildPlayerLine) : ['  (none found)']),
      '',
      'PITCHERS:',
      ...(pitchers.length ? pitchers.map(buildPlayerLine) : ['  (none found)']),
    ].join('\n');

    // ── Score waiver targets using the real fantasyBrain engine ─────────────
    // No hardcoded scores — all values come from scoreWaiverTarget()
    const rosterDiag = brain.buildRosterDiagnosis(roster, settings, null, pitching);
    const scoredWaiver = freeAgents.slice(0, 25).map(p => {
      const wScore = brain.scoreWaiverTarget(p, roster, settings, rosterDiag.categoryNeeds, pitching);
      return { ...p, waiverScore: wScore };
    }).sort((a, b) => (b.waiverScore?.score ?? 0) - (a.waiverScore?.score ?? 0));

    // ── Build pitching intelligence block ───────────────────────────────────
    const buildPitcherBlock = (names, details) =>
      names.length === 0 ? '  None confirmed yet'
      : names.map(n => {
          const d = details?.[n];
          return d ? `  • ${d.fullName}: ${d.label}` : `  • ${n}`;
        }).join('\n');

    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
    const twoStartBlock = [
      pitching.remainingTwoStarters?.length
        ? `  FULL 2-START VALUE (both starts remaining):\n${buildPitcherBlock(pitching.remainingTwoStarters, pitching.pitcherDetails)}`
        : '  No pitchers with 2 full starts remaining',
      pitching.oneStartRemaining?.length
        ? `  PARTIAL VALUE — 1 start already pitched, 1 remaining:\n${buildPitcherBlock(pitching.oneStartRemaining, pitching.pitcherDetails)}`
        : '',
      pitching.today?.length
        ? `  STARTING TODAY (single start only):\n${buildPitcherBlock(pitching.today, pitching.pitcherDetails)}`
        : '',
    ].filter(Boolean).join('\n');

    const nextWeekBlock = buildPitcherBlock(pitching.nextWeek || [], {});

    const scoringLabel = SCORING_TYPE_MAP[settings.scoring_type] || settings.scoring_type || 'H2H Points';

    // Split roster into active and IL for Claude context
    const ilPlayers     = roster.filter(p => playerILTag(p).includes('IL-UNAVAILABLE'));
    const activePlayers = roster.filter(p => !playerILTag(p).includes('IL-UNAVAILABLE'));
    const activeBlock   = activePlayers.map(buildPlayerLine).join('\n') || '  (none)';
    const ilBlock       = ilPlayers.length
      ? ilPlayers.map(p => `  • ${p.name} (${p.position}, ${p.team || '?'}) [${p.slot}] [⛔IL] — ${p.status || 'injured'}`).join('\n')
      : '  None';

    const prompt = `You are Goin' Yard HQ — an expert fantasy baseball assistant. Be specific, data-driven, and name real players.

⚠️ SCORING FORMAT: ${scoringLabel}
This determines ALL advice. For H2H Points: focus on maximizing total points scored this week, not category counts. Do NOT mention 5x5 categories, Roto rankings, or season-long category standing. For H2H Categories: focus on winning individual categories. For Roto: focus on season ranking.

⛔ IL RULE: Players listed under "ON IL" below are INJURED and UNAVAILABLE. Do NOT recommend starting them, trading for them, or treating them as active contributors this week. Do NOT mention them as strengths. If they are taking up a roster spot a healthy player could use, flag that in waiver advice.

LEAGUE: "${settings.name || league_key}" | Teams: ${settings.num_teams || 10} | Week: ${settings.current_week || '?'}

⚠️ USE ONLY THE STATS BELOW — do not use your training data for player performance numbers. The stats below are the current 2026 season actuals from Yahoo Fantasy.

ACTIVE ROSTER:
${activeBlock}

ON IL (do NOT start or recommend these players):
${ilBlock}

MY ROSTER:
${rosterBlock}

PITCHING INTELLIGENCE (as of ${nowDay}):
⚠️ CRITICAL PITCHING RULE: Only recommend starting or streaming pitchers who appear in the schedule below.
A player mentioned in breaking news (e.g., "X signs with Y team") is NOT available to start unless they
appear as a confirmed probable pitcher in the schedule below. Newly signed players are typically on
ramp-up/rehab and may not pitch for weeks. Do NOT recommend them.

THIS WEEK — by remaining value:
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
    "grade": "[A/B/C/D based on roster VOR]",
    "headline": "[one sentence verdict on this roster]",
    "strength": "[#1 roster strength — player name and stat value from the data above]",
    "weakness": "[#1 roster weakness — category or player name with stat from the data above]",
    "topPlayer": {"name": "[player name from roster]", "position": "[position]", "statLine": "[stat:value pairs from data above only]"}
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

    const raw = await callClaude([{ role: 'user', content: prompt }], 1400);

    let analysis = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      // Fallback: wrap raw text so modules can still display something
      analysis = { waiver: { headline: 'Analysis unavailable', summary: raw }, startSit: {}, pitching: {}, audit: {}, gameplan: {}, matchup: {} };
    }

    return NextResponse.json({ analysis, scoredWaiver: scoredWaiver.slice(0, 10), lineupRecs: null });

  } catch (err) {
    console.error('[claude/analyze]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
