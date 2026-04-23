import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';

const LOWER_IS_BETTER = new Set(['26', '27', '29']); // ERA, WHIP, L

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    // Component sends matchup_data (the full parsed matchup object from the Yahoo route)
    const { matchup_data, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    if (!matchup_data?.myTeam || !matchup_data?.opponent) {
      return NextResponse.json({ error: 'No matchup data provided' }, { status: 400 });
    }

    const { week, myTeam, opponent, stats } = matchup_data;
    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points'
      : settings.scoring_type === 'headone' ? 'H2H Categories'
      : settings.scoring_type === 'roto'    ? 'Rotisserie'
      : settings.scoring_type               || 'H2H Points';

    // ── Self-fetch my roster for additional context ──────────────────────────
    let rosterNames = [];
    try {
      const teamKey = await yahoo.getUserTeamKey(guid, league_key);
      if (teamKey) {
        const rosterData = await yahoo.getRoster(guid, league_key, teamKey);
        for (const item of (rosterData || [])) {
          const p = item?.player;
          if (!p || !Array.isArray(p)) continue;
          const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
          if (info.full_name || info.name) rosterNames.push(info.full_name || info.name);
        }
      }
    } catch (e) {
      console.warn('[matchup/predict] Roster fetch failed:', e.message);
    }

    // ── Build a readable category comparison table ───────────────────────────
    const scoreBlock = `${myTeam.name}: ${myTeam.total_points ?? '?'} pts  vs  ${opponent.name}: ${opponent.total_points ?? '?'} pts`;

    const categoryRows = (stats || []).map(s => {
      const lowerBetter = LOWER_IS_BETTER.has(String(s.stat_id));
      const myWin  = s.my_winning  ? ' ← YOU LEAD' : '';
      const oppWin = s.opp_winning ? ' ← OPP LEADS' : '';
      return `  ${s.name || s.stat_id}: ${s.my_value ?? '—'} vs ${s.opp_value ?? '—'}${myWin}${oppWin}`;
    }).join('\n');

    const myWinningCats  = (stats || []).filter(s => s.my_winning).map(s => s.name || s.stat_id);
    const oppWinningCats = (stats || []).filter(s => s.opp_winning).map(s => s.name || s.stat_id);
    const tiedCats       = (stats || []).filter(s => !s.my_winning && !s.opp_winning).map(s => s.name || s.stat_id);

    const prompt = `You are Goin' Yard HQ — an expert fantasy baseball matchup analyst.

⚠️ DATA RULE: Analyze ONLY the data provided below. Do not reference players or stats from your training data.

LEAGUE: ${settings.name || league_key} | Format: ${scoringLabel} | Week ${week || '?'}

CURRENT LIVE SCORE:
${scoreBlock}

CATEGORY-BY-CATEGORY BREAKDOWN:
${categoryRows || '(no category data)'}

SUMMARY:
- Categories YOU are leading: ${myWinningCats.join(', ') || 'none yet'}
- Categories OPPONENT leads: ${oppWinningCats.join(', ') || 'none yet'}
- Tied categories: ${tiedCats.join(', ') || 'none'}

MY ROSTER PLAYERS (active this week):
${rosterNames.length ? rosterNames.join(', ') : '(roster unavailable)'}

Based ONLY on the data above, provide:
1. Win probability assessment — who is favored based on current score and category gaps
2. Which categories are battlegrounds (close enough to flip this week)
3. Which categories are locked up on either side
4. Specific advice: what do I need to do THIS WEEK to win? (reference real categories and my actual score gap)
5. Any streaming or bench move recommendations based on which categories I'm losing`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1000);
    return NextResponse.json({ prediction: text });

  } catch (err) {
    console.error('[claude/matchup/predict]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
