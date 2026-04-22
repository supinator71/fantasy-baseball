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
    const raw = await getLeague(guid, leagueKey);

    // Yahoo returns league as an array: [settingsObj, metadataObj]
    // or sometimes a plain object. Normalize both cases.
    const info = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});

    const settings = {
      league_key: leagueKey,
      name: info.name || leagueKey,
      num_teams: info.num_teams,
      scoring_type: info.scoring_type,
      current_week: info.current_week,
      draft_status: info.draft_status,
      season: info.season,
      start_week: info.start_week,
      end_week: info.end_week,
    };

    // Persist to DB
    db.saveLeagueSettings(guid, leagueKey, settings);
    db.trackLeagueUse(guid, leagueKey);

    return NextResponse.json(settings);
  } catch (err) {
    console.error('[league route]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

