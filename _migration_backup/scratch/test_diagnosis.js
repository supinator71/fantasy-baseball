const brain = require('../server/services/fantasyBrain');
const mlbStats = require('../server/services/mlbStatsService');

async function test() {
  const roster = [
    { name: 'Ivan Herrera', position: 'C', stats: { AVG: 0.250, HR: 10 } },
    { name: 'Liam Hicks', position: 'C', stats: { AVG: 0.260, HR: 5 } }
  ];
  const settings = { num_teams: 12, scoring_type: 'Head-to-Head Points', roster_slots: { C: 1 } };
  
  try {
    const diagnosis = brain.buildRosterDiagnosis(roster, settings);
    console.log('Diagnosis successful');
    console.log('Warnings:', diagnosis.catAnalysis.warnings); // Wait, warnings are in diagnosis.catAnalysis? 
    // No, I put them in rosterAnalysis.warnings?
  } catch (err) {
    console.error('Diagnosis failed:', err.stack);
  }
}

test();
