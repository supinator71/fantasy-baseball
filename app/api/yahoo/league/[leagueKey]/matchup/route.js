import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getScoreboard, getUserTeamKey } from '@/lib/yahooService';

// Comprehensive Yahoo Fantasy Baseball stat_id → human-readable name
const STAT_NAMES = {
  '0': 'GP',   '1': 'GS',   '2': 'AB',   '3': 'AVG',  '4': 'OBP',
  '5': 'SLG',  '6': 'OPS',  '7': 'R',    '8': 'H',    '9': '1B',
  '10': '2B',  '11': '3B',  '12': 'HR',  '13': 'RBI', '14': 'SAC',
  '15': 'SF',  '16': 'SB',  '17': 'CS',  '18': 'BB',  '19': 'IBB',
  '20': 'HBP', '21': 'SO',  '22': 'GDP', '23': 'CYC', '24': 'E',
  '25': 'TB',
  // Pitching
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
const LOWER_IS_BETTER = new Set(['26', '27', '29', '33', '34', '35', '37', '40']);

function parseYahooMatchup(matchups, myTeamKey) {
  if (!matchups) return null;
  let totalMatchups = parseInt(matchups['@attributes']?.count) || Object.keys(matchups).filter(k => /^\d+$/.test(k)).length;
  const week = matchups['@attributes']?.week || null;

  function extractTeamsFromMatchup(m) {
    if (!m) return null;
    if (m.teams) return m.teams;
    if (Array.isArray(m)) {
      for (const item of m) { if (item?.teams) return item.teams; }
    }
    for (const key of Object.keys(m)) { if (m[key]?.teams) return m[key].teams; }
    return null;
  }
  function getMatchupEntry(idx) {
    const raw = matchups[idx] || matchups[String(idx)];
    if (!raw) return null;
    return raw.matchup || raw;
  }
  function extractTeamKey(teamData) {
    if (!teamData) return null;
    const teamArr = teamData.team || teamData;
    if (!Array.isArray(teamArr)) return teamData.team_key;
    const first = teamArr[0];
    if (Array.isArray(first)) return Object.assign({}, ...first)?.team_key;
    return first?.team_key;
  }
  function getTeamEntries(teamsObj) {
    if (!teamsObj) return [];
    const entries = [];
    const numericKeys = Object.keys(teamsObj).filter(k => /^\d+$/.test(k)).sort((a,b) => a-b);
    if (numericKeys.length > 0) {
      for (const k of numericKeys) if (teamsObj[k]) entries.push(teamsObj[k]);
    }
    if (!entries.length && Array.isArray(teamsObj)) entries.push(...teamsObj);
    if (!entries.length && teamsObj.team) {
      if (Array.isArray(teamsObj.team)) {
        if (teamsObj.team[0] && !Array.isArray(teamsObj.team[0]) && teamsObj.team[0].team_key) entries.push({ team: teamsObj.team });
        else for (const t of teamsObj.team) entries.push({ team: Array.isArray(t) ? t : [t] });
      }
    }
    return entries;
  }

  let foundMatchup = null;
  for (let i = 0; i < totalMatchups; i++) {
    const matchupData = getMatchupEntry(i);
    if (!matchupData) continue;
    const teamsObj = extractTeamsFromMatchup(matchupData);
    if (!teamsObj) continue;
    const teamEntries = getTeamEntries(teamsObj);
    for (const entry of teamEntries) {
      if (myTeamKey && extractTeamKey(entry) === myTeamKey) { foundMatchup = matchupData; break; }
    }
    if (foundMatchup) break;
  }
  if (!foundMatchup) foundMatchup = getMatchupEntry(0);
  if (!foundMatchup) return null;

  const teamEntries = getTeamEntries(extractTeamsFromMatchup(foundMatchup));
  const parsedTeams = [];
  for (let j = 0; j < teamEntries.length; j++) {
    const teamArr = teamEntries[j]?.team;
    if (!teamArr || !Array.isArray(teamArr)) continue;
    let info = Array.isArray(teamArr[0]) ? Object.assign({}, ...teamArr[0]) : teamArr[0] || {};
    // Collect team_stats (category breakdown) AND team_points (H2H score) separately
    let statsObj = {};
    let pointsObj = {};
    for (let k = 1; k < teamArr.length; k++) {
      if (teamArr[k]?.team_stats) statsObj = teamArr[k].team_stats;
      if (teamArr[k]?.team_points) pointsObj = teamArr[k].team_points;
    }

    // Handle Yahoo's {stat: [...]} or [{stat:{...}}, ...] nesting inside team_stats.stats
    const rawStats = statsObj.stats;
    const statsArr = Array.isArray(rawStats)
      ? rawStats
      : rawStats?.stat
        ? (Array.isArray(rawStats.stat) ? rawStats.stat : [rawStats.stat])
        : [];

    const stats = statsArr
      .map(s => s.stat || s)
      .filter(s => s.stat_id !== undefined && s.value !== undefined)
      .map(s => ({ stat_id: String(s.stat_id), name: STAT_NAMES[String(s.stat_id)] || String(s.stat_id), value: s.value }));

    let manager = '';
    if (info.managers) {
      if (Array.isArray(info.managers)) manager = info.managers[0]?.manager?.nickname || info.managers[0]?.nickname || '';
      else if (info.managers.manager) manager = info.managers.manager?.nickname || '';
    }
    // Prefer team_points.total for H2H score; fall back to team_stats total
    let pointsTotal = parseFloat(pointsObj.total) || parseFloat(statsObj.total) || null;
    parsedTeams.push({ key: info.team_key, name: info.name || 'Team '+(j+1), manager, stats, total_points: pointsTotal });
  }

  const myIdx = myTeamKey ? parsedTeams.findIndex(t => t.key === myTeamKey) : 0;
  const myTeam = parsedTeams[myIdx >= 0 ? myIdx : 0];
  const opponent = parsedTeams[myIdx === 0 ? 1 : 0];

  const statMap = {};
  (myTeam?.stats || []).forEach(s => { statMap[s.stat_id] = { ...s, my_value: s.value } });
  (opponent?.stats || []).forEach(s => {
    if (statMap[s.stat_id]) statMap[s.stat_id].opp_value = s.value;
    else statMap[s.stat_id] = { stat_id: s.stat_id, name: s.name, opp_value: s.value };
  });

  const statComparison = Object.values(statMap).map(s => {
    const myVal = parseFloat(s.my_value) || 0;
    const oppVal = parseFloat(s.opp_value) || 0;
    const lowerBetter = LOWER_IS_BETTER.has(s.stat_id);
    return {
      ...s,
      my_winning: myVal !== oppVal && (lowerBetter ? myVal < oppVal : myVal > oppVal),
      opp_winning: myVal !== oppVal && (lowerBetter ? oppVal < myVal : oppVal > myVal)
    };
  });

  return { week: week || foundMatchup.week, myTeam, opponent, stats: statComparison };
}

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const matchups = await getScoreboard(guid, leagueKey);
    const myTeamKey = await getUserTeamKey(guid, leagueKey);

    const parsed = parseYahooMatchup(matchups, myTeamKey);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}