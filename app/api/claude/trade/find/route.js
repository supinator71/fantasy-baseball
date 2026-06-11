import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, all_rosters, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};
    const leagueSize = settings.num_teams || 12;

    // ── Unified Roster Diagnosis ───────────────────────────────────────────
    const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings || {});

    // Find teams with opposite needs
    const tradeTargets = [];
    let allRostersSummary = '';

    if (all_rosters && Array.isArray(all_rosters)) {
      all_rosters.forEach(team => {
        const mockRoster = (team.players || []).map(pStr => {
          if (pStr && typeof pStr === 'object') return pStr;
          const match = String(pStr || '').match(/\((.*?)\)$/);
          return { position: match ? match[1] : '' };
        });

        const theirAnalysis = brain.analyzeRosterStrengths(mockRoster, settings);
        const theirSurposPositions = (theirAnalysis.surpluses || []).map(s => s.position);
        const matchingVoids = (diagnosis.voids || []).filter(v => theirSurposPositions.includes(v));
        const mySurplusPositions = (diagnosis.surpluses || []).map(s => s.position);
        const theirVoids = theirAnalysis.voids || [];
        const matchingSurplus = mySurplusPositions.filter(p => theirVoids.includes(p));

        if (matchingVoids.length > 0 || matchingSurplus.length > 0) {
          tradeTargets.push({
            team: team.team || team.team_name || team.name,
            theyHave: matchingVoids,
            theyNeed: matchingSurplus,
            compatibility: matchingVoids.length + matchingSurplus.length,
          });
        }
      });

      if (all_rosters.length > 0) {
        allRostersSummary = '\n\n=== ENTIRE LEAGUE ROSTERS ===\n' + all_rosters.map(t => {
          const pList = Array.isArray(t.players)
            ? t.players.map(p => typeof p === 'object' ? `${p.name || p.player_name} (${p.position})` : p).join(', ')
            : '';
          return `Team: ${t.team || t.team_name || t.name}\nRoster: ${pList}`;
        }).join('\n\n');
      }
    }

    tradeTargets.sort((a, b) => b.compatibility - a.compatibility);

    const text = await callClaudeFast([{
      role: 'user',
      content: `League Format: ${settings.scoring_type || 'Unknown'} | Teams: ${settings.num_teams || 10} | League: ${settings.name || league_key || '?'}
${diagnosis.promptBlock}
=== TRADE FINDER ===

BEST TRADE PARTNERS (by roster compatibility):
${tradeTargets.slice(0, 5).map(t =>
  `${t.team}: They have surplus ${t.theyHave.join('/')} and need ${t.theyNeed.join('/')}`
).join('\n') || 'No roster data for other teams provided — generating general trade proposals.'}${allRostersSummary}

Generate 3-5 specific trade proposals using the ENTIRE LEAGUE ROSTERS data above. For each:
1. What I send and receive (specific player names sourced from the actual opposing rosters)
2. Which specific Team/Manager I am trading with
3. Why this makes sense for BOTH sides (addressing my surplus/void and their surplus/void)
4. A fairness score estimate (-100 to +100, from MY perspective)
5. The "pitch" — exact language to use when proposing this trade to the other manager

CRITICAL: Use the ROSTER DIAGNOSIS above to ensure trades address CATEGORY WEAKNESSES, not just positional voids. If pitching is a team weakness, propose trades that acquire starting pitching. If hitting is weak, target hitters at scarce positions.

Focus heavily on trades that exploit my surplus to fill my voids while offering the specific opponent manager something they genuinely need. Do not invent players; use the actual rosters provided.

CRITICAL "SHOW YOUR WORK" RULE: You MUST explicitly cite the math. For every trade, explicitly write:
**Net VOR Impact:** [+X / -X] in bold.
And next to every player name involved in the trade, include their markdown badge. Example: "**Carlos Correa** \\\`[VOR: 65]\\\`".
Do NOT write paragraphs without citing these numbers. You are a mathematical engine.`
    }]);

    return NextResponse.json({
      proposals: text,
      myAnalysis: {
        surpluses: diagnosis.surpluses,
        voids: diagnosis.voids,
        sellHigh: diagnosis.sellHigh
      },
      tradeTargets: tradeTargets.slice(0, 5)
    });
  } catch (err) {
    console.error('[claude/trade/find]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
