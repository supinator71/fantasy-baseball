import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as mlbStats from '@/lib/mlbStatsService';

// Shared hallucination guard prepended to all Claude prompts
const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats provided in this prompt. 
DO NOT use your training data to supply ERA, AVG, HR, or any other stat values.
DO NOT invent or assume stats for any player. If a stat is not listed below, say "stats not available" rather than guessing.
DO NOT recommend pitchers who are not confirmed as probable pitchers in the schedule below.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { players, matchup_context, scoring_type, league_key, leagueSettings: clientSettings } = await request.json();
    const dbSettings = db.getLeagueSettings(guid, league_key) || {};
    // Merge: client has fresh Yahoo data, DB has persisted overrides
    const settings = { ...dbSettings, ...clientSettings, scoring_type: clientSettings?.scoring_type || dbSettings.scoring_type || scoring_type };

    const pitching = await mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], today: [], pitcherDetails: {} }));

    const twoStartNames = (pitching.remainingTwoStarters || []).join(', ') || 'None confirmed';
    const todayNames    = (pitching.today || []).join(', ') || 'None confirmed';

    // Build stat-only string per player from Yahoo data; no training data
    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points' : settings.scoring_type === 'headone' ? 'H2H Categories' : settings.scoring_type === 'roto' ? 'Rotisserie' : settings.scoring_type || 'Unknown format';

    // Build a stat-only string for each player from the data passed in — no training data
    const rosterBlock = (players || []).map(p => {
      const stats = p.stats || p;
      const statStr = Object.entries(stats)
        .filter(([k, v]) => !['name','position','team','slot','status','player_key'].includes(k) && v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`)
        .join(' ');
      const ilTag = ['IL','IL+','IL10','IL15','IL60','O','OUT','SUSP'].includes(String(p.status || '').toUpperCase()) ? ' [⛔IL-UNAVAILABLE]' : '';
      return `  • ${p.name || p.player_name} (${p.position || '?'}, ${p.team || '?'}) [${p.slot || 'BN'}]${ilTag} — ${statStr || 'no stats available'}`;
    }).join('\n') || '  (no roster data)';

    const text = await callClaudeFast([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League Format: ${scoringLabel}
League: ${settings.name || league_key || 'Unknown'}

MY ROSTER (2026 season stats from Yahoo — use ONLY these numbers):
${rosterBlock}

PITCHING SCHEDULE (MLB confirmed probable pitchers only):
- 2-start SPs with starts REMAINING this week: ${twoStartNames}
- Starting TODAY: ${todayNames}
- 2-start SPs NEXT WEEK: ${(pitching.nextWeek || []).slice(0, 6).join(', ') || 'None confirmed'}

⚠️ PITCHING RULE: Only recommend starting pitchers who appear in the schedule above.

User Question / Context: ${matchup_context || 'Evaluate my roster for today and this week.'}

Give specific start/sit advice based ONLY on the stats and schedule above. 
For players with no stats listed, note that stats are unavailable rather than guessing.
Identify must-starts, bench candidates, and the top 3 toughest decisions.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/startsit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
