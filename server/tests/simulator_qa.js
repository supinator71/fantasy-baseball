const axios = require('axios');
const fs = require('fs');
const path = require('path');
const brain = require('../services/fantasyBrain');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-3-5-haiku-latest";

async function callClaude(messages, systemPrompt, max_tokens = 1500) {
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens,
      temperature: 0,
      system: systemPrompt,
      messages,
    });
    return msg.content[0].text;
  } catch (err) {
    return 'ERROR: ' + err.message;
  }
}

const LEAGUES = [
  {
    id: 'h2h_points_12',
    name: 'Pro League (H2H Points)',
    num_teams: 12,
    scoring_type: 'Head-to-Head Points',
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP'] // Points uses many, but let's say standard display
  },
  {
    id: 'h2h_points_10',
    name: 'Home League (H2H Points)',
    num_teams: 10,
    scoring_type: 'Head-to-Head Points',
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']
  },
  {
    id: 'h2h_cats_12_std',
    name: 'Expert 5x5 (H2H Categories)',
    num_teams: 12,
    scoring_type: 'Head-to-Head Categories',
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']
  },
  {
    id: 'h2h_cats_12_obp',
    name: 'OBP/HLD (H2H Categories)',
    num_teams: 12,
    scoring_type: 'Head-to-Head Categories',
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'OBP', 'W', 'SV', 'K', 'ERA', 'WHIP', 'HLD']
  },
  {
    id: 'roto_15_deep',
    name: 'NFBC Main (Roto)',
    num_teams: 15,
    scoring_type: 'Roto',
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']
  },
  {
    id: 'roto_12_std',
    name: 'Slab League (Roto)',
    num_teams: 12,
    scoring_type: 'Roto',
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']
  }
];

const MOCK_ROSTER = [
  { name: 'Shohei Ohtani', position: 'DH', team: 'LAD', stats: { HR: 45, R: 120, RBI: 110, SB: 25, AVG: 0.295 } },
  { name: 'Spencer Strider', position: 'SP', team: 'ATL', stats: { W: 18, K: 250, ERA: 3.10, WHIP: 1.05 } },
  { name: 'Corbin Carroll', position: 'OF', team: 'AZ', stats: { HR: 20, R: 100, RBI: 70, SB: 45, AVG: 0.275 } },
  { name: 'Yandy Diaz', position: '1B', team: 'TB', stats: { HR: 15, R: 85, RBI: 75, SB: 0, AVG: 0.310 } },
  { name: 'Camilo Doval', position: 'RP', team: 'SF', stats: { SV: 35, K: 90, ERA: 2.80, WHIP: 1.15 } }
];

const MOCK_WAIVER_WIRE = [
  { name: 'Jackson Holliday', position: '2B', team: 'BAL', stats: { HR: 5, R: 20, RBI: 15, SB: 5, AVG: 0.240 } },
  { name: 'Hunter Brown', position: 'SP', team: 'HOU', stats: { W: 5, K: 80, ERA: 4.20, WHIP: 1.30 } }
];

const SYSTEM_PROMPT = `You are Goin' Yard HQ — a friendly, encouraging fantasy baseball AI for the 2026 MLB season. Help beginners dominate their Yahoo leagues.

RULES:
1. ALL data is from LIVE Yahoo API for 2026. Trust it completely.
2. Never mention data issues or ask for verification.
3. Write like a supportive friend. Explain WHY moves help in simple terms.
4. End every response with a 🎓 Baseball 101 tip.
5. H2H Points: maximize volume. Roto: balance categories.
6. CATCHER RULE: Fill all slots if possible.
7. Format: Clean prose, no brackets. Rank recommendations clearly. Use bolded metric badges (**Player** \`[VOR: XX]\`).`;

