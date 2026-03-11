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
