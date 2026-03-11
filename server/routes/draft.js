const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get full draft board
router.get('/board', (req, res) => {
  const players = db.prepare('SELECT * FROM draft_board ORDER BY adp ASC').all();
  res.json(players);
});

// Mark player as drafted
router.post('/pick', (req, res) => {
  const { player_key, drafted_by, draft_round, draft_pick } = req.body;
  try {
    db.prepare(`UPDATE draft_board SET drafted = 1, drafted_by = ?, draft_round = ?, draft_pick = ?
      WHERE player_key = ?`).run(drafted_by, draft_round, draft_pick, player_key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Undo a pick
router.post('/undo', (req, res) => {
  const { player_key } = req.body;
  db.prepare(`UPDATE draft_board SET drafted = 0, drafted_by = NULL, draft_round = NULL, draft_pick = NULL
    WHERE player_key = ?`).run(player_key);
  res.json({ success: true });
});

// Load players into draft board (bulk import)
router.post('/load', (req, res) => {
  const { players } = req.body;
  const insert = db.prepare(`INSERT OR IGNORE INTO draft_board (player_key, player_name, position, team, adp)
    VALUES (?, ?, ?, ?, ?)`);
  const insertMany = db.transaction((players) => {
    for (const p of players) insert.run(p.player_key, p.player_name, p.position, p.team, p.adp);
  });
  insertMany(players);
  res.json({ success: true, count: players.length });
});

// Reset draft board
router.post('/reset', (req, res) => {
  db.prepare('DELETE FROM draft_board').run();
  res.json({ success: true });
});

// Get my drafted players
router.get('/myteam', (req, res) => {
  const players = db.prepare(`SELECT * FROM draft_board WHERE drafted_by = 'me' ORDER BY draft_pick ASC`).all();
  res.json(players);
});

// Get available players (not drafted)
router.get('/available', (req, res) => {
  const { position } = req.query;
  let query = 'SELECT * FROM draft_board WHERE drafted = 0';
  if (position && position !== 'ALL') query += ` AND position LIKE '%${position}%'`;
  query += ' ORDER BY adp ASC';
  const players = db.prepare(query).all();
  res.json(players);
});

// Get draft summary stats
router.get('/summary', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM draft_board').get();
  const drafted = db.prepare('SELECT COUNT(*) as count FROM draft_board WHERE drafted = 1').get();
  const myTeam = db.prepare(`SELECT COUNT(*) as count FROM draft_board WHERE drafted_by = 'me'`).get();
  res.json({ total: total.count, drafted: drafted.count, available: total.count - drafted.count, my_picks: myTeam.count });
});

module.exports = router;
