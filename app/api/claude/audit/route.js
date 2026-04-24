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
