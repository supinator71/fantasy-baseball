import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';

const LOWER_IS_BETTER = new Set(['26', '27', '29']); // ERA, WHIP, L

// Safely extract a player name from Yahoo's nested name object
function extractName(info) {
  if (!info) return null;
  // Yahoo returns name as {full, first, last} object or sometimes a plain string
  if (typeof info.full_name === 'string') return info.full_name;
  if (typeof info.full_name === 'object' && info.full_name?.full) return info.full_name.full;
  if (typeof info.name === 'string') return info.name;
  if (typeof info.name === 'object' && info.name?.full) return info.name.full;
  return null;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
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

    // ── Fetch roster with slot info ──────────────────────────────────────────
    let rosterLines = [];
    try {
      const teamKey = await yahoo.getUserTeamKey(guid, league_key);
      if (teamKey) {
        const rosterData = await yahoo.getRoster(guid, league_key, teamKey);
        for (const item of (rosterData || [])) {
          const p = item?.player;
          if (!p || !Array.isArray(p)) continue;
          const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
          const name = extractName(info);
          if (!name) continue;
          // Get slot
          const selPos = p[1]?.selected_position;
          let slot = 'BN';
          if (Array.isArray(selPos)) {
            const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
            slot = posItem?.position || 'BN';
          } else if (selPos?.position) {
            slot = selPos.position;
          }
          const pos = info.display_position || info.primary_position || '?';
          rosterLines.push(`  • ${name} (${pos}) [${slot}]`);
        }
      }
    } catch (e) {
      console.warn('[matchup/predict] Roster fetch failed:', e.message);
    }

    // ── Score gap and urgency ────────────────────────────────────────────────
    const myPts  = parseFloat(myTeam.total_points  ?? 0);
    const oppPts = parseFloat(opponent.total_points ?? 0);
    const gap    = Math.round((oppPts - myPts) * 10) / 10;
    const leading = gap < 0;
    const gapAbs  = Math.abs(gap);

    const urgencyLabel = leading
      ? `✅ You are WINNING by ${gapAbs} points.`
      : gapAbs > 75
        ? `🚨 CRITICAL: You are DOWN ${gapAbs} points. Aggressive moves required immediately.`
        : gapAbs > 30
          ? `⚠️ You are trailing by ${gapAbs} points. You need to make moves to close this gap.`
          : `⚡ Close match — gap is only ${gapAbs} points. Smart lineup moves can swing this.`;

    // ── Category comparison ──────────────────────────────────────────────────
    const categoryRows = (stats || []).map(s => {
      const myWin  = s.my_winning  ? ' ← YOU LEAD' : '';
      const oppWin = s.opp_winning ? ' ← OPP LEADS' : '';
      return `  ${s.name || s.stat_id}: YOU ${s.my_value ?? '—'} vs OPP ${s.opp_value ?? '—'}${myWin}${oppWin}`;
    }).join('\n');

    const myWinningCats  = (stats || []).filter(s => s.my_winning).map(s => s.name || s.stat_id);
    const oppWinningCats = (stats || []).filter(s => s.opp_winning).map(s => s.name || s.stat_id);

    const prompt = `You are Goin' Yard HQ — an expert fantasy baseball matchup analyst.

⚠️ DATA RULE: Analyze ONLY the data provided below. Do NOT use training data for player stats or availability.

LEAGUE: ${settings.name || league_key} | Format: ${scoringLabel} | Week ${week || '?'}

${urgencyLabel}

LIVE SCORE:
  ${myTeam.name}: ${myPts} pts
  ${opponent.name}: ${oppPts} pts
  Point gap: ${gap > 0 ? `You are DOWN ${gap}` : `You are UP ${Math.abs(gap)}`} points

CATEGORY BREAKDOWN:
${categoryRows || '(no category data)'}

YOU ARE WINNING: ${myWinningCats.join(', ') || 'none yet'}
OPPONENT LEADS:  ${oppWinningCats.join(', ') || 'none yet'}

MY ROSTER (slot shown — BN = bench, active slot = starting):
${rosterLines.length ? rosterLines.join('\n') : '(roster unavailable)'}

${!leading && gapAbs > 30 ? `
TRIAGE PRIORITY: You are significantly behind. Do NOT say "you can still win" without specific actionable advice.
Your response MUST include:
1. Exact point deficit and how many days remain to close it
2. Which bench players should START immediately to maximize scoring
3. Which streaming moves (waiver pickups) address your weakest categories
4. Which categories are mathematically closeable vs. already lost
` : ''}

Provide sharp, specific, actionable advice based ONLY on the data above.`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1200);
    return NextResponse.json({ prediction: text, gap, leading, urgencyLabel });

  } catch (err) {
    console.error('[claude/matchup/predict]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
