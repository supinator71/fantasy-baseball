import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';
import { callClaude } from '@/lib/claude';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';
import * as yahoo from '@/lib/yahooService';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "batflip_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function POST(request) {
  const session = await getIronSession(await cookies(), sessionOptions);
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { available_players, my_roster, league_key } = await request.json();
    const settings = db.load().league_settings[guid]?.[league_key] || {};
    
    // Build context
    const pitchingContext = await mlbStats.getTwoStartPitchers();
    const diagnosis = brain.buildRosterDiagnosis(my_roster, settings, null, pitchingContext);
    
    const scored = (available_players || []).map(p => {
      const wScore = brain.scoreWaiverTarget(p, my_roster, settings, diagnosis.categoryNeeds, pitchingContext);
      return { ...p, waiverScore: wScore };
    }).sort((a,b) => b.waiverScore.score - a.waiverScore.score);

    const news = await mlbStats.getBreakingNews();
    
    const text = await callClaude([
      {
        role: 'user',
        content: `
          League Settings: ${JSON.stringify(settings)}
          ${diagnosis.promptBlock}
          Breaking News: ${news}
          Waiver Targets: ${JSON.stringify(scored.slice(0, 10))}
          
          Provide Add/Drop recommendations based on the team's needs and the waiver talent.
        `
      }
    ]);

    return NextResponse.json({ recommendations: text, scored: scored.slice(0, 10) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
