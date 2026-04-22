import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoster, getUserTeamKey } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const teamKey = await getUserTeamKey(guid, leagueKey);
    if (!teamKey) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const players = await getRoster(guid, leagueKey, teamKey);
    return NextResponse.json({ players });
  } catch (err) {
    console.error('[Pitching Hub] Roster fetch failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
