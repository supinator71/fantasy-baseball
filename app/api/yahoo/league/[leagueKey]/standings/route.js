import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStandings } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  if (!session?.yahoo_guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const data = await getStandings(session.yahoo_guid, leagueKey);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}