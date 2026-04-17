const fs = require('fs');
const path = './server/routes/claude.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `Return ONLY valid JSON (no markdown):
{
  "projected_wins": 5, "projected_losses": 4, "projected_ties": 1,
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose",
  "categories": [{ "name": "Category Name", "my_proj": "value", "opp_proj": "value", "winner": "me", "confidence": "high", "note": "A readable sentence" }]
}\`
    }], 4000);`;

const repStr = `Return ONLY valid JSON (no markdown):
{
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose"
}\`
    }], 1200);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(path, content, 'utf8');
console.log('Update Complete 2');
