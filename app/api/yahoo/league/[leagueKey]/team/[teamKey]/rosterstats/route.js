
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoster, getBatchPlayerStats } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey, teamKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const rosterData = await getRoster(guid, leagueKey, teamKey);
    const playerKeys = [];
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (p && Array.isArray(p)) {
        const infoArray = Array.isArray(p[0]) ? p[0] : [];
        const info = Object.assign({}, ...infoArray);
        if (info.player_key) playerKeys.push(info.player_key);
      }
    }
    if (!playerKeys.length) return NextResponse.json({ players: [], teamKey });
    const players = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);
    return NextResponse.json({ players, teamKey });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
