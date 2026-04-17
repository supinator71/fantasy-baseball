const fs = require('fs');
const path = './server/routes/claude.js';
let content = fs.readFileSync(path, 'utf8');

// Chunk 1: The math categories
content = content.replace(/(const catAnalysis = brain\.analyzeCategories.*? settings\?\.scoring_type \|\| 'H2H'\);)/s, 
`$1

  const safeCats = stat_categories || ['W','SV','OUT','H','ER','BB','HBP','K','R','1B','2B','3B','HR','RBI','SB'];
  const mathCategories = safeCats.map((cat, i) => {
    const myStatObj = (my_team?.stats || [])[i] || {};
    const oppStatObj = (opponent?.stats || [])[i] || {};
    let myVal = parseFloat(myStats[cat] || myStatObj.value || 0);
    let oppVal = parseFloat(oppStats[cat] || oppStatObj.value || 0);
    const lowerIsBetter = ['ERA', 'WHIP', 'L', 'ER', 'BB', 'HBP', 'H/AB', 'L'].includes(cat);
    let winner = 'tie';
    if (myVal !== oppVal) {
      winner = lowerIsBetter ? (myVal < oppVal ? 'me' : 'opp') : (myVal > oppVal ? 'me' : 'opp');
    }
    return { name: cat, my_proj: myVal, opp_proj: oppVal, winner, confidence: 'high' };
  });

  const mathProjectedWins = mathCategories.filter(c => c.winner === 'me').length;
  const mathProjectedLosses = mathCategories.filter(c => c.winner === 'opp').length;
  const mathProjectedTies = mathCategories.filter(c => c.winner === 'tie').length;
`);

// Chunk 2: The prompt payload
content = content.replace(
  /Return ONLY valid JSON \(no markdown\):\s*\{[\s\S]*?\}`\s*\}\], 4000\);/g,
  `Return ONLY valid JSON (no markdown):
{
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose"
}\`
    }], 1200);`
);

// Chunk 3: parsed JSON fallback
content = content.replace(
  /if \(parsed\) return res\.json\(parsed\);/g,
  `if (parsed) {
      return res.json({
        ...parsed,
        projected_wins: mathProjectedWins,
        projected_losses: mathProjectedLosses,
        projected_ties: mathProjectedTies,
        categories: mathCategories
      });
    }`
);

// Chunk 4: regex extraction fallback
content = content.replace(
  /projected_wins: _wins \? parseInt\(_wins\[1\]\) : '\?',\s*projected_losses: _losses \? parseInt\(_losses\[1\]\) : '\?',\s*projected_ties: _ties \? parseInt\(_ties\[1\]\) : 0,/s,
  `projected_wins: mathProjectedWins, 
      projected_losses: mathProjectedLosses,
      projected_ties: mathProjectedTies,`
);

content = content.replace(
  /categories: \[\]/g,
  `categories: mathCategories`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Update Complete');
