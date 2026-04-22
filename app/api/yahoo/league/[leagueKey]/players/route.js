import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPlayers } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'A';
  const position = searchParams.get('position') || null;
  const start = parseInt(searchParams.get('start') || '0', 10);

  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const players = await getPlayers(guid, leagueKey, status, start, position);
    return NextResponse.json(players);
  } catch (err) {
    console.error('[Pitching Hub] Player search failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
