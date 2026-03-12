const express = require('express');
const router = express.Router();
const yahoo = require('../services/yahooService');
const db = require('../db/database');

function requireAuth(req, res, next) {
  const row = db.prepare('SELECT * FROM tokens WHERE id = 1').get();
  if (!row) return res.status(401).json({ error: 'Not authenticated. Please login with Yahoo.' });
  next();
}

router.get('/leagues', requireAuth, async (req, res) => {
  try {
    const leagues = await yahoo.getLeagues();
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey', requireAuth, async (req, res) => {
  try {
    const league = await yahoo.getLeague(req.params.leagueKey);
    res.json(league);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/roster/:teamKey', requireAuth, async (req, res) => {
  try {
    const roster = await yahoo.getRoster(req.params.leagueKey, req.params.teamKey);
    res.json(roster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/standings', requireAuth, async (req, res) => {
  try {
    const standings = await yahoo.getStandings(req.params.leagueKey);
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/scoreboard', requireAuth, async (req, res) => {
  try {
    const scoreboard = await yahoo.getScoreboard(req.params.leagueKey);
    res.json(scoreboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/players', requireAuth, async (req, res) => {
  try {
    const { status = 'A', start = 0 } = req.query;
    const players = await yahoo.getPlayers(req.params.leagueKey, status, start);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/draft', requireAuth, async (req, res) => {
  try {
    const draft = await yahoo.getDraftResults(req.params.leagueKey);
    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/transactions', requireAuth, async (req, res) => {
  try {
    const transactions = await yahoo.getTransactions(req.params.leagueKey);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/:leagueKey/player/:playerKey/stats', requireAuth, async (req, res) => {
  try {
    const stats = await yahoo.getPlayerStats(req.params.leagueKey, req.params.playerKey);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const STAT_NAMES = {
  '60': 'R', '7': 'HR', '12': 'RBI', '16': 'SB', '3': 'AVG',
  '6': 'OBP', '5': 'SLG', '8': 'H', '10': 'BB',
  '28': 'W', '29': 'L', '32': 'SV', '42': 'K', '26': 'ERA', '27': 'WHIP',
  '23': 'IP', '31': 'HLD', '48': 'QS'
};
const LOWER_IS_BETTER = new Set(['26', '27', '29']);

router.get('/league/:leagueKey/matchup', requireAuth, async (req, res) => {
  try {
    const { leagueKey } = req.params;
    const [matchups, myTeamKey] = await Promise.all([
      yahoo.getScoreboard(leagueKey),
      yahoo.getUserTeamKey(leagueKey)
    ]);

    if (!matchups) return res.status(404).json({ error: 'No matchup data available' });

    const totalMatchups = matchups['@attributes']?.count || 0;
    const week = matchups['@attributes']?.week || null;

    let foundMatchup = null;
    for (let i = 0; i < totalMatchups; i++) {
      const matchup = matchups[i]?.matchup;
      if (!matchup) continue;
      const teams = matchup.teams;
      if (!teams) continue;
      const teamCount = teams['@attributes']?.count || 2;
      for (let j = 0; j < teamCount; j++) {
        const teamKey = teams[j]?.team?.[0]?.team_key;
        if (myTeamKey && teamKey === myTeamKey) { foundMatchup = matchup; break; }
      }
      if (foundMatchup) break;
    }
    if (!foundMatchup) foundMatchup = matchups[0]?.matchup;
    if (!foundMatchup) return res.status(404).json({ error: 'No matchup found' });

    const teams = foundMatchup.teams;
    const teamCount = teams?.['@attributes']?.count || 2;
    const parsedTeams = [];

    for (let j = 0; j < teamCount; j++) {
      const teamArr = teams?.[j]?.team;
      if (!teamArr) continue;
      const info = teamArr[0] || {};
      const statsObj = teamArr[1]?.team_stats || teamArr[2]?.team_stats || {};
      const statsArr = statsObj.stats || [];
      const stats = statsArr
        .map(s => s.stat || s)
        .filter(s => s.stat_id !== undefined && s.value !== undefined)
        .map(s => ({ stat_id: String(s.stat_id), name: STAT_NAMES[String(s.stat_id)] || String(s.stat_id), value: s.value }));
      parsedTeams.push({
        key: info.team_key,
        name: info.name || `Team ${j + 1}`,
        manager: info.managers?.[0]?.manager?.nickname || '',
        stats
      });
    }

    const myIdx = myTeamKey ? parsedTeams.findIndex(t => t.key === myTeamKey) : 0;
    const myTeam = parsedTeams[myIdx >= 0 ? myIdx : 0];
    const opponent = parsedTeams[myIdx === 0 ? 1 : 0];

    const statMap = {};
    (myTeam?.stats || []).forEach(s => { statMap[s.stat_id] = { ...s, my_value: s.value }; });
    (opponent?.stats || []).forEach(s => {
      if (statMap[s.stat_id]) statMap[s.stat_id].opp_value = s.value;
      else statMap[s.stat_id] = { stat_id: s.stat_id, name: s.name, opp_value: s.value };
    });

    const statComparison = Object.values(statMap).map(s => {
      const myVal = parseFloat(s.my_value) || 0;
      const oppVal = parseFloat(s.opp_value) || 0;
      const lowerBetter = LOWER_IS_BETTER.has(s.stat_id);
      return {
        ...s,
        my_winning: myVal !== oppVal && (lowerBetter ? myVal < oppVal : myVal > oppVal),
        opp_winning: myVal !== oppVal && (lowerBetter ? oppVal < myVal : oppVal > myVal)
      };
    });

    res.json({ week: week || foundMatchup.week, myTeam, opponent, stats: statComparison });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save league settings to local DB
router.post('/league/save', requireAuth, async (req, res) => {
  try {
    const { league_key, league_name, num_teams, scoring_type, draft_type, draft_position, roster_slots, stat_categories } = req.body;
    db.prepare(`INSERT OR REPLACE INTO league_settings
      (id, league_key, league_name, num_teams, scoring_type, draft_type, draft_position, roster_slots, stat_categories, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(league_key, league_name, num_teams, scoring_type, draft_type, draft_position,
      JSON.stringify(roster_slots), JSON.stringify(stat_categories), Date.now());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league/settings/local', (req, res) => {
  const settings = db.prepare('SELECT * FROM league_settings WHERE id = 1').get();
  if (!settings) return res.json(null);
  settings.roster_slots = JSON.parse(settings.roster_slots || '{}');
  settings.stat_categories = JSON.parse(settings.stat_categories || '[]');
  res.json(settings);
});

module.exports = router;
