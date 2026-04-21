const mlb = require('../server/services/mlbStatsService');
const brain = require('../server/services/fantasyBrain');

async function audit() {
  console.log('=== LIAM HICKS VS WILLIAM CONTRERAS DATA AUDIT ===\n');
  
  const players = ['Liam Hicks', 'William Contreras'];
  
  for (const name of players) {
    console.log(`Lookup: ${name}...`);
    const stats = await mlb.getPlayerSeasonStats(name, 2025);
    
    if (!stats) {
      console.log(`  ❌ No 2025 stats found for ${name}. Checking 2024...`);
      const stats24 = await mlb.getPlayerSeasonStats(name, 2024);
      if (stats24) {
        processPlayer(stats24);
      } else {
        console.log(`  ❌ No data found.`);
      }
    } else {
      processPlayer(stats);
    }
    console.log('');
  }
}

function processPlayer(data) {
  const intel = brain.generatePlayerIntelligence(data);
  const breakout = brain.detectBreakoutRegression(data.stats, data.type, 'Points');
  
  console.log(`  Player: ${data.name} (${data.teamAbbr})`);
  console.log(`  Pos:    ${data.position}`);
  console.log(`  Stats:  AVG:${data.stats.AVG}, HR:${data.stats.HR}, RBI:${data.stats.RBI}, OPS:${data.stats.OPS}`);
  console.log(`  VOR:    ${brain.calculateVOR(data.stats, data.position, 12, 'Points')}`);
  console.log(`  Breakout Score: ${breakout.score}`);
  if (breakout.flags.length > 0) {
    console.log(`  Flags:  ${breakout.flags.join(', ')}`);
  }
  console.log(`  Summary: ${intel.summary}`);
}

audit();
