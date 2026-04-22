const brain = require('../server/services/fantasyBrain');

const leagueContext = {
  num_teams: 12,
  scoring_type: 'H2H Categories',
  stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG']
};

const roster = [
  {
    player_name: 'William Contreras',
    position: 'C,1B',
    stats: { R: 80, HR: 22, RBI: 85, SB: 5, AVG: 0.285, AB: 550 }
  },
  {
    player_name: 'Liam Hicks',
    position: 'C',
    stats: { R: 40, HR: 10, RBI: 40, SB: 1, AVG: 0.240, AB: 300 }
  }
];

// Situation A: No other 1B. 
// Expectation: Contreras is counted as 1B too, so Hicks isn't "wasteful" as the only pure C? 
// Wait, Hicks IS the pure C. Contreras is C/1B. 
// If Contreras is the best 1B, Hicks is just the backup C. 
// Actually, Contreras is way better than Hicks. Contreras is the starter C. 
// Hicks is the backup C. The rule should say Hicks is wasteful.

console.log('--- TEST 1: Contreras (C,1B) + Hicks (C) ---');
const analysis1 = brain.analyzeRosterStrengths(roster, leagueContext);
console.log('Voids:', analysis1.voids);
console.log('Surpluses:', analysis1.surpluses.map(s => `${s.position}: ${s.count}`));
console.log('Warnings:', analysis1.rosterWarnings);

// Situation B: Add another 1B (Freddie Freeman).
// Now Contreras is also a backup C, and his 1B eligibility is redundant.
roster.push({
  player_name: 'Freddie Freeman',
  position: '1B',
  stats: { R: 100, HR: 25, RBI: 100, SB: 10, AVG: 0.315, AB: 600 }
});

console.log('\n--- TEST 2: Contreras + Hicks + Freeman (1B) ---');
const analysis2 = brain.analyzeRosterStrengths(roster, leagueContext);
console.log('Warnings:', analysis2.rosterWarnings);
