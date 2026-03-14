/**
 * fantasyBrain.js — Expert fantasy baseball logic engine
 * Pure computation — no Claude calls. Feeds structured intelligence into AI prompts.
 */

// ─────────────────────────────────────────────────────────────────────────────
// A) POSITIONAL VALUE TIERS
// ─────────────────────────────────────────────────────────────────────────────

const POSITIONAL_DATA = {
  C: {
    tier: 'elite',
    draftWindow: 'rounds 3-7',
    replacementDropoff: 'massive',
    notes: 'Only 3-4 viable starters in a 12-team league. Elite C worth a 3rd rounder. Replacement-level C (.230 AVG, 12 HR) is a weekly liability.',
    replacementLevel: { R: 45, HR: 11, RBI: 45, SB: 2, AVG: 0.232 },
    starterSlots: 1,
  },
  SS: {
    tier: 'scarce',
    draftWindow: 'rounds 3-8',
    replacementDropoff: 'massive',
    notes: 'Top 5 SS have massive edge. After pick ~60 overall the position drops to .248 AVG / 14 HR territory. Must address by round 8.',
    replacementLevel: { R: 65, HR: 14, RBI: 60, SB: 7, AVG: 0.248 },
    starterSlots: 1,
  },
  '2B': {
    tier: 'moderate',
    draftWindow: 'rounds 5-10',
    replacementDropoff: 'significant',
    notes: 'Dual-eligible players have deepened the position. UTIL eligibility means you can wait, but top 2B have premium value.',
    replacementLevel: { R: 65, HR: 14, RBI: 60, SB: 6, AVG: 0.250 },
    starterSlots: 1,
  },
  '3B': {
    tier: 'moderate',
    draftWindow: 'rounds 4-10',
    replacementDropoff: 'gradual',
    notes: 'Deeper than SS, easy to stream. Top 3B (Ramirez, Arenado tier) are worth early picks but position has depth through round 10.',
    replacementLevel: { R: 62, HR: 17, RBI: 65, SB: 4, AVG: 0.246 },
    starterSlots: 1,
  },
  '1B': {
    tier: 'deep',
    draftWindow: 'rounds 5-12',
    replacementDropoff: 'gradual',
    notes: 'Deepest non-OF position. Never draft a 1B early unless elite (Freeman, Goldschmidt tier). UTIL eligibility adds depth.',
    replacementLevel: { R: 70, HR: 20, RBI: 74, SB: 2, AVG: 0.250 },
    starterSlots: 1,
  },
  OF: {
    tier: 'deep',
    draftWindow: 'rounds 1-15',
    replacementDropoff: 'minimal',
    notes: '3 starting slots means you need volume but the position is extremely deep. Never reach for OF. Stars in rounds 1-3, fill with depth later.',
    replacementLevel: { R: 68, HR: 17, RBI: 68, SB: 8, AVG: 0.252 },
    starterSlots: 3,
  },
  SP: {
    tier: 'moderate',
    draftWindow: 'rounds 2-12',
    replacementDropoff: 'significant',
    notes: 'Top 5 aces (sub-3.00 ERA, 200+ K) are round 2-3 value. Middle SPs stream well. Zero-SP strategy viable in H2H. Never reach past ADP.',
    replacementLevel: { W: 8, K: 140, ERA: 4.50, WHIP: 1.35, SV: 0 },
    starterSlots: 5,
  },
  RP: {
    tier: 'replacement',
    draftWindow: 'rounds 12-23',
    replacementDropoff: 'minimal',
    notes: 'Most volatile position. Closers blow saves, lose jobs, get injured constantly. Never draft RP before round 12 in standard leagues. Waiver wire replaces closers regularly.',
    replacementLevel: { W: 3, K: 55, ERA: 4.00, WHIP: 1.30, SV: 10 },
    starterSlots: 2,
  },
}

