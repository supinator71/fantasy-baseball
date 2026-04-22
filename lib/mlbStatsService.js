/**
 * mlbStatsService.js — Free MLB Stats API integration
 */

import axios from 'axios';
import xml2js from 'xml2js';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;       // 10 min — player stats, schedules
const NEWS_CACHE_TTL = 3 * 60 * 1000;   // 3 min — breaking news (fresh signings)

function getCached(key, ttl = CACHE_TTL) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
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

export async function getRecentTransactions(days = 30) {
  const key = `mlb_transactions_${days}`;
  const cached = getCached(key, NEWS_CACHE_TTL);
  if (cached) return cached;
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const { data } = await axios.get(`${BASE_URL}/transactions`, {
      params: { sportId: 1, startDate, endDate },
      timeout: 8000,
    });
    const txns = (data.transactions || [])
      .filter(t => t.person?.fullName && (t.toTeam?.name || t.typeCode))
      .slice(0, 20)
      .map(t => {
        const name = t.person.fullName;
        const type = t.type?.shortDescription || t.typeCode || 'Transaction';
        const to   = t.toTeam?.name   ? `to ${t.toTeam.name}`   : '';
        const from = t.fromTeam?.name ? `from ${t.fromTeam.name}` : '';
        const date = (t.date || '').slice(0, 10);
        return `- ${name}: ${type} ${to} ${from} (${date})`.replace(/\s+/g, ' ').trim();
      });
    const result = txns.join('\n');
    setCache(key, result);
    return result;
  } catch (err) {
    console.warn('[MLB Stats] Transactions fetch failed:', err.message);
    return '';
  }
}

export async function getBreakingNews() {
  const key = `breaking_news`;
  const cached = getCached(key, NEWS_CACHE_TTL);
  if (cached) return cached;

  // Fetch both sources in parallel
  const [rssResult, txnResult] = await Promise.allSettled([
    // Source 1: RotoWire RSS (last ~24h)
    axios.get('https://www.rotowire.com/rss/news.php?sport=MLB', { timeout: 5000 })
      .then(({ data }) => new Promise((resolve) => {
        xml2js.parseString(data, (err, result) => {
          if (err) return resolve('');
          const items = result?.rss?.channel?.[0]?.item || [];
          resolve(items.slice(0, 12).map(i => `- ${i.title[0]}`).join('\n'));
        });
      }))
      .catch(() => ''),
    // Source 2: MLB Stats API transactions (last 30 days — catches older signings/trades)
    getRecentTransactions(30),
  ]);

  const rss  = rssResult.status  === 'fulfilled' ? rssResult.value  : '';
  const txns = txnResult.status === 'fulfilled' ? txnResult.value : '';

  const combined = [
    rss  ? `RECENT NEWS (RotoWire):\n${rss}`           : '',
    txns ? `MLB TRANSACTIONS (last 30 days):\n${txns}` : '',
  ].filter(Boolean).join('\n\n') || 'No recent news available';

  setCache(key, combined);
  return combined;
}

