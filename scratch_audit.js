const fs = require('fs');
const path = './server/routes/claude.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the "300 word narrative essay" instruction
content = content.replace(
  /- The fullAnalysis should be a compelling 300-word narrative essay\.\s*/,
  ''
);

// 2. Remove the JSON property from the prompt
content = content.replace(
  /,\s*"fullAnalysis": "A comprehensive 300-word narrative analysis written as readable prose"/,
  ''
);

// 3. Lower Token Limit
content = content.replace(
  /\}\], 4000\);/g,
  `}], 1500);`
);

// 4. Update the fallback regex mapping
content = content.replace(
  `const _analysis = text.match(/"fullAnalysis"\\s*:\\s*"([^"]+)"/i);`,
  `const _analysis = ["", "AI audit computed without dense prose to save generation time."];`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Audit patch complete');
