/**
 * mlbStatsService.js — Free MLB Stats API integration
 * Fetches real player stats from statsapi.mlb.com (no API key needed)
 * Provides 2025 season data to power fantasy analytics
 */

const axios = require('axios');

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  // Evict old entries if cache grows too large
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    oldest.slice(0, 100).forEach(([k]) => cache.delete(k));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER SEARCH — find MLB player ID by name
// ─────────────────────────────────────────────────────────────────────────────

async function searchPlayer(name) {
  const key = `search:${name.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    // Use the sports_players endpoint and filter by name
    const { data } = await axios.get(`${BASE_URL}/people/search`, {
      params: { names: name, sportId: 1 },
      timeout: 8000,
    });

    const players = data.people || [];
    if (players.length === 0) return null;

    // Best match: prefer exact name match, then closest
    const exact = players.find(p =>
      p.fullName?.toLowerCase() === name.toLowerCase() ||
      p.nameFirstLast?.toLowerCase() === name.toLowerCase()
    );
    const result = exact || players[0];
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Search failed for "${name}":`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER STATS — get season hitting or pitching stats
// ─────────────────────────────────────────────────────────────────────────────

async function getPlayerStats(playerId, season = 2025, group = 'hitting') {
  const key = `stats:${playerId}:${season}:${group}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/people/${playerId}/stats`, {
      params: { stats: 'season', season, group },
      timeout: 8000,
    });

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

// ─────────────────────────────────────────────────────────────────────────────
// FULL PLAYER LOOKUP — search by name, return normalized fantasy stats
// ─────────────────────────────────────────────────────────────────────────────

async function getPlayerSeasonStats(playerName, season = 2025) {
  const player = await searchPlayer(playerName);
  if (!player) return null;

  const isPitcher = player.primaryPosition?.abbreviation === 'P' ||
                    player.primaryPosition?.type === 'Pitcher';

  const rawStats = await getPlayerStats(player.id, season, isPitcher ? 'pitching' : 'hitting');
  if (!rawStats) return null;

  // Normalize to fantasy-relevant format
  if (isPitcher) {
    return {
      name: player.fullName,
      mlbId: player.id,
      team: player.currentTeam?.name || '',
      teamAbbr: player.currentTeam?.abbreviation || '',
      position: 'P',
      age: player.currentAge,
      season,
      type: 'pitcher',
      stats: {
        W: rawStats.wins || 0,
        L: rawStats.losses || 0,
        ERA: parseFloat(rawStats.era) || 0,
        WHIP: parseFloat(rawStats.whip) || 0,
        K: rawStats.strikeOuts || 0,
        SV: rawStats.saves || 0,
        IP: parseFloat(rawStats.inningsPitched) || 0,
        GS: rawStats.gamesStarted || 0,
        G: rawStats.gamesPlayed || 0,
        BB: rawStats.baseOnBalls || 0,
        H: rawStats.hits || 0,
        HR: rawStats.homeRuns || 0,
        K9: parseFloat(rawStats.strikeoutsPer9Inn) || 0,
        BB9: parseFloat(rawStats.walksPer9Inn) || 0,
        KBBR: rawStats.strikeoutWalkRatio ? parseFloat(rawStats.strikeoutWalkRatio) : 0,
        AVG: parseFloat(rawStats.avg) || 0,
      },
    };
  } else {
    return {
      name: player.fullName,
      mlbId: player.id,
      team: player.currentTeam?.name || '',
      teamAbbr: player.currentTeam?.abbreviation || '',
      position: player.primaryPosition?.abbreviation || 'UTIL',
      age: player.currentAge,
      season,
      type: 'hitter',
      stats: {
        G: rawStats.gamesPlayed || 0,
        PA: rawStats.plateAppearances || 0,
        AB: rawStats.atBats || 0,
        R: rawStats.runs || 0,
        H: rawStats.hits || 0,
        HR: rawStats.homeRuns || 0,
        RBI: rawStats.rbi || 0,
        SB: rawStats.stolenBases || 0,
        CS: rawStats.caughtStealing || 0,
        BB: rawStats.baseOnBalls || 0,
        K: rawStats.strikeOuts || 0,
        AVG: parseFloat(rawStats.avg) || 0,
        OBP: parseFloat(rawStats.obp) || 0,
        SLG: parseFloat(rawStats.slg) || 0,
        OPS: parseFloat(rawStats.ops) || 0,
        BABIP: parseFloat(rawStats.babip) || 0,
        '2B': rawStats.doubles || 0,
        '3B': rawStats.triples || 0,
        TB: rawStats.totalBases || 0,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK LOOKUP — fetch stats for multiple players at once
// ─────────────────────────────────────────────────────────────────────────────

async function getBulkPlayerStats(playerNames = [], season = 2025) {
  // Process in parallel batches of 5 to avoid overwhelming the API
  const results = {};
  const batchSize = 5;

  for (let i = 0; i < playerNames.length; i += batchSize) {
    const batch = playerNames.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(name => getPlayerSeasonStats(name, season))
    );

    batchResults.forEach((result, idx) => {
      const name = batch[idx];
      if (result.status === 'fulfilled' && result.value) {
        results[name] = result.value;
      }
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-SEASON — get stats across multiple years for trend analysis
// ─────────────────────────────────────────────────────────────────────────────

async function getMultiSeasonStats(playerName, seasons = [2023, 2024, 2025]) {
  const player = await searchPlayer(playerName);
  if (!player) return null;

  const isPitcher = player.primaryPosition?.abbreviation === 'P' ||
                    player.primaryPosition?.type === 'Pitcher';
  const group = isPitcher ? 'pitching' : 'hitting';

  const results = {};
  for (const season of seasons) {
    const stats = await getPlayerStats(player.id, season, group);
    if (stats) {
      results[season] = stats;
    }
  }

  return {
    name: player.fullName,
    mlbId: player.id,
    position: player.primaryPosition?.abbreviation || 'UTIL',
    age: player.currentAge,
    isPitcher,
    seasonStats: results,
  };
}

module.exports = {
  searchPlayer,
  getPlayerStats,
  getPlayerSeasonStats,
  getBulkPlayerStats,
  getMultiSeasonStats,
};
