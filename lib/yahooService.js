import axios from 'axios';
import { db, forceRefreshToken } from './database.js';

const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

export async function getAccessToken(guid) {
  if (!guid) throw new Error('Not authenticated (missing session guid)');
  
  const row = db.getToken(guid);
  if (!row) throw new Error('Not authenticated with Yahoo');

  if (Date.now() > row.expires_at - 60000) {
    console.log('[Yahoo OAuth] Token naturally expired, auto-refreshing...');
    return await forceRefreshToken(guid, row.refresh_token);
  }

  return row.access_token;
}

export async function yahooGet(guid, endpoint) {
  let token = await getAccessToken(guid);
  
  try {
    const response = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('[Yahoo OAuth] Yahoo rejected unexpired token! Forcing aggressive retry...');
      const row = db.getToken(guid);
      if (!row) throw err;
      
      token = await forceRefreshToken(guid, row.refresh_token);
      
      const retryResponse = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return retryResponse.data;
    }
    throw err;
  }
}

export function toArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  let count = parseInt(obj['@attributes']?.count) || parseInt(obj.count) || 0;
  if (!count) {
    count = Object.keys(obj).filter(k => /^\d+$/.test(k)).length;
  }
  if (!count) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = obj[i] || obj[String(i)];
    if (item) result.push(item);
  }
  return result;
}

export async function getLeagues(guid) {
  const data = await yahooGet(guid, '/users;use_login=1/games;game_keys=mlb/leagues');
  const leagues = data?.fantasy_content?.users?.['0']?.user?.[1]?.games?.['0']?.game?.[1]?.leagues;
  if (!leagues) return [];
  return toArray(leagues).map(l => l?.league?.[0]).filter(Boolean);
}

export async function getLeague(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/settings`);
  return data.fantasy_content?.league;
}

export async function getRoster(guid, leagueKey, teamKey) {
  const data = await yahooGet(guid, `/team/${teamKey}/roster/players`);
  const team = data.fantasy_content?.team;
  let players = null;
  const roster = team?.[1]?.roster;
  if (roster) {
    if (Array.isArray(roster)) {
      for (const r of roster) {
        if (r?.players) { players = r.players; break; }
      }
    } else {
      for (let i = 0; i <= 2; i++) {
        if (roster[i]?.players) { players = roster[i].players; break; }
        if (roster[String(i)]?.players) { players = roster[String(i)].players; break; }
      }
      if (!players && roster.players) players = roster.players;
    }
  }
  if (!players && Array.isArray(team)) {
    for (const item of team) {
      if (item?.roster) {
        const r = item.roster;
        if (Array.isArray(r)) {
          for (const ri of r) { if (ri?.players) { players = ri.players; break; } }
        } else {
          for (let i = 0; i <= 2; i++) {
            if (r[i]?.players) { players = r[i].players; break; }
            if (r[String(i)]?.players) { players = r[String(i)].players; break; }
          }
          if (!players && r.players) players = r.players;
        }
        if (players) break;
      }
    }
  }
  return toArray(players);
}

export async function getStandings(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/standings`);
  const teams = data.fantasy_content?.league?.[1]?.standings?.[1]?.teams || data.fantasy_content?.league?.[1]?.standings?.[0]?.teams;
  return toArray(teams);
}

