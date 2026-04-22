/**
 * mlbStatsService.js — Free MLB Stats API integration
 */

import axios from 'axios';
import xml2js from 'xml2js';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    oldest.slice(0, 100).forEach(([k]) => cache.delete(k));
  }
}

export async function searchPlayer(name) {
  const key = `search:${name.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/people/search`, { params: { names: name, sportId: 1 }, timeout: 8000 });
    const players = data.people || [];
    if (players.length === 0) return null;
    const exact = players.find(p => p.fullName?.toLowerCase() === name.toLowerCase() || p.nameFirstLast?.toLowerCase() === name.toLowerCase());
    const result = exact || players[0];
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Search failed for "${name}":`, err.message);
    return null;
  }
}

export async function getPlayerStats(playerId, season = 2026, group = 'hitting') {
  const key = `stats:${playerId}:${season}:${group}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/people/${playerId}/stats`, { params: { stats: 'season', season, group }, timeout: 8000 });
    const splits = data.stats?.[0]?.splits || [];
    if (splits.length === 0) return null;
    const stat = splits[0].stat;
    const result = { playerId, season, group, ...stat };
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Stats fetch failed for player ${playerId}:`, err.message);
    return null;
  }
}

export async function getPlayerSeasonStats(playerName, season = 2026) {
  const player = await searchPlayer(playerName);
  if (!player) return null;
  const isPitcher = player.primaryPosition?.abbreviation === 'P' || player.primaryPosition?.type === 'Pitcher';
  const rawStats = await getPlayerStats(player.id, season, isPitcher ? 'pitching' : 'hitting');
  if (!rawStats) return null;
  if (isPitcher) {
    return {
      name: player.fullName, mlbId: player.id, team: player.currentTeam?.name || '', teamAbbr: player.currentTeam?.abbreviation || '',
      position: 'P', age: player.currentAge, season, type: 'pitcher',
      stats: { W: rawStats.wins || 0, L: rawStats.losses || 0, ERA: parseFloat(rawStats.era) || 0, WHIP: parseFloat(rawStats.whip) || 0, K: rawStats.strikeOuts || 0, SV: rawStats.saves || 0, IP: parseFloat(rawStats.inningsPitched) || 0, GS: rawStats.gamesStarted || 0, G: rawStats.gamesPlayed || 0, BB: rawStats.baseOnBalls || 0, H: rawStats.hits || 0, HR: rawStats.homeRuns || 0, K9: parseFloat(rawStats.strikeoutsPer9Inn) || 0, BB9: parseFloat(rawStats.walksPer9Inn) || 0, KBBR: rawStats.strikeoutWalkRatio ? parseFloat(rawStats.strikeoutWalkRatio) : 0, AVG: parseFloat(rawStats.avg) || 0 }
    };
  } else {
    return {
      name: player.fullName, mlbId: player.id, team: player.currentTeam?.name || '', teamAbbr: player.currentTeam?.abbreviation || '',
      position: player.primaryPosition?.abbreviation || 'UTIL', age: player.currentAge, season, type: 'hitter',
      stats: { G: rawStats.gamesPlayed || 0, PA: rawStats.plateAppearances || 0, AB: rawStats.atBats || 0, R: rawStats.runs || 0, H: rawStats.hits || 0, HR: rawStats.homeRuns || 0, RBI: rawStats.rbi || 0, SB: rawStats.stolenBases || 0, CS: rawStats.caughtStealing || 0, BB: rawStats.baseOnBalls || 0, K: rawStats.strikeOuts || 0, AVG: parseFloat(rawStats.avg) || 0, OBP: parseFloat(rawStats.obp) || 0, SLG: parseFloat(rawStats.slg) || 0, OPS: parseFloat(rawStats.ops) || 0, BABIP: parseFloat(rawStats.babip) || 0, '2B': rawStats.doubles || 0, '3B': rawStats.triples || 0, TB: rawStats.totalBases || 0 }
    };
  }
}

export async function getBulkPlayerStats(playerNames = [], season = 2026) {
  const results = {};
  const batchSize = 5;
  for (let i = 0; i < playerNames.length; i += batchSize) {
    const batch = playerNames.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(name => getPlayerSeasonStats(name, season)));
    batchResults.forEach((result, idx) => {
      const name = batch[idx];
      if (result.status === 'fulfilled' && result.value) results[name] = result.value;
    });
  }
  return results;
}

