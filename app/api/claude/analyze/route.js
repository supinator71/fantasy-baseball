import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as yahoo from '@/lib/yahooService';
import * as mlbStats from '@/lib/mlbStatsService';

/**
 * POST /api/claude/analyze
 *
 * The single master AI call for the entire app.
 * Fetches all needed data server-side (roster, trends, pitching context, waiver targets),
 * runs fantasyBrain scoring, and sends ONE prompt to Claude.
 * Returns a structured { waiver, startSit, pitching, audit, gameplan, matchup } object
 * that gets cached in LeagueContext and shared across all modules.
 *
 * Individual module buttons that previously triggered their own Claude calls should
 * display this cached result instead. Only AiQuestionBox (/api/claude/ask) calls
 * Claude again, and only on explicit user input.
 */
export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { league_key } = await request.json();
    if (!league_key) return NextResponse.json({ error: 'league_key required' }, { status: 400 });

    const settings = db.getLeagueSettings(guid, league_key) || {};

    // ── Fetch all data in parallel ────────────────────────────────────────────
    const [rosterRes, trendsRes, pitchingCtx, waiverFAs] = await Promise.allSettled([
      yahoo.getRosterWithStats(guid, league_key),
      yahoo.getTrends ? yahoo.getTrends(guid, league_key) : Promise.resolve({ myPlayers: [], freeAgents: [] }),
      mlbStats.getTwoStartPitchers().catch(() => ({ today: [], currentWeekTwoStart: [], nextWeekTwoStart: [] })),
      yahoo.getPlayers(guid, league_key, 'A', 0, null).catch(() => []),
    ]);

    const roster      = rosterRes.status === 'fulfilled'   ? rosterRes.value   : [];
    const trends      = trendsRes.status === 'fulfilled'   ? trendsRes.value   : { myPlayers: [], freeAgents: [] };
    const pitching    = pitchingCtx.status === 'fulfilled' ? pitchingCtx.value : { today: [], currentWeekTwoStart: [], nextWeekTwoStart: [] };
    const freeAgents  = waiverFAs.status === 'fulfilled'   ? waiverFAs.value   : [];

    // ── Run fantasyBrain scoring ──────────────────────────────────────────────
    const diagnosis = brain.buildRosterDiagnosis
      ? brain.buildRosterDiagnosis(roster, settings, null, pitching)
      : { promptBlock: `Roster: ${JSON.stringify(roster.slice(0, 10))}`, categoryNeeds: {} };

    const scoredWaiver = freeAgents.slice(0, 25).map(p => ({
      ...p,
      waiverScore: brain.scoreWaiverTarget
        ? brain.scoreWaiverTarget(p, roster, settings, diagnosis.categoryNeeds, pitching)
        : { score: 50, priority: 'Speculative add', reasoning: '' }
    })).sort((a, b) => (b.waiverScore?.score ?? 0) - (a.waiverScore?.score ?? 0));

    const lineupRecs = brain.optimizeLineup
      ? brain.optimizeLineup(roster, {}, settings.scoring_type, settings.num_teams)
      : { starters: [], bench: [], reasoning: '' };

    // ── Single Claude call ────────────────────────────────────────────────────
    const prompt = `You are Goin' Yard HQ — a friendly, expert fantasy baseball assistant. The user is likely a beginner.

LEAGUE: ${settings.name || league_key} | Format: ${settings.scoring_type || 'H2H Points'} | Teams: ${settings.num_teams || 10}

${diagnosis.promptBlock || ''}

PITCHING CONTEXT:
- Probable starters TODAY: ${pitching.today?.slice(0, 8).join(', ') || 'None'}
- 2-start pitchers THIS WEEK: ${pitching.currentWeekTwoStart?.slice(0, 6).join(', ') || 'None'}
- 2-start pitchers NEXT WEEK: ${pitching.nextWeekTwoStart?.slice(0, 6).join(', ') || 'None'}

LINEUP OPTIMIZER OUTPUT: ${lineupRecs.reasoning}
Top starts: ${lineupRecs.starters?.slice(0, 5).map(p => `${p.player_name} (score:${p.startScore})`).join(', ') || 'N/A'}
Volume plays (7-game weeks): ${lineupRecs.volumePlays?.map(p => p.player_name).join(', ') || 'None'}

TOP WAIVER TARGETS (scored by brain):
${scoredWaiver.slice(0, 8).map(p => `${p.name || p.player_name} (${p.position}) — Score: ${p.waiverScore?.score}, ${p.waiverScore?.priority}`).join('\n')}

HOT FREE AGENTS (trending):
${trends.freeAgents?.slice(0, 5).map(p => `${p.name} (${p.position}) — ${p.trend}`).join('\n') || 'None'}

---
Respond ONLY with a JSON object in this exact shape (no markdown, no prose outside JSON):
{
  "waiver": "2-3 sentence waiver wire recommendation. Name specific players to add/drop.",
  "startSit": "2-3 sentence start/sit advice for this week. Reference the lineup optimizer output.",
  "pitching": "2-3 sentence pitching strategy. Highlight any 2-start pitchers to stream or pick up.",
  "audit": "2-3 sentence team audit. Name the biggest strength and biggest weakness on this roster.",
  "gameplan": "2-3 sentence weekly game plan. What is the #1 priority move this week?",
  "matchup": "1-2 sentence matchup preview. Which categories should the user focus on winning?"
}`;

    const raw = await callClaude([{ role: 'user', content: prompt }], 900);

    // Parse JSON from Claude response
    let analysis = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { waiver: raw, startSit: '', pitching: '', audit: '', gameplan: '', matchup: '' };
    } catch {
      // If JSON parse fails, put the whole response in waiver as fallback
      analysis = { waiver: raw, startSit: '', pitching: '', audit: '', gameplan: '', matchup: '' };
    }

    return NextResponse.json({
      analysis,
      // Pass computed data to the client so modules can use brain scores directly
      scoredWaiver: scoredWaiver.slice(0, 10),
      lineupRecs,
    });

  } catch (err) {
    console.error('[claude/analyze]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
