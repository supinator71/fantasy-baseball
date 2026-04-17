const fs = require('fs');
const path = './server/routes/claude.js';
let content = fs.readFileSync(path, 'utf8');

// First replace the broken obviousStarts code:
const badObvious = `  // Native obvious start/sit logic
  const obviousStarts = enriched.filter(p => p.vor > 5);
  const obviousSits = enriched.filter(p => p.status === 'IL' || p.status === 'O');
  const bubblePlayers = enriched.filter(p => !obviousStarts.includes(p) && !obviousSits.includes(p));

  const obviousText = \`OBVIOUS DECISIONS:\\n\` +
    obviousStarts.map(p => \`🟢 START: \${p.name} (High VOR)\`).join('\\n') + \`\\n\` +
    obviousSits.map(p => \`🔴 SIT: \${p.name} (Injured/Out)\`).join('\\n') + \`\\n\\n\`;
`;
content = content.replace(badObvious, "");

const insertLogic = `  // Math pre-computation
  const obviousStarts = enriched.filter(p => !String(p.status || '').includes('IL') && p.vor >= 60 && ['No', '0'].indexOf(p.is_starting) === -1);
  const obviousSits = enriched.filter(p => String(p.status || '').includes('IL') || ['No', '0'].indexOf(p.is_starting) !== -1 || (p.vor < 30 && (p.streaming?.score || 0) < 50));
  const bubblePlayers = enriched.filter(p => !obviousStarts.includes(p) && !obviousSits.includes(p));

  const obviousText = \`### ⚡ Obvious Starts (Pre-computed)\\n\${obviousStarts.map(p => \`- 🟢 **\${p.name || p.player_name}** [VOR: \${p.vor}]\`).join('\\n') || '- None'}\\n\\n### 🔴 Obvious Sits (IL / Off Day / Low VOR)\\n\${obviousSits.map(p => \`- 🔴 **\${p.name || p.player_name}**\`).join('\\n') || '- None'}\\n\\n### ⚖️ AI Bubble Decisions (Marginal Plays)\\n\\n\`;

  try {`;

content = content.replace("  try {", insertLogic);

const oldPrompt = `      content: \`\${leagueCtx}
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

const newPrompt = `      content: \`\${leagueCtx}
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

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync(path, content, 'utf8');
console.log('Update Complete Starts/Sits via NodeJS');
