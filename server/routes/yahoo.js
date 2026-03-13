const express = require('express');
const router = express.Router();
const yahoo = require('../services/yahooService');
const cache = require('../services/cache');
const db = require('../db/database');

// TTLs (ms)
const TTL = {
  LEAGUES:    5  * 60 * 1000,
  LEAGUE:     5  * 60 * 1000,
  MATCHUP:    5  * 60 * 1000,
  SCOREBOARD: 5  * 60 * 1000,
  PLAYERS:    15 * 60 * 1000,
  TRENDS:     15 * 60 * 1000,
  STATS:      15 * 60 * 1000,
  ROSTER:     15 * 60 * 1000,
  DRAFT:      5  * 60 * 1000,
  TXNS:       15 * 60 * 1000,
  STANDINGS:  30 * 60 * 1000,
}

function requireAuth(req, res, next) {
  const row = db.prepare('SELECT * FROM tokens WHERE id = 1').get();
  if (!row) return res.status(401).json({ error: 'Not authenticated. Please login with Yahoo.' });
  next();
}

// Wrap fetch with cache; sets X-Cache-* headers on res
async function withCache(res, key, ttlMs, force, fn) {
  if (!force) {
    const entry = cache.get(key)
    if (entry) {
      res.set('X-Cache-Hit', 'true')
      res.set('X-Cache-Updated', entry.cachedAt)
      return entry.value
    }
  }
  const data = await fn()
  const cachedAt = new Date().toISOString()
  cache.set(key, data, ttlMs)
  res.set('X-Cache-Hit', 'false')
  res.set('X-Cache-Updated', cachedAt)
  return data
}

// ── Cache management ───────────────────────────────────────────────────────────
router.get('/cache/stats', (req, res) => res.json(cache.stats()))

router.post('/cache/clear', (req, res) => {
  cache.clear(req.body?.key || undefined)
  res.json({ success: true })
})

