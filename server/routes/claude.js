const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/database');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an elite fantasy baseball expert with deep knowledge of MLB players, statistics, and strategy.
You provide concise, actionable fantasy baseball advice tailored to the user's specific league settings.
Always consider: player injuries, recent performance trends, schedule, ballpark factors, and positional scarcity.
Be direct and confident in your recommendations. Format responses clearly with bullet points when listing multiple items.`;

function getLeagueContext() {
  const settings = db.prepare('SELECT * FROM league_settings WHERE id = 1').get();
  if (!settings) return '';
  return `League context: ${settings.num_teams} teams, ${settings.scoring_type} scoring, ${settings.draft_type} draft.`;
}

// Draft pick recommendation
router.post('/draft/recommend', async (req, res) => {
  const { available_players, my_roster, pick_number, total_picks, needs } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
Draft pick #${pick_number} of ${total_picks}.
My current roster: ${JSON.stringify(my_roster)}
My positional needs: ${JSON.stringify(needs)}
Top available players: ${JSON.stringify(available_players)}

Who should I draft and why? Give me your top 3 recommendations with brief reasoning.`
      }]
    });
    res.json({ recommendation: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start/Sit analysis
router.post('/startsit', async (req, res) => {
  const { players, matchup_context, scoring_type } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
Scoring: ${scoring_type}
Matchup context: ${matchup_context}
Players to evaluate: ${JSON.stringify(players)}

Give me clear START or SIT recommendations for each player with brief reasoning.`
      }]
    });
    res.json({ analysis: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trade analysis
router.post('/trade', async (req, res) => {
  const { giving, receiving, my_roster, their_roster } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
Trade proposal:
GIVING: ${JSON.stringify(giving)}
RECEIVING: ${JSON.stringify(receiving)}
My full roster: ${JSON.stringify(my_roster)}
Their full roster: ${JSON.stringify(their_roster)}

Analyze this trade. Is it fair? Should I accept, reject, or counter? What counter would be fair?`
      }]
    });
    res.json({ analysis: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Waiver wire recommendations
router.post('/waiver', async (req, res) => {
  const { available_players, my_roster, drop_candidates } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
My current roster: ${JSON.stringify(my_roster)}
Players I could drop: ${JSON.stringify(drop_candidates)}
Available on waiver wire: ${JSON.stringify(available_players)}

What waiver wire moves should I make this week? Give me the top 3 add/drop recommendations.`
      }]
    });
    res.json({ recommendations: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// General fantasy question
router.post('/ask', async (req, res) => {
  const { question, context } = req.body;
  const leagueContext = getLeagueContext();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `${leagueContext}
${context ? `Additional context: ${context}` : ''}
Question: ${question}`
      }]
    });
    res.json({ answer: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Draft strategy overview
router.post('/draft/strategy', async (req, res) => {
  const { draft_position, num_teams, scoring_type, roster_slots, stat_categories } = req.body;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a complete draft strategy for:
- Draft position: ${draft_position} of ${num_teams} teams
- Scoring: ${scoring_type}
- Roster slots: ${JSON.stringify(roster_slots)}
- Categories: ${JSON.stringify(stat_categories)}

Cover: early round strategy, positional priority, when to target closers, when to load up on pitching, late round sleepers to target, and positions to avoid early.`
      }]
    });
    res.json({ strategy: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
