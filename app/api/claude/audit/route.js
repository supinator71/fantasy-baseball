import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, standings_context, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};
    const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings, null, null);

    const text = await callClaude([{
      role: 'user',
      content: `League: ${JSON.stringify(settings)}
${diagnosis.promptBlock}
Standings Context: ${standings_context || 'Not provided'}

Perform a full team audit. Grade each roster position (A-F). Identify the 3 biggest strengths, 3 biggest weaknesses, and give an overall team grade with a clear action plan.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/audit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
