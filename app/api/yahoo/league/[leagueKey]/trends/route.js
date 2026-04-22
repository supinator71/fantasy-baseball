import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as yahoo from '@/lib/yahooService';

// ── Trend calculation logic (ported from old Express server) ──────────────────

function calculateTrend(seasonStats, recentStats, position, historicalStats = {}) {
  const hasRecent = Object.values(recentStats || {}).some(v => parseFloat(v) > 0);
  if (!hasRecent) return 'neutral';

  const isPitcher = /SP|RP|P/.test(String(position));
  let score = 0;

  if (isPitcher) {
    const hERA = parseFloat(historicalStats?.['26']);
    const sERA = parseFloat(seasonStats?.['26']) || 4.00;
    const rERA = parseFloat(recentStats?.['26']);

    if (!isNaN(rERA)) {
      if (rERA <= 2.50) score += 10;
      else if (rERA >= 5.50) score -= 10;
      if (rERA <= sERA * 0.7) score += 10;
      else if (rERA >= sERA * 1.3) score -= 10;
      if (!isNaN(hERA) && hERA > 0) {
        if (sERA <= hERA - 1.00) score += 5;
        else if (sERA >= hERA + 1.00) score -= 15;
      }
    }
    const rW  = parseFloat(recentStats?.['28'] || 0);
    const rSV = parseFloat(recentStats?.['32'] || 0);
    const rK  = parseFloat(recentStats?.['42'] || 0);
    if (rW > 0 || rSV > 0) score += 5;
    if (rK >= 10) score += 5;
  } else {
    const hAVG = parseFloat(historicalStats?.['3']);
    const sAVG = parseFloat(seasonStats?.['3']) || 0.250;
    const rAVG = parseFloat(recentStats?.['3']);

    if (!isNaN(rAVG)) {
      if (rAVG >= 0.330) score += 10;
      else if (rAVG <= 0.200) score -= 10;
      if (rAVG >= sAVG + 0.050) score += 10;
      else if (rAVG <= sAVG - 0.050) score -= 10;
      if (!isNaN(hAVG) && hAVG > 0) {
        if (sAVG >= hAVG + 0.030) score += 5;
        else if (sAVG <= hAVG - 0.040) score -= 15;
      }
    }
    const rHR  = parseFloat(recentStats?.['7']  || 0);
    const rRBI = parseFloat(recentStats?.['12'] || 0);
    const rSB  = parseFloat(recentStats?.['16'] || 0);
    if (rHR >= 2) score += 10;
    else if (rHR === 1) score += 3;
    if (rRBI >= 5) score += 5;
    if (rSB >= 2) score += 5;
  }

  if (score >= 15) return 'hot';
  if (score > 0)   return 'rising';
  if (score <= -10) return 'cold';
  return 'neutral';
}

function trendDisplayStats(recentStats, seasonStats, position) {
  const isPitcher = /SP|RP|P/.test(String(position));
  if (isPitcher) {
    return [
      { label: 'ERA',  season: seasonStats?.['26'], lowerBetter: true },
      { label: 'WHIP', season: seasonStats?.['27'], lowerBetter: true },
      { label: 'K',    season: seasonStats?.['42'] },
    ].filter(s => s.season !== undefined);
  }
  return [
    { label: 'AVG', season: seasonStats?.['3'] },
    { label: 'HR',  season: seasonStats?.['7'] },
    { label: 'RBI', season: seasonStats?.['12'] },
    { label: 'R',   season: seasonStats?.['60'] },
    { label: 'SB',  season: seasonStats?.['16'] },
  ].filter(s => s.season !== undefined);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request, { params }) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  const { leagueKey } = await params;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const myTeamKey = await yahoo.getUserTeamKey(guid, leagueKey);
    if (!myTeamKey) {
      return NextResponse.json({ myPlayers: [], freeAgents: [] });
    }

    const rosterData = await yahoo.getRoster(guid, leagueKey, myTeamKey);
    const playerKeys = [];
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (Array.isArray(p)) {
        const infoArray = Array.isArray(p[0]) ? p[0] : [];
        const info = Object.assign({}, ...infoArray);
        if (info.player_key) playerKeys.push(info.player_key);
      }
    }

    const [recentMine, seasonMine, historicalMine, faData] = await Promise.all([
      playerKeys.length ? yahoo.getBatchPlayerStats(guid, leagueKey, playerKeys, 'lastweek') : [],
      playerKeys.length ? yahoo.getBatchPlayerStats(guid, leagueKey, playerKeys, null) : [],
      playerKeys.length ? yahoo.getBatchPlayerStats(guid, leagueKey, playerKeys, 'season;year=2025') : [],
      yahoo.getFreeAgentsTrending(guid, leagueKey, 25),
    ]);

    const seasonMap = {};
    const historicalMap = {};
    seasonMine.forEach(p => { seasonMap[p.key] = p.stats; });
    historicalMine.forEach(p => { historicalMap[p.key] = p.stats; });

    const myPlayers = recentMine.map(p => {
      const seasonStats = seasonMap[p.key] || {};
      const historicalStats = historicalMap[p.key] || {};
      const trend = calculateTrend(seasonStats, p.stats, p.position, historicalStats);
      return {
        ...p,
        recentStats: p.stats,
        seasonStats,
        trend,
        displayStats: trendDisplayStats(p.stats, seasonStats, p.position),
      };
    }).sort((a, b) => {
      const order = { hot: 0, rising: 1, neutral: 2, cold: 3 };
      return (order[a.trend] ?? 2) - (order[b.trend] ?? 2);
    });

    const freeAgents = faData
      .map(p => ({
        ...p,
        trend: calculateTrend(p.seasonStats, p.recentStats, p.position, p.historicalStats),
        displayStats: trendDisplayStats(p.recentStats, p.seasonStats, p.position),
      }))
      .filter(p => p.trend === 'hot' || p.trend === 'rising')
      .sort((a, b) => (a.trend === 'hot' ? -1 : 1));

    return NextResponse.json(
      { myPlayers, freeAgents },
      {
        headers: {
          'X-Cache-Hit': 'false',
          'X-Cache-Updated': new Date().toISOString(),
        },
      }
    );
  } catch (err) {
    console.error('[trends route]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
