import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { players, matchup_context, scoring_type, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaude([{
      role: 'user',
      content: `League Format: ${scoring_type || settings.scoring_type || 'Roto 5x5'}
My Roster: ${JSON.stringify(players || [])}
Context: ${matchup_context || ''}

Give specific start/sit advice for each player. Identify must-starts, bench candidates, and your top 3 toughest decisions.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/startsit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
