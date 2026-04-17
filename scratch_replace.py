import re

with open('server/routes/claude.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = """  const catAnalysis = brain.analyzeCategories(myStats, [{ stats: oppStats }], settings?.scoring_type || 'H2H');

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
Week ${week || 'current'} matchup prediction.

MY TEAM: ${my_team?.name}
Stats: ${JSON.stringify(my_team?.stats || [])}

OPPONENT: ${opponent?.name}
Stats: ${JSON.stringify(opponent?.stats || [])}

Categories: ${JSON.stringify(stat_categories || ['W','SV','OUT','H','ER','BB','HBP','K','R','1B','2B','3B','HR','RBI','SB'])}
Pre-computed matchup analysis: ${JSON.stringify(catAnalysis)}

IMPORTANT: Write all text values in clean, conversational prose. No brackets, no code syntax. Write like a sports analyst breaking down a matchup.

CRITICAL JSON ESCAPING RULES: You MUST use double quotes for all JSON keys and string values. Do NOT use single quotes for JSON properties. If you need to use a quote inside your text prose, use single quotes (e.g., "He is a 'must-start' player"). You MUST NOT use raw newlines inside string values; use the literal sequence \\n.
Return ONLY valid JSON (no markdown):
{
  "projected_wins": 5, "projected_losses": 4, "projected_ties": 1,
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose",
  "categories": [{ "name": "Category Name", "my_proj": "value", "opp_proj": "value", "winner": "me", "confidence": "high", "note": "A readable sentence" }]
}`
    }], 4000);

    const parsed = tryParseJSON(text);
    console.log('[Claude] /matchup/predict parsed:', parsed ? 'JSON OK' : 'FALLBACK to raw text');
    if (parsed) return res.json(parsed);
    
    // Robust Fallback: Regex extraction when JSON structurally truncates
    const _wins = text.match(/"projected_wins"\\s*:\\s*(\\d+)/i);
    const _losses = text.match(/"projected_losses"\\s*:\\s*(\\d+)/i);
    const _ties = text.match(/"projected_ties"\\s*:\\s*(\\d+)/i);
    const _confidence = text.match(/"overall_confidence"\\s*:\\s*"([^"]+)"/i);
    const _summary = text.match(/"summary"\\s*:\\s*"([^"]+)"/i);
    
    res.json({ 
      projected_wins: _wins ? parseInt(_wins[1]) : '?', 
      projected_losses: _losses ? parseInt(_losses[1]) : '?',
      projected_ties: _ties ? parseInt(_ties[1]) : 0,
      overall_confidence: _confidence ? _confidence[1] : 'low',
      summary: _summary ? _summary[1] : "Incomplete analysis. The API response was truncated before finishing.",
      lineup_recommendations: null, // Avoid dumping raw JSON block into UI
      categories: [],
      raw: text 
    });"""

replacement = """  const catAnalysis = brain.analyzeCategories(myStats, [{ stats: oppStats }], settings?.scoring_type || 'H2H');

  const safeCats = stat_categories || ['W','SV','OUT','H','ER','BB','HBP','K','R','1B','2B','3B','HR','RBI','SB'];
  const mathCategories = safeCats.map((cat, i) => {
    const myStatObj = (my_team?.stats || [])[i] || {};
    const oppStatObj = (opponent?.stats || [])[i] || {};
    let myVal = parseFloat(myStats[cat] || myStatObj.value || 0);
    let oppVal = parseFloat(oppStats[cat] || oppStatObj.value || 0);
    const lowerIsBetter = ['ERA', 'WHIP', 'L', 'ER', 'BB', 'HBP', 'H/AB'].includes(cat);
    let winner = 'tie';
    if (myVal !== oppVal) {
      winner = lowerIsBetter ? (myVal < oppVal ? 'me' : 'opp') : (myVal > oppVal ? 'me' : 'opp');
    }
    return { name: cat, my_proj: myVal, opp_proj: oppVal, winner, confidence: 'high' };
  });

  const mathProjectedWins = mathCategories.filter(c => c.winner === 'me').length;
  const mathProjectedLosses = mathCategories.filter(c => c.winner === 'opp').length;
  const mathProjectedTies = mathCategories.filter(c => c.winner === 'tie').length;

  try {
    const text = await callClaude([{
      role: 'user',
      content: `${leagueCtx}
Week ${week || 'current'} matchup prediction.

MY TEAM: ${my_team?.name}
Stats: ${JSON.stringify(my_team?.stats || [])}

OPPONENT: ${opponent?.name}
Stats: ${JSON.stringify(opponent?.stats || [])}

Categories: ${JSON.stringify(safeCats)}
Pre-computed matchup analysis: ${JSON.stringify(catAnalysis)}

IMPORTANT: Write all text values in clean, conversational prose. No brackets, no code syntax. Write like a sports analyst breaking down a matchup.

CRITICAL JSON ESCAPING RULES: You MUST use double quotes for all JSON keys and string values. Do NOT use single quotes for JSON properties. If you need to use a quote inside your text prose, use single quotes (e.g., "He is a 'must-start' player"). You MUST NOT use raw newlines inside string values; use the literal sequence \\n.
Return ONLY valid JSON (no markdown):
{
  "overall_confidence": "medium",
  "summary": "A clear, readable summary of the matchup projection",
  "key_matchups": "Describe the 2-3 swing categories and how to win them in plain English",
  "lineup_recommendations": "Write specific actionable moves in conversational prose"
}`
    }], 1200);

    const parsed = tryParseJSON(text);
    if (parsed) {
      return res.json({
        ...parsed,
        projected_wins: mathProjectedWins,
        projected_losses: mathProjectedLosses,
        projected_ties: mathProjectedTies,
        categories: mathCategories
      });
    }
    
    // Robust Fallback: Regex extraction when JSON structurally truncates
    const _confidence = text.match(/"overall_confidence"\\s*:\\s*"([^"]+)"/i);
    const _summary = text.match(/"summary"\\s*:\\s*"([^"]+)"/i);
    
    res.json({ 
      projected_wins: mathProjectedWins, 
      projected_losses: mathProjectedLosses,
      projected_ties: mathProjectedTies,
      overall_confidence: _confidence ? _confidence[1] : 'low',
      summary: _summary ? _summary[1] : "Incomplete analysis. The API response was truncated before finishing.",
      lineup_recommendations: null, // Avoid dumping raw JSON block into UI
      categories: mathCategories,
      raw: text 
    });"""

if target in content:
    new_content = content.replace(target, replacement)
    with open('server/routes/claude.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS')
else:
    print('TARGET NOT FOUND')
