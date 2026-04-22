
const brain = require('../server/services/fantasyBrain');

async function runAudit() {
  console.log('=== UNIVERSAL FORMAT STABILITY AUDIT ===\n');

  const testCases = [
    { name: 'H2H Points League', scoring: 'headpoint', expected: 'H2H_POINTS' },
    { name: 'H2H Categories League', scoring: 'head', expected: 'H2H_CAT' },
    { name: 'Roto League', scoring: 'roto', expected: 'ROTO' },
    { name: 'Alt Points Name', scoring: 'Points', expected: 'H2H_POINTS' },
    { name: 'Alt Cat Name', scoring: 'H2H_Categories', expected: 'H2H_CAT' }
  ];

  let passed = 0;
  testCases.forEach(tc => {
    const detected = brain.detectFormat(tc.scoring);
    const success = detected === tc.expected;
    if (success) passed++;
    console.log(`[${success ? 'PASS' : 'FAIL'}] ${tc.name}: Input "${tc.scoring}" -> Detected "${detected}" (Expected: "${tc.expected}")`);
  });

  console.log(`\nFormat Detection Accuracy: ${passed}/${testCases.length}`);

  console.log('\n--- VERIFYING ADVICE BRANCHING ---');
  
  const dummyStats = { HR: 30, RBI: 90, R: 90, SB: 15, AVG: 0.280, W: 15, K: 200, ERA: 3.50, WHIP: 1.20 };
  const dummyOpponent = { HR: 25, RBI: 80, R: 80, SB: 20, AVG: 0.260, W: 12, K: 180, ERA: 3.80, WHIP: 1.30 };

  ['headpoint', 'head', 'roto'].forEach(fmt => {
    const analysis = brain.analyzeCategories(dummyStats, [dummyOpponent], fmt);
    console.log(`\n[${fmt.toUpperCase()}] Advice Preview:`);
    console.log(analysis.advice);
  });

  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit().catch(console.error);
