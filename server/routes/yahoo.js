const express = require('express');
const router = express.Router();
const yahoo = require('../services/yahooService');
const cache = require('../services/cache');
const db = require('../services/database');
const mlbStats = require('../services/mlbStatsService');

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
  const guid = req.session?.yahoo_guid;
  if (!guid) return res.status(401).json({ error: 'Not authenticated. Please login with Yahoo.' });
  const row = db.getToken(guid);
  if (!row) return res.status(401).json({ error: 'Not authenticated. Please login with Yahoo.' });
  next();
}

// Wrap fetch with cache; sets X-Cache-* headers on res
async function withCache(req, res, key, ttlMs, force, fn) {
  const userPrefix = req.session?.yahoo_guid || 'global';
  const scopedKey = `${userPrefix}:${key}`;
  if (!force) {
    const entry = cache.get(scopedKey)
    if (entry) {
      res.set('X-Cache-Hit', 'true')
      res.set('X-Cache-Updated', entry.cachedAt)
      return entry.value
    }
  }
  const data = await fn()
  const cachedAt = new Date().toISOString()
  cache.set(scopedKey, data, ttlMs)
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
    const data = await withCache(req, res, 'leagues', TTL.LEAGUES, force, () => yahoo.getLeagues(req))
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
    const data = await withCache(req, res, `league:${leagueKey}`, TTL.LEAGUE, force,
      () => yahoo.getLeague(req, leagueKey))
      
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

    const payload = {
      league_key: leagueKey,
      league_name: data?.[0]?.name || '',
      num_teams: parseInt(data?.[0]?.num_teams || 12),
      scoring_type: data?.[0]?.scoring_type || 'Roto',
      draft_type: data?.[0]?.draft_type || 'Snake',
      roster_slots: Object.keys(roster_slots).length ? roster_slots : {},
      stat_categories: stat_categories.length ? stat_categories : []
    };

    // Auto-save the fetched settings into the DB natively!
    db.prepare(`INSERT OR REPLACE INTO league_settings
      (id, league_key, league_name, num_teams, scoring_type, draft_type, draft_position, roster_slots, stat_categories, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(payload.league_key, payload.league_name, payload.num_teams, payload.scoring_type, payload.draft_type, 1, 
      JSON.stringify(payload.roster_slots), JSON.stringify(payload.stat_categories), Date.now());

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/roster', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(req, res, `roster:${leagueKey}:mine`, TTL.ROSTER, force, async () => {
      const myTeamKey = await yahoo.getUserTeamKey(req, leagueKey);
      if (!myTeamKey) throw new Error('Could not find your team in this league.');
      return yahoo.getRoster(req, leagueKey, myTeamKey);
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
    const result = await withCache(req, res, `myroster:${leagueKey}`, TTL.ROSTER, force, async () => {
      const myTeamKey = await yahoo.getUserTeamKey(req, leagueKey)
      if (!myTeamKey) return { players: [], teamKey: null }
      const rosterData = await yahoo.getRoster(req, leagueKey, myTeamKey)
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
      const players = await yahoo.getBatchPlayerStats(req, leagueKey, playerKeys, null)

      // MLB Stats API Override for Probable Pitchers
      try {
        const probablePitchers = await mlbStats.getLiveProbablePitchers();
        if (probablePitchers.length > 0) {
          players.forEach(p => {
            // Only strictly override Starting Pitchers (SP). Relief pitchers don't get 'probable' tags from MLB.
            if (p.position === 'SP' || String(p.position).includes('SP/')) {
              const normName = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              if (probablePitchers.includes(normName)) {
                // Force AI to see them as actively starting today
                p.is_starting = 'Yes';
              } else {
                // If they are an SP and MLB says they are NOT pitching today, strip the stale Yahoo 'Yes' tag.
                p.is_starting = 'No';
              }
            }
          });
        }
      } catch (err) {
        console.error('[Yahoo Roster] Failed to override probable pitchers:', err.message);
      }

      return { players, teamKey: myTeamKey }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Specific team's roster as flat player array (for opponent auditing)
router.get('/league/:leagueKey/team/:teamKey/rosterstats', requireAuth, async (req, res) => {
  const { leagueKey, teamKey } = req.params
  const force = req.query.force === 'true'
  try {
    const result = await withCache(req, res, `rosterstats:${leagueKey}:${teamKey}`, TTL.ROSTER, force, async () => {
      const rosterData = await yahoo.getRoster(req, leagueKey, teamKey)
      const playerKeys = []
      for (const rosterItem of (rosterData || [])) {
        const p = rosterItem?.player
        if (p && Array.isArray(p)) {
          const infoArray = Array.isArray(p[0]) ? p[0] : []
          const info = Object.assign({}, ...infoArray)
          if (info.player_key) playerKeys.push(info.player_key)
        }
      }
      if (!playerKeys.length) return { players: [], teamKey }
      const players = await yahoo.getBatchPlayerStats(req, leagueKey, playerKeys, null)
      return { players, teamKey }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// All rosters in the league (lightweight, for AI matching)
router.get('/league/:leagueKey/allrosters', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const result = await withCache(req, res, `allrosters:${leagueKey}`, TTL.ROSTER, force, async () => {
      const standings = await yahoo.getStandings(req, leagueKey)
      const myTeamKey = await yahoo.getUserTeamKey(req, leagueKey)
      const allRosters = []
      const promises = []
      
      for (const t of (standings || [])) {
        const teamObj = t?.team
        if (!teamObj) continue
        const info = Array.isArray(teamObj) ? (Array.isArray(teamObj[0]) ? Object.assign({}, ...teamObj[0]) : teamObj[0]) : teamObj
        const teamKey = info?.team_key
        const teamName = info?.name
        
        // Skip user's own team (Trade finder analyzes opponents)
        if (!teamKey || teamKey === myTeamKey) continue
        
        promises.push(
          yahoo.getRoster(req, leagueKey, teamKey).then(rosterData => {
            const playerList = []
            for (const rosterItem of (rosterData || [])) {
              const p = rosterItem?.player
              if (p && Array.isArray(p)) {
                const pInfo = Array.isArray(p[0]) ? Object.assign({}, ...p[0]) : p[0]
                const name = pInfo.name?.full || pInfo.full_name
                const pos = pInfo.display_position || ''
                if (name) playerList.push(`${name} (${pos})`)
              }
            }
            if (playerList.length > 0) {
              allRosters.push({ team: teamName, players: playerList })
            }
          }).catch(e => console.error(`Error fetching roster for ${teamKey}:`, e.message))
        )
      }
      
      await Promise.all(promises)
      return allRosters
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
    const data = await withCache(req, res, `standings:${leagueKey}`, TTL.STANDINGS, force,
      () => yahoo.getStandings(req, leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/scoreboard', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(req, res, `scoreboard:${leagueKey}`, TTL.SCOREBOARD, force,
      () => yahoo.getScoreboard(req, leagueKey))
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
    const data = await withCache(req, res, `players:${leagueKey}:${status}:${start}`, TTL.PLAYERS, force,
      () => yahoo.getPlayers(req, leagueKey, status, start))

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[Yahoo/players] WARNING: returned ${Array.isArray(data) ? 0 : typeof data} players for ${leagueKey}. Sending empty array.`)
    }
    res.json(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('[Yahoo/players] ERROR:', err.message, err.stack?.split('\n')[1])
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/draft', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(req, res, `draft:${leagueKey}`, TTL.DRAFT, force,
      () => yahoo.getDraftResults(req, leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/transactions', requireAuth, async (req, res) => {
  const { leagueKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(req, res, `txns:${leagueKey}`, TTL.TXNS, force,
      () => yahoo.getTransactions(req, leagueKey))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/league/:leagueKey/player/:playerKey/stats', requireAuth, async (req, res) => {
  const { leagueKey, playerKey } = req.params
  const force = req.query.force === 'true'
  try {
    const data = await withCache(req, res, `playerstats:${leagueKey}:${playerKey}`, TTL.STATS, force,
      () => yahoo.getPlayerStats(req, leagueKey, playerKey))
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
    const result = await withCache(req, res, `matchup:${leagueKey}`, TTL.MATCHUP, force, async () => {
      const [matchups, myTeamKey] = await Promise.all([
        yahoo.getScoreboard(req, leagueKey),
        yahoo.getUserTeamKey(req, leagueKey)
      ])

      // Call the newly exported parser
      const parsedMatchup = parseYahooMatchup(matchups, myTeamKey);
      if (!parsedMatchup) throw new Error('No matchup found');
      return parsedMatchup;
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Trends ────────────────────────────────────────────────────────────────────
function calculateTrend(seasonStats, recentStats, position, historicalStats = {}) {
  // If we lack recent stats, we cannot determine a recent momentum trend
  const hasRecent = Object.values(recentStats || {}).some(v => parseFloat(v) > 0)
  if (!hasRecent) return 'neutral'

  const isPitcher = /SP|RP|P/.test(String(position))
  let score = 0;

  if (isPitcher) {
    const hERA = parseFloat(historicalStats?.['26']); // 2025 baseline
    const sERA = parseFloat(seasonStats?.['26']) || 4.00; 
    const rERA = parseFloat(recentStats?.['26']);
    
    if (!isNaN(rERA)) {
      // Reward elite recent ERA, penalize blowups
      if (rERA <= 2.50) score += 10;
      else if (rERA >= 5.50) score -= 10;
      
      // Context of recent vs season average
      if (rERA <= sERA * 0.7) score += 10; // Pitching much better recently
      else if (rERA >= sERA * 1.3) score -= 10; // Pitching much worse

      // 2025 Baseline Regression / Breakout check
      if (!isNaN(hERA) && hERA > 0) {
        if (sERA <= hERA - 1.00) score += 5; // Breaking out compared to last year
        else if (sERA >= hERA + 1.00) score -= 15; // Massive regression from last year!
      }
    }
    
    // Recent Counting stats (W, SV, Ks)
    const rW = parseFloat(recentStats?.['28'] || 0);
    const rSV = parseFloat(recentStats?.['32'] || 0);
    const rK = parseFloat(recentStats?.['42'] || 0);
    if (rW > 0 || rSV > 0) score += 5;
    if (rK >= 10) score += 5;
    
  } else {
    // HITTERS
    const hAVG = parseFloat(historicalStats?.['3']); // 2025 baseline
    const sAVG = parseFloat(seasonStats?.['3']) || 0.250;
    const rAVG = parseFloat(recentStats?.['3']);
    
    if (!isNaN(rAVG)) {
      // Reward elite recent average, penalize slumps
      if (rAVG >= 0.330) score += 10;
      else if (rAVG <= 0.200) score -= 10;
      
      // Context of recent vs season average
      if (rAVG >= sAVG + 0.050) score += 10;
      else if (rAVG <= sAVG - 0.050) score -= 10;

      // 2025 Baseline Regression / Breakout check
      if (!isNaN(hAVG) && hAVG > 0) {
        if (sAVG >= hAVG + 0.030) score += 5; // Hitting much better than last year
        else if (sAVG <= hAVG - 0.040) score -= 15; // Massive regression! Overrated.
      }
    }
    
    // Recent Counting stats (HR:7, RBI:12, SB:16)
    const rHR = parseFloat(recentStats?.['7'] || 0);
    const rRBI = parseFloat(recentStats?.['12'] || 0);
    const rSB = parseFloat(recentStats?.['16'] || 0);
    
    // A single good week of power or speed heavily impacts momentum
    if (rHR >= 2) score += 10;
    else if (rHR === 1) score += 3;
    
    if (rRBI >= 5) score += 5;
    if (rSB >= 2) score += 5;
  }

  // Final trend evaluation based strictly on recent performance contextualized against the season + 2025 baseline
  if (score >= 15) return 'hot';
  if (score > 0) return 'rising';
  if (score <= -10) return 'cold';
  return 'neutral';
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
    const result = await withCache(req, res, `trends:${leagueKey}`, TTL.TRENDS, force, async () => {
      const myTeamKey = await yahoo.getUserTeamKey(req, leagueKey)
      if (!myTeamKey) return { myPlayers: [], freeAgents: [] }

      const rosterData = await yahoo.getRoster(req, leagueKey, myTeamKey)
      const playerKeys = []
      for (const rosterItem of (rosterData || [])) {
        const p = rosterItem?.player
        if (Array.isArray(p)) {
          const infoArray = Array.isArray(p[0]) ? p[0] : []
          const info = Object.assign({}, ...infoArray)
          if (info.player_key) playerKeys.push(info.player_key)
        }
      }

      const [recentMine, seasonMine, historicalMine, faData] = await Promise.all([
        playerKeys.length ? yahoo.getBatchPlayerStats(req, leagueKey, playerKeys, 'lastweek') : [],
        playerKeys.length ? yahoo.getBatchPlayerStats(req, leagueKey, playerKeys, null) : [],
        playerKeys.length ? yahoo.getBatchPlayerStats(req, leagueKey, playerKeys, 'season;year=2025') : [],
        yahoo.getFreeAgentsTrending(req, leagueKey, 25)
      ])

      const seasonMap = {}
      const historicalMap = {}
      seasonMine.forEach(p => { seasonMap[p.key] = p.stats })
      historicalMine.forEach(p => { historicalMap[p.key] = p.stats })

      const myPlayers = recentMine.map(p => {
        const seasonStats = seasonMap[p.key] || {}
        const historicalStats = historicalMap[p.key] || {}
        const trend = calculateTrend(seasonStats, p.stats, p.position, historicalStats)
        return { ...p, recentStats: p.stats, seasonStats, trend, displayStats: trendDisplayStats(p.stats, seasonStats, p.position) }
      }).sort((a, b) => {
        const order = { hot: 0, rising: 1, neutral: 2, cold: 3 }
        return (order[a.trend] ?? 2) - (order[b.trend] ?? 2)
      })

      const freeAgents = faData.map(p => ({
        ...p,
        trend: calculateTrend(p.seasonStats, p.recentStats, p.position, p.historicalStats),
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

// ── EXPORT MATCHUP PARSER ──────────────────────────────────────────────────────────
function parseYahooMatchup(matchups, myTeamKey) {
      if (!matchups) return null;

      // Count matchups: try @attributes, then count numeric keys
      let totalMatchups = parseInt(matchups['@attributes']?.count) || 0
      if (!totalMatchups) {
        totalMatchups = Object.keys(matchups).filter(k => /^\d+$/.test(k)).length;
      }
      const week = matchups['@attributes']?.week || null

      // Helper: extract teams from a matchup object (which can be nested in various ways)
      function extractTeamsFromMatchup(m) {
        if (!m) return null;
        if (m.teams) return m.teams;
        if (Array.isArray(m)) {
          for (const item of m) {
            if (item?.teams) return item.teams;
          }
        }
        for (const key of Object.keys(m)) {
          if (m[key]?.teams) return m[key].teams;
        }
        return null;
      }

      function getMatchupEntry(idx) {
        const raw = matchups[idx] || matchups[String(idx)];
        if (!raw) return null;
        return raw.matchup || raw;
      }

      function extractTeamKey(teamData) {
        if (!teamData) return null;
        const teamArr = teamData.team || teamData;
        if (!Array.isArray(teamArr)) return teamData.team_key;
        const first = teamArr[0];
        if (Array.isArray(first)) return Object.assign({}, ...first)?.team_key;
        return first?.team_key;
      }

      function getTeamEntries(teamsObj) {
        if (!teamsObj) return [];
        const entries = [];
        const count = parseInt(teamsObj['@attributes']?.count) || 0;
        const numericKeys = Object.keys(teamsObj).filter(k => /^\d+$/.test(k)).sort((a,b) => a-b);
        if (numericKeys.length > 0) {
          for (const k of numericKeys) {
            if (teamsObj[k]) entries.push(teamsObj[k]);
          }
        }
        if (!entries.length && Array.isArray(teamsObj)) entries.push(...teamsObj);
        if (!entries.length && teamsObj.team) {
          if (Array.isArray(teamsObj.team)) {
            if (teamsObj.team[0] && !Array.isArray(teamsObj.team[0]) && teamsObj.team[0].team_key) {
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
        if (!matchupData) continue;
        const teamsObj = extractTeamsFromMatchup(matchupData);
        if (!teamsObj) continue;
        
        const teamEntries = getTeamEntries(teamsObj);
        for (const entry of teamEntries) {
          const key = extractTeamKey(entry);
          if (myTeamKey && key === myTeamKey) { foundMatchup = matchupData; break; }
        }
        if (foundMatchup) break;
      }
      
      if (!foundMatchup) foundMatchup = getMatchupEntry(0);
      if (!foundMatchup) return null;

      const teamsObj = extractTeamsFromMatchup(foundMatchup);
      const teamEntries = getTeamEntries(teamsObj);
      
      const parsedTeams = []
      for (let j = 0; j < teamEntries.length; j++) {
        const entry = teamEntries[j];
        const teamArr = entry?.team;
        if (!teamArr || !Array.isArray(teamArr)) continue;
        
        let info = {};
        if (Array.isArray(teamArr[0])) {
          info = Object.assign({}, ...teamArr[0]);
        } else {
          info = teamArr[0] || {};
        }
        
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
        
        let manager = '';
        const managers = info.managers;
        if (managers) {
          if (Array.isArray(managers)) manager = managers[0]?.manager?.nickname || managers[0]?.nickname || '';
          else if (managers.manager) manager = managers.manager?.nickname || '';
        }
        
        parsedTeams.push({
          key: info.team_key,
          name: info.name || `Team ${j + 1}`,
          manager,
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
}

router.parseYahooMatchup = parseYahooMatchup;
module.exports = router;
