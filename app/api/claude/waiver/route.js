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
      ? myRoster.map(p => `  • ${p.name} (${p.position}) [${p.slot || 'BN'}] — ${readableStats(p)}`).join('\n')
      : '  (roster unavailable)';

    const scoredBlock = scored.slice(0, 10).map((p, i) =>
      `  ${i + 1}. ${p.name} (${p.position}, ${p.team || '?'}) Score:${p.waiverScore.score} Priority:${p.waiverScore.priority}\n     Stats: ${readableStats(p)}\n     Reason: ${p.waiverScore.reasoning || 'N/A'}`
    ).join('\n');

    const prompt = `You are Goin' Yard HQ — fantasy baseball waiver wire expert for the 2026 MLB season.

⚠️ DATA RULE: Use ONLY the player names, stats, and scores listed below.
DO NOT reference players not shown. DO NOT invent stats.

LEAGUE: ${settings.name || league_key} | Format: ${settings.scoring_type === 'headpoint' ? 'H2H Points' : settings.scoring_type || 'H2H Points'} | Teams: ${settings.num_teams || 10}

MY CURRENT ROSTER:
${rosterBlock}

CATEGORY NEEDS (engine-computed):
${diagnosis.promptBlock || 'N/A'}

ENGINE-RANKED WAIVER TARGETS (top 10, scored by fantasyBrain):
${scoredBlock}

BREAKING NEWS:
${newsText ? newsText.slice(0, 500) : 'None'}

Give specific Add/Drop recommendations based ONLY on the data above.
Reference actual player names from MY ROSTER when suggesting drops.
Reference actual stat values shown — do not guess stats not listed.`;

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
