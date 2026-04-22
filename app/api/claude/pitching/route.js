import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { available_players, my_roster, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};
    const pitchingContext = await mlbStats.getTwoStartPitchers();
    const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings, null, pitchingContext);

    const text = await callClaude([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
${diagnosis.promptBlock}
Pitching Context (2-start pitchers this week): ${JSON.stringify(pitchingContext)}
Available Pitching Free Agents: ${JSON.stringify((available_players || []).slice(0, 15))}

Provide a pitching strategy: who to stream, who to start/sit, and top waiver wire arms to target.`
    }]);

    return NextResponse.json({ recommendations: text });
  } catch (err) {
    console.error('[claude/pitching]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
