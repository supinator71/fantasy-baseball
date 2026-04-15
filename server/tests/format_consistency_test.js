/**
 * Format Consistency Test — Validates that fantasyBrain produces
 * distinct, accurate output for all 3 scoring formats:
 *   ROTO, H2H_CAT (headcat), H2H_POINTS (headpoint)
 *
 * Tests: detectFormat, VOR, analyzeCategories, streamingValue,
 *        optimizeLineup, scoreWaiverTarget, evaluateTrade, buildRosterDiagnosis
 */

const brain = require('../services/fantasyBrain');

// ─── Mock Data ───────────────────────────────────────────────────────────────

const eliteHitter = {
  player_name: 'Mike Trout', position: 'OF', team: 'LAA', status: '',
  stats: { R: 95, H: 160, '1B': 85, '2B': 35, '3B': 4, HR: 36, RBI: 95, SB: 18, BB: 85, HBP: 5, AB: 520, AVG: 0.308 },
  recentStats: { '3': 0.330 }, seasonStats: { '3': 0.308 },
};

const solidSP = {
  player_name: 'Zack Wheeler', position: 'SP', team: 'PHI', status: '',
  stats: { W: 14, SV: 0, IP: 195, HA: 155, ER: 58, BBA: 42, HBPA: 5, K: 220, ERA: 2.68, WHIP: 1.01 },
  recentStats: { '26': 2.40 }, seasonStats: { '26': 2.68 },
};

const riskyStreamer = {
  player_name: 'Streamer Jones', position: 'SP', team: 'COL', status: '',
  stats: { W: 6, SV: 0, IP: 120, HA: 135, ER: 68, BBA: 50, HBPA: 3, K: 100, ERA: 5.10, WHIP: 1.54 },
  recentStats: { '26': 5.50 }, seasonStats: { '26': 5.10 },
  era: 5.10, whip: 1.54, k9: 7.5, ip_per_start: 5.2,
};

const coldHitter = {
  player_name: 'Slumping Steve', position: 'SS', team: 'NYY', status: '',
  stats: { R: 40, H: 70, '1B': 40, '2B': 15, '3B': 2, HR: 13, RBI: 42, SB: 5, BB: 25, HBP: 2, AB: 310, AVG: 0.226 },
  recentStats: { '3': 0.185 }, seasonStats: { '3': 0.226 },
};

const closerRP = {
  player_name: 'Saves Machine', position: 'RP', team: 'NYM', status: '',
  stats: { W: 3, SV: 32, IP: 60, HA: 42, ER: 15, BBA: 18, HBPA: 2, K: 75, ERA: 2.25, WHIP: 1.00 },
  recentStats: { '26': 1.80 }, seasonStats: { '26': 2.25 },
};

const ilPlayer = {
  player_name: 'Hurt Harry', position: '3B', team: 'BOS', status: 'IL10',
  stats: { R: 10, H: 20, HR: 3, RBI: 12, SB: 0, BB: 8, AB: 80, AVG: 0.250 },
};

const mockRoster = [eliteHitter, solidSP, coldHitter, closerRP, ilPlayer,
  { player_name: 'Good OF', position: 'OF', team: 'ATL', status: '', stats: { R: 70, H: 130, '1B': 70, '2B': 25, '3B': 3, HR: 22, RBI: 75, SB: 12, BB: 50, HBP: 3, AB: 480, AVG: 0.271 } },
  { player_name: 'Avg 1B', position: '1B', team: 'HOU', status: '', stats: { R: 60, H: 120, '1B': 65, '2B': 30, '3B': 1, HR: 24, RBI: 80, SB: 1, BB: 40, HBP: 2, AB: 460, AVG: 0.261 } },
  { player_name: 'SP2', position: 'SP', team: 'SD', status: '', stats: { W: 10, SV: 0, IP: 170, HA: 150, ER: 65, BBA: 45, HBPA: 4, K: 180, ERA: 3.44, WHIP: 1.15 } },
  { player_name: 'Bench OF', position: 'OF', team: 'SEA', status: '', stats: { R: 35, H: 55, '1B': 30, '2B': 12, '3B': 1, HR: 8, RBI: 30, SB: 4, BB: 15, HBP: 1, AB: 220, AVG: 0.250 } },
];

const FORMATS = [
  { label: 'H2H_POINTS', yahooType: 'headpoint' },
  { label: 'H2H_CAT',    yahooType: 'head' },
  { label: 'ROTO',        yahooType: 'roto' },
];

const LEAGUE_CATS_10 = ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP'];
const LEAGUE_CATS_12 = ['R', 'HR', 'RBI', 'SB', 'OBP', 'SLG', 'W', 'SV', 'K', 'ERA', 'WHIP', 'QS'];

