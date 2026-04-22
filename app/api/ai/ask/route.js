import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { question, leagueKey, context } = await request.json();

    // Pull any saved league settings for richer context
    const leagueSettings = leagueKey ? db.getLeagueSettings(guid, leagueKey) : null;

    const answer = await callClaudeFast([
      {
        role: 'user',
        content: [
          leagueSettings
            ? `League: ${leagueSettings.name} | Format: ${leagueSettings.scoring_type} | Teams: ${leagueSettings.num_teams}`
            : null,
          context || null,
          question,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ]);

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[ai/ask]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
