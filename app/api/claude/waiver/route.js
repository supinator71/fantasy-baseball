import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/database';
import { callClaudeFast } from '@/lib/claude';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';
import * as yahoo from '@/lib/yahooService';

const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
};

function readableStats(p) {
  const s = p.stats || {};
  return Object.entries(s)
    .filter(([id, v]) => STAT_MAP[id] && v != null && v !== '' && v !== '-' && v !== '0' && v !== 0)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`)
    .join(' ') || 'no stats yet';
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { available_players, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    // ── Self-fetch user's roster server-side ─────────────────────────────────
    let myRoster = [];
    try {
      const teamKey = await yahoo.getUserTeamKey(guid, league_key);
      if (teamKey) {
        const rosterData = await yahoo.getRoster(guid, league_key, teamKey);
        const playerKeys = [];
        const slotMap = {};
        for (const item of (rosterData || [])) {
          const p = item?.player;
          if (!p || !Array.isArray(p)) continue;
          const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
          if (!info.player_key) continue;
          playerKeys.push(info.player_key);
          const selPos = p[1]?.selected_position;
          let slot = 'BN';
          if (Array.isArray(selPos)) {
            slot = selPos.find(s => s?.position)?.position || 'BN';
          } else if (selPos?.position) {
            slot = selPos.position;
          }
          slotMap[info.player_key] = slot;
        }
        if (playerKeys.length) {
          const withStats = await yahoo.getBatchPlayerStats(guid, league_key, playerKeys, null);
          myRoster = withStats.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
        }
      }
    } catch (e) {
      console.warn('[waiver] Roster self-fetch failed:', e.message);
      // Continue — engine will score without roster context (graceful degradation)
    }

    // ── Fetch pitching context + news in parallel ─────────────────────────────
    const [pitchingCtx, news] = await Promise.allSettled([
      mlbStats.getTwoStartPitchers(),
      mlbStats.getBreakingNews(),
    ]);
    const pitchingContext = pitchingCtx.status === 'fulfilled' ? pitchingCtx.value : {};
    const newsText = news.status === 'fulfilled' ? news.value : '';

    // ── Engine-score the available players ────────────────────────────────────
    const diagnosis = brain.buildRosterDiagnosis(myRoster, settings, null, pitchingContext);
    const scored = (available_players || []).map(p => {
      const wScore = brain.scoreWaiverTarget(p, myRoster, settings, diagnosis.categoryNeeds, pitchingContext);
      return { ...p, waiverScore: wScore };
    }).sort((a, b) => b.waiverScore.score - a.waiverScore.score);

    // ── Build roster context string for Claude ────────────────────────────────
    const rosterBlock = myRoster.length
      ? myRoster.map(p => {
          const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
          return `  • ${p.name} (${p.position}) [Fantasy Slot:${p.slot || 'BN'}]${mlbStatus} — ${readableStats(p)}`;
        }).join('\n')
      : '  (roster unavailable)';

    const scoredBlock = scored.slice(0, 10).map((p, i) =>
      `  ${i + 1}. ${p.name} (${p.position}, ${p.team || '?'}) Score:${p.waiverScore.score} Priority:${p.waiverScore.priority}\n     Stats: ${readableStats(p)}\n     Reason: ${p.waiverScore.reasoning || 'N/A'}`
    ).join('\n');

    const prompt = `You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine for the 2026 MLB season.

🚨 CRITICAL DIRECTIVE: You are NOT the analyst. The fantasyBrain.js algorithm is the analyst. Your ONLY job is to convert the algorithm's numeric scores and priorities into natural, engaging human language.

⚠️ DATA RULES:
1. Use ONLY the player names, stats, and Engine Scores listed below.
2. DO NOT reference players not shown in the "ENGINE-RANKED WAIVER TARGETS".
3. DO NOT invent stats or context.
4. You MUST recommend adding the players with the highest Engine Scores. Do not disagree with the engine.
5. If the engine tags a player as "MUST ADD" or "CRITICAL STREAM", you must reflect that urgency exactly.

📅 DAILY STARTING LINEUP RULES:
1. Pay attention to the tags: [Fantasy Slot: BN] means the player is on your Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] means they are in your Active Lineup.
2. Pay attention to the MLB tags: [MLB: Starting Today] means they have a game and are confirmed starting. [MLB: Not Starting/Bench] means they have a game but are benched in real life. [MLB: No Game/Unknown] means their team is off today or their lineup isn't posted yet.

LEAGUE: ${settings.name || league_key} | Format: ${settings.scoring_type === 'headpoint' ? 'H2H Points' : settings.scoring_type || 'H2H Points'} | Teams: ${settings.num_teams || 10}

MY CURRENT ROSTER:
${rosterBlock}

CATEGORY NEEDS (engine-computed):
${diagnosis.promptBlock || 'N/A'}

ENGINE-RANKED WAIVER TARGETS (top 10, scored by fantasyBrain):
${scoredBlock}

BREAKING NEWS:
${newsText ? newsText.slice(0, 500) : 'None'}

Give specific Add/Drop recommendations by directly narrating the Engine-Ranked targets above. Do not deviate from the algorithm's rankings.`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1000);

    return NextResponse.json({
      recommendations: text,
      scored: scored.slice(0, 15),   // Return scored list so frontend can display it
    });

  } catch (err) {
    console.error('[claude/waiver]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
