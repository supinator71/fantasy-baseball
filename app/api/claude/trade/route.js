import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { giving, receiving, my_roster, their_roster, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaude([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
Trade Proposal:
  You GIVE: ${giving?.join(', ')}
  You RECEIVE: ${receiving?.join(', ')}
My Current Roster: ${my_roster?.join(', ') || 'Not provided'}
Their Roster: ${their_roster?.join(', ') || 'Not provided'}

Evaluate this trade. Who wins? Is it fair? Should I accept or counter? Give a clear verdict.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/trade]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
