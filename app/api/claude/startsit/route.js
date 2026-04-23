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

function buildPlayerLine(p, teamsPlaying) {
  const rawStats = p.stats || {};
  const parts = Object.entries(rawStats)
    .filter(([id, v]) => STAT_MAP[id] && v !== null && v !== undefined && v !== '' && v !== '-' && v !== '0' && v !== 0)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);

  const slot     = p.slot || 'BN';
  const status   = String(p.status || '').toUpperCase();
  const isIL     = IL_STATUSES.has(status) || IL_STATUSES.has(slot.toUpperCase());
  const isDTD    = ['DTD','Q','QUESTIONABLE'].some(s => status.includes(s));

  // Check if hitter's team has a game today
  const isPitcher = ['SP','RP','P'].some(x => String(p.position||'').toUpperCase().includes(x));
  const teamAbbr  = String(p.team || '').toUpperCase();
  const teamName  = String(p.team || '').toLowerCase();
  const hasGame   = !teamsPlaying || isPitcher
    || teamsPlaying.abbrs.has(teamAbbr)
    || teamsPlaying.names.has(teamName)
    || teamsPlaying.abbrs.size === 0;  // fallback: if schedule fetch failed, assume game

  const tag = isIL    ? ' [⛔IL-UNAVAILABLE — do NOT start]'
             : isDTD  ? ' [⚠️DTD — health risk]'
             : !hasGame ? ' [⛔NO GAME TODAY — cannot score points, bench this player]'
             : '';

  const statStr = parts.length ? parts.join(' ') : 'no stats yet';
  return `  • ${p.name || p.player_name} (${p.position || '?'}) [Slot:${slot}] Team:${teamAbbr}${tag}\n    Stats: ${statStr}`;
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
    const teamsPlaying = await mlbStats.getTodayTeamsPlaying().catch(() => ({ abbrs: new Set(), names: new Set() }));

    const todayNames     = (pitching.today || []).join(', ')                    || 'None confirmed';
    const twoStartNames  = (pitching.remainingTwoStarters || pitching.currentWeek || []).join(', ') || 'None confirmed';
    const nextWeekNames  = (pitching.nextWeek || []).slice(0, 8).join(', ')     || 'None confirmed';
    const teamsOffToday  = teamsPlaying.abbrs.size > 0
      ? `Teams with NO game today (hitters cannot score): any team NOT listed below has the day off.
Teams PLAYING today: ${[...teamsPlaying.abbrs].join(', ')}`
      : 'Schedule unavailable — assume all hitters may play.';

    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points'
      : settings.scoring_type === 'headone' ? 'H2H Categories'
      : settings.scoring_type === 'roto'    ? 'Rotisserie'
      : settings.scoring_type               || 'H2H Points';

    const playerList = Array.isArray(players) ? players : [];
    const ilPlayers  = playerList.filter(p => IL_STATUSES.has(String(p.status||'').toUpperCase()) || IL_STATUSES.has(String(p.slot||'').toUpperCase()));
    const activePlayers = playerList.filter(p => !ilPlayers.includes(p));

    const rosterBlock = [
      'ACTIVE PLAYERS (only recommend these):',
      ...activePlayers.map(p => {
        const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
        return buildPlayerLine(p, teamsPlaying) + mlbStatus;
      }),
      '',
      'IL / UNAVAILABLE (do NOT recommend starting or benching — they cannot play):',
      ...ilPlayers.map(p => `  • ${p.name} (${p.position}) [${p.status || 'injured'}]`),
    ].join('\n') || '(no roster data received)';

    const prompt = `You are Goin' Yard HQ — a fantasy baseball lineup optimizer for the 2026 MLB season.

⛔ ABSOLUTE DATA RULE: You must use ONLY the player names and stats listed in MY ROSTER below.
DO NOT mention any player not listed (e.g. Tyler Glasnow, Logan Webb, Tarik Skubal, or any player from your training data).
DO NOT invent or estimate any stat values. If a stat is missing, say "no stats yet."
DO NOT recommend starting IL/UNAVAILABLE players.

📅 DAILY STARTING LINEUP RULES:
1. Pay attention to the tags: [Fantasy Slot: BN] means the player is on your Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] means they are in your Active Lineup.
2. Pay attention to the MLB tags: [MLB: Starting Today] means they have a game and are confirmed starting. [MLB: Not Starting/Bench] means they have a game but are benched in real life. [MLB: No Game/Unknown] means their team is off today or their lineup isn't posted yet.
3. ADVICE MUST RECOGNIZE BENCHINGS: Do not recommend "starting" a player who is already in an active Fantasy Slot. If a player is marked [MLB: Not Starting/Bench] or [MLB: No Game/Unknown], DO NOT tell the user to start them today, and recommend moving them to the Fantasy Bench [BN] if they are currently active.

SCORING FORMAT: ${scoringLabel}
LEAGUE: ${settings.name || league_key || 'Unknown'}

MY ROSTER — 2026 Yahoo season stats:
${rosterBlock}

HITTER SCHEDULE — TODAY:
${teamsOffToday}
⚠️ HITTER RULES:
1. Any hitter tagged [⛔NO GAME TODAY] has no game — automatic sit, cannot score.
2. Even if a hitter has a game, they may not be in their MLB team's actual starting lineup. Note this uncertainty for players who platoon or sit vs. certain handedness.
3. If a player is [Slot:BN] and has a game + strong stats, recommend whether to move them ACTIVE.
4. If a player is in an active slot but tagged [⛔NO GAME TODAY], recommend moving them to bench.

CONFIRMED PITCHING SCHEDULE:
• Starting TODAY: ${todayNames}
• 2-start SPs this week: ${twoStartNames}
• 2-start SPs next week: ${nextWeekNames}

⚠️ PITCHER RULE: Only recommend starting SPs who appear in the schedule above. If none of MY pitchers appear in those lists, say so.

Context from manager: ${matchup_context || 'Evaluate my full roster for today. Who are must-starts? Who should sit or be moved to bench?'}

Give concrete lineup advice using ONLY my roster. Include:
1. Must-starts (active slot confirmed, team playing, likely in MLB lineup)
2. Automatic sits (no game today, IL, or [Slot:BN] with no reason to activate)
3. Moves to make (BN → active or active → BN swaps)
4. Top 3 toughest decisions`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1200);
    return NextResponse.json({ analysis: text });

  } catch (err) {
    console.error('[claude/startsit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

