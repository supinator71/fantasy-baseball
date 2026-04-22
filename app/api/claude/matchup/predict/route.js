import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, opponent_roster, matchup_stats, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaudeFast([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
My Team: ${JSON.stringify(my_roster || [])}
Opponent: ${JSON.stringify(opponent_roster || [])}
Current Matchup Stats: ${JSON.stringify(matchup_stats || {})}

Predict the outcome of this matchup. Which categories am I winning/losing? What lineup moves or streaming adds would flip the result? Give a win probability and key battleground categories.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/matchup/predict]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
