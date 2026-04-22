import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { question, context, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    const text = await callClaudeFast([{
      role: 'user',
      content: [
        settings.name ? `League: ${settings.name} (${settings.scoring_type})` : null,
        context || null,
        question
      ].filter(Boolean).join('\n\n')
    }]);

    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error('[claude/ask]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
