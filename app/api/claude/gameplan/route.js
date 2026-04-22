import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
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

    // Build real roster block with VOR
    const rosterBlock = (my_roster || []).map(p => {
      const pos = String(p.position || '').split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, pos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const ilTag = ['IL','IL+','IL10','IL15','IL60','O','OUT','SUSP'].includes(String(p.status || '').toUpperCase()) ? ' [⛔IL]' : '';
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      // Tag pitchers with schedule info
      const norm = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const detail = pitching.pitcherDetails?.[norm];
      const schedTag = detail ? ` [${detail.label}]` : '';
      return `  • ${p.name} (${p.position}, ${p.team || '?'}) [${p.slot || 'BN'}]${ilTag}${schedTag} VOR:${vor.toFixed(1)} | ${statStr || 'no stats'}`;
    }).join('\n') || '  (no roster data)';

    const twoStartNames = (pitching.remainingTwoStarters || []).join(', ') || 'None';
    const nextWeekNames = (pitching.nextWeek || []).slice(0, 8).join(', ') || 'None';

    const text = await callClaude([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League: ${settings.name || league_key || '?'} | Format: ${settings.scoring_type || 'Unknown'} | As of: ${nowDay}

MY ROSTER (VOR + 2026 Yahoo stats — use ONLY these numbers):
${rosterBlock}

CONFIRMED 2-START PITCHER SCHEDULE (as of ${nowDay}):
- Full 2-start value remaining: ${twoStartNames}
- Next week 2-start: ${nextWeekNames}
- Starting today: ${(pitching.today || []).join(', ') || 'None'}

Opponent context: ${JSON.stringify(opponent || {})}
Week context: ${week_context || ''}

Build a weekly game plan using ONLY the stats and schedule above.
Identify must-starts (prioritize pitchers with remaining starts this week), streaming targets from the schedule above, 
and lineup slots to maximize for the ${settings.scoring_type || 'this'} format.`
    }]);

    return NextResponse.json({ gameplan: text });
  } catch (err) {
    console.error('[claude/gameplan]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
