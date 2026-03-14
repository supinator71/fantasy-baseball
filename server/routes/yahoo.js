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
      console.log('[ROSTER DEBUG] myTeamKey:', myTeamKey);
      if (!myTeamKey) throw new Error('Could not find your team in this league.');
      const rosterResult = await yahoo.getRoster(leagueKey, myTeamKey);
      console.log('[ROSTER DEBUG] result type:', typeof rosterResult, 'isArray:', Array.isArray(rosterResult), 'length:', rosterResult?.length);
      if (rosterResult?.[0]) {
        console.log('[ROSTER DEBUG] first item:', JSON.stringify(rosterResult[0]).slice(0, 500));
      }
      return rosterResult;
    })
    res.json(data)
  } catch (err) {
    console.error('[ROSTER ERROR]', err.message);
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
      for (const rosterItem of (rosterData || [])) {
        const p = rosterItem?.player
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
      
    // BACKEND DIAGNOSTIC LOG
    console.log('API /PLAYERS PAYLOAD[0]:', JSON.stringify(data[0] || 'EMPTY', null, 2));
      
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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

      // Log the raw matchups structure  
      const matchupsKeys = Object.keys(matchups).slice(0, 10);
      console.log('[MATCHUP] matchups keys:', matchupsKeys);
      
      // Count matchups: try @attributes, then count numeric keys
      let totalMatchups = parseInt(matchups['@attributes']?.count) || 0
      if (!totalMatchups) {
        totalMatchups = Object.keys(matchups).filter(k => /^\d+$/.test(k)).length;
      }
      const week = matchups['@attributes']?.week || null
      console.log('[MATCHUP] totalMatchups:', totalMatchups, 'week:', week, 'myTeamKey:', myTeamKey);

      // Helper: extract teams from a matchup object (which can be nested in various ways)
      function extractTeamsFromMatchup(m) {
        if (!m) return null;
        // Direct teams property
        if (m.teams) return m.teams;
        // If matchup is an array, search items for teams
        if (Array.isArray(m)) {
          for (const item of m) {
            if (item?.teams) return item.teams;
          }
        }
        // If matchup is an object with numeric keys, search them
        for (const key of Object.keys(m)) {
          if (m[key]?.teams) return m[key].teams;
        }
        return null;
      }

      // Helper: get the raw matchup entry from matchups collection
      function getMatchupEntry(idx) {
        const raw = matchups[idx] || matchups[String(idx)];
        if (!raw) return null;
        // Could be {matchup: ...} or directly the matchup data
        return raw.matchup || raw;
      }

      // Helper: extract team_key from a team info structure
      function extractTeamKey(teamData) {
        if (!teamData) return null;
        // teamData could be: [array of team sub-entries] or {team: [...]}
        const teamArr = teamData.team || teamData;
        if (!Array.isArray(teamArr)) return teamData.team_key;
        const first = teamArr[0];
        if (Array.isArray(first)) {
          return Object.assign({}, ...first)?.team_key;
        }
        return first?.team_key;
      }

      // Helper: get team entries from teams obj (can be indexed, array, or have direct team property)
      function getTeamEntries(teamsObj) {
        if (!teamsObj) return [];
        const entries = [];
        
        // Try numeric keys: teams["0"], teams["1"]
        const count = parseInt(teamsObj['@attributes']?.count) || 0;
        const numericKeys = Object.keys(teamsObj).filter(k => /^\d+$/.test(k)).sort((a,b) => a-b);
        
        if (numericKeys.length > 0) {
          for (const k of numericKeys) {
            if (teamsObj[k]) entries.push(teamsObj[k]);
          }
        }
        
        // Fallback: if teams is an array
        if (!entries.length && Array.isArray(teamsObj)) {
          entries.push(...teamsObj);
        }
        
        // Fallback: if teams has a direct "team" property that's an array of teams
        if (!entries.length && teamsObj.team) {
          if (Array.isArray(teamsObj.team)) {
            // Could be [{team_key:...}, {name:...}] (single team) or [[{team_key:...},...], [{team_key:...},...]] (multiple)
            if (teamsObj.team[0] && !Array.isArray(teamsObj.team[0]) && teamsObj.team[0].team_key) {
              // Single team flattened
              entries.push({ team: teamsObj.team });
            } else {
              for (const t of teamsObj.team) {
                entries.push({ team: Array.isArray(t) ? t : [t] });
              }
            }
          }
        }
        
        return entries;
      }

      let foundMatchup = null
      for (let i = 0; i < totalMatchups; i++) {
        const matchupData = getMatchupEntry(i);
        if (!matchupData) { console.log('[MATCHUP] entry', i, 'is null'); continue; }
        const teamsObj = extractTeamsFromMatchup(matchupData);
        if (!teamsObj) { console.log('[MATCHUP] entry', i, 'has no teams'); continue; }
        
        const teamEntries = getTeamEntries(teamsObj);
        for (const entry of teamEntries) {
          const key = extractTeamKey(entry);
          if (myTeamKey && key === myTeamKey) { foundMatchup = matchupData; break; }
        }
        if (foundMatchup) break;
      }
      
      if (!foundMatchup) {
        console.log('[MATCHUP] Did not find user matchup, falling back to first matchup');
        foundMatchup = getMatchupEntry(0);
      }
      if (!foundMatchup) throw new Error('No matchup found')

      // Log the found matchup structure
      console.log('[MATCHUP] foundMatchup keys:', Object.keys(foundMatchup).slice(0, 10));
      console.log('[MATCHUP] foundMatchup isArray:', Array.isArray(foundMatchup));
      if (Array.isArray(foundMatchup)) {
        console.log('[MATCHUP] foundMatchup[0]:', JSON.stringify(foundMatchup[0])?.slice(0, 300));
        console.log('[MATCHUP] foundMatchup[1] keys:', foundMatchup[1] ? Object.keys(foundMatchup[1]) : 'N/A');
      }

      const teamsObj = extractTeamsFromMatchup(foundMatchup);
      console.log('[MATCHUP] teamsObj keys:', teamsObj ? Object.keys(teamsObj).slice(0, 10) : 'NULL');
      console.log('[MATCHUP] teamsObj type:', typeof teamsObj, 'isArray:', Array.isArray(teamsObj));
      
      const teamEntries = getTeamEntries(teamsObj);
      console.log('[MATCHUP] teamEntries count:', teamEntries.length);
      
      const parsedTeams = []
      for (let j = 0; j < teamEntries.length; j++) {
        const entry = teamEntries[j];
        const teamArr = entry?.team;
        if (!teamArr || !Array.isArray(teamArr)) {
          console.log('[MATCHUP] team', j, 'no array, entry keys:', entry ? Object.keys(entry) : 'null');
          continue;
        }
        
        // teamArr[0] can be a flat object or an array of info objects
        let info = {};
        if (Array.isArray(teamArr[0])) {
          info = Object.assign({}, ...teamArr[0]);
        } else {
          info = teamArr[0] || {};
        }
        
        // Search for team_stats in teamArr
        let statsObj = {};
        for (let k = 1; k < teamArr.length; k++) {
          if (teamArr[k]?.team_stats) { statsObj = teamArr[k].team_stats; break; }
          if (teamArr[k]?.team_points) { statsObj = teamArr[k].team_points; break; }
        }
        
        const statsArr = statsObj.stats || []
        const stats = statsArr
          .map(s => s.stat || s)
          .filter(s => s.stat_id !== undefined && s.value !== undefined)
          .map(s => ({ stat_id: String(s.stat_id), name: STAT_NAMES[String(s.stat_id)] || String(s.stat_id), value: s.value }))
        
        // Extract manager name
        let manager = '';
        const managers = info.managers;
        if (managers) {
          if (Array.isArray(managers)) {
            manager = managers[0]?.manager?.nickname || managers[0]?.nickname || '';
          } else if (managers.manager) {
            manager = managers.manager?.nickname || '';
          }
        }
        
        parsedTeams.push({
          key: info.team_key,
          name: info.name || `Team ${j + 1}`,
          manager,
          stats
        })
      }
      
      console.log('[MATCHUP] parsedTeams count:', parsedTeams.length, 'teams:', parsedTeams.map(t => ({ key: t.key, name: t.name, statsCount: t.stats.length })));

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
      for (const rosterItem of (rosterData || [])) {
        const p = rosterItem?.player
        if (Array.isArray(p)) {
          const infoArray = Array.isArray(p[0]) ? p[0] : []
          const info = Object.assign({}, ...infoArray)
          if (info.player_key) playerKeys.push(info.player_key)
        }
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

// ── Debug endpoints (temporary) ────────────────────────────────────────────────
router.get('/debug/roster/:leagueKey', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  try {
    const myTeamKey = await yahoo.getUserTeamKey(leagueKey);
    if (!myTeamKey) return res.json({ error: 'No team key found', myTeamKey });
    
    // Get raw roster data without toArray processing
    const rawData = await yahoo.yahooGet(`/team/${myTeamKey}/roster/players`);
    const players = rawData.fantasy_content?.team?.[1]?.roster?.[1]?.players 
                 || rawData.fantasy_content?.team?.[1]?.roster?.[0]?.players;
    
    // Show raw structure info
    const debugInfo = {
      myTeamKey,
      playersType: typeof players,
      playersIsArray: Array.isArray(players),
      playersKeys: players ? Object.keys(players).slice(0, 10) : null,
      playersAttrCount: players?.['@attributes']?.count,
      firstPlayer: players ? JSON.parse(JSON.stringify(players['0'] || players[0] || 'NONE')) : null,
    };
    
    res.json(debugInfo);
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack?.split('\n').slice(0, 5) });
  }
});