let passed = 0;
let failed = 0;
function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}${detail ? ' — ' + detail : ''}`);
  } else {
    failed++;
    console.error(`  ❌ ${testName}${detail ? ' — ' + detail : ''}`);
  }
}

// ─── TEST 1: detectFormat ────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 1: detectFormat()');
console.log('══════════════════════════════════════════');
assert(brain.detectFormat('headpoint') === 'H2H_POINTS', 'headpoint → H2H_POINTS');
assert(brain.detectFormat('head') === 'H2H_CAT', 'head → H2H_CAT');
assert(brain.detectFormat('roto') === 'ROTO', 'roto → ROTO');
assert(brain.detectFormat('Roto') === 'ROTO', 'Roto (capitalized) → ROTO');
assert(brain.detectFormat('headone') === 'H2H_CAT', 'headone → H2H_CAT');
assert(brain.detectFormat('') === 'ROTO', 'empty → ROTO (default)');
assert(brain.detectFormat('Points') === 'H2H_POINTS', 'Points → H2H_POINTS');
assert(brain.detectFormat('h2h_categories') === 'H2H_CAT', 'h2h_categories → H2H_CAT');

// ─── TEST 2: VOR consistency across formats ──────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 2: VOR scale consistency');
console.log('══════════════════════════════════════════');

for (const fmt of FORMATS) {
  const troutVOR = brain.calculateVOR(eliteHitter.stats, 'OF', 12, fmt.yahooType);
  const wheelerVOR = brain.calculateVOR(solidSP.stats, 'SP', 12, fmt.yahooType);
  const coldVOR = brain.calculateVOR(coldHitter.stats, 'SS', 12, fmt.yahooType);
  const closerVOR = brain.calculateVOR(closerRP.stats, 'RP', 12, fmt.yahooType);
  const streamerVOR = brain.calculateVOR(riskyStreamer.stats, 'SP', 12, fmt.yahooType);

  console.log(`\n  [${fmt.label}]`);
  console.log(`    Trout(OF):${troutVOR}  Wheeler(SP):${wheelerVOR}  ColdSS:${coldVOR}  Closer:${closerVOR}  Streamer:${streamerVOR}`);

  assert(troutVOR > 40, `${fmt.label}: Elite hitter VOR > 40`, `got ${troutVOR}`);
  assert(wheelerVOR > 30, `${fmt.label}: Ace SP VOR > 30`, `got ${wheelerVOR}`);
  assert(troutVOR > coldVOR, `${fmt.label}: Elite > Cold hitter`, `${troutVOR} > ${coldVOR}`);
  assert(wheelerVOR > streamerVOR, `${fmt.label}: Ace > Risky streamer`, `${wheelerVOR} > ${streamerVOR}`);
  // Cross-format: VOR should be in similar ballpark (not 10x different)
  if (fmt.label !== 'H2H_POINTS') {
    const ptsVOR = brain.calculateVOR(eliteHitter.stats, 'OF', 12, 'headpoint');
    const ratio = troutVOR / ptsVOR;
    assert(ratio > 0.3 && ratio < 3.0, `${fmt.label}: VOR scale within 3x of H2H_POINTS`, `ratio: ${ratio.toFixed(2)}`);
  }
}

// ─── TEST 3: analyzeCategories — format-specific advice ──────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 3: analyzeCategories format-specific advice');
console.log('══════════════════════════════════════════');

const myTeamStats = { R: 70, HR: 25, RBI: 68, SB: 10, AVG: 0.260, W: 8, SV: 5, K: 150, ERA: 3.80, WHIP: 1.22 };
const oppStats = { R: 85, HR: 30, RBI: 82, SB: 6, AVG: 0.255, W: 10, SV: 8, K: 140, ERA: 3.50, WHIP: 1.18 };

for (const fmt of FORMATS) {
  const result = brain.analyzeCategories(myTeamStats, [{ stats: oppStats }], fmt.yahooType, LEAGUE_CATS_10);
  console.log(`\n  [${fmt.label}] advice: "${result.advice.slice(0, 120)}..."`);
  console.log(`    format: ${result.format}, weaknesses: ${result.weaknesses?.join(',') || 'N/A'}`);

  assert(result.format === brain.FORMAT[fmt.label], `${fmt.label}: format tag correct`, `got ${result.format}`);

  if (fmt.label === 'H2H_POINTS') {
    assert(result.advice.includes('POINTS'), `${fmt.label}: advice mentions POINTS`, '');
    assert(!result.advice.includes('ratio') && !result.advice.includes('ROTO'), `${fmt.label}: no roto/ratio advice`, '');
  } else if (fmt.label === 'ROTO') {
    assert(result.advice.includes('ROTO') || result.advice.includes('marathon'), `${fmt.label}: advice mentions ROTO/marathon`, '');
    assert(!result.advice.includes('week'), `${fmt.label}: no weekly language`, '');
  } else {
    assert(result.advice.includes('CATEGORIES') || result.advice.includes('categories'), `${fmt.label}: advice mentions CATEGORIES`, '');
    assert(result.advice.includes('week'), `${fmt.label}: mentions weekly context`, '');
  }
}

// Test with custom 12-cat league
const result12 = brain.analyzeCategories(myTeamStats, [{ stats: oppStats }], 'head', LEAGUE_CATS_12);
assert(result12.advice.includes('12 cats'), 'H2H_CAT with 12 cats: mentions 12', result12.advice.slice(0, 80));

// ─── TEST 4: streamingValue — format-specific risk tolerance ─────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 4: streamingValue format-specific behavior');
console.log('══════════════════════════════════════════');

const badOpp = { wOBA: 0.340, kRate: 0.19, obp: 0.350 }; // strong offense

for (const fmt of FORMATS) {
  const riskyStream = brain.streamingValue(riskyStreamer, badOpp, fmt.yahooType);
  const aceStream = brain.streamingValue({ ...solidSP, era: 2.68, whip: 1.01, k9: 10.2, ip_per_start: 6.5 }, badOpp, fmt.yahooType);

  console.log(`\n  [${fmt.label}] Risky streamer vs tough lineup: ${riskyStream.score}/100 (${riskyStream.grade})`);
  console.log(`  [${fmt.label}] Ace vs tough lineup: ${aceStream.score}/100 (${aceStream.grade})`);

  assert(aceStream.score > riskyStream.score, `${fmt.label}: Ace > Risky streamer`, `${aceStream.score} > ${riskyStream.score}`);

  if (fmt.label === 'ROTO') {
    assert(riskyStream.score <= 25, `ROTO: Risky streamer severely penalized`, `score: ${riskyStream.score}`);
  }
  if (fmt.label === 'H2H_POINTS') {
    // Points format cares less about ratios, more about volume
    const ptsScore = riskyStream.score;
    const rotoScore = brain.streamingValue(riskyStreamer, badOpp, 'roto').score;
    assert(ptsScore >= rotoScore, `H2H_POINTS: Risky streamer ≥ Roto score`, `pts:${ptsScore} roto:${rotoScore}`);
  }
}

// ─── TEST 5: optimizeLineup — VOR + format adjustments ───────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 5: optimizeLineup with VOR + format');
console.log('══════════════════════════════════════════');

const weekSchedule = { LAA: 7, PHI: 6, NYY: 6, NYM: 6, COL: 7, ATL: 6, HOU: 7, SD: 6, SEA: 4, BOS: 6 };

for (const fmt of FORMATS) {
  const lineup = brain.optimizeLineup(mockRoster.filter(p => p.status !== 'IL10'), weekSchedule, fmt.yahooType, 12);
  const topStarter = lineup.starters[0];

  console.log(`\n  [${fmt.label}] Top starter: ${topStarter?.player_name} (VOR:${topStarter?.vor}, score:${topStarter?.startScore})`);
  console.log(`    Reasoning: "${lineup.reasoning}"`);
  console.log(`    Starters: ${lineup.starters.length}, Bench: ${lineup.bench.length}, Streaming: ${lineup.volumePlays.length}`);

  assert(lineup.starters.length > 0, `${fmt.label}: Has starters`, `${lineup.starters.length}`);
  assert(topStarter?.vor > 0, `${fmt.label}: Top starter has VOR`, `${topStarter?.vor}`);
  assert(lineup.reasoning.includes(fmt.label === 'H2H_POINTS' ? 'points' : fmt.label === 'ROTO' ? 'roto' : 'H2H cats'),
    `${fmt.label}: Reasoning mentions format`, '');

  // IL player should never be a starter
  assert(!lineup.starters.find(p => p.player_name === 'Hurt Harry'), `${fmt.label}: IL player excluded from starters`, '');
}

// ─── TEST 6: evaluateTrade — consistent across formats ───────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 6: evaluateTrade consistency');
console.log('══════════════════════════════════════════');

const giving = [coldHitter];
const receiving = [{ player_name: 'Good SP', position: 'SP', stats: { ...solidSP.stats } }];

for (const fmt of FORMATS) {
  const trade = brain.evaluateTrade(giving, receiving, mockRoster, { num_teams: 12, scoring_type: fmt.yahooType });
  console.log(`\n  [${fmt.label}] Trade score: ${trade.score} (${trade.verdict})`);
  console.log(`    Reasoning: "${trade.reasoning.slice(0, 120)}"`);

  assert(trade.score !== undefined, `${fmt.label}: Trade has score`, `${trade.score}`);
  assert(trade.verdict, `${fmt.label}: Trade has verdict`, trade.verdict);
  assert(trade.reasoning.length > 10, `${fmt.label}: Trade has reasoning`, '');
}

// ─── TEST 7: buildRosterDiagnosis — format label + prompt block ──────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 7: buildRosterDiagnosis prompt block');
console.log('══════════════════════════════════════════');

for (const fmt of FORMATS) {
  const diag = brain.buildRosterDiagnosis(mockRoster, {
    num_teams: 12,
    scoring_type: fmt.yahooType,
    stat_categories: LEAGUE_CATS_10,
  });

  const hasFormatTag = diag.promptBlock.includes('FORMAT:');
  const hasLeagueCats = diag.promptBlock.includes('League cats:') || fmt.label === 'H2H_POINTS';
  const headerMatch = fmt.label === 'H2H_POINTS'
    ? diag.promptBlock.includes('H2H Points')
    : fmt.label === 'H2H_CAT'
    ? diag.promptBlock.includes('H2H Categories')
    : diag.promptBlock.includes('Rotisserie');

  console.log(`\n  [${fmt.label}]`);
  console.log(`    Active: ${diag.activeRoster.length}, IL: ${diag.unavailablePlayers.length}, DTD: ${diag.dtdPlayers.length}`);
  console.log(`    Total VOR: ${diag.totalVOR}, Avg: ${diag.avgVOR}, Elite: ${diag.eliteCount}, Replacement: ${diag.replacementCount}`);
  console.log(`    Voids: ${diag.voids.join(',') || 'none'} | Surpluses: ${diag.surpluses.map(s => s.position).join(',') || 'none'}`);
  console.log(`    Category needs: pitching=${diag.categoryNeeds.needsPitching}, hitting=${diag.categoryNeeds.needsHitting}`);
  console.log(`    Prompt block header: "${diag.promptBlock.split('\n').slice(1, 3).join(' | ').slice(0, 100)}"`);

  assert(headerMatch, `${fmt.label}: Prompt header matches format`, '');
  assert(hasFormatTag, `${fmt.label}: Prompt has FORMAT: tag`, '');
  assert(diag.unavailablePlayers.length === 1, `${fmt.label}: IL player detected`, `${diag.unavailablePlayers[0]?.player_name}`);
  assert(diag.activeRoster.length === mockRoster.length - 1, `${fmt.label}: Active roster excludes IL`, `${diag.activeRoster.length}`);
  assert(diag.vorByPlayer.length > 0, `${fmt.label}: VOR by player populated`, `${diag.vorByPlayer.length}`);

  // H2H Points should NOT mention category-balancing in its format directive
  if (fmt.label === 'H2H_POINTS') {
    assert(diag.promptBlock.includes('Do NOT give category-balancing'), 'H2H_POINTS: Explicitly bars category advice', '');
  }
  // Roto should warn about ratio protection
  if (fmt.label === 'ROTO') {
    assert(diag.promptBlock.includes('Protect ratios'), 'ROTO: Warns about ratio protection', '');
  }
  // H2H Cat should mention win target
  if (fmt.label === 'H2H_CAT') {
    assert(diag.promptBlock.includes('categories weekly'), 'H2H_CAT: Mentions weekly category target', '');
    assert(hasLeagueCats, 'H2H_CAT: League cats listed in prompt', '');
  }
}

// ─── TEST 8: scoreWaiverTarget — format awareness ────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 8: scoreWaiverTarget format-aware');
console.log('══════════════════════════════════════════');

const waiverTarget = {
  player_name: 'Waiver SP', position: 'SP', team: 'HOU',
  stats: { W: 5, IP: 80, ERA: 3.50, WHIP: 1.15, K: 85 },
  recentStats: { '26': 2.80 }, seasonStats: { '26': 3.50 },
};

for (const fmt of FORMATS) {
  const catNeeds = { needsPitching: true, needsHitting: false, weakCategories: ['K', 'ERA'] };
  const score = brain.scoreWaiverTarget(waiverTarget, mockRoster, { num_teams: 12, scoring_type: fmt.yahooType }, catNeeds);
  console.log(`  [${fmt.label}] Waiver SP score: ${score.score}/100 (${score.priority})`);
  assert(score.score > 40, `${fmt.label}: Pitching-needy team + good SP = decent score`, `${score.score}`);
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════');
process.exit(failed > 0 ? 1 : 0);
