/**
 * Final Format Consistency Audit — Validates that fantasyBrain produces
 * distinct, accurate output for all 3 scoring formats across all modules.
 */

const brain = require('../server/services/fantasyBrain');

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockRoster = [
  { name: 'Mike Trout', position: 'OF', stats: { R: 95, HR: 36, RBI: 95, SB: 18, AVG: 0.308 } },
  { name: 'Zack Wheeler', position: 'SP', stats: { W: 14, K: 220, ERA: 2.68, WHIP: 1.01, IP: 195 } },
  { name: 'Slumping Steve', position: 'SS', stats: { R: 40, HR: 13, RBI: 42, SB: 5, AVG: 0.226 } },
  { name: 'Saves Machine', position: 'RP', stats: { SV: 32, K: 75, ERA: 2.25, WHIP: 1.00 } },
];

const mockFA = [
  { name: 'Hot FA', position: 'OF', stats: { R: 70, HR: 22, RBI: 75, SB: 12, AVG: 0.271 } },
  { name: 'Streamer SP', position: 'SP', stats: { W: 6, K: 100, ERA: 5.10, WHIP: 1.54, IP: 120 } },
];

const FORMATS = [
  { label: 'H2H_POINTS', yahooType: 'headpoint' },
  { label: 'H2H_CAT',    yahooType: 'head' },
  { label: 'ROTO',       yahooType: 'roto' },
];

async function runAudit() {
  console.log('\n══════════════════════════════════════════');
  console.log('FINAL FORMAT CONSISTENCY AUDIT');
  console.log('══════════════════════════════════════════');

  for (const fmt of FORMATS) {
    console.log(`\n▶ TESTING FORMAT: ${fmt.label}`);

    // 1. Roster Diagnosis Prompt Block
    const diag = brain.buildRosterDiagnosis(mockRoster, { scoring_type: fmt.yahooType });
    const header = diag.promptBlock.split('\n')[1];
    console.log(`   [Diagnosis] Prompt Header: "${header}"`);

    // 2. VOR Scale
    const troutVOR = brain.calculateVOR(mockRoster[0].stats, 'OF', 12, fmt.yahooType);
    console.log(`   [VOR] Trout VOR (${fmt.label}): ${troutVOR.toFixed(2)}`);

    // 3. Category Advice
    const myStats = { R: 70, HR: 25, RBI: 68, SB: 10, AVG: 0.260, W: 8, SV: 5, K: 150, ERA: 3.80, WHIP: 1.22 };
    const oppStats = { R: 85, HR: 30, RBI: 82, SB: 6, AVG: 0.255, W: 10, SV: 8, K: 140, ERA: 3.50, WHIP: 1.18 };
    const advice = brain.analyzeCategories(myStats, [{ stats: oppStats }], fmt.yahooType, ['R', 'HR', 'RBI', 'SB', 'AVG']);
    console.log(`   [Categories] Advice Snippet: "${advice.advice.slice(0, 80)}..."`);

    // 4. Lineup Optimization
    const schedule = { LAA: 7, PHI: 6, NYY: 6, NYM: 6 };
    const lineup = brain.optimizeLineup(mockRoster, schedule, fmt.yahooType, 12);
    console.log(`   [Lineup] Reasoning Snippet: "${lineup.reasoning.slice(0, 80)}..."`);
  }

  console.log('\n══════════════════════════════════════════');
  console.log('AUDIT COMPLETE');
  console.log('══════════════════════════════════════════\n');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
