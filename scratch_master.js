const fs = require('fs');
const path = './server/routes/claude.js';
let content = fs.readFileSync(path, 'utf8');

// --- MATCHUP MODULE FIX ---
// 1. Math definition
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
      winner = lowerIsBetter ? (myVal < oppVal ? 'me' : 'opponent') : (myVal > oppVal ? 'me' : 'opponent');
    }
    return { name: cat, my_proj: myVal, opp_proj: oppVal, winner, confidence: 'high' };
  });

  const mathProjectedWins = mathCategories.filter(c => c.winner === 'me').length;
  const mathProjectedLosses = mathCategories.filter(c => c.winner === 'opponent').length;
  const mathProjectedTies = mathCategories.filter(c => c.winner === 'tie').length;
`);

// 2. Prompt target
const pTargetMatchup = `Return ONLY valid JSON (no markdown):
{
  "projected_wins": 5, "projected_losses": 4, "projected_ties": 1,
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose",
  "categories": [{ "name": "Category Name", "my_proj": "value", "opp_proj": "value", "winner": "me", "confidence": "high", "note": "A readable sentence" }]
}\`
    }], 4000);`;

const pRepMatchup = `Return ONLY valid JSON (no markdown):
{
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose"
}\`
    }], 1200);`;

content = content.replace(pTargetMatchup, pRepMatchup);

// 3. Parsed Fallback
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

// 4. regex extraction fallback MATCHUP
content = content.replace(
  /projected_wins: _wins \? parseInt\(_wins\[1\]\) : '\?',\s*projected_losses: _losses \? parseInt\(_losses\[1\]\) : '\?',\s*projected_ties: _ties \? parseInt\(_ties\[1\]\) : 0,/s,
  `projected_wins: mathProjectedWins, 
      projected_losses: mathProjectedLosses,
      projected_ties: mathProjectedTies,`
);
content = content.replace(/categories: \[\]/g, `categories: mathCategories`);

// --- STARTSIT MODULE FIX ---
const tStartsit = `  try {
    const text = await callClaude([{
      role: 'user',
      content: \`\${leagueCtx}
\${diagnosis.promptBlock}
Context: \${matchup_context || 'Daily optimization'}

Players:
\${enriched.map(p =>
  \`\${p.name} (\${p.position}, \${p.team}) Status:\${p.status || 'Active'} Starting:\${p.is_starting || '?'} VOR:\${p.vor} Games:\${p.weekGames} Stream:\${p.streaming?.score}/100\`
).join('\\n')}\${liveMatchups}\${breakingNews}\${historicalIntel}

\${daily_mode ? 
  \`DAILY MODE: 1) Must Starts. 2) 3-4 marginal decisions with reasoning. 3) Bench list.
Rules: Never start IL/O/DTD. Batters: start if "Starting:Yes/?" bench if "No". SP: ONLY start if "Starting:Yes".
Use live matchups + category weakness to weight decisions.\` 
  : 
  \`WEEKLY MODE: START or SIT each player. Flag breakouts/regression. Weight category weaknesses.\`
}

Format: **Player** \\\`[VOR:XX | Stream:YY]\\\` 🟢 START / 🔴 SIT -> *Logic:* [reason]. Show the math.\`
    }]);
    res.json({ analysis: text });`;

const rStartsit = `  // Math pre-computation
  const obviousStarts = enriched.filter(p => !String(p.status || '').includes('IL') && p.vor >= 60 && ['No', '0'].indexOf(p.is_starting) === -1);
  const obviousSits = enriched.filter(p => String(p.status || '').includes('IL') || ['No', '0'].indexOf(p.is_starting) !== -1 || (p.vor < 30 && (p.streaming?.score || 0) < 50));
  const bubblePlayers = enriched.filter(p => !obviousStarts.includes(p) && !obviousSits.includes(p));

  const obviousText = \`### ⚡ Obvious Starts (Pre-computed)\\n\${obviousStarts.map(p => \`- 🟢 **\${p.name || p.player_name}** [VOR: \${p.vor}]\`).join('\\n') || '- None'}\\n\\n### 🔴 Obvious Sits (IL / Off Day / Low VOR)\\n\${obviousSits.map(p => \`- 🔴 **\${p.name || p.player_name}**\`).join('\\n') || '- None'}\\n\\n### ⚖️ AI Bubble Decisions (Marginal Plays)\\n\\n\`;

  try {
    const text = await callClaude([{
      role: 'user',
      content: \`\${leagueCtx}
\${diagnosis.promptBlock}
Context: \${matchup_context || 'Daily optimization'}

Bubble Players (MARGINAL DECISIONS ONLY):
\${bubblePlayers.map(p =>
  \`\${p.name} (\${p.position}, \${p.team}) Status:\${p.status || 'Active'} Starting:\${p.is_starting || '?'} VOR:\${p.vor} Games:\${p.weekGames} Stream:\${p.streaming?.score}/100\`
).join('\\n')}\${liveMatchups}\${breakingNews}\${historicalIntel}

\${daily_mode ? 
  \`DAILY MODE: Evaluate ONLY the Bubble Players provided. 1) Must Starts out of this list. 2) Marginal decisions with reasoning. 3) Bench list.\\nRules: Never start IL/O/DTD. Batters: start if "Starting:Yes/?" bench if "No". SP: ONLY start if "Starting:Yes".\\nUse live matchups + category weakness to weight decisions.\` 
  : 
  \`WEEKLY MODE: START or SIT every Bubble Player provided. Flag breakouts/regression. Weight category weaknesses.\`
}

Format: **Player Name** \\\`[VOR:XX | Stream:YY]\\\` 🟢 START / 🔴 SIT -> *Logic:* [reason]. Show the math.\`
    }], 1200);
    res.json({ analysis: obviousText + text });`;

content = content.replace(tStartsit, rStartsit);

// --- FULL AUDIT MODULE FIX ---
const tAudit = `  "championshipPath": "A compelling narrative paragraph describing the path to winning it all",
  "fullAnalysis": "A comprehensive 300-word narrative analysis written as readable prose"
}\`
    }], 4000);`;

const rAudit = `  "championshipPath": "A compelling narrative paragraph describing the path to winning it all"
}\`
    }], 1500);`;

content = content.replace(tAudit, rAudit);

const tAuditExtract = `const _analysis = text.match(/"fullAnalysis"\\s*:\\s*"([^"]+)"/i);`;
const rAuditExtract = `const _analysis = ["", "AI audit computed without dense prose to save generation time."];`;
content = content.replace(tAuditExtract, rAuditExtract);

fs.writeFileSync(path, content, 'utf8');
console.log('MASTER SCRIPT COMPLETE');
