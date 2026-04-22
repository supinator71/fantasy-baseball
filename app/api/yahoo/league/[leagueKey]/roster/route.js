import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserTeamKey, getRoster } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  
  try {
    const myTeamKey = await getUserTeamKey(guid, leagueKey);
    if (!myTeamKey) throw new Error('Could not find your team in this league.');
    const data = await getRoster(guid, leagueKey, myTeamKey);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
