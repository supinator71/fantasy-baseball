import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats provided in this prompt.
DO NOT use your training data to supply ERA, AVG, HR, or any other stat values.
DO NOT invent or assume stats for any player. If a stat is not listed, say "stats not available" rather than guessing.
`;

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { giving, receiving, my_roster, their_roster, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    // Score every player in the trade using the real VOR engine
    const vorScore = (players) => (players || []).map(p => {
      const pos = String(p.position || p).split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, pos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      return `  • ${p.name || p} — VOR: ${vor.toFixed(1)} | ${statStr || 'no stats available'}`;
    }).join('\n');

    const givingBlock    = vorScore(Array.isArray(giving)    ? giving    : [{ name: giving }]);
    const receivingBlock = vorScore(Array.isArray(receiving) ? receiving : [{ name: receiving }]);

    const text = await callClaude([{
      role: 'user',
      content: `${STAT_GUARDRAIL}
League Format: ${settings.scoring_type || 'Unknown'} | Teams: ${settings.num_teams || 10} | League: ${settings.name || league_key || '?'}

TRADE PROPOSAL:
You GIVE (VOR and 2026 stats from Yahoo):
${givingBlock}

You RECEIVE (VOR and 2026 stats from Yahoo):
${receivingBlock}

My Current Roster: ${Array.isArray(my_roster) ? my_roster.map(p => p.name || p).join(', ') : my_roster || 'Not provided'}
Their Roster: ${Array.isArray(their_roster) ? their_roster.map(p => p.name || p).join(', ') : their_roster || 'Not provided'}

Evaluate this trade using ONLY the VOR and stats shown above. 
Who wins? Is it fair? Should I accept or counter? Give a clear verdict.
DO NOT cite stats not listed above.`
    }]);

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('[claude/trade]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