export async function getTwoStartPitchers() {
  const key = 'rolling_two_start_pitchers_v2';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const now = new Date();
    const day = now.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    // Current fantasy week: Mon → Sun
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - daysSinceMonday);
    currentMonday.setHours(0, 0, 0, 0);
    const cMonStr = currentMonday.toISOString().split('T')[0];
    const cSunStr = new Date(currentMonday.getTime() + 6 * 86400000).toISOString().split('T')[0];

    // Next fantasy week
    const nextMonday = new Date(currentMonday.getTime() + 7 * 86400000);
    const nMonStr = nextMonday.toISOString().split('T')[0];
    const nSunStr = new Date(nextMonday.getTime() + 6 * 86400000).toISOString().split('T')[0];

    const todayStr = now.toISOString().split('T')[0];

    const [currentData, nextData] = await Promise.all([
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: cMonStr, endDate: cSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(r => r.data),
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: nMonStr, endDate: nSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(r => r.data),
    ]);

    const normName = (n) => (n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ── Build per-pitcher start records for the current week ─────────────────
    const pitcherMap = new Map(); // normName → { fullName, starts: [{...}] }

    for (const dateObj of (currentData.dates || [])) {
      const dateStr = dateObj.date; // 'YYYY-MM-DD'
      const dayName = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'America/New_York' });

      for (const g of (dateObj.games || [])) {
        const gameTime  = g.gameDate ? new Date(g.gameDate) : null;
        const gameState = g.status?.abstractGameState || 'Preview'; // 'Preview' | 'Live' | 'Final'
        const isCompleted = gameState === 'Final';
        const isLive      = gameState === 'Live';
        // A game is "upcoming" if it hasn't started yet OR is today but hasn't been completed
        const isUpcoming  = !isCompleted && (!gameTime || gameTime > now);
        const isToday     = dateStr === todayStr;

        for (const side of ['away', 'home']) {
          const pitcher = g.teams?.[side]?.probablePitcher;
          if (!pitcher?.fullName) continue;
          const key = normName(pitcher.fullName);
          if (!pitcherMap.has(key)) pitcherMap.set(key, { fullName: pitcher.fullName, starts: [] });
          pitcherMap.get(key).starts.push({ dateStr, dayName, gameTime, isCompleted, isLive, isUpcoming, isToday });
        }
      }
    }

    // ── Classify each pitcher ─────────────────────────────────────────────────
    const twoStartThisWeek      = [];  // has 2+ total starts this week (backward compat)
    const remainingTwoStarters  = [];  // 2+ starts REMAINING (full value for add)
    const oneStartRemaining     = [];  // was a 2-start SP but 1 already pitched
    const todayStarters         = [];  // starting today (not yet final)
    const pitcherDetails        = {};  // rich data for the prompt

    for (const [norm, p] of pitcherMap) {
      const completed = p.starts.filter(s => s.isCompleted);
      const upcoming  = p.starts.filter(s => s.isUpcoming || s.isLive);
      const isToday   = p.starts.some(s => s.isToday && !s.isCompleted);

      if (isToday) todayStarters.push(norm);

      const totalStarts     = p.starts.length;
      const remainingCount  = upcoming.length;
      const completedCount  = completed.length;

      if (totalStarts >= 2) {
        twoStartThisWeek.push(norm);
        if (remainingCount >= 2) {
          remainingTwoStarters.push(norm);
        } else if (remainingCount === 1) {
          oneStartRemaining.push(norm);
        }
      }

      pitcherDetails[norm] = {
        fullName:       p.fullName,
        totalStarts,
        remainingStarts: remainingCount,
        completedStarts: completedCount,
        upcomingDays:   upcoming.map(s => s.dayName),
        completedDays:  completed.map(s => s.dayName),
        // Plain-English label for prompts/UI
        label: totalStarts >= 2
          ? remainingCount >= 2
            ? `2-start (both upcoming: ${upcoming.map(s => s.dayName).join(', ')})`
            : remainingCount === 1
              ? `2-start SP — 1 already pitched (${completed.map(s => s.dayName).join(',')}), 1 remaining (${upcoming.map(s => s.dayName).join(',')})`
              : `2-start SP — BOTH STARTS ALREADY PITCHED this week (${completed.map(s => s.dayName).join(', ')})`
          : isToday
            ? `1-start (today)`
            : `1-start (${p.starts.map(s => s.dayName).join(', ')})`,
      };
    }

    // ── Next week: just detect 2-start SPs (simple count, all future) ────────
    const nextPitcherCount = new Map();
    for (const dateObj of (nextData.dates || [])) {
      for (const g of (dateObj.games || [])) {
        for (const side of ['away', 'home']) {
          const pitcher = g.teams?.[side]?.probablePitcher;
          if (!pitcher?.fullName) continue;
          const key = normName(pitcher.fullName);
          nextPitcherCount.set(key, (nextPitcherCount.get(key) || 0) + 1);
        }
      }
    }
    const nextWeek = [...nextPitcherCount.entries()].filter(([, c]) => c >= 2).map(([n]) => n);

    const result = {
      currentWeek: twoStartThisWeek,   // backward compat
      nextWeek,
      today: todayStarters,
      remainingTwoStarters,            // still have 2 starts left → FULL value
      oneStartRemaining,               // 1 of 2 starts already used → partial value
      pitcherDetails,                  // rich per-pitcher detail for prompts
    };

    setCache(key, result);
    return result;
  } catch (err) {
    console.error('[MLB Stats] Failed to fetch 2-start pitchers:', err.message);
    return { currentWeek: [], nextWeek: [], today: [], remainingTwoStarters: [], oneStartRemaining: [], pitcherDetails: {} };
  }
}
