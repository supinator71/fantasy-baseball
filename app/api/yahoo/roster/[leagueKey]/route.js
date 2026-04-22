import { NextResponse } from 'next/server';
import { getRoster, getUserTeamKey } from '@/lib/yahooService';
import { getSession } from '@/lib/session';

export async function GET(request, { params }) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  const { leagueKey } = await params;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const teamKey = await getUserTeamKey(guid, leagueKey);
    if (!teamKey) throw new Error('Could not find user team in league');
    
    const players = await getRoster(guid, leagueKey, teamKey);
    return NextResponse.json({ players });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