router.get('/debug/matchup/:leagueKey', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  try {
    const [matchups, myTeamKey] = await Promise.all([
      yahoo.getScoreboard(leagueKey),
      yahoo.getUserTeamKey(leagueKey)
    ]);
    
    const totalMatchups = matchups?.['@attributes']?.count || 0;
    const week = matchups?.['@attributes']?.week || null;
    
    // Get first matchup raw shape
    const firstMatchup = matchups?.[0]?.matchup || matchups?.[0];
    const teams = firstMatchup?.teams;
    const firstTeam = teams?.[0]?.team;
    
    const debugInfo = {
      myTeamKey,
      totalMatchups,
      week,
      matchupsType: typeof matchups,
      matchupsKeys: matchups ? Object.keys(matchups).slice(0, 5) : null,
      firstMatchupKeys: firstMatchup ? Object.keys(firstMatchup) : null,
      teamsKeys: teams ? Object.keys(teams).slice(0, 5) : null,
      firstTeamIsArray: Array.isArray(firstTeam),
      firstTeamLength: firstTeam?.length,
      firstTeamItem0Type: typeof firstTeam?.[0],
      firstTeamItem0IsArray: Array.isArray(firstTeam?.[0]),
      firstTeamItem0Keys: firstTeam?.[0] ? (Array.isArray(firstTeam[0]) ? 'IS_ARRAY' : Object.keys(firstTeam[0])) : null,
      firstTeamItem0: firstTeam?.[0] ? JSON.parse(JSON.stringify(firstTeam[0])) : null,
      firstTeamItem1Keys: firstTeam?.[1] ? Object.keys(firstTeam[1]) : null,
    };
    
    res.json(debugInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