// ── League routes ──────────────────────────────────────────────────────────────
router.get('/leagues', requireAuth, async (req, res) => {
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, 'leagues', TTL.LEAGUES, force, () => yahoo.getLeagues())
    res.json(data)
  } catch (err) {
    console.error('Error in /leagues endpoint:', err.message, err.response?.data || '');
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `league:${leagueKey}`, TTL.LEAGUE, force,
      () => yahoo.getLeague(leagueKey))
      
    // Parse the data for the LeagueSetup frontend component
    const settingsArr = data?.[1]?.settings?.[0];
    const rosterArr = settingsArr?.roster_positions?.[0]?.roster_position || Object.values(settingsArr?.roster_positions || {}).filter(v => v.position);
    const statsArr = settingsArr?.stat_categories?.stats || settingsArr?.stat_categories?.[0]?.stats || Object.values(settingsArr?.stat_categories || {}).filter(v => v.stat);

    const roster_slots = {};
    if (Array.isArray(rosterArr)) {
      rosterArr.forEach(r => {
        const pos = r.position || r.roster_position?.position || r.roster_position?.[0]?.position;
        const count = parseInt(r.count || r.roster_position?.count || r.roster_position?.[0]?.count || 1);
        if (pos) roster_slots[pos] = (roster_slots[pos] || 0) + count;
      });
    }

    const stat_categories = [];
    if (Array.isArray(statsArr)) {
      statsArr.forEach(s => {
        const name = s.stat?.name || s.stat?.[0]?.name;
        if (name) stat_categories.push(name);
      });
    }

    res.json({
      league_key: leagueKey,
      league_name: data?.[0]?.name || '',
      num_teams: parseInt(data?.[0]?.num_teams || 12),
      scoring_type: data?.[0]?.scoring_type || 'Roto',
      draft_type: data?.[0]?.draft_type || 'Snake',
      roster_slots: Object.keys(roster_slots).length ? roster_slots : undefined,
      stat_categories: stat_categories.length ? stat_categories : undefined
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/roster', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `roster:${leagueKey}:mine`, TTL.ROSTER, force, async () => {
      const myTeamKey = await yahoo.getUserTeamKey(leagueKey);
      if (!myTeamKey) throw new Error('Could not find your team in this league.');
      return yahoo.getRoster(leagueKey, myTeamKey);
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// My roster as flat player array (for AI features)
router.get('/league/:leagueKey/myroster', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const result = await withCache(res, `myroster:${leagueKey}`, TTL.ROSTER, force, async () => {
      const myTeamKey = await yahoo.getUserTeamKey(leagueKey)
      if (!myTeamKey) return { players: [], teamKey: null }
      const rosterData = await yahoo.getRoster(leagueKey, myTeamKey)
      const playerKeys = []
      const rosterCount = rosterData?.length || rosterData?.['@attributes']?.count || 0
      for (let i = 0; i < rosterCount; i++) {
        const p = rosterData[i]?.player
        if (p && Array.isArray(p)) {
          const infoArray = Array.isArray(p[0]) ? p[0] : []
          const info = Object.assign({}, ...infoArray)
          if (info.player_key) playerKeys.push(info.player_key)
        }
      }
      if (!playerKeys.length) return { players: [], teamKey: myTeamKey }
      const players = await yahoo.getBatchPlayerStats(leagueKey, playerKeys, null)
      return { players, teamKey: myTeamKey }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/standings', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `standings:${leagueKey}`, TTL.STANDINGS, force,
      () => yahoo.getStandings(leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/scoreboard', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `scoreboard:${leagueKey}`, TTL.SCOREBOARD, force,
      () => yahoo.getScoreboard(leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/players', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const { status = 'A', start = 0 } = req.query
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `players:${leagueKey}:${status}:${start}`, TTL.PLAYERS, force,
      () => yahoo.getPlayers(leagueKey, status, start))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// TEMPORARY DEBUG ENDPOINT FOR LOGS
router.get('/debug/fa/:leagueKey', requireAuth, async (req, res) => {
  try {
    const data = await yahoo.yahooGet(`/league/${req.params.leagueKey}/players;status=FA;start=0;count=3`);
    res.json(data);
  } catch (err) {
    res.json({ error: err.message });
  }
});

router.get('/league/:leagueKey/draft', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `draft:${leagueKey}`, TTL.DRAFT, force,
      () => yahoo.getDraftResults(leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/transactions', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `txns:${leagueKey}`, TTL.TXNS, force,
      () => yahoo.getTransactions(leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/player/:playerKey/stats', requireAuth, async (req, res) => {
  const { leagueKey, playerKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(res, `playerstats:${leagueKey}:${playerKey}`, TTL.STATS, force,
      () => yahoo.getPlayerStats(leagueKey, playerKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Matchup ───────────────────────────────────────────────────────────────────
const STAT_NAMES = {
  '60': 'R', '7': 'HR', '12': 'RBI', '16': 'SB', '3': 'AVG',
  '6': 'OBP', '5': 'SLG', '8': 'H', '10': 'BB',
  '28': 'W', '29': 'L', '32': 'SV', '42': 'K', '26': 'ERA', '27': 'WHIP',
  '23': 'IP', '31': 'HLD', '48': 'QS'
}
const LOWER_IS_BETTER = new Set(['26', '27', '29'])

router.get('/league/:leagueKey/matchup', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const result = await withCache(res, `matchup:${leagueKey}`, TTL.MATCHUP, force, async () => {
      const [matchups, myTeamKey] = await Promise.all([
        yahoo.getScoreboard(leagueKey),
        yahoo.getUserTeamKey(leagueKey)
      ])

      if (!matchups) throw new Error('No matchup data available')

      const totalMatchups = matchups['@attributes']?.count || 0
      const week = matchups['@attributes']?.week || null

      let foundMatchup = null
      for (let i = 0; i < totalMatchups; i++) {
        const matchup = matchups[i]?.matchup
        if (!matchup) continue
        const teams = matchup.teams
        if (!teams) continue
        const teamCount = teams['@attributes']?.count || 2
        for (let j = 0; j < teamCount; j++) {
          const teamKey = teams[j]?.team?.[0]?.team_key
          if (myTeamKey && teamKey === myTeamKey) { foundMatchup = matchup; break }
        }
        if (foundMatchup) break
      }
      if (!foundMatchup) foundMatchup = matchups[0]?.matchup
      if (!foundMatchup) throw new Error('No matchup found')

      const teams = foundMatchup.teams
      const teamCount = teams?.['@attributes']?.count || 2
      const parsedTeams = []

      for (let j = 0; j < teamCount; j++) {
        const teamArr = teams?.[j]?.team
        if (!teamArr) continue
        const info = teamArr[0] || {}
        const statsObj = teamArr[1]?.team_stats || teamArr[2]?.team_stats || {}
        const statsArr = statsObj.stats || []
        const stats = statsArr
          .map(s => s.stat || s)
          .filter(s => s.stat_id !== undefined && s.value !== undefined)
          .map(s => ({ stat_id: String(s.stat_id), name: STAT_NAMES[String(s.stat_id)] || String(s.stat_id), value: s.value }))
        parsedTeams.push({
          key: info.team_key,
          name: info.name || `Team ${j + 1}`,
          manager: info.managers?.[0]?.manager?.nickname || '',
          stats
        })
      }

      const myIdx = myTeamKey ? parsedTeams.findIndex(t => t.key === myTeamKey) : 0
      const myTeam = parsedTeams[myIdx >= 0 ? myIdx : 0]
      const opponent = parsedTeams[myIdx === 0 ? 1 : 0]

      const statMap = {}
      ;(myTeam?.stats || []).forEach(s => { statMap[s.stat_id] = { ...s, my_value: s.value } })
      ;(opponent?.stats || []).forEach(s => {
        if (statMap[s.stat_id]) statMap[s.stat_id].opp_value = s.value
        else statMap[s.stat_id] = { stat_id: s.stat_id, name: s.name, opp_value: s.value }
      })

      const statComparison = Object.values(statMap).map(s => {
        const myVal = parseFloat(s.my_value) || 0
        const oppVal = parseFloat(s.opp_value) || 0
        const lowerBetter = LOWER_IS_BETTER.has(s.stat_id)
        return {
          ...s,
          my_winning: myVal !== oppVal && (lowerBetter ? myVal < oppVal : myVal > oppVal),
          opp_winning: myVal !== oppVal && (lowerBetter ? oppVal < myVal : oppVal > myVal)
        }
      })

      return { week: week || foundMatchup.week, myTeam, opponent, stats: statComparison }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Trends ────────────────────────────────────────────────────────────────────
function calculateTrend(seasonStats, recentStats, position) {
  const hasRecent = Object.values(recentStats || {}).some(v => parseFloat(v) > 0)
  if (!hasRecent) return 'cold'

  const isPitcher = /SP|RP|P/.test(String(position))
  let delta = 0
  let components = 0

  if (isPitcher) {
    const sERA = parseFloat(seasonStats?.['26']); const rERA = parseFloat(recentStats?.['26'])
    const sWHIP = parseFloat(seasonStats?.['27']); const rWHIP = parseFloat(recentStats?.['27'])
    if (rERA && sERA && sERA > 0) { delta += (sERA - rERA) / sERA * 100; components++ }
    if (rWHIP && sWHIP && sWHIP > 0) { delta += (sWHIP - rWHIP) / sWHIP * 100; components++ }
  } else {
    const sAVG = parseFloat(seasonStats?.['3']); const rAVG = parseFloat(recentStats?.['3'])
    const sHR = parseFloat(seasonStats?.['7']);  const rHR = parseFloat(recentStats?.['7'])
    const sRBI = parseFloat(seasonStats?.['12']); const rRBI = parseFloat(recentStats?.['12'])
    if (rAVG && sAVG && sAVG > 0) { delta += (rAVG - sAVG) / sAVG * 100 * 1.5; components += 1.5 }
    if (rHR !== undefined && sHR !== undefined && sHR >= 0) { delta += (rHR - sHR) / Math.max(sHR, 1) * 50; components++ }
    if (rRBI !== undefined && sRBI !== undefined && sRBI >= 0) { delta += (rRBI - sRBI) / Math.max(sRBI, 1) * 25; components++ }
  }

  if (components === 0) return 'neutral'
  const score = delta / components
  if (score > 20) return 'hot'
  if (score > 7)  return 'rising'
  if (score >= -7) return 'neutral'
  return 'cold'
}

function trendDisplayStats(recentStats, seasonStats, position) {
  const isPitcher = /SP|RP|P/.test(String(position))
  if (isPitcher) {
    return [
      { label: 'ERA',  recent: recentStats?.['26'], season: seasonStats?.['26'], lowerBetter: true },
      { label: 'WHIP', recent: recentStats?.['27'], season: seasonStats?.['27'], lowerBetter: true },
      { label: 'K',    recent: recentStats?.['42'], season: seasonStats?.['42'] }
    ].filter(s => s.recent !== undefined || s.season !== undefined)
  }
  return [
    { label: 'AVG',  recent: recentStats?.['3'],  season: seasonStats?.['3'] },
    { label: 'HR',   recent: recentStats?.['7'],  season: seasonStats?.['7'] },
    { label: 'RBI',  recent: recentStats?.['12'], season: seasonStats?.['12'] },
    { label: 'R',    recent: recentStats?.['60'], season: seasonStats?.['60'] },
    { label: 'SB',   recent: recentStats?.['16'], season: seasonStats?.['16'] }
  ].filter(s => s.recent !== undefined || s.season !== undefined)
}

router.get('/league/:leagueKey/trends', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const result = await withCache(res, `trends:${leagueKey}`, TTL.TRENDS, force, async () => {
      const myTeamKey = await yahoo.getUserTeamKey(leagueKey)
      if (!myTeamKey) return { myPlayers: [], freeAgents: [] }

      const rosterData = await yahoo.getRoster(leagueKey, myTeamKey)
      const playerKeys = []
      const rosterCount = rosterData?.['@attributes']?.count || 0
      for (let i = 0; i < rosterCount; i++) {
        const key = rosterData[i]?.player?.[0]?.player_key
        if (key) playerKeys.push(key)
      }

      const [recentMine, seasonMine, faData] = await Promise.all([
        playerKeys.length ? yahoo.getBatchPlayerStats(leagueKey, playerKeys, 'lastweek') : [],
        playerKeys.length ? yahoo.getBatchPlayerStats(leagueKey, playerKeys, null) : [],
        yahoo.getFreeAgentsTrending(leagueKey, 25)
      ])

      const seasonMap = {}
      seasonMine.forEach(p => { seasonMap[p.key] = p.stats })

      const myPlayers = recentMine.map(p => {
        const seasonStats = seasonMap[p.key] || {}
        const trend = calculateTrend(seasonStats, p.stats, p.position)
        return { ...p, recentStats: p.stats, seasonStats, trend, displayStats: trendDisplayStats(p.stats, seasonStats, p.position) }
      }).sort((a, b) => {
        const order = { hot: 0, rising: 1, neutral: 2, cold: 3 }
        return (order[a.trend] ?? 2) - (order[b.trend] ?? 2)
      })

      const freeAgents = faData.map(p => ({
        ...p,
        trend: calculateTrend(p.seasonStats, p.recentStats, p.position),
        displayStats: trendDisplayStats(p.recentStats, p.seasonStats, p.position)
      })).filter(p => p.trend === 'hot' || p.trend === 'rising')
        .sort((a, b) => (a.trend === 'hot' ? -1 : 1))

      return { myPlayers, freeAgents }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── League settings (local, no cache needed) ──────────────────────────────────
router.post('/league/save', requireAuth, async (req, res) => {
  try {
    const { league_key, league_name, num_teams, scoring_type, draft_type, draft_position, roster_slots, stat_categories } = req.body
    db.prepare(`INSERT OR REPLACE INTO league_settings
      (id, league_key, league_name, num_teams, scoring_type, draft_type, draft_position, roster_slots, stat_categories, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(league_key, league_name, num_teams, scoring_type, draft_type, draft_position,
      JSON.stringify(roster_slots), JSON.stringify(stat_categories), Date.now())
    // Clear cached data for this league so fresh data loads next time
    cache.clear(league_key)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/settings/local', (req, res) => {
  const settings = db.prepare('SELECT * FROM league_settings WHERE id = 1').get()
  if (!settings) return res.json(null)
  settings.roster_slots = JSON.parse(settings.roster_slots || '{}')
  settings.stat_categories = JSON.parse(settings.stat_categories || '[]')
  res.json(settings)
})

module.exports = router;
