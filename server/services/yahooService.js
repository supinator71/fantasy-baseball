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

async function getLeagues() {
  const data = await yahooGet('/users;use_login=1/games;game_keys=mlb/leagues');
  const leagues = data.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues;
  if (!leagues) return [];

  const result = [];
  const count = leagues['@attributes']?.count || 0;
  for (let i = 0; i < count; i++) {
    const league = leagues[i]?.league?.[0];
    if (league) result.push(league);
  }
  return result;
}

async function getLeague(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/settings`);
  return data.fantasy_content?.league;
}

async function getRoster(leagueKey, teamKey) {
  const data = await yahooGet(`/team/${teamKey}/roster/players`);
  return data.fantasy_content?.team?.[1]?.roster?.[0]?.players;
}

async function getStandings(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/standings`);
  return data.fantasy_content?.league?.[1]?.standings?.[0]?.teams;
}

async function getScoreboard(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/scoreboard`);
  return data.fantasy_content?.league?.[1]?.scoreboard?.[0]?.matchups;
}

async function getPlayers(leagueKey, status = 'A', start = 0) {
  const data = await yahooGet(`/league/${leagueKey}/players;status=${status};start=${start};count=25`);
  return data.fantasy_content?.league?.[1]?.players;
}

async function getDraftResults(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/draftresults`);
  return data.fantasy_content?.league?.[1]?.draft_results;
}

async function getTransactions(leagueKey) {
  const data = await yahooGet(`/league/${leagueKey}/transactions;type=waiver`);
  return data.fantasy_content?.league?.[1]?.transactions;
}

async function getPlayerStats(leagueKey, playerKey) {
  const data = await yahooGet(`/league/${leagueKey}/players;player_keys=${playerKey}/stats`);
  return data.fantasy_content?.league?.[1]?.players?.[0]?.player;
}

function parsePlayersStats(raw) {
  if (!raw) return [];
  const count = raw['@attributes']?.count || 0;
  const result = [];
  for (let i = 0; i < count; i++) {
    const p = raw[i]?.player;
    if (!p) continue;
    const info = p[0] || {};
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
    const games = data.fantasy_content?.users?.[0]?.user?.[1]?.games;
    if (!games) return null;
    const count = games['@attributes']?.count || 0;
    for (let i = 0; i < count; i++) {
      const game = games[i]?.game;
      if (!game) continue;
      const leagues2 = game[1]?.leagues;
      if (!leagues2) continue;
      const lcount = leagues2['@attributes']?.count || 0;
      for (let j = 0; j < lcount; j++) {
        const league = leagues2[j]?.league;
        if (!league) continue;
        const teams = league[1]?.teams;
        if (!teams) continue;
        const tcount = teams['@attributes']?.count || 0;
        for (let k = 0; k < tcount; k++) {
          const teamKey = teams[k]?.team?.[0]?.team_key;
          if (teamKey) return teamKey;
        }
      }
    }
  } catch (e) {}
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
  getAccessToken
};
