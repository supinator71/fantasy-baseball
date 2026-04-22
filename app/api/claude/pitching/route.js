import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats and pitcher schedule provided in this prompt.
DO NOT use your training data to supply ERA, WHIP, AVG, HR, or any other stat values.
DO NOT recommend pitchers not listed in the confirmed probable pitcher schedule below.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { available_players, my_roster, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};
    const pitchingContext = await mlbStats.getTwoStartPitchers();
    const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings, null, pitchingContext);

    // Build real pitcher schedule block
    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
    const buildBlock = (names) => names.length ? names.map(n => {
      const d = pitchingContext.pitcherDetails?.[n];
      return `  • ${d ? `${d.fullName}: ${d.label}` : n}`;
    }).join('\n') : '  None confirmed';

    const scheduleBlock = [
      `FULL 2-START VALUE (both starts remaining):\n${buildBlock(pitchingContext.remainingTwoStarters || [])}`,
      pitchingContext.oneStartRemaining?.length ? `PARTIAL (1 already pitched, 1 remaining):\n${buildBlock(pitchingContext.oneStartRemaining)}` : '',
      pitchingContext.today?.length ? `STARTING TODAY:\n${buildBlock(pitchingContext.today)}` : '',
      `NEXT WEEK (2-start):\n${pitchingContext.nextWeek?.length ? pitchingContext.nextWeek.slice(0, 6).join(', ') : 'None confirmed'}`,
    ].filter(Boolean).join('\n\n');

    // Score available pitchers with real engine
    const scored = (available_players || []).map(p => {
      const wScore = brain.scoreWaiverTarget(p, my_roster || [], settings, diagnosis.categoryNeeds, pitchingContext);
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      return { ...p, waiverScore: wScore, statStr };
    }).sort((a, b) => b.waiverScore.score - a.waiverScore.score).slice(0, 15);

    const pitcherBlock = scored.map(p =>
      `  • ${p.name} (${p.position}, ${p.team}) — Score:${p.waiverScore.score} | ${p.statStr || 'no stats'} | ${p.waiverScore.reasoning || ''}`
    ).join('\n');

    const text = await callClaude([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League: ${settings.name || league_key || '?'} | Format: ${settings.scoring_type || 'Unknown'} | As of: ${nowDay}

${diagnosis.promptBlock}

CONFIRMED MLB PITCHER SCHEDULE (as of ${nowDay}):
${scheduleBlock}

AVAILABLE PITCHERS (engine-scored, 2026 Yahoo stats):
${pitcherBlock}

Provide pitching strategy: who to stream (from the schedule above only), who to start/sit on roster, 
and the top waiver wire arms to target. Reference only stats and pitchers listed above.`
    }]);

    return NextResponse.json({ recommendations: text });
  } catch (err) {
    console.error('[claude/pitching]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