function getPositionalScarcity(position, leagueSize = 12) {
  const pos = String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
  const data = POSITIONAL_DATA[pos] || POSITIONAL_DATA['OF']
  const scale = leagueSize / 12  // adjust for non-12-team leagues

  return {
    tier: data.tier,
    draftWindow: data.draftWindow,
    replacementDropoff: data.replacementDropoff,
    replacementLevel: data.replacementLevel,
    notes: data.notes,
    urgencyScore: { elite: 10, scarce: 8, moderate: 5, deep: 2, replacement: 0 }[data.tier] || 3,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// B) CATEGORY STRATEGY ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const CAT_LOWER_IS_BETTER = new Set(['ERA', 'WHIP'])

function analyzeCategories(myStats = {}, leagueStandings = [], scoringType = 'Roto') {
  const result = { punt: [], chase: [], locked: [], swing: [], advice: '' }

  if (!leagueStandings || leagueStandings.length === 0) {
    result.advice = 'No league standings provided — focus on balanced category coverage.'
    return result
  }

  const cats = Object.keys(myStats)
  if (cats.length === 0) {
    result.advice = 'No stats provided — cannot compute category analysis.'
    return result
  }

  if (scoringType.toLowerCase().includes('roto')) {
    // ROTO: rank each category, find efficient gains
    const catAnalysis = cats.map(cat => {
      const myVal = parseFloat(myStats[cat])
      const allVals = leagueStandings
        .map(t => parseFloat(t.stats?.[cat] ?? t[cat]))
        .filter(v => !isNaN(v))
        .sort((a, b) => CAT_LOWER_IS_BETTER.has(cat) ? a - b : b - a)

      const rank = allVals.findIndex(v =>
        CAT_LOWER_IS_BETTER.has(cat) ? myVal <= v : myVal >= v
      ) + 1 || Math.ceil(allVals.length / 2)

      const gapUp = rank > 1
        ? Math.abs(myVal - (allVals[rank - 2] || myVal))
        : 0
      const gapDown = rank < allVals.length
        ? Math.abs((allVals[rank] || myVal) - myVal)
        : 0

      return { cat, rank, total: allVals.length, gapUp, gapDown, myVal }
    })

    // Punt: bottom 20% AND gap to move up is large
    // Chase: gap to move up a rank is small (efficient gain)
    catAnalysis.forEach(c => {
      const pct = c.rank / c.total
      if (pct > 0.75) result.punt.push(c.cat)
      else if (pct < 0.4 && c.gapUp > 0 && c.gapUp < (Math.abs(c.myVal) * 0.08))
        result.chase.push(c.cat)
    })

    const sorted = catAnalysis.sort((a, b) => a.gapUp - b.gapUp)
    result.advice = `ROTO strategy: Most efficient gains in ${sorted.slice(0, 2).map(c => c.cat).join(', ')}. ` +
      (result.punt.length ? `Consider punting ${result.punt.join(', ')} if deep in hole.` : 'No clear punt categories.')

  } else {
    // H2H: identify close matchups (swing) vs locked wins/losses
    const opponent = leagueStandings[0] || {}
    cats.forEach(cat => {
      const myVal = parseFloat(myStats[cat])
      const oppVal = parseFloat(opponent.stats?.[cat] ?? opponent[cat])
      if (isNaN(myVal) || isNaN(oppVal)) return

      const lowerBetter = CAT_LOWER_IS_BETTER.has(cat)
      const myWinning = lowerBetter ? myVal < oppVal : myVal > oppVal
      const gap = Math.abs(myVal - oppVal)
      const pctGap = gap / Math.max(Math.abs(myVal), 0.001)

      if (pctGap < 0.05) result.swing.push(cat)      // within 5%: swing
      else if (myWinning && pctGap > 0.15) result.locked.push(cat)  // locked win
      else if (!myWinning && pctGap > 0.15) result.punt.push(cat)   // locked loss
      else if (!myWinning && pctGap < 0.12) result.chase.push(cat)  // closeable
    })

    result.advice = `H2H focus: Attack swing categories (${result.swing.join(', ') || 'none identified'}). ` +
      `Chase: ${result.chase.join(', ') || 'none'}. Concede: ${result.punt.join(', ') || 'none'}.`
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// C) VALUE OVER REPLACEMENT (VOR) CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

// Stat weights for 5x5 scoring — higher = more valuable/scarce
const HITTING_WEIGHTS = { R: 1.0, HR: 3.0, RBI: 2.0, SB: 2.5, AVG: 1.5 }
const PITCHING_WEIGHTS = { W: 2.0, K: 2.0, ERA: 3.0, WHIP: 3.0, SV: 2.5 }

function calculateVOR(playerStats = {}, position, leagueSize = 12) {
  if (!playerStats || Object.keys(playerStats).length === 0) return 0

  const pos = String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
  const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P'
  const scarcity = getPositionalScarcity(pos, leagueSize)
  const baseline = scarcity.replacementLevel

  let rawScore = 0
  let totalWeight = 0

  if (!isPitcher) {
    const weights = HITTING_WEIGHTS
    for (const [stat, weight] of Object.entries(weights)) {
      const pVal = parseFloat(playerStats[stat])
      const bVal = parseFloat(baseline[stat])
      if (isNaN(pVal) || isNaN(bVal) || bVal === 0) continue
      const delta = (pVal - bVal) / Math.max(Math.abs(bVal), 1)
      rawScore += delta * weight
      totalWeight += weight
    }
  } else {
    const weights = PITCHING_WEIGHTS
    for (const [stat, weight] of Object.entries(weights)) {
      const pVal = parseFloat(playerStats[stat])
      const bVal = parseFloat(baseline[stat])
      if (isNaN(pVal) || isNaN(bVal) || bVal === 0) continue
      // ERA and WHIP: lower is better, so invert the delta
      const lowerBetter = stat === 'ERA' || stat === 'WHIP'
      const delta = lowerBetter
        ? (bVal - pVal) / Math.max(Math.abs(bVal), 0.01)
        : (pVal - bVal) / Math.max(Math.abs(bVal), 1)
      rawScore += delta * weight
      totalWeight += weight
    }
  }

  if (totalWeight === 0) return 50  // no data, neutral score

  // Apply positional scarcity multiplier (scarce positions get boosted)
  const scarcityMultiplier = { elite: 1.4, scarce: 1.25, moderate: 1.0, deep: 0.85, replacement: 0.7 }[scarcity.tier] || 1.0
  const normalized = (rawScore / totalWeight) * scarcityMultiplier

  // Normalize to 0-100 scale (clamp)
  return Math.min(100, Math.max(0, Math.round(50 + normalized * 25)))
}

// ─────────────────────────────────────────────────────────────────────────────
// D) SCHEDULE & MATCHUP INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────

// Approximate weekly game counts — most teams average 6.2 games/week.
// Pattern: typical team plays 6 or 7 games most weeks, occasionally 4-5.
// This is a reasonable approximation without live schedule data.
const BASE_WEEKLY_GAMES = 6

const TEAM_SCHEDULE_OFFDAYS = {
  // Teams with historically more off-days in certain stretches
  NYY: [4, 4, 5, 5], LAD: [4, 5], HOU: [4], // sample off-day weeks
}

function getWeeklyGameCount(teamAbbr, weekNumber) {
  const team = String(teamAbbr || '').toUpperCase()
  const offDayWeeks = TEAM_SCHEDULE_OFFDAYS[team] || []
  // If this week is in an off-day week, return 4-5; otherwise 6-7
  const isLightWeek = offDayWeeks.includes(weekNumber)
  const isHeavyWeek = weekNumber % 7 === 0  // doubleheader weeks occur periodically

  if (isLightWeek) return 4
  if (isHeavyWeek) return 7
  // Default: alternate 6 and 7
  return weekNumber % 3 === 0 ? 7 : 6
}

// Ballpark run-environment factors (>1.0 = hitter friendly)
const BALLPARK_FACTORS = {
  COL: 1.35, CIN: 1.18, TEX: 1.12, BOS: 1.10, PHI: 1.08, MIL: 1.06,
  ARI: 1.05, ATL: 1.04, NYY: 1.03, CHC: 1.02, PIT: 1.01, CLE: 1.00,
  STL: 0.99, DET: 0.98, MIN: 0.97, TOR: 0.97, BAL: 0.97, SEA: 0.96,
  MIA: 0.95, TB: 0.95, KC: 0.95, SD: 0.94, OAK: 0.94, SF: 0.93,
  LAD: 0.93, NYM: 0.92, WSH: 0.92, LAA: 0.91, HOU: 0.91, CWS: 0.90,
}

function streamingValue(pitcher = {}, opposingTeamStats = {}) {
  let score = 50  // neutral baseline

  // Opponent offensive quality (wOBA-based) — lower opp wOBA = better stream
  const oppWOBA = parseFloat(opposingTeamStats.wOBA || opposingTeamStats.avg || 0.315)
  if (oppWOBA < 0.300) score += 15
  else if (oppWOBA < 0.310) score += 8
  else if (oppWOBA > 0.330) score -= 10
  else if (oppWOBA > 0.320) score -= 5

  // Opponent K-rate — higher opp K% = better stream
  const oppKRate = parseFloat(opposingTeamStats.kRate || opposingTeamStats.k_pct || 0.22)
  if (oppKRate > 0.26) score += 12
  else if (oppKRate > 0.24) score += 6
  else if (oppKRate < 0.20) score -= 8
  else if (oppKRate < 0.18) score -= 14

  // Pitcher's recent K/9
  const kPer9 = parseFloat(pitcher.k9 || pitcher.k_per_9 || 8.0)
  if (kPer9 > 10) score += 12
  else if (kPer9 > 9) score += 6
  else if (kPer9 < 7) score -= 8

  // Ballpark factor
  const park = String(pitcher.home_park || pitcher.team || '').toUpperCase()
  const parkFactor = BALLPARK_FACTORS[park] || 1.0
  if (parkFactor < 0.94) score += 8
  else if (parkFactor < 0.97) score += 4
  else if (parkFactor > 1.10) score -= 10
  else if (parkFactor > 1.05) score -= 5

  // Recent ERA (last 3 starts)
  const recentERA = parseFloat(pitcher.recent_era || pitcher.era || 4.0)
  if (recentERA < 2.50) score += 15
  else if (recentERA < 3.50) score += 8
  else if (recentERA > 5.00) score -= 12
  else if (recentERA > 4.50) score -= 6

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    grade: score >= 75 ? 'Elite stream' : score >= 60 ? 'Good stream' : score >= 45 ? 'Neutral' : score >= 30 ? 'Risky' : 'Avoid',
    factors: { oppWOBA, oppKRate, kPer9, parkFactor, recentERA }
  }
}

// Platoon advantage multiplier (LHH vs RHP is a known edge)
const PLATOON_MATRIX = {
  'L-R': 1.12,  // LHH vs RHP — meaningful platoon advantage
  'R-L': 1.08,  // RHH vs LHP — smaller but real advantage
  'L-L': 0.93,  // LHH vs LHP — disadvantage
  'R-R': 0.95,  // RHH vs RHP — slight disadvantage
  'S-R': 1.06,  // switch hitter vs RHP (bats left) — moderate advantage
  'S-L': 1.05,  // switch hitter vs LHP (bats right) — moderate advantage
}

function platoonAdvantage(batterHand, pitcherHand) {
  const key = `${String(batterHand || 'R').toUpperCase()}-${String(pitcherHand || 'R').toUpperCase()}`
  const multiplier = PLATOON_MATRIX[key] || 1.0
  return {
    multiplier,
    advantage: multiplier >= 1.10 ? 'Strong' : multiplier >= 1.05 ? 'Moderate' : multiplier < 0.96 ? 'Disadvantage' : 'Neutral',
    description: PLATOON_MATRIX[key]
      ? `${batterHand}HH vs ${pitcherHand}HP: ${((multiplier - 1) * 100).toFixed(0)}% platoon ${multiplier >= 1 ? 'boost' : 'penalty'}`
      : 'No platoon data available'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// E) TRADE FAIRNESS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function evaluateTrade(giving = [], receiving = [], myRoster = [], leagueContext = {}) {
  const leagueSize = leagueContext.num_teams || 12

  // VOR score for each side
  const givingVOR = giving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize), 0)
  const receivingVOR = receiving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize), 0)

  // Positional scarcity weight for what I'm giving up vs receiving
  const givingScarcity = giving.reduce((sum, p) => {
    const s = getPositionalScarcity(p.position, leagueSize)
    return sum + s.urgencyScore
  }, 0)
  const receivingScarcity = receiving.reduce((sum, p) => {
    const s = getPositionalScarcity(p.position, leagueSize)
    return sum + s.urgencyScore
  }, 0)

  // Roster need bonus: am I filling a critical hole?
  const myPositions = myRoster.map(p => String(p.position || '').split('/')[0].toUpperCase())
  const rosterNeedBonus = receiving.reduce((bonus, p) => {
    const pos = String(p.position || '').split('/')[0].toUpperCase()
    const countAtPos = myPositions.filter(mp => mp === pos).length
    const scarcity = getPositionalScarcity(pos, leagueSize)
    if (countAtPos === 0 && scarcity.tier !== 'deep') return bonus + 15
    if (countAtPos === 0) return bonus + 8
    return bonus
  }, 0)

  // Sell high / buy low detection
  const sellHighFlags = giving.filter(p => {
    const babip = parseFloat(p.stats?.babip || p.babip || 0)
    const hrFb = parseFloat(p.stats?.hr_fb || p.hr_fb || 0)
    return (babip > 0.350) || (hrFb > 0.22)
  }).map(p => `${p.player_name || p.name} (unsustainable peripherals — sell high candidate)`)

  const buyLowFlags = receiving.filter(p => {
    const babip = parseFloat(p.stats?.babip || p.babip || 0)
    return babip > 0 && babip < 0.250
  }).map(p => `${p.player_name || p.name} (depressed BABIP — buy low candidate)`)

  // 2-for-1 roster spot consideration
  const countDelta = receiving.length - giving.length
  const rosterSpotValue = countDelta < 0 ? 10 : countDelta > 0 ? -8 : 0  // gaining a roster spot is good

  // Raw fairness score
  const vorDelta = receivingVOR - givingVOR
  const scarcityDelta = receivingScarcity - givingScarcity
  let score = (vorDelta * 0.6) + (scarcityDelta * 2) + rosterNeedBonus + rosterSpotValue

  // Clamp to -100 to +100
  score = Math.max(-100, Math.min(100, Math.round(score)))

  const verdict =
    score >= 60 ? 'smash accept' :
    score >= 20 ? 'accept' :
    score >= -15 ? 'fair' :
    score >= -45 ? 'decline' :
    'insulting'

  const reasoning = [
    `VOR delta: ${receivingVOR > givingVOR ? '+' : ''}${(receivingVOR - givingVOR).toFixed(0)} in your favor`,
    givingScarcity > receivingScarcity ? `You're giving up scarcer positional value` : `You're receiving scarcer positional value`,
    rosterNeedBonus > 0 ? `Filling a roster hole adds ${rosterNeedBonus} need-bonus points` : null,
    sellHighFlags.length ? `SELL HIGH: ${sellHighFlags.join('; ')}` : null,
    buyLowFlags.length ? `BUY LOW: ${buyLowFlags.join('; ')}` : null,
  ].filter(Boolean).join('. ')

  const counterOffer = score < -15 && receiving.length > 0
    ? `Counter: ask them to add a ${getPositionalScarcity(giving[0]?.position, leagueSize).tier}-tier player to balance the VOR gap`
    : score >= -15 && score < 20
      ? `Negotiate: request a bench depth upgrade to push this from fair to favorable`
      : ''

  return { score, verdict, reasoning, counterOffer, sellHighFlags, buyLowFlags }
}

