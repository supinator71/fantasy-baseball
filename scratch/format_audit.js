const brain = require('../server/services/fantasyBrain');

const formats = [
  { name: 'H2H Points', type: 'H2H Points' },
  { name: 'H2H Categories', type: 'H2H Categories' },
  { name: 'Roto', type: 'Rotisserie' }
];

const testRoster = [
  {
    player_name: 'William Contreras',
    position: 'C,1B',
    stats: { R: 85, HR: 24, RBI: 90, SB: 6, AVG: 0.288, AB: 560, W: 0, IP: 0 }
  },
  {
    player_name: 'Ivan Herrera',
    position: 'C',
    stats: { R: 45, HR: 12, RBI: 48, SB: 2, AVG: 0.255, AB: 320, W: 0, IP: 0 }
  },
  {
    player_name: 'Freddie Freeman',
    position: '1B',
    stats: { R: 110, HR: 28, RBI: 105, SB: 12, AVG: 0.318, AB: 610, W: 0, IP: 0 }
  },
  {
    player_name: 'Gerrit Cole',
    position: 'SP',
    stats: { W: 15, K: 220, ERA: 3.20, WHIP: 1.05, IP: 190, GS: 32 }
  },
  {
    player_name: 'Emmanuel Clase',
    position: 'RP',
    stats: { W: 3, SV: 44, K: 75, ERA: 1.80, WHIP: 0.95, IP: 70, G: 72 }
  }
];

const leagueContext = {
  num_teams: 12,
  roster_slots: { C: 1, '1B': 1, '2B': 1, '3B': 1, SS: 1, OF: 3, UTIL: 1, SP: 2, RP: 2, P: 3, BN: 5, IL: 2 }
};

console.log('=== MULTI-FORMAT CONSISTENCY AUDIT ===\n');

formats.forEach(fmt => {
  console.log(`--- TESTING FORMAT: ${fmt.name} ---`);
  const ctx = { ...leagueContext, scoring_type: fmt.type };
  const analysis = brain.analyzeRosterStrengths(testRoster, ctx);
  
  console.log(`[VOR Summary]`);
  analysis.vorByPlayer.forEach(p => {
    console.log(`  - ${p.name.padEnd(18)} (${p.position.padEnd(5)}) VOR: ${p.vor}`);
  });

  console.log(`[Voids]    : ${analysis.voids.join(', ') || 'None'}`);
  console.log(`[Warnings] : ${analysis.rosterWarnings.length} found`);
  analysis.rosterWarnings.forEach(w => console.log(`  ⚠️  ${w}`));
  
  if (analysis.buyLow.length > 0) {
    console.log(`[Advice Sample]: ${analysis.buyLow[0].name} (${analysis.buyLow[0].reason})`);
  }
  
  const diagnosis = brain.buildRosterDiagnosis(testRoster, ctx);
  console.log(`[Prompt Block Fragment]: ${diagnosis.promptBlock.substring(0, 150).replace(/\n/g, ' ')}...`);
  console.log('\n');
});
