const mlb = require('../server/services/mlbStatsService');
const brain = require('../server/services/fantasyBrain');

async function audit() {
  console.log('=== HERRERA VS HICKS VS CONTRERAS AUDIT ===\n');
  
  const players = ['Ivan Herrera', 'Liam Hicks', 'William Contreras'];
  
  for (const name of players) {
    const stats = await mlb.getPlayerSeasonStats(name, 2025) || await mlb.getPlayerSeasonStats(name, 2024);
    if (stats) {
      const breakout = brain.detectBreakoutRegression(stats.stats, stats.type, 'Points');
      console.log(`  ${stats.name.padEnd(20)} | VOR: ${brain.calculateVOR(stats.stats, stats.position, 12, 'Points').toString().padEnd(5)} | OPS: ${stats.stats.OPS.toString().padEnd(5)} | Breakout: ${breakout.verdict}`);
    } else {
      console.log(`  ${name.padEnd(20)} | NO DATA FOUND`);
    }
  }
}

audit();
