/**
 * mlbStats.js — Express routes for MLB Stats API
 * Exposes historical player stats to the frontend
 */

const express = require('express');
const router = express.Router();
const mlbStats = require('../services/mlbStatsService');
const brain = require('../services/fantasyBrain');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mlb/player/:name/stats — Single player lookup with full intelligence
// ─────────────────────────────────────────────────────────────────────────────

router.get('/player/:name/stats', async (req, res) => {
  try {
    const { name } = req.params;
    const season = parseInt(req.query.season) || 2025;
    console.log(`[MLB Stats] Looking up: ${name} (${season})`);

    const playerData = await mlbStats.getPlayerSeasonStats(name, season);
    if (!playerData) {
      return res.status(404).json({ error: `Player "${name}" not found for ${season}` });
    }

    // Run pro analytics on the data
    const intelligence = brain.generatePlayerIntelligence(playerData);

    res.json({
      ...playerData,
      intelligence,
    });
  } catch (err) {
    console.error('[MLB Stats] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mlb/bulk-stats — Batch player lookup
// Body: { players: ["Mike Trout", "Shohei Ohtani", ...], season: 2025 }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/bulk-stats', async (req, res) => {
  try {
    const { players = [], season = 2025 } = req.body;
    console.log(`[MLB Stats] Bulk lookup: ${players.length} players (${season})`);

    const results = await mlbStats.getBulkPlayerStats(players, season);

    // Run intelligence reports for each player found
    const enriched = {};
    for (const [name, data] of Object.entries(results)) {
      enriched[name] = {
        ...data,
        intelligence: brain.generatePlayerIntelligence(data),
      };
    }

    res.json({
      found: Object.keys(enriched).length,
      total: players.length,
      players: enriched,
    });
  } catch (err) {
    console.error('[MLB Stats] Bulk error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mlb/player/:name/trends — Multi-season trend analysis
// ─────────────────────────────────────────────────────────────────────────────

router.get('/player/:name/trends', async (req, res) => {
  try {
    const { name } = req.params;
    const seasons = (req.query.seasons || '2023,2024,2025').split(',').map(Number);
    console.log(`[MLB Stats] Trend analysis: ${name} (${seasons.join(', ')})`);

    const multiSeason = await mlbStats.getMultiSeasonStats(name, seasons);
    if (!multiSeason || Object.keys(multiSeason.seasonStats || {}).length === 0) {
      return res.status(404).json({ error: `No multi-season data found for "${name}"` });
    }

    const trend = brain.analyzeYoYTrend(multiSeason.seasonStats);
    const ageCurve = brain.ageCurveAnalysis(multiSeason.age || 28, multiSeason.position);

    res.json({
      name: multiSeason.name,
      position: multiSeason.position,
      age: multiSeason.age,
      seasonStats: multiSeason.seasonStats,
      trend,
      ageCurve,
    });
  } catch (err) {
    console.error('[MLB Stats] Trend error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