export async function getScoreboard(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/scoreboard`);
  const league = data.fantasy_content?.league;
  let matchups = null;
  if (Array.isArray(league)) {
    for (const item of league) {
      if (item?.scoreboard) {
        const sb = item.scoreboard;
        if (Array.isArray(sb)) {
          for (const s of sb) {
            if (s?.matchups) { matchups = s.matchups; break; }
          }
        } else {
          for (let i = 0; i <= 2; i++) {
            if (sb[i]?.matchups) { matchups = sb[i].matchups; break; }
            if (sb[String(i)]?.matchups) { matchups = sb[String(i)].matchups; break; }
          }
          if (!matchups && sb.matchups) matchups = sb.matchups;
        }
        if (matchups) break;
      }
    }
  }
  return matchups;
}

export async function getPlayers(guid, leagueKey, status = 'A', start = 0, position = null) {
  const posFilter = position ? `;position=${position}` : '';
  const data = await yahooGet(guid, `/league/${leagueKey}/players${posFilter};status=${status};sort=AR;start=${start};count=25/stats`);
  const leagueObj = data.fantasy_content?.league;
  const rawPlayers =
    leagueObj?.[1]?.players ||
    leagueObj?.[0]?.players ||
    leagueObj?.players ||
    {};
  return parsePlayersStats(rawPlayers);
}

export function parsePlayersStats(raw) {
  if (!raw) return [];
  let count = parseInt(raw['@attributes']?.count ?? raw.count ?? 0, 10);
  if (!count) {
    count = Object.keys(raw).filter(k => /^\d+$/.test(k)).length;
  }
  const result = [];
  for (let i = 0; i < count; i++) {
    const rawItem = raw[i] || raw[String(i)];
    const p = rawItem?.player || rawItem;
    if (!p) continue;
    const infoArray = Array.isArray(p) ? (Array.isArray(p[0]) ? p[0] : p) : [];
    const info = Object.assign({}, ...infoArray);
    let statsObj = null;
    if (Array.isArray(p)) {
      statsObj = p.find(item => item && (item.player_stats || item.player_season_stats || item.player_points));
    }
    const statsArr = statsObj?.player_stats?.stats || statsObj?.player_season_stats?.stats || [];
    const stats = {};
    for (const s of statsArr) {
      const stat = s.stat || {};
      if (stat.stat_id !== undefined) stats[String(stat.stat_id)] = stat.value;
    }
    let pos = info.display_position || '';
    if (!pos) {
      const ep = info.eligible_positions?.position;
      pos = Array.isArray(ep) ? ep.join(',') : (ep || '');
    }
    if (pos === 'TBD' || pos === 'IL') {
      if (stats['26'] !== undefined || stats['28'] !== undefined || stats['42'] !== undefined) pos = 'P';
      else if (stats['60'] !== undefined || stats['7'] !== undefined) pos = 'UTIL';
    }
    result.push({
      key: info.player_key,
      name: info.full_name || info.name?.full || 'Unknown',
      position: String(pos),
      team: info.editorial_team_abbr || '',
      status: typeof info.status === 'string' ? info.status : '',
      injury: typeof info.status === 'string' ? info.status : '',
      is_starting: String(info.starting_status?.is_starting) === '1' ? 'Yes' : (String(info.starting_status?.is_starting) === '0' ? 'No' : 'Unknown'),
      stats
    });
  }
  return result;
}

export async function getBatchPlayerStats(guid, leagueKey, playerKeys, type) {
  if (!playerKeys || !playerKeys.length) return [];
  const batch = playerKeys.slice(0, 25).join(',');
  const typeParam = type ? `;type=${type}` : '';
  const data = await yahooGet(guid, `/league/${leagueKey}/players;player_keys=${batch}/stats${typeParam}`);
  return parsePlayersStats(data.fantasy_content?.league?.[1]?.players);
}

export async function getFreeAgentsTrending(guid, leagueKey, count = 25) {
  const [recent, season, historical] = await Promise.all([
    yahooGet(guid, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=lastweek`),
    yahooGet(guid, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats`),
    yahooGet(guid, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=season;year=2025`)
  ]);
  const recentPlayers = parsePlayersStats(recent.fantasy_content?.league?.[1]?.players);
  const seasonPlayers = parsePlayersStats(season.fantasy_content?.league?.[1]?.players);
  const historicalPlayers = parsePlayersStats(historical.fantasy_content?.league?.[1]?.players);
  const seasonMap = {};
  seasonPlayers.forEach(p => { seasonMap[p.key] = p.stats; });
  const historicalMap = {};
  historicalPlayers.forEach(p => { historicalMap[p.key] = p.stats; });
  return recentPlayers.map(p => ({ ...p, recentStats: p.stats, seasonStats: seasonMap[p.key] || {}, historicalStats: historicalMap[p.key] || {} }));
}

export async function getUserTeamKey(guid, leagueKey) {
  try {
    const data = await yahooGet(guid, '/users;use_login=1/games;game_keys=mlb/teams');
    const gamesObj = data?.fantasy_content?.users?.['0']?.user?.[1]?.games;
    const gameList = toArray(gamesObj);
    for (const g of gameList) {
      const gItem = g?.game;
      if (!gItem) continue;
      const teamsObj = gItem[1]?.teams;
      const teamsList = toArray(teamsObj);
      for (const tItem of teamsList) {
        const tData = tItem?.team;
        if (!tData) continue;
        const tKey = tData[0]?.[0]?.team_key || tData[0]?.team_key;
        if (tKey && tKey.startsWith(leagueKey + '.t.')) return tKey;
      }
    }
  } catch (e) {
    console.log('Error fetching getUserTeamKey:', e.message);
  }
  return null;
}

export async function getDraftResults(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/draftresults`);
  return data.fantasy_content?.league?.[1]?.draft_results;
}

export async function getTransactions(guid, leagueKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/transactions`);
  const txns = data.fantasy_content?.league?.[1]?.transactions;
  return toArray(txns);
}

export async function getPlayerStats(guid, leagueKey, playerKey) {
  const data = await yahooGet(guid, `/league/${leagueKey}/players;player_keys=${playerKey}/stats`);
  return data.fantasy_content?.league?.[1]?.players?.[0]?.player;
}
