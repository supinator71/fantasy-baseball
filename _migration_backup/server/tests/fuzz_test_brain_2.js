const brain = require('../services/fantasyBrain');

console.log("--- FANTASY BRAIN FUZZ TEST ---");

// Test 6: Trade Analysis (evaluateTrade)
console.log("\n[6] Testing evaluateTrade");
const giving = [
  { name: 'Average Joe', position: 'OF', stats: { '7': 15, '12': 50, '3': 0.250 } }
];
const receiving = [
  { name: 'Ohtani', position: 'UT', stats: { '7': 40, '12': 100, '3': 0.300 } }
];
const tradeValue = brain.evaluateTrade(giving, receiving, [], { num_teams: 12, scoring_type: 'Points' });
console.log(`Trade Verdict: ${tradeValue.verdict} (Score: ${tradeValue.score})`);
console.log(`Reasoning: ${tradeValue.reasoning}`);

// Test 7: Waiver Priority Scoring
console.log("\n[7] Testing scoreWaiverTarget");
const freeAgent = { 
  name: 'Hot Prospect', 
  position: 'SS', 
  recentStats: { '3': 0.400 }, 
  seasonStats: { '3': 0.220 },
  team: 'NYY'
};
const myRoster = [{ position: 'OF' }, { position: '1B' }]; // Roster has NO SS! So they are filling a need.
const waiverScore = brain.scoreWaiverTarget(freeAgent, myRoster, { num_teams: 12, roster_slots: { 'SS': 1 } });
console.log(`Waiver Priority: ${waiverScore.priority} (Score: ${waiverScore.score})`);
console.log(`Reasoning: ${waiverScore.reasoning}`);

// Test 8: Roster Update / Analyze Strengths
console.log("\n[8] Testing analyzeRosterStrengths");
const rosterAnalysis = brain.analyzeRosterStrengths([
  { name: 'OF1', position: 'OF' }, { name: 'OF2', position: 'OF' }, { name: 'OF3', position: 'OF' }, { name: 'OF4', position: 'OF' }, // Surplus OF
  { name: 'SP1', position: 'SP' }, { name: 'SP2', position: 'SP' }
], 12);
console.log(`Needs (Voids): ${rosterAnalysis.voids.join(', ')}`);
console.log(`Surpluses: ${rosterAnalysis.surpluses.map(s => `${s.position} (${s.count})`).join(', ')}`);
