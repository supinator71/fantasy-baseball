/**
 * mlbStatsService.js — Free MLB Stats API integration
 * Fetches real player stats from statsapi.mlb.com (no API key needed)
 * Provides 2025 season data to power fantasy analytics
 */

const axios = require('axios');
const xml2js = require('xml2js');

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

// ─────────────────────────────────────────────────────────────────────────────
// PROBABLE PITCHERS — get today's live scheduled starters
// ─────────────────────────────────────────────────────────────────────────────

async function getLiveProbablePitchers() {
  const key = 'live_probable_pitchers';
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, {
      params: { sportId: 1, hydrate: 'probablePitcher' },
      timeout: 8000
    });

    const pitchers = new Set();
    const games = data.dates?.[0]?.games || [];
    
    games.forEach(g => {
      if (g.teams?.away?.probablePitcher?.fullName) {
        pitchers.add(g.teams.away.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
      if (g.teams?.home?.probablePitcher?.fullName) {
        pitchers.add(g.teams.home.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    });

    const result = Array.from(pitchers);
    // Cache for 60 minutes since probable pitchers rarely change rapidly on game day
    cache.set(key, { data: result, ts: Date.now() });
    
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch probable pitchers:`, err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY SCHEDULE — Fetch upcoming matchups for AI context
// ─────────────────────────────────────────────────────────────────────────────

async function getUpcomingSchedule() {
  const key = `upcoming_schedule`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    // Get schedule for today
    const date = new Date().toISOString().split('T')[0];
    const { data } = await axios.get(`${BASE_URL}/schedule?sportId=1&date=${date}&hydrate=probablePitcher`, {
      timeout: 8000,
    });

    const games = data.dates?.[0]?.games || [];
    const matchups = games.map(g => {
      const away = g.teams?.away?.team?.name || 'Away';
      const home = g.teams?.home?.team?.name || 'Home';
      const awayP = g.teams?.away?.probablePitcher?.fullName || 'TBD';
      const homeP = g.teams?.home?.probablePitcher?.fullName || 'TBD';
      return `- ${away} @ ${home} (Pitching: ${awayP} vs ${homeP})`;
    });

    const result = matchups.join('\n');
    cache.set(key, { data: result, ts: Date.now() });
    
    return result;
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch upcoming schedule:`, err.message);
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BREAKING NEWS — Fetch real-time injury and transaction news from Rotowire RSS
// ─────────────────────────────────────────────────────────────────────────────

async function getBreakingNews() {
  const key = `breaking_news`;
  const cached = cache.get(key);
  // Cache news for 5 minutes
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;

  try {
    const { data } = await axios.get('https://www.rotowire.com/rss/news.php?sport=MLB', {
      timeout: 5000,
    });

    return new Promise((resolve) => {
      xml2js.parseString(data, (err, result) => {
        if (err) {
          console.error(`[MLB Stats] Failed to parse XML for breaking news:`, err.message);
          return resolve('');
        }
        
        const items = result?.rss?.channel?.[0]?.item || [];
        // Extract the top 15 breaking headlines
        const headlines = items.slice(0, 15).map(i => `- ${i.title[0]}`);
        const resultString = headlines.join('\n');
        
        cache.set(key, { data: resultString, ts: Date.now() });
        resolve(resultString);
      });
    });
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch breaking news:`, err.message);
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TWO-START PITCHERS — Calculate next week's 2-start pitchers
// ─────────────────────────────────────────────────────────────────────────────

async function getTwoStartPitchers() {
  const key = 'rolling_two_start_pitchers';
  const cached = cache.get(key);
  // Reduce cache from 2 hours to 10 minutes so fresh probable pitchers surface immediately
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.data; 

  try {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday

    // 1. Calculate Current Week Monday & Sunday
    const currentMondayDate = new Date(now);
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    currentMondayDate.setDate(now.getDate() - daysSinceMonday);
    
    const currentSundayDate = new Date(currentMondayDate);
    currentSundayDate.setDate(currentMondayDate.getDate() + 6);

    // 2. Calculate Next Week Monday & Sunday
    const nextMondayDate = new Date(now);
    const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
    nextMondayDate.setDate(now.getDate() + daysUntilNextMonday);

    const nextSundayDate = new Date(nextMondayDate);
    nextSundayDate.setDate(nextMondayDate.getDate() + 6);

    // Date strings
    const cMonStr = currentMondayDate.toISOString().split('T')[0];
    const cSunStr = currentSundayDate.toISOString().split('T')[0];
    const nMonStr = nextMondayDate.toISOString().split('T')[0];
    const nSunStr = nextSundayDate.toISOString().split('T')[0];

    // Fetch BOTH weeks in parallel
    const [currentData, nextData] = await Promise.all([
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: cMonStr, endDate: cSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(res => res.data).catch(() => ({ dates: [] })),
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: nMonStr, endDate: nSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(res => res.data).catch(() => ({ dates: [] }))
    ]);

    function processSchedule(data, minDateStr = null) {
      const dates = data.dates || [];
      const pitcherStarts = {}; // name -> count of starts >= minDateStr
      const teamGameIndex = {}; 
      const teamGamesRemaining = {};
      
      dates.forEach(d => {
        const isFutureOrToday = !minDateStr || d.date >= minDateStr;
        const games = d.games || [];
        games.forEach(g => {
          const awayId = g.teams?.away?.team?.id;
          const homeId = g.teams?.home?.team?.id;
          const awayP = g.teams.away.probablePitcher?.fullName;
          const homeP = g.teams.home.probablePitcher?.fullName;
          
          if (awayId) {
             if(!teamGameIndex[awayId]) teamGameIndex[awayId] = [];
             teamGameIndex[awayId].push({ pitcher: awayP, date: d.date });
             if (isFutureOrToday) teamGamesRemaining[awayId] = (teamGamesRemaining[awayId] || 0) + 1;
             if (awayP && isFutureOrToday) {
               const name = awayP.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
               pitcherStarts[name] = (pitcherStarts[name] || 0) + 1;
             }
          }
          if (homeId) {
             if(!teamGameIndex[homeId]) teamGameIndex[homeId] = [];
             teamGameIndex[homeId].push({ pitcher: homeP, date: d.date });
             if (isFutureOrToday) teamGamesRemaining[homeId] = (teamGamesRemaining[homeId] || 0) + 1;
             if (homeP && isFutureOrToday) {
               const name = homeP.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
               pitcherStarts[name] = (pitcherStarts[name] || 0) + 1;
             }
          }
        });
      });

      const confirmedTwoStarters = Object.keys(pitcherStarts).filter(name => pitcherStarts[name] >= 2);
      const twoStartPitchers = [...confirmedTwoStarters];
      const nextWeekLinearProjectionList = [];

      for (const teamId in teamGameIndex) {
         const games = teamGameIndex[teamId];
         const remaining = teamGamesRemaining[teamId] || 0;
         const futureGames = games.filter(g => !minDateStr || g.date >= minDateStr);
         
         // Current Week Logic: Projected two-starters based on remaining games
         if (remaining >= 6 && futureGames[0]?.pitcher) {
             twoStartPitchers.push(futureGames[0].pitcher.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
         }
         if (remaining >= 7 && futureGames[1]?.pitcher) {
             twoStartPitchers.push(futureGames[1].pitcher.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
         }
         if (remaining >= 8 && futureGames[2]?.pitcher) {
             twoStartPitchers.push(futureGames[2].pitcher.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
         }

         // Next Week Projection Logic (always uses the FULL week schedule to find the tail of the rotation)
         const totalGames = games.length;
         const nextWeekGame1Index = totalGames % 5;
         const nextWeekGame2Index = (totalGames + 1) % 5;
         
         const projectedGame1Starter = games[nextWeekGame1Index]?.pitcher;
         const projectedGame2Starter = games[nextWeekGame2Index]?.pitcher;

         if (projectedGame1Starter) nextWeekLinearProjectionList.push({ teamId, name: projectedGame1Starter });
         if (projectedGame2Starter) nextWeekLinearProjectionList.push({ teamId, name: projectedGame2Starter, isGame2: true });
      }
      return { twoStartPitchers: [...new Set(twoStartPitchers)], linearProjections: nextWeekLinearProjectionList, teamGameIndex };
    }

    const todayStr = now.toISOString().split('T')[0];
    const cw = processSchedule(currentData, todayStr);
    const nw = processSchedule(nextData);

    const currentWeekFinal = cw.twoStartPitchers;
    const nextWeekFinal = nw.twoStartPitchers; // Picks up any manually announced probable pitchers for next week
    
    // Supplement next week with linear projections (since MLB rarely provides next-week probables)
    for (const proj of cw.linearProjections) {
        const nextWeekGamesCount = nw.teamGameIndex[proj.teamId]?.length || 0;
        const basicName = proj.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (!proj.isGame2 && nextWeekGamesCount >= 6) {
             if (!nextWeekFinal.includes(basicName)) nextWeekFinal.push(basicName);
        }
        if (proj.isGame2 && nextWeekGamesCount >= 7) {
             if (!nextWeekFinal.includes(basicName)) nextWeekFinal.push(basicName);
        }
    }

    const result = { currentWeek: currentWeekFinal, nextWeek: nextWeekFinal };
    cache.set(key, { data: result, ts: Date.now() });
    return result;

  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch 2-start pitchers:`, err.message);
    return { currentWeek: [], nextWeek: [] };
  }
}

module.exports = {
  searchPlayer,
  getPlayerStats,
  getPlayerSeasonStats,
  getBulkPlayerStats,
  getMultiSeasonStats,
  getLiveProbablePitchers,
  getTwoStartPitchers,
  getUpcomingSchedule,
  getBreakingNews,
};
