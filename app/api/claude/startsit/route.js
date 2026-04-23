import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as mlbStats from '@/lib/mlbStatsService';

// Yahoo stat ID → readable label (same map used in audit route)
const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
  '0': 'GP', '1': 'GS', '2': 'AB', '4': 'OBP', '5': 'SLG',
  '6': 'OPS', '8': 'H', '9': '1B', '10': '2B', '11': '3B',
};

const IL_STATUSES = new Set(['IL','IL+','IL7','IL10','IL15','IL60','DL','O','OUT','SUSP','NA']);

function buildPlayerLine(p) {
  const rawStats = p.stats || {};
  // Map numeric IDs → readable names; skip zero/empty values
  const parts = Object.entries(rawStats)
    .filter(([id, v]) => STAT_MAP[id] && v !== null && v !== undefined && v !== '' && v !== '-' && v !== '0' && v !== 0)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);

  const slot     = p.slot || 'BN';
  const status   = String(p.status || '').toUpperCase();
  const isIL     = IL_STATUSES.has(status) || IL_STATUSES.has(slot.toUpperCase());
  const isDTD    = ['DTD','Q','QUESTIONABLE'].some(s => status.includes(s));
  const tag      = isIL ? ' [⛔IL-UNAVAILABLE — do NOT start]' : isDTD ? ' [⚠️DTD]' : '';

  const statStr  = parts.length ? parts.join(' ') : 'no stats yet';
  return `  • ${p.name || p.player_name} (${p.position || '?'}) [Slot:${slot}] Team:${p.team || '?'}${tag}\n    Stats: ${statStr}`;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { players, matchup_context, scoring_type, league_key, leagueSettings: clientSettings } = await request.json();
    const dbSettings = db.getLeagueSettings(guid, league_key) || {};
    const settings   = { ...dbSettings, ...clientSettings, scoring_type: clientSettings?.scoring_type || dbSettings.scoring_type || scoring_type };

    const pitching = await mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], today: [], pitcherDetails: {} }));
    const todayNames     = (pitching.today || []).join(', ')                    || 'None confirmed';
    const twoStartNames  = (pitching.remainingTwoStarters || pitching.currentWeek || []).join(', ') || 'None confirmed';
    const nextWeekNames  = (pitching.nextWeek || []).slice(0, 8).join(', ')     || 'None confirmed';

    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points'
      : settings.scoring_type === 'headone' ? 'H2H Categories'
      : settings.scoring_type === 'roto'    ? 'Rotisserie'
      : settings.scoring_type               || 'H2H Points';

    const playerList = Array.isArray(players) ? players : [];
    const ilPlayers  = playerList.filter(p => IL_STATUSES.has(String(p.status||'').toUpperCase()) || IL_STATUSES.has(String(p.slot||'').toUpperCase()));
    const activePlayers = playerList.filter(p => !ilPlayers.includes(p));

    const rosterBlock = [
      'ACTIVE PLAYERS (only recommend these):',
      ...activePlayers.map(buildPlayerLine),
      '',
      'IL / UNAVAILABLE (do NOT recommend starting or benching — they cannot play):',
      ...ilPlayers.map(p => `  • ${p.name} (${p.position}) [${p.status || 'injured'}]`),
    ].join('\n') || '(no roster data received)';

    const prompt = `You are Goin' Yard HQ — a fantasy baseball lineup optimizer for the 2026 MLB season.

⛔ ABSOLUTE DATA RULE: You must use ONLY the player names and stats listed in MY ROSTER below.
DO NOT mention any player not listed (e.g. Tyler Glasnow, Logan Webb, Tarik Skubal, or any player from your training data).
DO NOT invent or estimate any stat values. If a stat is missing, say "no stats yet."
DO NOT recommend starting IL/UNAVAILABLE players.

SCORING FORMAT: ${scoringLabel}
LEAGUE: ${settings.name || league_key || 'Unknown'}

MY ROSTER — 2026 Yahoo season stats (stat labels: R=Runs, HR=HRs, RBI, SB, AVG, BB, HBP, W=Wins, K=Strikeouts, ERA, WHIP, IP, SV=Saves):
${rosterBlock}

CONFIRMED PITCHING SCHEDULE (ONLY these pitchers are cleared to start):
• Starting TODAY: ${todayNames}
• 2-start SPs this week: ${twoStartNames}
• 2-start SPs next week: ${nextWeekNames}

⚠️ PITCHER RULE: Only recommend starting SPs who appear in the schedule above. If none of MY pitchers appear in those lists, say so — do not substitute others.

Context from manager: ${matchup_context || 'Evaluate my full roster for today. Who are my must-starts? Who should sit?'}

Give concrete start/sit advice using ONLY my roster above. Include:
1. Must-starts with specific stat reasons
2. Sit candidates with reasons from their actual stats
3. The 3 toughest start/sit decisions on THIS roster`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1200);
    return NextResponse.json({ analysis: text });

  } catch (err) {
    console.error('[claude/startsit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