export async function getMultiSeasonStats(playerName, seasons = [2024, 2025, 2026]) {
  const player = await searchPlayer(playerName);
  if (!player) return null;
  const isPitcher = player.primaryPosition?.abbreviation === 'P' || player.primaryPosition?.type === 'Pitcher';
  const group = isPitcher ? 'pitching' : 'hitting';
  const results = {};
  for (const season of seasons) {
    const stats = await getPlayerStats(player.id, season, group);
    if (stats) results[season] = stats;
  }
  return { name: player.fullName, mlbId: player.id, position: player.primaryPosition?.abbreviation || 'UTIL', age: player.currentAge, isPitcher, seasonStats: results };
}

export async function getLiveProbablePitchers() {
  const key = 'live_probable_pitchers';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, { params: { sportId: 1, hydrate: 'probablePitcher' }, timeout: 8000 });
    const pitchers = new Set();
    const games = data.dates?.[0]?.games || [];
    games.forEach(g => {
      if (g.teams?.away?.probablePitcher?.fullName) pitchers.add(g.teams.away.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      if (g.teams?.home?.probablePitcher?.fullName) pitchers.add(g.teams.home.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    });
    const result = Array.from(pitchers);
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch probable pitchers:`, err.message);
    return [];
  }
}

export async function getTodayLiveScores() {
  const key = 'live_scores_today';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, { params: { sportId: 1, hydrate: 'decidingPitcher,linescore' }, timeout: 10000 });
    const results = [];
    const games = data.dates?.[0]?.games || [];
    games.forEach(g => {
      results.push({
        gameId: g.gamePk, status: g.status?.abstractGameState || 'Unknown',
        homeTeam: g.teams?.home?.team?.name || 'Home', awayTeam: g.teams?.away?.team?.name || 'Away',
        homeScore: g.teams?.home?.score ?? 0, awayScore: g.teams?.away?.score ?? 0,
        winner: g.decidingPitcher?.winner?.fullName, loser: g.decidingPitcher?.loser?.fullName, saver: g.decidingPitcher?.save?.fullName,
        summary: `${g.teams?.away?.team?.name || 'Away'} ${g.teams?.away?.score ?? 0}, ${g.teams?.home?.team?.name || 'Home'} ${g.teams?.home?.score ?? 0}`
      });
    });
    setCache(key, results);
    return results;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch live scores:`, err.message);
    return [];
  }
}

export async function getBreakingNews() {
  const key = `breaking_news`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get('https://www.rotowire.com/rss/news.php?sport=MLB', { timeout: 5000 });
    return new Promise((resolve) => {
      xml2js.parseString(data, (err, result) => {
        if (err) return resolve('');
        const items = result?.rss?.channel?.[0]?.item || [];
        const headlines = items.slice(0, 15).map(i => `- ${i.title[0]}`);
        const resultString = headlines.join('\n');
        setCache(key, resultString);
        resolve(resultString);
      });
    });
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch breaking news:`, err.message);
    return '';
  }
}

export async function getTwoStartPitchers() {
  const key = 'rolling_two_start_pitchers';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const now = new Date();
    const day = now.getDay();
    const currentMondayDate = new Date(now);
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    currentMondayDate.setDate(now.getDate() - daysSinceMonday);
    const cMonStr = currentMondayDate.toISOString().split('T')[0];
    const cSunStr = new Date(currentMondayDate.getTime() + 6 * 86400000).toISOString().split('T')[0];
    const nextMondayDate = new Date(currentMondayDate.getTime() + 7 * 86400000);
    const nMonStr = nextMondayDate.toISOString().split('T')[0];
    const nSunStr = new Date(nextMondayDate.getTime() + 6 * 86400000).toISOString().split('T')[0];
    const [currentData, nextData] = await Promise.all([
      axios.get(`${BASE_URL}/schedule`, { params: { sportId: 1, startDate: cMonStr, endDate: cSunStr, hydrate: 'probablePitcher' }, timeout: 8000 }).then(res => res.data),
      axios.get(`${BASE_URL}/schedule`, { params: { sportId: 1, startDate: nMonStr, endDate: nSunStr, hydrate: 'probablePitcher' }, timeout: 8000 }).then(res => res.data)
    ]);
    const getPitchers = (data) => {
      const pitchers = new Set();
      (data.dates || []).forEach(d => (d.games || []).forEach(g => {
        if (g.teams?.away?.probablePitcher?.fullName) pitchers.add(g.teams.away.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        if (g.teams?.home?.probablePitcher?.fullName) pitchers.add(g.teams.home.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }));
      return Array.from(pitchers);
    };
    const result = { currentWeek: getPitchers(currentData), nextWeek: getPitchers(nextData) };
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch 2-start pitchers:`, err.message);
    return { currentWeek: [], nextWeek: [] };
  }
}
