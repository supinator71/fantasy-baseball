import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';
import * as mlbStats from '@/lib/mlbStatsService';

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

    // ── Score waiver targets ───────────────────────────────────────────────────
    const scoredWaiver = freeAgents.slice(0, 25).map(p => {
      const pos    = String(p.position || '').split('/')[0].toUpperCase();
      const isPit  = PITCHER_SLOTS.has(pos);
      const score  = isPit ? 55 : 45; // simple fallback score without full brain
      return { ...p, waiverScore: { score, priority: score >= 60 ? 'High priority' : 'Speculative add', reasoning: 'Check stats' } };
    }).sort((a, b) => (b.waiverScore?.score ?? 0) - (a.waiverScore?.score ?? 0));

    // ── Single Claude call for the entire app ─────────────────────────────────
    const twoStartThis = (pitching.currentWeek || []).slice(0, 8).join(', ') || 'None confirmed';
    const twoStartNext = (pitching.nextWeek   || []).slice(0, 6).join(', ') || 'None confirmed';

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

PITCHING INTELLIGENCE:
- 2-start SPs THIS WEEK: ${twoStartThis}
- 2-start SPs NEXT WEEK: ${twoStartNext}

TOP FREE AGENTS (available now):
${freeAgents.slice(0, 10).map(p => `  • ${p.name} (${p.position}) — ${p.team}`).join('\n') || '  None'}

BREAKING NEWS (MLB — last 24h):
${newsRaw || '  No recent news available'}

---
Respond ONLY with valid JSON — no markdown fences, no prose outside JSON:
{
  "waiver": "2-3 sentences. Name specific free agents to ADD and who to DROP. Reference actual free agents from the list above.",
  "startSit": "2-3 sentences. Name specific roster players to START or BENCH this week based on their actual stats shown above.",
  "pitching": "2-3 sentences. Name specific 2-start pitchers to stream. Mention ERA/WHIP from stats above. Note any relevant breaking news.",
  "audit": "2-3 sentences. Identify the #1 strength and #1 weakness on this roster by player name, citing actual stat values.",
  "gameplan": "2-3 sentences. The #1 move this week for a ${scoringLabel.split('(')[0].trim()} league. Be specific to this scoring format.",
  "matchup": "1-2 sentences. What this team's point-scoring advantage is this week."
}`;

    const raw = await callClaude([{ role: 'user', content: prompt }], 900);

    let analysis = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { waiver: raw, startSit: '', pitching: '', audit: '', gameplan: '', matchup: '' };
    } catch {
      analysis = { waiver: raw, startSit: '', pitching: '', audit: '', gameplan: '', matchup: '' };
    }

    return NextResponse.json({ analysis, scoredWaiver: scoredWaiver.slice(0, 10), lineupRecs: null });

  } catch (err) {
    console.error('[claude/analyze]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
