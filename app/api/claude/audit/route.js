import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as yahoo from '@/lib/yahooService';
import * as mlbStats from '@/lib/mlbStatsService';

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
    const { league_key, team_key } = body;
    // Accept pre-fetched roster from frontend as fallback
    const frontendRoster = body.my_roster || body.roster || [];

    const settings = db.getLeagueSettings(guid, league_key) || {};
    const scoringLabel = SCORING_TYPE_MAP[settings.scoring_type] || settings.scoring_type || 'H2H Points';

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
      'ACTIVE HITTERS:',
      ...hitters.map(buildPlayerLine),
      '',
      'ACTIVE PITCHERS:',
      ...pitchers.map(buildPlayerLine),
      '',
      'ON IL (do NOT recommend as starters, strengths, or trade targets):',
      ...(ilPlayers.length
        ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔IL/${p.status || '?'}]`)
        : ['  None']),
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

    // ── Prompt ────────────────────────────────────────────────────────────────
    const raw = await callClaudeFast([{
      role: 'user',
      content: `You are Goin' Yard HQ — an expert fantasy baseball roster analyst for the 2026 MLB season.

⚠️ SCORING FORMAT: ${scoringLabel}
Tailor ALL advice to this exact format. Do NOT apply Roto logic to H2H leagues, or vice versa.

⚠️ DATA RULE: Use ONLY stats, VOR values, and player names from the data below.
DO NOT invent stats. If a stat is missing, say "stats not yet available."
DO NOT recommend streaming pitchers who are NOT in the two-start list.
${standingsBlock}${pitchingBlock}

LEAGUE: "${settings.name || league_key}" | Teams: ${settings.num_teams || 10} | Format: ${scoringLabel}

TEAM ROSTER — 2026 Yahoo season stats (each line: Name (Pos) [Slot] — stats):
${rosterBlock}

CATEGORY NEEDS (engine-computed from this roster):
${diagnosis.promptBlock || 'N/A'}

PRE-CALCULATED VOR (engine-computed — use these exact values in vorByPlayer, do NOT recalculate):
${vorBlock}

⛔ IL PLAYERS — do NOT mention as strengths or streaming options:
${ilPlayers.length ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [${p.status || 'injured'}]`).join('\n') : '  None'}

BREAKING NEWS (factor in if relevant):
${news ? news.slice(0, 600) : 'None'}

Perform a comprehensive team audit. Be specific — cite actual player names and stats from above.
Respond ONLY with valid JSON (no markdown fences):
{
  "grade": "[A+/A/A-/B+/B/B-/C+/C/D/F based on roster VOR distribution above]",
  "championshipPath": "[one specific sentence on this team's path to win, citing actual roster strengths]",
  "strengths": [
    "[Strength citing a specific player + their actual stat above]",
    "[Strength 2 — another player or category advantage]",
    "[Strength 3]"
  ],
  "weaknesses": [
    "[Weakness citing a specific gap or low-VOR player from above]",
    "[Weakness 2]",
    "[Weakness 3 — category hole if relevant to ${scoringLabel}]"
  ],
  "moves": [
    {"action": "[Specific drop X / add Y or trade suggestion]", "priority": "immediate", "reasoning": "[why, citing actual stats and VOR above]"},
    {"action": "[Move 2]", "priority": "high", "reasoning": "[why]"},
    {"action": "[Move 3]", "priority": "medium", "reasoning": "[why]"}
  ],
  "vorByPlayer": ${JSON.stringify(vorTable.map(p => ({ name: p.name, position: p.position, vor: p.vor, scarcity: p.scarcity })))}
}`
    }], 1800);

    // ── Parse response ────────────────────────────────────────────────────────
    let parsed = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    } catch {
      parsed = { grade: '?', raw };
    }

    return NextResponse.json({
      ...parsed,
      vorByPlayer: vorTable,  // Always use engine-computed VOR, not Claude's
    });

  } catch (err) {
    console.error('[claude/audit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
