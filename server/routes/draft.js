const express = require('express');
const router = express.Router();
const db = require('../db/database');
const yahoo = require('../services/yahooService');

// ── Helper: parse Yahoo players response into flat array ──────────────────────
function parseYahooPlayers(raw) {
  if (!raw) return [];
  const count = parseInt(raw['@attributes']?.count || 0);
  const result = [];
  for (let i = 0; i < count; i++) {
    const player = raw[i]?.player?.[0];
    if (!player) continue;
    result.push({
      player_key: player.player_key,
      player_name: player.full_name || player.name?.full || 'Unknown',
      position: player.display_position || player.eligible_positions?.position || '',
      team: player.editorial_team_abbr || '',
      adp: parseFloat(player.average_draft_pick || 999)
    });
  }
  return result;
}

// Initialize draft board from Yahoo player pool (top 300 players, 12 pages)
router.post('/init-yahoo/:leagueKey', async (req, res) => {
  try {
    const { leagueKey } = req.params;
    // Clear existing board first
    db.prepare('DELETE FROM draft_board').run();

    const pages = 10; // 250 players
    const allPlayers = [];
    for (let page = 0; page < pages; page++) {
      try {
        const data = await yahoo.getAccessToken().then(async token => {
          const axios = require('axios');
          const resp = await axios.get(
            `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/players;sort=AR;start=${page * 25};count=25?format=json`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return resp.data;
        });
        const playersRaw = data.fantasy_content?.league?.[1]?.players;
        const players = parseYahooPlayers(playersRaw);
        if (players.length === 0) break;
        allPlayers.push(...players);
      } catch (e) {
        break; // stop if a page fails
      }
    }

    if (allPlayers.length === 0) {
      return res.status(500).json({ error: 'No players returned from Yahoo. Make sure you\'re authenticated.' });
    }

    const insert = db.prepare(`INSERT OR IGNORE INTO draft_board (player_key, player_name, position, team, adp)
      VALUES (?, ?, ?, ?, ?)`);
    const insertMany = db.transaction((players) => {
      for (const p of players) insert.run(p.player_key, p.player_name, p.position, p.team, p.adp);
    });
    insertMany(allPlayers);

    res.json({ success: true, count: allPlayers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync live draft results from Yahoo — call this every ~10s during draft
router.get('/sync/:leagueKey', async (req, res) => {
  try {
    const { leagueKey } = req.params;

    // Get user's team key to identify own picks
    const myTeamKey = await yahoo.getUserTeamKey(leagueKey);

    // Get draft results from Yahoo
    const rawResults = await yahoo.getDraftResults(leagueKey);
    if (!rawResults) return res.json({ picks: 0, synced: 0, myTeamKey });

    const count = parseInt(rawResults['@attributes']?.count || 0);
    const picks = [];
    for (let i = 0; i < count; i++) {
      const r = rawResults[i]?.draft_result;
      if (r) picks.push({ pick: +r.pick, round: +r.round, team_key: r.team_key, player_key: r.player_key });
    }

    if (picks.length === 0) return res.json({ picks: 0, synced: 0, myTeamKey });

    // Find any player_keys not yet in draft_board so we can add them
    const knownKeys = new Set(
      db.prepare('SELECT player_key FROM draft_board').all().map(r => r.player_key)
    );
    const unknownKeys = [...new Set(picks.map(p => p.player_key).filter(k => !knownKeys.has(k)))];

    // Batch-fetch unknown player info from Yahoo (25 at a time)
    if (unknownKeys.length > 0) {
      for (let i = 0; i < unknownKeys.length; i += 25) {
        const batch = unknownKeys.slice(i, i + 25).join(',');
        try {
          const token = await yahoo.getAccessToken();
          const axios = require('axios');
          const resp = await axios.get(
            `https://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=${batch}?format=json`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const rawP = resp.data.fantasy_content?.players;
          const newPlayers = parseYahooPlayers(rawP);
          const ins = db.prepare(`INSERT OR IGNORE INTO draft_board (player_key, player_name, position, team, adp) VALUES (?, ?, ?, ?, ?)`);
          const txn = db.transaction(ps => { for (const p of ps) ins.run(p.player_key, p.player_name, p.position, p.team, p.adp); });
          txn(newPlayers);
        } catch (e) {
          // Add placeholders for any we couldn't fetch
          const ins = db.prepare(`INSERT OR IGNORE INTO draft_board (player_key, player_name, position, team, adp) VALUES (?, ?, ?, ?, ?)`);
          const txn = db.transaction(ks => { for (const k of ks) ins.run(k, `Player ${k}`, 'UTIL', '—', 999); });
          txn(unknownKeys.slice(i, i + 25));
        }
      }
    }

    // Apply all picks to draft_board
    const update = db.prepare(`UPDATE draft_board SET drafted = 1, drafted_by = ?, draft_round = ?, draft_pick = ? WHERE player_key = ?`);
    const applyPicks = db.transaction(ps => {
      for (const p of ps) {
        const draftedBy = (myTeamKey && p.team_key === myTeamKey) ? 'me' : 'other';
        update.run(draftedBy, p.round, p.pick, p.player_key);
      }
    });
    applyPicks(picks);

    // Return current board state
    const board = db.prepare('SELECT * FROM draft_board ORDER BY adp ASC').all();
    res.json({ picks: picks.length, synced: picks.length, myTeamKey, board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