function leagueContext(settings) {
  const rawType = (settings.scoring_type || '').toLowerCase();
  let format = 'Rotisserie (Roto)';
  let rule = 'Focus on long-term categorical accumulation. Protect ERA/WHIP.';
  if (rawType.includes('headpoint')) {
    format = 'Head-to-Head Points';
    rule = 'Maximize raw total points. Volume is everything. Strikeouts DO NOT count against you.';
  } else if (rawType.includes('head')) {
    format = 'Head-to-Head Categories';
    rule = 'Balance gathering counting stats with protecting ratios. Consider weekly matchups.';
  }
  return `League Rules: ${settings.num_teams} teams, **${format} scoring**. ${rule}`;
}

async function runSimulatorQA() {
  console.log('🚀 STARTING MULTI-LEAGUE SIMULATOR QA AUDIT...');
  let report = '# Multi-League Simulation QA Report\n\nGenerated: ' + new Date().toISOString() + '\n\n';

  for (const league of LEAGUES) {
    console.log(`\n--- Testing League: ${league.name} ---`);
    report += `## League: ${league.name} (${league.scoring_type})\n\n`;

    const context = leagueContext(league);
    
    // 1. WAIVER WIRE TEST
    console.log('  > Testing Waiver Wire module...');
    const diagnosis = brain.buildRosterDiagnosis(MOCK_ROSTER, league, null, { today: [], currentWeekTwoStart: [], nextWeekTwoStart: [] });
    const waiverScored = MOCK_WAIVER_WIRE.map(p => ({
        ...p,
        waiverScore: brain.scoreWaiverTarget(p, diagnosis.activeRoster, league, diagnosis.categoryNeeds, { today: [] })
    }));

    const waiverPrompt = `${context}
${diagnosis.promptBlock}
Waiver targets:
${waiverScored.map(p => `${p.name} (${p.position}) — Priority: ${p.waiverScore.score}/100 — ${p.waiverScore.reasoning}`).join('\n')}

Identify the best target and who to drop from the MY CURRENT TEAM ROSTER.`;

    const waiverResponse = await callClaude([{ role: 'user', content: waiverPrompt }], SYSTEM_PROMPT);
    report += `### Waiver Wire Module\n> ${waiverResponse.replace(/\n/g, '\n> ')}\n\n`;

    // 2. START/SIT TEST
    console.log('  > Testing Start/Sit module...');
    const startSitPrompt = `${context}
${diagnosis.promptBlock}
Context: Daily optimization. Sunday, matchup is close.
Recommend which players to start vs sit today. Focus on the Catcher rule if applicable.`;

    const startSitResponse = await callClaude([{ role: 'user', content: startSitPrompt }], SYSTEM_PROMPT);
    report += `### Start/Sit Module\n> ${startSitResponse.replace(/\n/g, '\n> ')}\n\n`;

    // 3. MATCHUP/TRENDS TEST
    if (league.scoring_type.includes('Head-to-Head')) {
      console.log('  > Testing Matchup Predictor module...');
      const matchupPrompt = `${context}
Week 4 Matchup.
My Team Stats: R:10, HR:2, RBI:8, SB:1, AVG:0.250
Opponent Stats: R:12, HR:1, RBI:10, SB:0, AVG:0.260
Predict the outcome and give 1 key move to swing the week.`;
      const matchupResponse = await callClaude([{ role: 'user', content: matchupPrompt }], SYSTEM_PROMPT);
      report += `### Matchup Predictor Module\n> ${matchupResponse.replace(/\n/g, '\n> ')}\n\n`;
    } else {
      console.log('  > Testing Player Trends module...');
      const trendPrompt = `${context}
Current Roster Trends:
Shohei Ohtani: Hot (5 HR in 7 days)
Corbin Carroll: Cold (0 SB in 14 days)
Analyze these trends and suggest a move.`;
      const trendResponse = await callClaude([{ role: 'user', content: trendPrompt }], SYSTEM_PROMPT);
      report += `### Player Trends Module\n> ${trendResponse.replace(/\n/g, '\n> ')}\n\n`;
    }
    
    report += '---\n\n';
  }

  fs.writeFileSync('./server/tests/simulation_audit_results.md', report);
  console.log('\n✅ SIMULATION COMPLETE. Report written to server/tests/simulation_audit_results.md');
}

runSimulatorQA().catch(console.error);
