const fs = require('fs');
const path = './server/routes/claude.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/'me' : 'opp'\)/g, "'me' : 'opponent')");
content = content.replace(/=== 'opp'/g, "=== 'opponent'");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed opp winner formatting');
