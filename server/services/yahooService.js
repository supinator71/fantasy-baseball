const axios = require('axios');
const xml2js = require('xml2js');
const db = require('./database');

const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

async function forceRefreshToken(req, refresh_token) {
  try {
    const credentials = Buffer.from(
      `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post('https://api.login.yahoo.com/oauth2/get_token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token }),
      { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
    const expiresAt = Date.now() + expires_in * 1000;
    const guid = req?.session?.yahoo_guid;
    if (guid) db.setToken(guid, { access_token, refresh_token: new_refresh_token, expires_at: expiresAt });
      
    return access_token;
  } catch (err) {
    console.error('[Yahoo OAuth] Refresh permanently failed. Wiping dead token.');
    const guid = req?.session?.yahoo_guid;
    if (guid) db.deleteToken(guid);
    const error = new Error('auth_revoked');
    error.status = 401;
    throw error;
  }
}

async function getAccessToken(req) {
  const guid = req?.session?.yahoo_guid;
  if (!guid) throw new Error('Not authenticated (missing session guid)');
  
  const row = db.getToken(guid);
  if (!row) throw new Error('Not authenticated with Yahoo');

  // Auto-refresh if naturally expired
  if (Date.now() > row.expires_at - 60000) {
    console.log('[Yahoo OAuth] Token naturally expired, auto-refreshing...');
    return await forceRefreshToken(req, row.refresh_token);
  }

  return row.access_token;
}

async function yahooGet(req, endpoint) {
  let token = await getAccessToken(req);
  
  try {
    const response = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('[Yahoo OAuth] Yahoo rejected unexpired token! Forcing aggressive retry...');
      const guid = req?.session?.yahoo_guid;
      const row = db.getToken(guid);
      if (!row) throw err;
      
      // Force refresh right now
      token = await forceRefreshToken(req, row.refresh_token);
      
      // Retry the exact same request seamlessly
      const retryResponse = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return retryResponse.data;
    }
    throw err;
  }
}

// Helper to convert Yahoo's unpredictable list format to a standard array
function toArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  
  // Yahoo's object structure usually looks like: { "0": {...}, "1": {...}, count: 2 } or has a nested "@attributes" count.
  let count = parseInt(obj['@attributes']?.count) || parseInt(obj.count) || 0;
  
  // Fallback: count numeric keys
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

async function getLeagues(req) {
  const data = await yahooGet(req, '/users;use_login=1/games;game_keys=mlb/leagues');
  
  // The JSON structure can vary slightly depending on whether you have 1 or multiple leagues
  const leagues = data?.fantasy_content?.users?.['0']?.user?.[1]?.games?.['0']?.game?.[1]?.leagues;
  if (!leagues) return [];

  return toArray(leagues).map(l => l?.league?.[0]).filter(Boolean);
}

async function getLeague(req, leagueKey) {
  const data = await yahooGet(req, `/league/${leagueKey}/settings`);
  return data.fantasy_content?.league;
}

async function getRoster(req, leagueKey, teamKey) {
  const data = await yahooGet(req, `/team/${teamKey}/roster/players`);
  const team = data.fantasy_content?.team;
  
  // Yahoo puts roster data in different spots depending on response format
  let players = null;
  
  // Try team[1].roster paths (most common)
  const roster = team?.[1]?.roster;
  if (roster) {
    // roster can be: {0: {coverage_type: ...}, "0": {players: ...}} or an array
    if (Array.isArray(roster)) {
      for (const r of roster) {
        if (r?.players) { players = r.players; break; }
      }
    } else {
      // Try indexed access
      for (let i = 0; i <= 2; i++) {
        if (roster[i]?.players) { players = roster[i].players; break; }
        if (roster[String(i)]?.players) { players = roster[String(i)].players; break; }
      }
      // Direct players property
      if (!players && roster.players) players = roster.players;
    }
  }
  
  // Fallback: search team array for roster
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

async function getStandings(req, leagueKey) {
  const data = await yahooGet(req, `/league/${leagueKey}/standings`);
  const teams = data.fantasy_content?.league?.[1]?.standings?.[1]?.teams || data.fantasy_content?.league?.[1]?.standings?.[0]?.teams;
  return toArray(teams);
}

async function getScoreboard(req, leagueKey) {
  const data = await yahooGet(req, `/league/${leagueKey}/scoreboard`);
  const league = data.fantasy_content?.league;
  
  let matchups = null;
  
  // Search for scoreboard/matchups in league array
  if (Array.isArray(league)) {
    for (const item of league) {
      if (item?.scoreboard) {
        const sb = item.scoreboard;
        // scoreboard can be array or object with indexed entries
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

async function getPlayers(req, leagueKey, status = 'A', start = 0) {
  const data = await yahooGet(req, `/league/${leagueKey}/players;status=${status};sort=AR;start=${start};count=25/stats`);
  const leagueObj = data.fantasy_content?.league;

  // Yahoo returns league as array [meta, data], object {0:meta,1:data}, or flat object
  const rawPlayers =
    leagueObj?.[1]?.players ||
    leagueObj?.[0]?.players ||
    leagueObj?.players ||
    {};

  const count = rawPlayers?.['@attributes']?.count ?? rawPlayers?.count ?? '?';
  const leagueType = Array.isArray(leagueObj) ? 'array' : typeof leagueObj;
  const leagueKeys = Object.keys(leagueObj || {}).slice(0, 8).join(',');
  console.log(`[Yahoo/getPlayers] league=${leagueKey} status=${status} rawCount=${count} leagueType=${leagueType} leagueKeys=[${leagueKeys}]`);

  const parsed = parsePlayersStats(rawPlayers);
  console.log(`[Yahoo/getPlayers] → parsed ${parsed.length} players`);
  return parsed;
}

async function getDraftResults(req, leagueKey) {
  const data = await yahooGet(req, `/league/${leagueKey}/draftresults`);
  return data.fantasy_content?.league?.[1]?.draft_results;
}

async function getTransactions(req, leagueKey) {
  const data = await yahooGet(req, `/league/${leagueKey}/transactions;type=waiver`);
  const txns = data.fantasy_content?.league?.[1]?.transactions;
  return toArray(txns);
}

async function getPlayerStats(req, leagueKey, playerKey) {
  const data = await yahooGet(req, `/league/${leagueKey}/players;player_keys=${playerKey}/stats`);
  return data.fantasy_content?.league?.[1]?.players?.[0]?.player;
}

function parsePlayersStats(raw) {
  if (!raw) return [];

  // parseInt handles Yahoo returning count as a string like "25"
  let count = parseInt(raw['@attributes']?.count ?? raw.count ?? 0, 10);

  // Fallback: if count is 0 but numeric keys exist, count them directly
  // (Yahoo occasionally returns count=0 for the first week of the season)
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

    // eligible_positions.position can be an array — flatten to comma string
    let pos = info.display_position || '';
    if (!pos) {
      const ep = info.eligible_positions?.position;
      pos = Array.isArray(ep) ? ep.join(',') : (ep || '');
    }

    // Workaround for Yahoo Spring Training "TBD" placeholder
    if (pos === 'TBD' || pos === 'IL') {
      if (stats['26'] !== undefined || stats['28'] !== undefined || stats['42'] !== undefined) {
        pos = 'P';
      } else if (stats['60'] !== undefined || stats['7'] !== undefined) {
        pos = 'UTIL';
      }
    }

    result.push({
      key: info.player_key,
      name: info.full_name || info.name?.full || 'Unknown',
      position: String(pos),
      team: info.editorial_team_abbr || '',
      status: info.status || '',
      is_starting: String(info.starting_status?.is_starting) === '1' ? 'Yes' : (String(info.starting_status?.is_starting) === '0' ? 'No' : 'Unknown'),
      stats
    });
  }
  return result;
}

async function getBatchPlayerStats(req, leagueKey, playerKeys, type) {
  if (!playerKeys || !playerKeys.length) return [];
  const batch = playerKeys.slice(0, 25).join(',');
  const typeParam = type ? `;type=${type}` : '';
  const data = await yahooGet(req, `/league/${leagueKey}/players;player_keys=${batch}/stats${typeParam}`);
  return parsePlayersStats(data.fantasy_content?.league?.[1]?.players);
}

async function getFreeAgentsTrending(req, leagueKey, count = 25) {
  const [recent, season, historical] = await Promise.all([
    yahooGet(req, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=lastweek`),
    yahooGet(req, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats`),
    yahooGet(req, `/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=season;year=2025`)
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

async function getUserTeamKey(req, leagueKey) {
  try {
    const data = await yahooGet(req, `/users;use_login=1/games;game_keys=mlb/leagues;league_keys=${leagueKey}/teams`);
    
    // Convert unpredictable structure into an array
    const gamesObj = data?.fantasy_content?.users?.['0']?.user?.[1]?.games;
    const gameList = toArray(gamesObj);
    
    for (const g of gameList) {
      const gItem = g?.game;
      if (!gItem) continue;
      
      const leaguesObj = gItem[1]?.leagues;
      const leagueList = toArray(leaguesObj);
      
      for (const lItem of leagueList) {
        const leagueData = lItem?.league;
        if (!leagueData) continue;
        
        // Find the matching league object
        const lKey = leagueData[0]?.league_key;
        if (lKey === leagueKey && leagueData[1]?.teams) {
             const teamsList = toArray(leagueData[1].teams);
             for (const tItem of teamsList) {
                 const tData = tItem?.team;
                 if (tData) return tData[0]?.[0]?.team_key || tData[0]?.team_key;
             }
        }
      }
    }
  } catch (e) {
    console.log('Error fetching getUserTeamKey:', e.message);
  }
  return null;
}

module.exports = {
  getLeagues,
  getLeague,
  getRoster,
  getStandings,
  getScoreboard,
  getPlayers,
  getDraftResults,
  getTransactions,
  getPlayerStats,
  getBatchPlayerStats,
  getFreeAgentsTrending,
  getUserTeamKey,
  getAccessToken,
  yahooGet
};
