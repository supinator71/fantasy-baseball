const brain = require('../services/fantasyBrain');

console.log("--- FANTASY BRAIN FUZZ TEST ---");

const leagueSize = 12;

// Test 1: VOR calculation with Yahoo Stat IDs (early season numbers)
console.log("\n[1] Testing calculateVOR with Yahoo numeric stat IDs (Hitters)");
const earlyHitter = {
  stats: { '3': 0.320, '4': 25, '7': 8, '12': 18, '16': 4, '60': 15 } // AVG, H, HR, RBI, SB, R
};
const ptsVOR = brain.calculateVOR(earlyHitter.stats, 'OF', leagueSize, 'Points');
const rotoVOR = brain.calculateVOR(earlyHitter.stats, 'OF', leagueSize, 'Roto');
console.log(`Early Hitter VOR (Points): ${ptsVOR} / 100`);
console.log(`Early Hitter VOR (Roto): ${rotoVOR} / 100`);

console.log("\n[2] Testing calculateVOR with Yahoo numeric stat IDs (Pitchers)");
const earlyPitcher = {
  stats: { '26': 2.15, '27': 0.95, '28': 3, '32': 0, '42': 35, '50': 29.1 } // ERA, WHIP, W, SV, K, IP
};
const pPtsVOR = brain.calculateVOR(earlyPitcher.stats, 'SP', leagueSize, 'Points');
const pRotoVOR = brain.calculateVOR(earlyPitcher.stats, 'SP', leagueSize, 'Roto');
console.log(`Early Pitcher VOR (Points): ${pPtsVOR} / 100`);
console.log(`Early Pitcher VOR (Roto):   ${pRotoVOR} / 100`);

// Test 3: Zero stats
console.log("\n[3] Testing calculateVOR with completely zeroed player");
const zeroPlayer = { stats: { '3': 0, '4': 0, '7': 0, '12': 0, '16': 0, '60': 0 } };
const zeroPtsVOR = brain.calculateVOR(zeroPlayer.stats, 'OF', leagueSize, 'Points');
const zeroRotoVOR = brain.calculateVOR(zeroPlayer.stats, 'OF', leagueSize, 'Roto');
console.log(`Zero Hitter VOR (Points): ${zeroPtsVOR} / 100`);
console.log(`Zero Hitter VOR (Roto):   ${zeroRotoVOR} / 100`);

// Test 4: Missing stats entirely
console.log("\n[4] Testing calculateVOR with NO stats");
const noStats = brain.calculateVOR({}, 'OF', leagueSize, 'Points');
console.log(`Missing Stats VOR (Points): ${noStats} / 100`);

// Test 5: Scarcity calculation
console.log("\n[5] Testing Positional Scarcity");
console.log(`SP Scarcity: ${JSON.stringify(brain.getPositionalScarcity('SP', leagueSize))}`);
console.log(`C Scarcity:  ${JSON.stringify(brain.getPositionalScarcity('C', leagueSize))}`);
console.log(`OF Scarcity: ${JSON.stringify(brain.getPositionalScarcity('OF', leagueSize))}`);
