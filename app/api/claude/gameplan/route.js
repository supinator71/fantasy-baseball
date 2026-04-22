import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, opponent, week_context, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaude([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
My Roster: ${JSON.stringify(my_roster || [])}
This Week's Opponent: ${JSON.stringify(opponent || {})}
Week Context: ${week_context || ''}

Build a weekly game plan. Identify must-starts, streaming targets, lineup slots to maximize, and categories to focus on vs this specific opponent.`
    }]);

    return NextResponse.json({ gameplan: text });
  } catch (err) {
    console.error('[claude/gameplan]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
