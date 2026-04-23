import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats and schedule data provided in this prompt.
DO NOT use your training data to supply ERA, AVG, HR, or any other stat values.
DO NOT recommend pitchers not listed in the confirmed probable pitcher schedule below.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, opponent, week_context, league_key, leagueSettings: clientSettings } = await request.json();
    // Client always has fresh Yahoo league data — use it. DB entry is fallback.
    const dbSettings = db.getLeagueSettings(guid, league_key) || {};
    const settings = { ...dbSettings, ...clientSettings };
    const pitching = await mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], today: [], pitcherDetails: {} }));

    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });

    // ── Split roster into active vs IL — IL players shown separately ──────────
    const IL_TAGS = new Set(['IL','IL+','IL7','IL10','IL15','IL60','O','OUT','SUSP','NA','DL']);
    const isIL = p => IL_TAGS.has(String(p.status || '').toUpperCase()) || IL_TAGS.has(String(p.slot || '').toUpperCase());
    const activePlayers = (my_roster || []).filter(p => !isIL(p));
    const ilPlayers     = (my_roster || []).filter(p => isIL(p));

    const buildLine = p => {
      const pos = String(p.position || '').split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, pos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      const norm = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const detail = pitching.pitcherDetails?.[norm];
      const schedTag = detail ? ` [${detail.label}]` : '';
      const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
      return `  • ${p.name} (${p.position}, ${p.team || '?'}) [Fantasy Slot:${p.slot || 'BN'}]${schedTag}${mlbStatus} VOR:${vor.toFixed(1)} | ${statStr || 'no stats'}`;
    };

    const activeBlock = activePlayers.length
      ? activePlayers.map(buildLine).join('\n')
      : '  (no active players)';
    const ilBlock = ilPlayers.length
      ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔ IL SLOT — ${p.status || 'injured'}]`).join('\n')
      : '  None';

    const twoStartNames = (pitching.remainingTwoStarters || []).join(', ') || 'None';
    const nextWeekNames = (pitching.nextWeek || []).slice(0, 8).join(', ') || 'None';

    const text = await callClaudeFast([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League: ${settings.name || league_key || '?'} | Format: ${settings.scoring_type || 'Unknown'} | As of: ${nowDay}

⛔⛔⛔ YAHOO IL RULES — READ THIS BEFORE GIVING ANY ADVICE ⛔⛔⛔
IL (Injured List) slots are COMPLETELY SEPARATE from active roster slots in Yahoo Fantasy.
- Dropping an IL player frees an IL slot — it does NOT free an active lineup spot.
- You CANNOT add an active player by dropping an IL player. It is mechanically impossible in Yahoo.
- The ONLY way to open an active roster spot is to drop a NON-IL player (someone from the ACTIVE ROSTER section below).
- Players in the "ON IL" section below occupy IL-only slots. They do NOT block any active roster moves.
- DO NOT mention IL players as drop candidates for roster upgrades. Period.
- The ONLY valid reason to drop an IL player is if you need that IL slot for a different injured player.

📅 DAILY STARTING LINEUP RULES:
1. [Fantasy Slot: BN] = Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] = Active Lineup.
2. [MLB: Starting Today] = confirmed in today's MLB lineup. [MLB: Not Starting/Bench] = benched in real life. [MLB: No Game/Unknown] = team off or lineup not posted.
3. Do not recommend "starting" someone already in an active slot. If a player is [MLB: Not Starting/Bench] or [MLB: No Game/Unknown] and in an active slot, recommend moving them to BN.

ACTIVE ROSTER (these are your only drop candidates if you need to make room):
${activeBlock}

ON IL (⛔ these players occupy IL-ONLY slots — dropping them does NOT open an active spot):
${ilBlock}

CONFIRMED 2-START PITCHER SCHEDULE (as of ${nowDay}):
- Full 2-start value remaining this week: ${twoStartNames}
- Next week 2-start targets: ${nextWeekNames}
- Starting today: ${(pitching.today || []).join(', ') || 'None'}

Opponent context: ${JSON.stringify(opponent || {})}
Week context: ${week_context || ''}

Build a weekly game plan using ONLY the stats and schedule above.
Identify must-starts (prioritize pitchers with remaining starts this week), streaming targets from the confirmed schedule,
and lineup slots to maximize for the ${settings.scoring_type || 'this'} format.
Remember: the week ends Sunday night — factor in remaining games when prioritizing streamers.
REMINDER: Do NOT suggest dropping any player from the "ON IL" section — it will not free an active roster spot.`
    }]);

    return NextResponse.json({ gameplan: text });
  } catch (err) {
    console.error('[claude/gameplan]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
