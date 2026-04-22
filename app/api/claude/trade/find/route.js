import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, all_rosters, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaudeFast([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
My Roster: ${JSON.stringify(my_roster || [])}
Other Teams: ${JSON.stringify(all_rosters || [])}

Identify the best trade targets from other teams. What do I need? What do they need? Suggest 2-3 specific trade proposals that benefit both sides.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/trade/find]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
