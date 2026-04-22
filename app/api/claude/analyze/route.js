import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';
import * as mlbStats from '@/lib/mlbStatsService';

// Yahoo stat ID → human-readable name
const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
  '9': '1B', '10': '2B', '11': '3B', '34': 'HA', '37': 'ER', '39': 'BBA'
};

const PITCHER_SLOTS = new Set(['SP', 'RP', 'P']);

function buildPlayerLine(p) {
  const isPitcher = PITCHER_SLOTS.has(String(p.position || '').split('/')[0]);
  const stats = p.stats || {};
  // Translate Yahoo IDs to real stat names, skip zeroes
  const parts = Object.entries(stats)
    .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  const statStr = parts.length ? parts.join(' ') : 'no stats yet this season';
  const slot = p.slot || 'BN';
  return `  • ${p.name} (${p.position}) [${slot}] — ${statStr}`;
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

    const prompt = `You are Goin' Yard HQ — an expert fantasy baseball assistant. Be specific, data-driven, and name real players.

LEAGUE: "${settings.name || league_key}"
Format: ${settings.scoring_type || 'H2H Points'} | Teams: ${settings.num_teams || 10} | Week: ${settings.current_week || '?'}

MY ROSTER:
${rosterBlock}

PITCHING INTELLIGENCE:
- 2-start SPs THIS WEEK: ${twoStartThis}
- 2-start SPs NEXT WEEK: ${twoStartNext}

TOP FREE AGENTS (first available):
${freeAgents.slice(0, 10).map(p => `  • ${p.name} (${p.position}) — team: ${p.team}`).join('\n') || '  None'}

BREAKING NEWS (MLB — last 24h):
${newsRaw || '  No recent news'}

---
Respond ONLY with valid JSON — no markdown, no prose outside JSON:
{
  "waiver": "2-3 sentences naming specific free agents to ADD and who to DROP. Reference the free agent list above.",
  "startSit": "2-3 sentences naming specific players from MY ROSTER to start or bench this week. Cite actual stats.",
  "pitching": "2-3 sentences covering rotation strategy. Name specific 2-start pitchers to stream. Mention any relevant breaking news (signings, injuries) affecting starters.",
  "audit": "2-3 sentences identifying the biggest strength and biggest weakness on this specific roster by name.",
  "gameplan": "2-3 sentences with the #1 move this week and the key category to attack given this scoring format.",
  "matchup": "1-2 sentences on what category advantage this team has this week."
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