// ─────────────────────────────────────────────────────────────────────────────
// F) WAIVER WIRE PRIORITY SCORING
// ─────────────────────────────────────────────────────────────────────────────

function scoreWaiverTarget(player = {}, myRoster = [], leagueSettings = {}) {
  let score = 30  // baseline

  const pos = String(player.position || '').split('/')[0].toUpperCase()
  const leagueSize = leagueSettings.num_teams || 12
  const scarcity = getPositionalScarcity(pos, leagueSize)
  const myPositions = myRoster.map(p => String(p.position || '').split('/')[0].toUpperCase())
  const countAtPos = myPositions.filter(p => p === pos).length
  const required = (leagueSettings.roster_slots || {})[pos] || 1

  // Positional need
  if (countAtPos < required) score += scarcity.urgencyScore * 3
  else if (countAtPos >= required) score -= 10

  // Recent performance vs career norms
  const recentAVG = parseFloat(player.recentStats?.['3'] || player.recent_avg || 0)
  const seasonAVG = parseFloat(player.seasonStats?.['3'] || player.season_avg || 0)
  if (recentAVG > 0 && seasonAVG > 0) {
    if (recentAVG > seasonAVG * 1.20) score += 15  // hot hitter
    else if (recentAVG < seasonAVG * 0.80) score -= 10  // cold, bad add
  }

  const recentERA = parseFloat(player.recentStats?.['26'] || player.recent_era || 0)
  const seasonERA = parseFloat(player.seasonStats?.['26'] || player.season_era || 0)
  if (recentERA > 0 && seasonERA > 0) {
    if (recentERA < seasonERA * 0.80) score += 15  // pitcher running hot
    else if (recentERA > seasonERA * 1.30) score -= 10
  }

  // Underlying metrics / regression flags
  const babip = parseFloat(player.babip || player.stats?.babip || 0)
  if (babip > 0) {
    if (babip > 0.360) score -= 12  // unsustainably hot, likely to regress
    else if (babip < 0.250) score += 12  // unlucky, likely to improve
  }
  const kPct = parseFloat(player.k_pct || player.stats?.k_pct || 0)
  if (kPct > 0 && kPct < 0.18) score += 8  // low K-rate = sustainable contact
  else if (kPct > 0.30) score -= 8

  // Schedule quality (games this week)
  const weekGames = getWeeklyGameCount(player.team, leagueSettings.current_week || 1)
  if (weekGames >= 7) score += 12
  else if (weekGames >= 6) score += 6
  else if (weekGames <= 4) score -= 8

  // Roster spot cost (who would I drop?)
  const benchDepth = myRoster.filter(p =>
    String(p.position || '').split('/')[0].toUpperCase() === pos
  ).length - required
  if (benchDepth > 1) score += 5  // easy to make room
  else if (benchDepth < 0) score -= 5  // would need to drop a starter

  score = Math.min(100, Math.max(0, Math.round(score)))

  return {
    score,
    priority: score >= 85 ? 'MUST ADD' : score >= 70 ? 'High priority' : score >= 50 ? 'Speculative add' : score >= 35 ? 'Monitor' : 'Pass',
    reasoning: `Positional need (${pos}: ${countAtPos}/${required}), schedule (${weekGames} games), ` +
      (babip > 0 ? `BABIP ${babip} ${babip > 0.360 ? '(regression risk)' : babip < 0.250 ? '(due for boost)' : '(normal)'}` : 'no BABIP data'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G) WEEKLY LINEUP OPTIMIZATION
// ─────────────────────────────────────────────────────────────────────────────

function optimizeLineup(roster = [], weekSchedule = {}, scoringType = 'Roto') {
  if (!roster || roster.length === 0) {
    return { starters: [], bench: [], reasoning: 'No roster provided.' }
  }

  const recommendations = roster.map(player => {
    const team = String(player.team || '').toUpperCase()
    const weekGames = weekSchedule[team] || getWeeklyGameCount(team, 1)
    const pos = String(player.position || '').split('/')[0].toUpperCase()
    const isPitcher = pos === 'SP' || pos === 'RP'

    // Hot/cold streak factor
    const recentAVG = parseFloat(player.recentStats?.['3'] || player.recent_avg || 0)
    const seasonAVG = parseFloat(player.seasonStats?.['3'] || player.season_avg || 0.250)
    const recentERA = parseFloat(player.recentStats?.['26'] || player.recent_era || 0)
    const seasonERA = parseFloat(player.seasonStats?.['26'] || player.season_era || 4.0)

    let startScore = weekGames * 10  // volume is king

    if (!isPitcher) {
      if (recentAVG > 0 && seasonAVG > 0) {
        startScore += ((recentAVG - seasonAVG) / seasonAVG) * 30
      }
    } else {
      if (recentERA > 0 && seasonERA > 0) {
        startScore += ((seasonERA - recentERA) / seasonERA) * 25  // lower ERA = better
      }
    }

    // Injury/rest risk — penalize players with recent IL stints (flag only)
    const onIL = player.injury_status === 'IL' || player.status === 'IL'
    if (onIL) startScore -= 50

    const confidence = startScore >= 70 ? 'High' : startScore >= 45 ? 'Medium' : 'Low'

    return {
      player_name: player.player_name || player.name,
      position: player.position,
      team: player.team,
      weekGames,
      startScore: Math.round(startScore),
      confidence,
      reasoning: `${weekGames} games this week. ` +
        (!isPitcher && recentAVG > 0 ? `Hitting ${recentAVG.toFixed(3)} recently (${recentAVG > seasonAVG ? 'hot' : 'cold'}). ` : '') +
        (isPitcher && recentERA > 0 ? `ERA ${recentERA.toFixed(2)} recently. ` : '') +
        (onIL ? 'ON IL — do not start.' : '')
    }
  })

  const sorted = recommendations.sort((a, b) => b.startScore - a.startScore)

  return {
    starters: sorted.filter(p => p.startScore >= 45 && !p.reasoning.includes('ON IL')).slice(0, 14),
    bench: sorted.filter(p => p.startScore < 45 || p.reasoning.includes('ON IL')),
    streamingTargets: sorted.filter(p => p.weekGames >= 7).slice(0, 3),
    reasoning: `Ranked ${roster.length} players by expected weekly value. Volume (games played) weighted most heavily.`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// H) DRAFT STRATEGY PROFILES
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_STRATEGIES = {
  'Stars & Scrubs': {
    description: 'Load elite talent in rounds 1-5, stream late positions from waivers all season.',
    roundTargets: {
      '1-3': 'Elite hitters only (Judge, Acuna, Betts tier). No pitching.',
      '4-6': '1-2 top aces (Cole, Verlander tier). One scarce position (C or SS).',
      '7-10': 'Fill roster spots with upside fliers — speed, saves.',
      '11-23': 'Streamable SPs, handcuff closers, bench depth.',
    },
    archetypes: ['Top-5 OF/1B', '2 elite SP', 'Elite C (if falls)', 'One elite SS'],
    risk: 'High — dependent on elite players staying healthy',
    reward: 'Dominant in power/speed categories when healthy',
    bestFor: 'Picks 1-4 in 12-team leagues',
  },
  'Balanced Build': {
    description: 'Spread value evenly across all categories, target mid-round ADP discounts.',
    roundTargets: {
      '1-3': 'Best player available regardless of position.',
      '4-7': 'Fill scarcest positions (C, SS). One SP.',
      '8-12': '2nd SP, UTIL fillers, emerging closers.',
      '13-23': 'Upside picks, saves streamers, bench.',
    },
    archetypes: ['Mid-tier elite', 'Value C (rounds 4-6)', 'Dual-eligible 2B/SS'],
    risk: 'Low — no category completely abandoned',
    reward: 'Consistent performer, hard to blow out in any category',
    bestFor: 'Picks 5-8, first-time managers',
  },
  'Zero-SP': {
    description: 'Avoid SP entirely until round 10+. Load up on elite hitting and saves.',
    roundTargets: {
      '1-5': 'All elite hitters. Best available regardless of position.',
      '6-9': 'Closers with elite saves upside. Fill C/SS needs.',
      '10-15': 'First SPs — target high-K streamers with safe floors.',
      '16-23': 'Streaming SPs. 2-start pitchers. Ratio stabilizers.',
    },
    archetypes: ['4 elite hitters', '2 closers early', 'Streaming SP from waivers'],
    risk: 'Medium — ERA/WHIP ratio categories will be rough early',
    reward: 'Dominant in R/HR/RBI/SB. Trade hitting surplus for pitching in-season.',
    bestFor: 'H2H leagues, experienced managers, picks 1-3',
  },
  'Ace Anchor': {
    description: 'Secure 2 elite aces early, build a rotation that anchors ERA/WHIP/K.',
    roundTargets: {
      '1-4': '2 top-5 SP (Burnes, Cole, Wheeler tier) + 1-2 elite hitters.',
      '5-8': 'Fill scarcest hitting positions (C, SS, 2B).',
      '9-14': '3rd SP, power bats, saves.',
      '15-23': 'Upside SP streamers. Saves. Speed.',
    },
    archetypes: ['2 sub-3.00 ERA aces', 'Elite SS or C', '2 power bats'],
    risk: 'High — elite SP are injury magnets. One trip to IL derails season.',
    reward: 'Dominant in all 5 pitching categories. Trade SP surplus for hitting.',
    bestFor: 'Roto leagues, picks 6-12',
  },
  'Category Punt': {
    description: 'Deliberately concede 1-2 weak categories to dominate the other 8-9.',
    roundTargets: {
      'Punt Saves': 'Zero RP in draft. Extra picks go to premium hitters and aces.',
      'Punt AVG': 'Draft all power — HR, RBI, R kings who hit .220-.240. Dominate counting stats.',
      'Punt SB': 'Ignore speed entirely. All picks go to premium power/AVG/pitching.',
      'Punt ERA/WHIP': 'Similar to Zero-SP. Load hitting, accept ratio damage.',
    },
    archetypes: ['Varies by punt choice', 'Must commit early and stay disciplined'],
    risk: 'High — requires disciplined execution all season, no panic saves chasing',
    reward: 'Can dominate 8 of 10 categories consistently if committed',
    bestFor: 'Experienced roto players. Not recommended for beginners.',
  },
}

function getDraftStrategy(draftPosition, numTeams = 12, scoringType = 'Roto') {
  const early = draftPosition <= 4
  const mid = draftPosition >= 5 && draftPosition <= 8
  const late = draftPosition >= 9

  const isH2H = scoringType.toLowerCase().includes('h2h')

  let recommended
  if (early && isH2H) recommended = 'Zero-SP'
  else if (early) recommended = 'Stars & Scrubs'
  else if (mid) recommended = 'Balanced Build'
  else recommended = 'Ace Anchor'  // late picks benefit from SP who fall

  return {
    recommended,
    strategy: DRAFT_STRATEGIES[recommended],
    alternatives: Object.entries(DRAFT_STRATEGIES)
      .filter(([name]) => name !== recommended)
      .map(([name, s]) => ({ name, bestFor: s.bestFor })),
    allStrategies: DRAFT_STRATEGIES,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROSTER ANALYSIS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function analyzeRosterStrengths(roster = [], leagueSize = 12) {
  const byPosition = {}
  const vorByPlayer = []

  roster.forEach(player => {
    const pos = String(player.position || '').split('/')[0].toUpperCase()
    if (!byPosition[pos]) byPosition[pos] = []
    const vor = calculateVOR(player.stats || {}, pos, leagueSize)
    byPosition[pos].push({ ...player, vor })
    vorByPlayer.push({ name: player.player_name || player.name, position: pos, vor })
  })

  // Identify surpluses (2+ players at same position) and voids (0 players)
  const surpluses = Object.entries(byPosition)
    .filter(([pos, players]) => players.length >= 2)
    .map(([pos, players]) => ({
      position: pos,
      count: players.length,
      players: players.map(p => p.player_name || p.name),
      scarcity: getPositionalScarcity(pos, leagueSize).tier,
    }))

  const voids = ['C', 'SS', '2B', '3B', 'SP'].filter(pos =>
    !byPosition[pos] || byPosition[pos].length === 0
  )

  // Sell high / buy low
  const sellHigh = vorByPlayer
    .filter(p => p.vor >= 70)
    .sort((a, b) => b.vor - a.vor)
    .slice(0, 3)
    .map(p => ({ ...p, reason: 'High VOR — trade from strength' }))

  const buyLow = vorByPlayer
    .filter(p => p.vor <= 35 && p.vor > 0)
    .sort((a, b) => a.vor - b.vor)
    .slice(0, 3)
    .map(p => ({ ...p, reason: 'Low VOR vs expected — buy low or cut' }))

  return { byPosition, surpluses, voids, sellHigh, buyLow, vorByPlayer }
}

// ─────────────────────────────────────────────────────────────────────────────
// I) BREAKOUT / REGRESSION DETECTOR
// Analyzes peripheral stats to flag unsustainable performance
// ─────────────────────────────────────────────────────────────────────────────

// League-average baselines for regression anchors (2023-2025 MLB averages)
const LEAGUE_AVG = {
  BABIP: 0.296, HR_FB: 0.128, LOB_PCT: 0.720,
  K_PCT: 0.224, BB_PCT: 0.086, AVG: 0.248,
  ERA: 4.08, WHIP: 1.27, K9: 8.6, BB9: 3.3,
}

function detectBreakoutRegression(playerStats = {}, type = 'hitter') {
  const flags = []
  let breakoutScore = 0  // positive = breakout candidate, negative = regression risk

  if (type === 'hitter') {
    const babip = parseFloat(playerStats.BABIP || playerStats.babip || 0)
    const avg = parseFloat(playerStats.AVG || playerStats.avg || 0)
    const kPct = playerStats.K && playerStats.PA ? playerStats.K / playerStats.PA : 0
    const bbPct = playerStats.BB && playerStats.PA ? playerStats.BB / playerStats.PA : 0
    const hrRate = playerStats.HR && playerStats.AB ? playerStats.HR / playerStats.AB : 0
    const isoP = parseFloat(playerStats.SLG || 0) - parseFloat(playerStats.AVG || 0)

    // BABIP regression (most powerful indicator)
    if (babip > 0) {
      if (babip > 0.360) {
        flags.push({ stat: 'BABIP', value: babip, verdict: 'REGRESSION RISK', note: `BABIP ${babip.toFixed(3)} is far above league avg (.296). AVG likely to drop.` })
        breakoutScore -= 20
      } else if (babip < 0.250) {
        flags.push({ stat: 'BABIP', value: babip, verdict: 'BREAKOUT CANDIDATE', note: `BABIP ${babip.toFixed(3)} is well below normal. Due for AVG boost.` })
        breakoutScore += 20
      }
    }

    // K-rate quality
    if (kPct > 0) {
      if (kPct < 0.15) {
        flags.push({ stat: 'K%', value: kPct, verdict: 'ELITE CONTACT', note: `${(kPct * 100).toFixed(1)}% K-rate. Elite contact profile — sustains AVG.` })
        breakoutScore += 10
      } else if (kPct > 0.30) {
        flags.push({ stat: 'K%', value: kPct, verdict: 'HIGH K-RATE', note: `${(kPct * 100).toFixed(1)}% K-rate. Volatile AVG, needs power to compensate.` })
        breakoutScore -= 10
      }
    }

    // Walk rate (plate discipline)
    if (bbPct > 0) {
      if (bbPct > 0.12) {
        flags.push({ stat: 'BB%', value: bbPct, verdict: 'ELITE DISCIPLINE', note: `${(bbPct * 100).toFixed(1)}% walk rate. High OBP floor.` })
        breakoutScore += 8
      }
    }

    // Power sustainability (ISO Power)
    if (isoP > 0.250) {
      flags.push({ stat: 'ISO', value: isoP, verdict: 'ELITE POWER', note: `ISO ${isoP.toFixed(3)} indicates legit 35+ HR power.` })
      breakoutScore += 12
    } else if (isoP > 0 && isoP < 0.100) {
      flags.push({ stat: 'ISO', value: isoP, verdict: 'NO POWER', note: `ISO ${isoP.toFixed(3)}. Batter provides no power upside.` })
      breakoutScore -= 5
    }

    // Speed profile
    const sbRate = playerStats.SB && playerStats.G ? playerStats.SB / playerStats.G : 0
    if (sbRate > 0.20) {
      flags.push({ stat: 'Speed', value: sbRate, verdict: 'ELITE SPEED', note: `${playerStats.SB} SB in ${playerStats.G} games. Premium stolen base contributor.` })
      breakoutScore += 10
    }

  } else {
    // Pitcher analysis
    const era = parseFloat(playerStats.ERA || playerStats.era || 0)
    const whip = parseFloat(playerStats.WHIP || playerStats.whip || 0)
    const k9 = parseFloat(playerStats.K9 || playerStats.k9 || 0)
    const bb9 = parseFloat(playerStats.BB9 || playerStats.bb9 || 0)
    const kbb = k9 && bb9 ? k9 / bb9 : 0

    // ERA sustainability
    if (era > 0 && era < 2.50) {
      flags.push({ stat: 'ERA', value: era, verdict: 'REGRESSION RISK', note: `Sub-2.50 ERA (${era.toFixed(2)}) is extremely hard to sustain. Expect regression toward 3.00+.` })
      breakoutScore -= 10
    } else if (era > 5.00) {
      flags.push({ stat: 'ERA', value: era, verdict: 'BREAKOUT CANDIDATE', note: `ERA ${era.toFixed(2)} may be inflated by bad luck. Check K/BB ratio.` })
      breakoutScore += 5
    }

    // Strikeout dominance
    if (k9 > 10.5) {
      flags.push({ stat: 'K/9', value: k9, verdict: 'ELITE STRIKEOUTS', note: `K/9 of ${k9.toFixed(1)} is elite. High K-rate pitchers are most stable.` })
      breakoutScore += 15
    }

    // K/BB ratio (best single pitching predictor)
    if (kbb > 4.0) {
      flags.push({ stat: 'K/BB', value: kbb, verdict: 'ELITE COMMAND', note: `K/BB ratio ${kbb.toFixed(1)} is elite tier. High floor pitcher.` })
      breakoutScore += 15
    } else if (kbb > 0 && kbb < 1.5) {
      flags.push({ stat: 'K/BB', value: kbb, verdict: 'POOR COMMAND', note: `K/BB ratio ${kbb.toFixed(1)} is dangerously low. Blowup risk.` })
      breakoutScore -= 20
    }
  }

  const verdict = breakoutScore >= 20 ? 'STRONG BREAKOUT CANDIDATE' :
    breakoutScore >= 10 ? 'MILD BREAKOUT CANDIDATE' :
    breakoutScore <= -20 ? 'HIGH REGRESSION RISK' :
    breakoutScore <= -10 ? 'MODERATE REGRESSION RISK' :
    'SUSTAINABLE PROFILE'

  return { flags, breakoutScore, verdict }
}

// ─────────────────────────────────────────────────────────────────────────────
// J) YEAR-OVER-YEAR TREND ANALYSIS
// Compares 2-3 seasons of stats to classify player trajectory
// ─────────────────────────────────────────────────────────────────────────────

function analyzeYoYTrend(multiSeasonData = {}) {
  const seasons = Object.keys(multiSeasonData).sort()
  if (seasons.length < 2) return { trend: 'INSUFFICIENT DATA', details: [] }

  const details = []
  const trends = {}

  // Compare key stats across seasons
  const hittingKeys = [
    { key: 'runs', label: 'R' }, { key: 'homeRuns', label: 'HR' },
    { key: 'rbi', label: 'RBI' }, { key: 'stolenBases', label: 'SB' },
    { key: 'avg', label: 'AVG', isRate: true },
  ]
  const pitchingKeys = [
    { key: 'wins', label: 'W' }, { key: 'strikeOuts', label: 'K' },
    { key: 'era', label: 'ERA', isRate: true, lowerBetter: true },
    { key: 'whip', label: 'WHIP', isRate: true, lowerBetter: true },
    { key: 'saves', label: 'SV' },
  ]

  // Detect if pitcher or hitter by checking first season
  const firstSeason = multiSeasonData[seasons[0]]
  const isPitcher = firstSeason.era !== undefined || firstSeason.wins !== undefined
  const statKeys = isPitcher ? pitchingKeys : hittingKeys

  statKeys.forEach(({ key, label, isRate, lowerBetter }) => {
    const values = seasons.map(s => parseFloat(multiSeasonData[s]?.[key] || 0)).filter(v => v > 0)
    if (values.length < 2) return

    // Per-game normalization for counting stats
    const normalized = values.map((v, i) => {
      if (isRate) return v
      const games = parseFloat(multiSeasonData[seasons[i]]?.gamesPlayed || multiSeasonData[seasons[i]]?.gamesPitched || 150)
      return games > 0 ? (v / games) * 150 : v  // normalize to 150-game pace
    })

    const first = normalized[0]
    const last = normalized[normalized.length - 1]
    const pctChange = first > 0 ? ((last - first) / first) * 100 : 0
    const direction = lowerBetter ? (pctChange < 0 ? 'improving' : 'declining') : (pctChange > 0 ? 'improving' : 'declining')

    trends[label] = {
      values: seasons.map((s, i) => ({ season: s, raw: values[i], normalized: normalized[i] })),
      pctChange: Math.round(pctChange),
      direction,
    }

    if (Math.abs(pctChange) > 15) {
      details.push(`${label}: ${direction === 'improving' ? '📈' : '📉'} ${direction} ${Math.abs(Math.round(pctChange))}% over ${seasons.length} seasons`)
    }
  })

  // Overall trajectory
  const improvingCount = Object.values(trends).filter(t => t.direction === 'improving').length
  const decliningCount = Object.values(trends).filter(t => t.direction === 'declining').length

  const trend = improvingCount >= 3 ? 'ASCENDING' :
    decliningCount >= 3 ? 'DECLINING' :
    improvingCount >= 2 && decliningCount <= 1 ? 'RISING' :
    decliningCount >= 2 && improvingCount <= 1 ? 'FADING' :
    'STABLE'

  return { trend, details, trends }
}

// ─────────────────────────────────────────────────────────────────────────────
// K) AGE CURVE MODELING
// Maps player age to expected production trajectory
// ─────────────────────────────────────────────────────────────────────────────

const AGE_CURVES = {
  power:  { peakStart: 26, peakEnd: 30, declineAge: 32, falloffRate: 0.04 },
  speed:  { peakStart: 24, peakEnd: 28, declineAge: 30, falloffRate: 0.08 },
  contact:{ peakStart: 26, peakEnd: 32, declineAge: 34, falloffRate: 0.03 },
  SP:     { peakStart: 26, peakEnd: 31, declineAge: 33, falloffRate: 0.05 },
  RP:     { peakStart: 27, peakEnd: 33, declineAge: 35, falloffRate: 0.03 },
}

function ageCurveAnalysis(age, position, playerProfile = {}) {
  const pos = String(position || '').toUpperCase()
  const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P'

  // Determine which curve to use
  const curves = isPitcher
    ? [AGE_CURVES[pos === 'RP' ? 'RP' : 'SP']]
    : [
        { ...AGE_CURVES.power, label: 'Power', weight: playerProfile.powerHeavy ? 0.6 : 0.3 },
        { ...AGE_CURVES.speed, label: 'Speed', weight: playerProfile.speedHeavy ? 0.6 : 0.2 },
        { ...AGE_CURVES.contact, label: 'Contact', weight: 0.3 },
      ]

  const analysis = {
    age,
    phase: 'unknown',
    projectionMultiplier: 1.0,
    notes: [],
  }

  // Weighted phase calculation for hitters
  if (!isPitcher) {
    let weightedMult = 0
    let totalWeight = 0
    curves.forEach(c => {
      const w = c.weight || 0.33
      let mult = 1.0
      if (age < c.peakStart) {
        mult = 0.85 + (age - 21) * 0.03  // ascending
      } else if (age >= c.peakStart && age <= c.peakEnd) {
        mult = 1.0  // peak
      } else if (age > c.peakEnd && age <= c.declineAge) {
        mult = 1.0 - (age - c.peakEnd) * (c.falloffRate / 2)  // early decline
      } else {
        mult = 1.0 - (c.peakEnd - c.peakStart) * (c.falloffRate / 2) - (age - c.declineAge) * c.falloffRate
      }
      weightedMult += mult * w
      totalWeight += w
    })
    analysis.projectionMultiplier = Math.max(0.5, Math.min(1.15, weightedMult / totalWeight))
  } else {
    const curve = curves[0]
    if (age < curve.peakStart) {
      analysis.projectionMultiplier = 0.90 + (age - 22) * 0.025
    } else if (age >= curve.peakStart && age <= curve.peakEnd) {
      analysis.projectionMultiplier = 1.0
    } else if (age > curve.declineAge) {
      analysis.projectionMultiplier = Math.max(0.6, 1.0 - (age - curve.declineAge) * curve.falloffRate)
    } else {
      analysis.projectionMultiplier = Math.max(0.8, 1.0 - (age - curve.peakEnd) * (curve.falloffRate / 2))
    }
  }

  // Determine phase label
  if (age < 25) analysis.phase = 'PRE-PEAK (upside play)'
  else if (analysis.projectionMultiplier >= 0.98) analysis.phase = 'PEAK YEARS'
  else if (analysis.projectionMultiplier >= 0.88) analysis.phase = 'EARLY DECLINE'
  else if (analysis.projectionMultiplier >= 0.75) analysis.phase = 'DECLINING'
  else analysis.phase = 'LATE CAREER'

  // Draft/trade implications
  if (age <= 25) {
    analysis.notes.push('Young player with upside — project improvement over current stats.')
    analysis.notes.push('Higher trade value than current production suggests.')
  } else if (age >= 33 && !isPitcher) {
    analysis.notes.push('Speed will decline fastest. Discount SB projections 20-40%.')
    analysis.notes.push('Injury risk increases significantly. Consider a backup plan.')
  } else if (age >= 34 && isPitcher) {
    analysis.notes.push('Velocity decline expected. K-rate may drop.')
    analysis.notes.push('Workload management — fewer innings likely.')
  }

  return analysis
}

// ─────────────────────────────────────────────────────────────────────────────
// L) CATEGORY CONTRIBUTION PROFILER
// Tells you exactly what % of your stat budget each player fills
// ─────────────────────────────────────────────────────────────────────────────

// Target season totals for a competitive 12-team H2H fantasy team
const TEAM_TARGETS = {
  R: 850, HR: 220, RBI: 820, SB: 110, AVG: 0.262,
  W: 75, SV: 65, K: 1200, ERA: 3.60, WHIP: 1.20,
}

function profileCategoryContribution(playerStats = {}, type = 'hitter') {
  const profile = {}

  if (type === 'hitter') {
    const cats = ['R', 'HR', 'RBI', 'SB']
    cats.forEach(cat => {
      const val = parseFloat(playerStats[cat] || 0)
      const target = TEAM_TARGETS[cat]
      profile[cat] = {
        value: val,
        pctOfTarget: target > 0 ? Math.round((val / target) * 100) : 0,
        grade: val / target > 0.12 ? 'A' : val / target > 0.08 ? 'B' : val / target > 0.05 ? 'C' : 'D',
      }
    })

    // AVG impact (weighted by ABs)
    const avg = parseFloat(playerStats.AVG || 0)
    const ab = parseInt(playerStats.AB || 0)
    profile.AVG = {
      value: avg,
      ab,
      impact: avg > 0.300 ? 'BOOSTS team AVG' : avg > 0.270 ? 'HELPS team AVG' : avg > 0.245 ? 'NEUTRAL' : 'DRAGS team AVG',
      grade: avg > 0.300 ? 'A' : avg > 0.270 ? 'B' : avg > 0.245 ? 'C' : 'D',
    }
  } else {
    profile.W = { value: playerStats.W || 0, pctOfTarget: Math.round(((playerStats.W || 0) / TEAM_TARGETS.W) * 100), grade: (playerStats.W || 0) > 12 ? 'A' : (playerStats.W || 0) > 8 ? 'B' : 'C' }
    profile.SV = { value: playerStats.SV || 0, pctOfTarget: Math.round(((playerStats.SV || 0) / TEAM_TARGETS.SV) * 100), grade: (playerStats.SV || 0) > 25 ? 'A' : (playerStats.SV || 0) > 10 ? 'B' : 'C' }
    profile.K = { value: playerStats.K || 0, pctOfTarget: Math.round(((playerStats.K || 0) / TEAM_TARGETS.K) * 100), grade: (playerStats.K || 0) > 180 ? 'A' : (playerStats.K || 0) > 130 ? 'B' : 'C' }

    const era = parseFloat(playerStats.ERA || 0)
    profile.ERA = { value: era, impact: era < 3.00 ? 'ANCHOR' : era < 3.60 ? 'HELPS' : era < 4.20 ? 'NEUTRAL' : 'HURTS', grade: era < 3.00 ? 'A' : era < 3.60 ? 'B' : era < 4.20 ? 'C' : 'D' }

    const whip = parseFloat(playerStats.WHIP || 0)
    profile.WHIP = { value: whip, impact: whip < 1.05 ? 'ANCHOR' : whip < 1.20 ? 'HELPS' : whip < 1.35 ? 'NEUTRAL' : 'HURTS', grade: whip < 1.05 ? 'A' : whip < 1.20 ? 'B' : whip < 1.35 ? 'C' : 'D' }
  }

  // Overall contributor grade
  const grades = Object.values(profile).map(p => p.grade)
  const gradeScore = grades.reduce((sum, g) => sum + ({ A: 4, B: 3, C: 2, D: 1 }[g] || 0), 0)
  const overallGrade = gradeScore / grades.length >= 3.5 ? 'A' : gradeScore / grades.length >= 2.5 ? 'B' : gradeScore / grades.length >= 1.5 ? 'C' : 'D'

  return { categories: profile, overallGrade, type }
}

// ─────────────────────────────────────────────────────────────────────────────
// M) COMPREHENSIVE PLAYER INTELLIGENCE REPORT
// Combines all analysis into one structured report for Claude
// ─────────────────────────────────────────────────────────────────────────────

function generatePlayerIntelligence(playerData = {}) {
  const { stats, age, position, type } = playerData
  if (!stats) return null

  const isHitter = type === 'hitter' || !['SP', 'RP', 'P'].includes(String(position).toUpperCase())

  const breakout = detectBreakoutRegression(stats, isHitter ? 'hitter' : 'pitcher')
  const ageCurve = ageCurveAnalysis(age || 28, position)
  const contribution = profileCategoryContribution(stats, isHitter ? 'hitter' : 'pitcher')

  return {
    breakout,
    ageCurve,
    contribution,
    summary: [
      `${breakout.verdict} (score: ${breakout.breakoutScore})`,
      `Age ${age}: ${ageCurve.phase} (projection multiplier: ${ageCurve.projectionMultiplier.toFixed(2)}x)`,
      `Category grade: ${contribution.overallGrade}`,
      ...breakout.flags.map(f => `${f.stat}: ${f.verdict}`),
      ...ageCurve.notes,
    ].join(' | '),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // A) Positional scarcity
  getPositionalScarcity,
  POSITIONAL_DATA,

  // B) Category strategy
  analyzeCategories,

  // C) VOR
  calculateVOR,

  // D) Schedule/matchup
  getWeeklyGameCount,
  streamingValue,
  platoonAdvantage,
  BALLPARK_FACTORS,

  // E) Trade engine
  evaluateTrade,

  // F) Waiver scoring
  scoreWaiverTarget,

  // G) Lineup optimization
  optimizeLineup,

  // H) Draft strategies
  getDraftStrategy,
  DRAFT_STRATEGIES,

  // Roster analysis
  analyzeRosterStrengths,

  // I) Breakout/Regression detection
  detectBreakoutRegression,
  LEAGUE_AVG,

  // J) Year-over-year trends
  analyzeYoYTrend,

  // K) Age curve modeling
  ageCurveAnalysis,
  AGE_CURVES,

  // L) Category contribution profiling
  profileCategoryContribution,
  TEAM_TARGETS,

  // M) Combined intelligence report
  generatePlayerIntelligence,
}

