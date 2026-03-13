const axios = require('axios');
const xml2js = require('xml2js');
const db = require('../db/database');

const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

async function getAccessToken() {
  const row = db.prepare('SELECT * FROM tokens WHERE id = 1').get();
  if (!row) throw new Error('Not authenticated with Yahoo');

  // Auto-refresh if expired
  if (Date.now() > row.expires_at - 60000) {
    const axios2 = require('axios');
    const credentials = Buffer.from(
      `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios2.post('https://api.login.yahoo.com/oauth2/get_token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token: row.refresh_token }),
      { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const expiresAt = Date.now() + expires_in * 1000;
    db.prepare('UPDATE tokens SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = 1')
      .run(access_token, refresh_token, expiresAt);
    return access_token;
  }

  return row.access_token;
}

async function yahooGet(endpoint) {
  const token = await getAccessToken();
  const response = await axios.get(`${YAHOO_API_BASE}${endpoint}?format=json`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Helper to convert Yahoo's unpredictable list format to a standard array
function toArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  const count = obj['@attributes']?.count || obj.count || 0;
  if (!count) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = obj[i] || obj[String(i)];
    if (item) result.push(item);
  }
  return result;
}

async function getLeagues() {
  const data = await yahooGet('/users;use_login=1/games;game_keys=mlb/leagues');
  console.log('Yahoo /leagues raw response:', JSON.stringify(data, null, 2));
  
  // The JSON structure can vary slightly depending on whether you have 1 or multiple leagues
  const leagues = data?.fantasy_content?.users?.['0']?.user?.[1]?.games?.['0']?.game?.[1]?.leagues;
  if (!leagues) return [];

  return toArray(leagues).map(l => l?.league?.[0]).filter(Boolean);
}

async function getLeague(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/settings`);
  return data.fantasy_content?.league;
}

async function getRoster(leagueKey, teamKey) {
  const data = await yahooGet(`/team/${teamKey}/roster/players`);
  console.log('Yahoo /roster raw response:', JSON.stringify(data, null, 2));
  const players = data.fantasy_content?.team?.[1]?.roster?.[1]?.players || data.fantasy_content?.team?.[1]?.roster?.[0]?.players;
  return toArray(players);
}

async function getStandings(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/standings`);
  const teams = data.fantasy_content?.league?.[1]?.standings?.[1]?.teams || data.fantasy_content?.league?.[1]?.standings?.[0]?.teams;
  return toArray(teams);
}

async function getScoreboard(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/scoreboard`);
  const matchups = data.fantasy_content?.league?.[1]?.scoreboard?.[1]?.matchups || data.fantasy_content?.league?.[1]?.scoreboard?.[0]?.matchups;
  return matchups;
}

async function getPlayers(leagueKey, status = 'A', start = 0) {
  const data = await yahooGet(`/league/${leagueKey}/players;status=${status};start=${start};count=25`);
  console.log(`Yahoo /players FA raw response for ${leagueKey}:`, JSON.stringify(data, null, 2));
  const players = data.fantasy_content?.league?.[1]?.players;
  return toArray(players);
}

async function getDraftResults(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/draftresults`);
  return data.fantasy_content?.league?.[1]?.draft_results;
}

async function getTransactions(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/transactions;type=waiver`);
  const txns = data.fantasy_content?.league?.[1]?.transactions;
  return toArray(txns);
}

async function getPlayerStats(leagueKey, playerKey) {
  const data = await yahooGet(`/league/${leagueKey}/players;player_keys=${playerKey}/stats`);
  return data.fantasy_content?.league?.[1]?.players?.[0]?.player;
}

function parsePlayersStats(raw) {
  if (!raw) return [];
  const count = raw['@attributes']?.count || raw.count || raw?.length || 0;
  const result = [];
  for (let i = 0; i < count; i++) {
    const p = raw[i] || raw[String(i)]?.player;
    if (!p) continue;

    // Flatten Yahoo's weird array of property objects
    const infoArray = Array.isArray(p[0]) ? p[0] : [];
    const info = Object.assign({}, ...infoArray);

    const statsArr = p[1]?.player_stats?.stats || p[1]?.player_season_stats?.stats || [];
    const stats = {};
    for (const s of statsArr) {
      const stat = s.stat || {};
      if (stat.stat_id !== undefined) stats[String(stat.stat_id)] = stat.value;
    }
    result.push({
      key: info.player_key,
      name: info.full_name || info.name?.full || 'Unknown',
      position: info.display_position || info.eligible_positions?.position || '',
      team: info.editorial_team_abbr || '',
      stats
    });
  }
  return result;
}

async function getBatchPlayerStats(leagueKey, playerKeys, type) {
  if (!playerKeys || !playerKeys.length) return [];
  const batch = playerKeys.slice(0, 25).join(',');
  const typeParam = type ? `;type=${type}` : '';
  const data = await yahooGet(`/league/${leagueKey}/players;player_keys=${batch}/stats${typeParam}`);
  return parsePlayersStats(data.fantasy_content?.league?.[1]?.players);
}

async function getFreeAgentsTrending(leagueKey, count = 25) {
  const [recent, season] = await Promise.all([
    yahooGet(`/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats;type=lastweek`),
    yahooGet(`/league/${leagueKey}/players;status=FA;sort=AR;count=${count}/stats`)
  ]);
  const recentPlayers = parsePlayersStats(recent.fantasy_content?.league?.[1]?.players);
  const seasonPlayers = parsePlayersStats(season.fantasy_content?.league?.[1]?.players);
  const seasonMap = {};
  seasonPlayers.forEach(p => { seasonMap[p.key] = p.stats; });
  return recentPlayers.map(p => ({ ...p, recentStats: p.stats, seasonStats: seasonMap[p.key] || {} }));
}

async function getUserTeamKey(leagueKey) {
  try {
    const data = await yahooGet(`/users;use_login=1/games;game_keys=mlb/leagues;league_keys=${leagueKey}/teams`);
    
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
