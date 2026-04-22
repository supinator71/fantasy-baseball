import { NextResponse } from 'next/server';
import { getLeague } from '@/lib/yahooService';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function GET(request, { params }) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  const { leagueKey } = await params;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await getLeague(guid, leagueKey);
    // Save to DB
    const settings = {
      league_key: leagueKey,
      name: data.name,
      num_teams: data.num_teams,
      scoring_type: data.scoring_type,
      current_week: data.current_week,
      // Parse more as needed
    };
    db.saveLeagueSettings(guid, leagueKey, settings);
    
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
