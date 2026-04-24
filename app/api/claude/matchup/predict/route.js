import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';

// Comprehensive Yahoo Fantasy Baseball stat_id → human-readable name
const STAT_NAMES = {
  '0': 'GP',   '1': 'GS',   '2': 'AB',   '3': 'AVG',  '4': 'OBP',
  '5': 'SLG',  '6': 'OPS',  '7': 'R',    '8': 'H',    '9': '1B',
  '10': '2B',  '11': '3B',  '12': 'HR',  '13': 'RBI', '14': 'SAC',
  '15': 'SF',  '16': 'SB',  '17': 'CS',  '18': 'BB',  '19': 'IBB',
  '20': 'HBP', '21': 'SO',  '22': 'GDP', '23': 'CYC', '24': 'E',
  '25': 'TB',
  '26': 'ERA', '27': 'WHIP','28': 'W',   '29': 'L',   '30': 'GS',
  '31': 'G',   '32': 'SV',  '33': 'HA',  '34': 'BBA', '35': 'HRA',
  '36': 'R_P', '37': 'ER',  '38': 'WP',  '39': 'BK',  '40': 'BS',
  '41': 'HB',  '42': 'K',   '43': 'SHO', '44': 'CG',  '45': 'NH',
  '46': 'PG',  '47': 'WinPct', '48': 'SV%', '49': 'K/9',
  '50': 'IP',  '51': 'K/BB', '52': 'OBA', '53': 'GO/AO',
  '54': 'TP',  '55': 'DP',  '56': 'QS%',
  '57': 'NSV', '58': 'NSB', '59': 'TB_P',
  '60': 'H/AB','61': 'XBH',
  '83': 'QS',  '84': 'NSVH','85': 'HLD',
};
const LOWER_IS_BETTER = new Set(['26', '27', '29', '33', '34', '35', '37', '40']); // ERA, WHIP, L, HA, BBA, HRA, ER, BS

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
    // Translate numeric stat_ids to human-readable names for the AI
    const resolveName = s => STAT_NAMES[s.stat_id] || s.name || s.stat_id;
    const categoryRows = (stats || []).map(s => {
      const catName = resolveName(s);
      const myWin  = s.my_winning  ? ' ← YOU LEAD' : '';
      const oppWin = s.opp_winning ? ' ← OPP LEADS' : '';
      const lowerBetter = LOWER_IS_BETTER.has(s.stat_id) ? ' (lower is better)' : '';
      return `  ${catName}${lowerBetter}: YOU ${s.my_value ?? '—'} vs OPP ${s.opp_value ?? '—'}${myWin}${oppWin}`;
    }).join('\n');

    const myWinningCats  = (stats || []).filter(s => s.my_winning).map(s => resolveName(s));
    const oppWinningCats = (stats || []).filter(s => s.opp_winning).map(s => resolveName(s));

    // ── Schedule Calculation ──────────────────────────────────────────────────
    // Yahoo fantasy weeks start on Monday, end on Sunday night.
    const todayNum = new Date().getDay(); // 0 = Sunday, 1 = Monday... 6 = Saturday
    const daysRemaining = (7 - todayNum) % 7;

    const prompt = `You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine.

🚨 CRITICAL DIRECTIVE: Your ONLY job is to convert the raw numeric gaps and categorical deficits below into a sharp, actionable summary. Do not invent your own analysis, and do not reference external data.

⚠️ DATA RULES: Analyze ONLY the data provided below. Do NOT use training data for player stats or availability. Do NOT disagree with the numeric gaps.

LEAGUE: ${settings.name || league_key} | Format: ${scoringLabel} | Week ${week || '?'} | ${daysRemaining} days remaining in matchup

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
1. Exact point deficit and how you can close it with ${daysRemaining} days remaining.
2. Which bench players should START immediately to maximize scoring
3. Based on the categories you are losing, what specific stat-profiles you should look to stream from the waiver wire (e.g. 'high-K relief pitcher', 'contact hitter with speed'). Do NOT invent or recommend specific free agent names.
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
