/**
 * fantasyBrain.js — Expert fantasy baseball logic engine
 * Pure computation — no Claude calls. Feeds structured intelligence into AI prompts.
 *
 * Three scoring formats are handled distinctly:
 *   ROTO          — Season-long category accumulation. Protect ratios, accumulate counting stats.
 *   H2H_CAT       — Weekly head-to-head category matchups. Win 6+ of 10 cats to win.
 *   H2H_POINTS    — Weekly total points. Maximize volume (ABs, IP, 2-start SPs).
 */

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL FORMAT DETECTOR — One function, used everywhere
// Yahoo sends: 'head', 'headpoint', 'headone', 'roto', etc.
// ─────────────────────────────────────────────────────────────────────────────
const FORMAT = { ROTO: 'ROTO', H2H_CAT: 'H2H_CAT', H2H_POINTS: 'H2H_POINTS' }

function detectFormat(scoringType) {
  const raw = String(scoringType || '').toLowerCase().trim()
  if (raw.includes('headpoint') || raw.includes('head_point') || raw === 'h2h_points' || raw === 'points') return FORMAT.H2H_POINTS
  if (raw.includes('head') || raw === 'h2h' || raw === 'h2h_cat' || raw === 'h2h_categories') return FORMAT.H2H_CAT
  return FORMAT.ROTO  // default: roto / everything else
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED POINTS CALCULATOR — Single source of truth for raw-points math
// Used by: calculateVOR (Points mode), analyzeCategories, profilePointsContribution
// ─────────────────────────────────────────────────────────────────────────────
const HITTING_PTS = { R: 1.9, '1B': 2.6, '2B': 5.2, '3B': 7.8, HR: 10.4, RBI: 1.9, SB: 4.2, BB: 2.6, HBP: 2.6 }
const PITCHING_PTS = { W: 8, SV: 8, OUT: 1, HA: -1.3, ER: -3, BBA: -1.3, HBPA: -1.3, K: 3 }

/**
 * Compute raw fantasy points for a player. Works with both Yahoo stat-ID keys
 * and human-readable stat names.
 * @param {Object} stats - player's stats object
 * @param {boolean} isPitcher - true if SP/RP
 * @param {Object} [statMapping] - optional league-specific stat ID mapping
 * @returns {number} raw season fantasy points
 */
function computePlayerPoints(stats = {}, isPitcher = false, statMapping = null) {
  // Helper: look up a stat by name, then by Yahoo numeric IDs
  const get = (name, ...ids) => {
    if (statMapping && statMapping[name]) {
      const v = stats[statMapping[name]]
      if (v !== undefined && v !== '-' && v !== '') return parseFloat(v) || 0
    }
    if (stats[name] !== undefined && stats[name] !== '-' && stats[name] !== '') return parseFloat(stats[name]) || 0
    for (const id of ids) {
      if (stats[id] !== undefined && stats[id] !== '-' && stats[id] !== '') return parseFloat(stats[id]) || 0
    }
    return 0
  }

  let pts = 0
  if (!isPitcher) {
    const hits = get('H', '4')
    const doubles = get('2B', '5', '10')
    const triples = get('3B', '6', '11')
    const hrs = get('HR', '12')
    const singles = get('1B', '9') || Math.max(0, hits - doubles - triples - hrs)
    pts += get('R', '7', '60')   * HITTING_PTS.R
    pts += singles               * HITTING_PTS['1B']
    pts += doubles               * HITTING_PTS['2B']
    pts += triples               * HITTING_PTS['3B']
    pts += hrs                   * HITTING_PTS.HR
    pts += get('RBI', '13')      * HITTING_PTS.RBI
    pts += get('SB', '16', '23') * HITTING_PTS.SB
    pts += get('BB', '18', '26') * HITTING_PTS.BB
    pts += get('HBP', '20', '51')* HITTING_PTS.HBP
  } else {
    const ip = get('IP', '50')
    const outs = Math.floor(ip) * 3 + Math.round((ip % 1) * 10)
    pts += get('W', '28')        * PITCHING_PTS.W
    pts += get('SV', '32')       * PITCHING_PTS.SV
    pts += outs                  * PITCHING_PTS.OUT
    pts += get('HA', '43')       * PITCHING_PTS.HA
    pts += get('ER', '47')       * PITCHING_PTS.ER
    pts += get('BBA', '46')      * PITCHING_PTS.BBA
    pts += get('HBPA', '57')     * PITCHING_PTS.HBPA
    pts += get('K', '42')        * PITCHING_PTS.K
  }
  return pts
}

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
// B) CATEGORY / POINTS STRATEGY ENGINE — now 3-format aware
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CATS = ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']

/**
 * @param {Object} myStats - aggregated team stats
 * @param {Array}  leagueStandings - opponent or league data
 * @param {string} scoringType - raw Yahoo scoring_type string
 * @param {Array}  [leagueStatCategories] - actual stat category names from league settings
 */
function analyzeCategories(myStats = {}, leagueStandings = [], scoringType = 'Points', leagueStatCategories = null) {
  const result = { topPerformers: [], weaknesses: [], advice: '', format: '' }
  const fmt = detectFormat(scoringType)
  result.format = fmt

  // Use actual league categories if provided, otherwise defaults
  const cats = (leagueStatCategories && leagueStatCategories.length > 0)
    ? leagueStatCategories
    : DEFAULT_CATS

  if (fmt === FORMAT.H2H_POINTS) {
    // ── H2H POINTS: volume is everything ─────────────────────────────
    const myPts = computePlayerPoints(myStats, false) + computePlayerPoints(myStats, true)
    const oppRaw = leagueStandings[0]?.stats || leagueStandings[0] || {}
    const oppPts = computePlayerPoints(oppRaw, false) + computePlayerPoints(oppRaw, true)

    if (myPts > 0 || oppPts > 0) {
      const margin = myPts - oppPts
      result.advice = `H2H POINTS: Maximize volume — 2-start SPs are gold, 7-game hitters are mandatory starts. Projected margin: ${margin > 0 ? '+' : ''}${margin.toFixed(1)} pts. Never punt categories — every point counts. Avoid negative-point risks (high ER/Hits allowed pitchers).`
    } else {
      result.advice = 'H2H POINTS: Maximize plate appearances and SP innings. Start every eligible player. Do NOT leave lineup slots empty. Bench only IL players.'
    }
    return result
  }

  // ── ROTO or H2H CATEGORIES: need per-category analysis ─────────────
  const oppRaw = leagueStandings[0]?.stats || leagueStandings[0] || {}
  const inverseCats = ['ERA', 'WHIP', 'BB9', 'BBA', 'L'] // lower = better

  cats.forEach(c => {
    const catName = String(c).toUpperCase().trim()
    const myVal = parseFloat(myStats[catName] || myStats[c] || 0)
    const oppVal = parseFloat(oppRaw[catName] || oppRaw[c] || 0)
    const isInverse = inverseCats.includes(catName)

    if (myVal === 0 && oppVal === 0) return
    const iWin = isInverse ? myVal < oppVal : myVal > oppVal
    if (iWin) result.topPerformers.push(catName)
    else if (myVal !== oppVal) result.weaknesses.push(catName)
  })

  if (fmt === FORMAT.ROTO) {
    result.advice = `ROTO: This is a marathon, not a sprint. Protect ratios (ERA/WHIP/AVG) all season — one bad streamer can damage months of work. Stream counting stats (${result.weaknesses.slice(0, 2).join('/') || 'SB/Saves'}) only with safe-floor pitchers. Never punt a category entirely.`
  } else {
    // H2H_CAT
    const totalCats = cats.length || 10
    const winTarget = Math.ceil(totalCats / 2) + 1
    result.advice = `H2H CATEGORIES (${totalCats} cats): You need to win ${winTarget}+ categories this week. Swing categories: ${result.weaknesses.slice(0, 3).join(', ') || 'TBD'}. Target waiver adds and streaming specifically aimed at flipping those weak cats. Safe to punt 1-2 hopeless cats and load up on the rest.`
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// C) VALUE OVER REPLACEMENT (VOR) CALCULATOR — Unified, 3-format aware
// Uses shared computePlayerPoints() for Points mode. SGP for Categories/Roto.
// Both outputs are normalized to the same 0-150+ scale.
// ─────────────────────────────────────────────────────────────────────────────

// SGP denominators for 12-team 5x5 Roto/Categories
const SGP_DENOMINATORS = {
  HR: 6.5, R: 25, RBI: 25, SB: 6, AVG_BASELINE: 0.252,
  W: 5.5, SV: 6.5, K: 40, ERA_BASELINE: 4.00, WHIP_BASELINE: 1.30
}

function calculateVOR(playerStats = {}, position, leagueSize = 12, scoringType = 'Points', statMapping = null) {
  if (!playerStats || Object.keys(playerStats).length === 0) return 0

  const pos = String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
  const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P'
  const fmt = detectFormat(scoringType)

  if (fmt === FORMAT.H2H_POINTS) {
    // ── H2H POINTS: raw fantasy points / normalizer ────────────────────
    const rawPts = computePlayerPoints(playerStats, isPitcher, statMapping)
    if (rawPts <= 0) return 0
    return Math.round(Math.max(0, rawPts / 5))
  }

  // ── ROTO or H2H CATEGORIES: SGP-based VOR ────────────────────────────
  // Helper macro to fetch stats securely
  const getStat = (statName, ...fallbackKeys) => {
    if (statMapping && statMapping[statName]) {
      const v = playerStats[statMapping[statName]]
      if (v !== undefined && v !== '-' && v !== '') return parseFloat(v) || 0
    }
    if (playerStats[statName] !== undefined && playerStats[statName] !== '-' && playerStats[statName] !== '') return parseFloat(playerStats[statName]) || 0
    for (const k of fallbackKeys) {
      if (playerStats[k] !== undefined && playerStats[k] !== '-' && playerStats[k] !== '') return parseFloat(playerStats[k]) || 0
    }
    return 0
  }

  let sgpTotal = 0
  if (!isPitcher) {
    sgpTotal += getStat('R', '7', '60')   / SGP_DENOMINATORS.R
    sgpTotal += getStat('HR', '12')        / SGP_DENOMINATORS.HR
    sgpTotal += getStat('RBI', '13')       / SGP_DENOMINATORS.RBI
    sgpTotal += getStat('SB', '16', '23')  / SGP_DENOMINATORS.SB
    const ab = getStat('AB', '2', '5')
    const avg = getStat('AVG', '3')
    if (ab > 0) {
      sgpTotal += ((avg - SGP_DENOMINATORS.AVG_BASELINE) * Math.min(ab, 150)) / 15
    }
  } else {
    sgpTotal += getStat('W', '28')  / SGP_DENOMINATORS.W
    sgpTotal += getStat('SV', '32') / SGP_DENOMINATORS.SV
    sgpTotal += getStat('K', '42')  / SGP_DENOMINATORS.K
    const ip = getStat('IP', '50')
    const era = getStat('ERA', '26') || SGP_DENOMINATORS.ERA_BASELINE
    const whip = getStat('WHIP', '27') || SGP_DENOMINATORS.WHIP_BASELINE
    if (ip > 0) {
      sgpTotal += ((SGP_DENOMINATORS.ERA_BASELINE - era) * Math.min(ip, 50)) / 20
      sgpTotal += ((SGP_DENOMINATORS.WHIP_BASELINE - whip) * Math.min(ip, 50)) / 5
    }
  }

  // H2H_CAT gets a schedule-volume bonus — more games = more chances to win counting cats
  if (fmt === FORMAT.H2H_CAT && !isPitcher) {
    sgpTotal *= 1.1  // slight volume premium for H2H weekly matchups
  }

  // Normalize SGP to the same VOR scale as Points mode (~0-150+)
  // SGP of 10 ≈ elite player → VOR ~80. SGP of 5 ≈ solid → VOR ~50.
  if (sgpTotal <= -10) return 0
  return Math.round(Math.max(0, (sgpTotal + 2) * 7))
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

function streamingValue(pitcher = {}, opposingTeamStats = {}, scoringType = 'Points') {
  let score = 50  // neutral baseline
  const fmt = detectFormat(scoringType)
  const isPoints = fmt === FORMAT.H2H_POINTS;

  // Opponent offensive quality
  const oppWOBA = parseFloat(opposingTeamStats.wOBA || opposingTeamStats.avg || 0.315)
  if (oppWOBA < 0.300) score += 15
  else if (oppWOBA < 0.310) score += 8
  else if (oppWOBA > 0.330) score -= 15
  else if (oppWOBA > 0.320) score -= 8

  // Pitcher's recent K/9
  const kPer9 = parseFloat(pitcher.k9 || pitcher.k_per_9 || 8.0)
  if (kPer9 > 10) score += 15
  else if (kPer9 > 9) score += 8
  else if (kPer9 < 7) score -= 10

  // Ballpark factor
  const park = String(pitcher.home_park || pitcher.team || '').toUpperCase()
  const parkFactor = BALLPARK_FACTORS[park] || 1.0
  if (parkFactor < 0.94) score += 8
  else if (parkFactor < 0.97) score += 4
  else if (parkFactor > 1.10) score -= 10
  else if (parkFactor > 1.05) score -= 5

  if (isPoints) {
    // POINTS FORMAT: Volume and Ks are heavily rewarded. Avoid high K opponents for safety.
    const oppKRate = parseFloat(opposingTeamStats.kRate || opposingTeamStats.k_pct || 0.22)
    if (oppKRate > 0.26) score += 20 // Huge boost in points
    else if (oppKRate > 0.24) score += 10
    else if (oppKRate < 0.20) score -= 10
    else if (oppKRate < 0.18) score -= 18 // Low Ks = low points ceiling

    // Pitcher innings depth (more outs = more points)
    const avgIP = parseFloat(pitcher.ip_per_start || pitcher.avg_ip || 5.0)
    if (avgIP >= 6.0) score += 15
    else if (avgIP >= 5.5) score += 8
    else if (avgIP < 4.5) score -= 15
  } else if (fmt === FORMAT.H2H_CAT) {
    // H2H CATEGORIES: Ratios matter per-week but you can afford a gamble.
    // A streamer who wins you W and K cats but hurts ERA is still worth considering.
    const pitcherERA = parseFloat(pitcher.era || 4.00)
    const pitcherWHIP = parseFloat(pitcher.whip || 1.30)
    if (pitcherERA > 4.50) score -= 15;
    else if (pitcherERA < 3.20) score += 8;
    if (pitcherWHIP > 1.40) score -= 10;
    else if (pitcherWHIP < 1.15) score += 8;
    // In H2H cats, streaming a 2-start SP for W and K categories is very valuable
    const avgIP = parseFloat(pitcher.ip_per_start || pitcher.avg_ip || 5.0)
    if (avgIP >= 6.0) score += 10;
  } else {
    // ROTO: Ratios are SACRED. One bad streamer ruins months of ERA/WHIP work.
    const pitcherERA = parseFloat(pitcher.era || 4.00)
    const pitcherWHIP = parseFloat(pitcher.whip || 1.30)
    
    // Severely penalize high-ratio pitchers — ROTO cannot recover from ratio damage
    if (pitcherERA > 4.50) score -= 25;
    else if (pitcherERA > 4.00) score -= 15;
    else if (pitcherERA < 3.20) score += 10;

    if (pitcherWHIP > 1.40) score -= 20;
    else if (pitcherWHIP < 1.15) score += 10;
    
    // Opponent team OBP heavily impacts WHIP ratio
    const oppOBP = parseFloat(opposingTeamStats.obp || 0.320)
    if (oppOBP > 0.335) score -= 15; // Very risky for WHIP
    else if (oppOBP < 0.300) score += 8;
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    grade: score >= 75 ? 'Elite stream' : score >= 60 ? 'Good stream' : score >= 45 ? 'Neutral' : score >= 30 ? 'Risky' : 'Avoid',
    factors: { oppWOBA, kPer9, parkFactor, format: fmt }
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
  const scoringType = leagueContext.scoring_type || 'Points'
  const statMapping = leagueContext.statMap || null

  // VOR score for each side
  const givingVOR = giving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize, scoringType, statMapping), 0)
  const receivingVOR = receiving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize, scoringType, statMapping), 0)

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

function scoreWaiverTarget(player = {}, myRoster = [], leagueSettings = {}, categoryNeeds = null) {
  let score = 30  // baseline

  const pos = String(player.position || '').split('/')[0].split(',')[0].trim().toUpperCase()
  const leagueSize = leagueSettings.num_teams || 12
  const scarcity = getPositionalScarcity(pos, leagueSize)
  const myPositions = myRoster.map(p => String(p.position || '').split(/[/,]/)[0].trim().toUpperCase())
  const countAtPos = myPositions.filter(p => p === pos).length
  const required = (leagueSettings.roster_slots || {})[pos] || 1

  // Positional need
  if (countAtPos < required) score += scarcity.urgencyScore * 3
  else if (countAtPos >= required) score -= 10

  // ── Category-need boost ────────────────────────────────────────────────
  // If the roster's category analysis shows pitching weakness, boost SP/RP.
  // If hitting weakness, boost hitters — ensures waiver aligns with gameplan.
  const isPitcher = ['SP', 'RP', 'P'].includes(pos)
  if (categoryNeeds) {
    if (isPitcher && categoryNeeds.needsPitching) {
      score += 18  // major boost — pitching is a team weakness
    }
    if (!isPitcher && categoryNeeds.needsHitting) {
      score += 12  // moderate boost — hitting is a team weakness
    }
    // Extra streaming bonus: 2-start SP or 7-game hitter in a category need week
    if (isPitcher && categoryNeeds.needsPitching) {
      const weekGamesTeam = getWeeklyGameCount(player.team, leagueSettings.current_week || 1)
      if (weekGamesTeam >= 7) score += 8  // likely 2-start SP on a busy team
    }
  }

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
    String(p.position || '').split(/[/,]/)[0].trim().toUpperCase() === pos
  ).length - required
  if (benchDepth > 1) score += 5  // easy to make room
  else if (benchDepth < 0) score -= 5  // would need to drop a starter

  score = Math.min(100, Math.max(0, Math.round(score)))

  const catNote = categoryNeeds ? (isPitcher && categoryNeeds.needsPitching ? ', category-need boost (pitching)' : !isPitcher && categoryNeeds.needsHitting ? ', category-need boost (hitting)' : '') : ''

  return {
    score,
    priority: score >= 85 ? 'MUST ADD' : score >= 70 ? 'High priority' : score >= 50 ? 'Speculative add' : score >= 35 ? 'Monitor' : 'Pass',
    reasoning: `Positional need (${pos}: ${countAtPos}/${required}), schedule (${weekGames} games)${catNote}, ` +
      (babip > 0 ? `BABIP ${babip} ${babip > 0.360 ? '(regression risk)' : babip < 0.250 ? '(due for boost)' : '(normal)'}` : 'no BABIP data'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G) WEEKLY LINEUP OPTIMIZATION
// ─────────────────────────────────────────────────────────────────────────────

function optimizeLineup(roster = [], weekSchedule = {}, scoringType = 'Roto', leagueSize = 12) {
  if (!roster || roster.length === 0) {
    return { starters: [], bench: [], reasoning: 'No roster provided.' }
  }

  const fmt = detectFormat(scoringType)

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

    // ── Base: VOR (player quality) + Volume (games this week) ──────────
    const vor = calculateVOR(player.stats || {}, pos, leagueSize, scoringType)
    let startScore = vor * 0.5 + weekGames * 8  // VOR is the floor, volume scales it

    // ── Format-specific adjustments ───────────────────────────────────
    if (fmt === FORMAT.H2H_POINTS) {
      // Points: volume is king. 7-game players always start.
      startScore += weekGames * 4  // extra volume weight
      if (isPitcher && weekGames >= 7) startScore += 15  // likely 2-start SP = massive points
    } else if (fmt === FORMAT.ROTO) {
      // Roto: protect ratios. Penalize high-ERA pitchers more heavily.
      if (isPitcher && recentERA > 5.0) startScore -= 20  // ratio damage lasts all season
    } else {
      // H2H_CAT: balanced — both volume and ratios matter per week
      if (isPitcher && recentERA > 0 && recentERA < 3.50) startScore += 10  // ratio helper
    }

    // Streak adjustments
    if (!isPitcher) {
      if (recentAVG > 0 && seasonAVG > 0) {
        startScore += ((recentAVG - seasonAVG) / seasonAVG) * 30
      }
    } else {
      if (recentERA > 0 && seasonERA > 0) {
        startScore += ((seasonERA - recentERA) / seasonERA) * 25
      }
    }

    // Injury/rest risk
    const onIL = player.injury_status === 'IL' || player.status === 'IL'
    if (onIL) startScore -= 50

    const confidence = startScore >= 70 ? 'High' : startScore >= 45 ? 'Medium' : 'Low'

    return {
      player_name: player.player_name || player.name,
      position: player.position,
      team: player.team,
      weekGames,
      vor,
      startScore: Math.round(startScore),
      confidence,
      reasoning: `VOR ${vor}, ${weekGames} games. ` +
        (!isPitcher && recentAVG > 0 ? `Hitting ${recentAVG.toFixed(3)} recently (${recentAVG > seasonAVG ? 'hot' : 'cold'}). ` : '') +
        (isPitcher && recentERA > 0 ? `ERA ${recentERA.toFixed(2)} recently. ` : '') +
        (onIL ? 'ON IL — do not start.' : '')
    }
  })

  const sorted = recommendations.sort((a, b) => b.startScore - a.startScore)
  const formatNote = fmt === FORMAT.H2H_POINTS ? 'VOR + volume (points mode — maximize ABs/IP)'
    : fmt === FORMAT.ROTO ? 'VOR + volume (roto — ratio-protected)'
    : 'VOR + volume (H2H cats — balanced)'

  return {
    starters: sorted.filter(p => p.startScore >= 45 && !p.reasoning.includes('ON IL')).slice(0, 14),
    bench: sorted.filter(p => p.startScore < 45 || p.reasoning.includes('ON IL')),
    volumePlays: sorted.filter(p => p.weekGames >= 7).slice(0, 3),
    reasoning: `Ranked ${roster.length} players by ${formatNote}.`,
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

function analyzeRosterStrengths(roster = [], leagueContext = {}) {
  const byPosition = {}
  const vorByPlayer = []
  const leagueSize = leagueContext.num_teams || 12
  const scoringType = leagueContext.scoring_type || 'Points'
  const statMapping = leagueContext.statMap || null

  // Filter out injured/suspended players before evaluating roster strengths
  // so a 0 VOR due to injury doesn't artificially trigger a "buy low" or "void" miscalculation
  const activeRoster = roster.filter(p => !p.status || (!String(p.status).toUpperCase().includes('IL') && ['O', 'OUT', 'SUSPENDED'].indexOf(String(p.status).toUpperCase()) === -1))

  activeRoster.forEach(player => {
    // Yahoo returns positions as "C,1B" or "OF/1B" — normalize both delimiters
    const primaryPos = String(player.position || '').split(/[/,]/)[0].trim().toUpperCase() || 'OF'
    const pos = primaryPos
    if (!byPosition[pos]) byPosition[pos] = []
    const vor = calculateVOR(player.stats || {}, pos, leagueSize, scoringType, statMapping)
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

  // Check ALL roster positions for voids — not just a subset
  const allPositions = Object.keys(POSITIONAL_DATA)  // C, SS, 2B, 3B, 1B, OF, SP, RP
  const voids = allPositions.filter(pos =>
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
// L) POINTS CONTRIBUTION PROFILER — Now uses shared computePlayerPoints()
// ─────────────────────────────────────────────────────────────────────────────

const POINTS_TARGETS = {
  hitter: 3.5,
  pitcher: 15,
}

function profilePointsContribution(playerStats = {}, type = 'hitter') {
  let games = parseFloat(playerStats.gamesPlayed || playerStats.G || playerStats.GS || 0)
  if (games === 0) games = 1

  const isPitcher = type !== 'hitter'
  const totalPts = computePlayerPoints(playerStats, isPitcher)
  const ptsPerGame = totalPts / games
  const isElite = isPitcher
    ? (ptsPerGame >= 20 || (playerStats.SV && totalPts > 150))
    : (ptsPerGame >= 4.5)

  const overallGrade = isElite ? 'A' : (ptsPerGame >= POINTS_TARGETS[type] ? 'B' : (ptsPerGame >= POINTS_TARGETS[type]*0.7 ? 'C' : 'D'))

  return { points: Math.round(totalPts), ptsPerGame: parseFloat(ptsPerGame.toFixed(1)), overallGrade, type }
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
  const contribution = profilePointsContribution(stats, isHitter ? 'hitter' : 'pitcher')

  return {
    breakout,
    ageCurve,
    contribution,
    summary: [
      `${breakout.verdict} (score: ${breakout.breakoutScore})`,
      `Age ${age}: ${ageCurve.phase} (projection multiplier: ${ageCurve.projectionMultiplier.toFixed(2)}x)`,
      `Points grade: ${contribution.overallGrade} (${contribution.points} total pts)`,
      ...breakout.flags.map(f => `${f.stat}: ${f.verdict}`),
      ...ageCurve.notes,
    ].join(' | '),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// O) UNIFIED ROSTER DIAGNOSIS — 3-format aware
// Single source of truth for every AI endpoint. Call once per request, inject
// the promptBlock into every Claude call. No more inconsistent analyses.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a complete roster diagnosis that every AI endpoint can consume.
 * @param {Array} roster - Full roster from Yahoo API (including IL/DTD players)
 * @param {Object} leagueCtx - { num_teams, scoring_type, roster_slots, stat_categories, current_week, ... }
 * @returns {Object} Unified diagnosis with promptBlock for Claude injection
 */
function buildRosterDiagnosis(roster = [], leagueCtx = {}) {
  const leagueSize = leagueCtx.num_teams || 12;
  const scoringType = leagueCtx.scoring_type || 'Points';
  const fmt = detectFormat(scoringType);
  const leagueStatCats = Array.isArray(leagueCtx.stat_categories) ? leagueCtx.stat_categories : null;

  // ── 1. Three-tier player status split ──────────────────────────────────
  const IL_STATUSES = ['IL', 'IL10', 'IL15', 'IL60', 'DL', 'DL10', 'DL15', 'DL60', 'O', 'OUT', 'SUSPENDED', 'NA'];
  const DTD_STATUSES = ['DTD', 'Q', 'QUESTIONABLE', 'D2D', 'DAY-TO-DAY'];

  function getPlayerStatus(p) {
    if (!p.status) return 'active';
    const s = String(p.status).toUpperCase().trim();
    if (IL_STATUSES.some(x => s.includes(x))) return 'unavailable';
    if (DTD_STATUSES.some(x => s.includes(x))) return 'dtd';
    return 'active';
  }

  const activeRoster = roster.filter(p => getPlayerStatus(p) === 'active' || getPlayerStatus(p) === 'dtd');
  const unavailablePlayers = roster.filter(p => getPlayerStatus(p) === 'unavailable');
  const dtdPlayers = roster.filter(p => getPlayerStatus(p) === 'dtd');

  // ── 2. Positional analysis (voids, surpluses, sell/buy) ────────────────
  const rosterAnalysis = analyzeRosterStrengths(activeRoster, { num_teams: leagueSize, scoring_type: scoringType });

  // ── 3. Category-level analysis — uses actual league stat categories ────
  const teamStats = {};
  activeRoster.forEach(p => {
    const stats = p.stats || {};
    Object.entries(stats).forEach(([k, v]) => {
      teamStats[k] = (teamStats[k] || 0) + (parseFloat(v) || 0);
    });
  });
  const catAnalysis = analyzeCategories(teamStats, [], scoringType, leagueStatCats);

  const pitchingCats = ['W', 'SV', 'K', 'ERA', 'WHIP'];
  const hittingCats = ['R', 'HR', 'RBI', 'SB', 'AVG'];
  const weaknessList = catAnalysis.weaknesses || [];

  const categoryNeeds = {
    needsPitching: weaknessList.some(c => pitchingCats.includes(c)) ||
      rosterAnalysis.voids.some(v => ['SP', 'RP'].includes(v)),
    needsHitting: weaknessList.some(c => hittingCats.includes(c)) ||
      rosterAnalysis.voids.some(v => ['C', 'SS', '2B', '3B', '1B', 'OF'].includes(v)),
    weakCategories: weaknessList,
  };

  // ── 4. VOR by player (active only) ─────────────────────────────────────
  const vorByPlayer = activeRoster
    .filter(p => getPlayerStatus(p) !== 'dtd' || true) // DTD stays in VOR calc
    .map(p => {
      const pos = String(p.position || '').split(/[/,]/)[0].trim().toUpperCase();
      return {
        name: p.player_name || p.name,
        position: pos,
        vor: calculateVOR(p.stats || {}, pos, leagueSize, scoringType),
        scarcity: getPositionalScarcity(pos, leagueSize).tier,
      };
    }).sort((a, b) => b.vor - a.vor);

  // ── 5. Build the canonical prompt block ────────────────────────────────
  // This EXACT string gets injected into every Claude call. Keep it compact.
  const formatLabel = fmt === FORMAT.H2H_POINTS ? 'H2H Points'
    : fmt === FORMAT.H2H_CAT ? 'H2H Categories'
    : 'Rotisserie (Roto)'
  let promptBlock = `\n=== ROSTER DIAGNOSIS (${formatLabel}, ${leagueSize}-team) ===\n`;

  // Format-specific strategic framing — Claude MUST know the format to give right advice
  if (fmt === FORMAT.H2H_POINTS) {
    promptBlock += `🎯 FORMAT: H2H POINTS — Maximize raw point output each week. Volume (ABs, IP) is everything. 2-start SPs are king. Never leave a roster spot empty. Do NOT give category-balancing advice.\n`;
  } else if (fmt === FORMAT.H2H_CAT) {
    promptBlock += `🎯 FORMAT: H2H CATEGORIES — Win ${Math.ceil((leagueStatCats?.length || 10) / 2) + 1}+ of ${leagueStatCats?.length || 10} categories weekly. Target swing categories. Safe to punt 1-2 hopeless cats and load up on the rest.\n`;
    if (leagueStatCats) promptBlock += `League cats: ${leagueStatCats.join(', ')}\n`;
  } else {
    promptBlock += `🎯 FORMAT: ROTO — Season-long category accumulation across all teams. Protect ratios (ERA/WHIP/AVG) at all costs. Never stream high-risk pitchers. Balance all categories — punting is risky.\n`;
    if (leagueStatCats) promptBlock += `League cats: ${leagueStatCats.join(', ')}\n`;
  }

  // Unavailable players
  if (unavailablePlayers.length > 0) {
    promptBlock += `⛔ UNAVAILABLE (IL/Out/Susp — exclude from all decisions): ${unavailablePlayers.map(p => `${p.player_name || p.name} [${p.status}]`).join(', ')}\n`;
  }

  // DTD/Questionable players
  if (dtdPlayers.length > 0) {
    promptBlock += `🟡 DTD/QUESTIONABLE (flag as risk, have backup plan): ${dtdPlayers.map(p => `${p.player_name || p.name} [${p.status}]`).join(', ')}\n`;
  }

  // Active roster — top 8 + bottom 3 to save tokens on large rosters
  const vorTop = vorByPlayer.slice(0, 8);
  const vorBottom = vorByPlayer.length > 11 ? vorByPlayer.slice(-3) : [];
  const vorMiddleCount = Math.max(0, vorByPlayer.length - 11);
  promptBlock += `\nROSTER (${activeRoster.length} active, by VOR):\n`;
  promptBlock += vorTop.map(p => `  ${p.name} (${p.position}) VOR:${p.vor}`).join('\n');
  if (vorMiddleCount > 0) promptBlock += `\n  ...${vorMiddleCount} middle-tier players omitted...`;
  if (vorBottom.length > 0) promptBlock += `\n` + vorBottom.map(p => `  ${p.name} (${p.position}) VOR:${p.vor}`).join('\n');

  // Positional needs — compact
  promptBlock += `\nVoids: ${rosterAnalysis.voids.join(', ') || 'None'}`;
  promptBlock += ` | Surpluses: ${rosterAnalysis.surpluses.map(s => `${s.position}(${s.count})`).join(', ') || 'None'}\n`;

  // Category weakness — compact
  if (categoryNeeds.needsPitching || categoryNeeds.needsHitting) {
    if (categoryNeeds.needsPitching) promptBlock += `⚠️ PITCHING WEAK — prioritize SP/RP.\n`;
    if (categoryNeeds.needsHitting) promptBlock += `⚠️ HITTING WEAK — prioritize bats at scarce positions.\n`;
    if (categoryNeeds.weakCategories.length > 0) promptBlock += `Weak cats: ${categoryNeeds.weakCategories.join(', ')}. `;
    promptBlock += `${catAnalysis.advice}\n`;
  }

  // Summary stats — one line
  const totalVOR = vorByPlayer.reduce((sum, p) => sum + (p.vor || 0), 0);
  const avgVOR = vorByPlayer.length > 0 ? (totalVOR / vorByPlayer.length).toFixed(1) : 0;
  const eliteCount = vorByPlayer.filter(p => p.vor >= 70).length;
  const replacementCount = vorByPlayer.filter(p => p.vor < 30).length;

  promptBlock += `Health: ${totalVOR} total VOR, ${avgVOR} avg, ${eliteCount} elite, ${replacementCount} replacement\n`;

  return {
    // Raw data for programmatic use
    activeRoster,
    unavailablePlayers,
    dtdPlayers,
    voids: rosterAnalysis.voids,
    surpluses: rosterAnalysis.surpluses,
    sellHigh: rosterAnalysis.sellHigh,
    buyLow: rosterAnalysis.buyLow,
    categoryNeeds,
    catAnalysis,
    vorByPlayer,
    totalVOR,
    avgVOR: parseFloat(avgVOR),
    eliteCount,
    replacementCount,

    // The canonical prompt string — inject into every Claude call
    promptBlock,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Format detection
  FORMAT,
  detectFormat,

  // Shared points calculator
  computePlayerPoints,
  HITTING_PTS,
  PITCHING_PTS,

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

  // L) Points contribution profiling
  profilePointsContribution,
  POINTS_TARGETS,

  // M) Combined intelligence report
  generatePlayerIntelligence,

  // N) ADP vs actual stats trend analysis
  analyzeADPvsTrend,

  // O) UNIFIED ROSTER DIAGNOSIS — the single source of truth
  buildRosterDiagnosis,
}



// ─────────────────────────────────────────────────────────────────────────────
// N) ADP vs ACTUAL STATS TREND ANALYSIS
// Compares 2025 real production to 2026 ADP to find value gaps
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates a production-based rank from last season's stats,
 * then compares to this year's ADP to find over/undervalued players.
 *
 * @param {object} lastSeasonStats - from mlbStatsService.getPlayerSeasonStats()
 * @param {number} adp2026 - this year's ADP
 * @param {number} leagueSize - number of teams (default 12)
 * @returns {object} trend analysis with value gap, classification, floor/ceiling
 */
function analyzeADPvsTrend(lastSeasonStats, adp2026, leagueSize = 12) {
  if (!lastSeasonStats || !lastSeasonStats.stats) {
    return { valueGap: 0, classification: 'UNKNOWN', summary: 'No 2025 stats available.' };
  }

  const s = lastSeasonStats.stats;
  const isP = lastSeasonStats.type === 'pitcher';
  const adp = parseFloat(adp2026) || 300;
  const totalDrafted = leagueSize * 23; // approximate total drafted players

  let productionScore = 0; // 0-100 scale
  let statLine = '';
  let floorCeiling = {};

  if (isP) {
    // Pitcher production score — lower ERA/WHIP = better
    const eraScore = Math.max(0, 100 - ((s.ERA - 2.5) / 3.5) * 100);
    const whipScore = Math.max(0, 100 - ((s.WHIP - 0.9) / 0.7) * 100);
    const kScore = Math.min(100, (s.K / 250) * 100);
    const wScore = Math.min(100, (s.W / 18) * 100);
    const svScore = Math.min(100, (s.SV / 40) * 100);
    const ipBonus = s.IP >= 160 ? 15 : s.IP >= 100 ? 8 : 0;

    productionScore = (eraScore * 0.25 + whipScore * 0.2 + kScore * 0.25 + wScore * 0.15 + svScore * 0.15) + ipBonus;
    productionScore = Math.min(100, Math.max(0, productionScore));

    statLine = `${s.W}W ${s.ERA} ERA ${s.WHIP} WHIP ${s.K}K ${s.SV}SV in ${s.IP}IP`;
    floorCeiling = {
      floor: `${Math.max(0, s.W - 4)}W, ${(s.ERA + 0.6).toFixed(2)} ERA, ${s.K - 30}K`,
      ceiling: `${s.W + 3}W, ${Math.max(1.5, s.ERA - 0.5).toFixed(2)} ERA, ${s.K + 25}K`,
    };
  } else {
    // Hitter production score
    const hrScore = Math.min(100, (s.HR / 45) * 100);
    const rbiScore = Math.min(100, (s.RBI / 120) * 100);
    const rScore = Math.min(100, (s.R / 110) * 100);
    const sbScore = Math.min(100, (s.SB / 40) * 100);
    const avgScore = Math.min(100, ((s.AVG - 0.200) / 0.120) * 100);
    const paBonus = s.PA >= 600 ? 10 : s.PA >= 500 ? 5 : s.PA < 300 ? -15 : 0;

    productionScore = (hrScore * 0.25 + rbiScore * 0.2 + rScore * 0.15 + sbScore * 0.2 + avgScore * 0.2) + paBonus;
    productionScore = Math.min(100, Math.max(0, productionScore));

    statLine = `${s.AVG}/${s.HR}HR/${s.RBI}RBI/${s.R}R/${s.SB}SB in ${s.PA}PA`;
    floorCeiling = {
      floor: `${Math.max(0.200, s.AVG - 0.025).toFixed(3)}/${Math.max(0, s.HR - 6)}HR/${Math.max(0, s.SB - 5)}SB`,
      ceiling: `${Math.min(0.340, s.AVG + 0.020).toFixed(3)}/${s.HR + 5}HR/${s.SB + 8}SB`,
    };
  }

  // Convert production score to an implied ADP rank
  // Score 90+ → should be top 20, Score 70+ → top 60, etc.
  const impliedADP = Math.max(1, Math.round(totalDrafted * (1 - productionScore / 100)));

  // Value gap: positive = undervalued (ADP is later than production warrants)
  const valueGap = adp - impliedADP;
  const gapPct = totalDrafted > 0 ? ((valueGap / totalDrafted) * 100).toFixed(0) : 0;

  let classification = 'FAIRLY PRICED';
  if (valueGap > 30) classification = 'SIGNIFICANTLY UNDERVALUED';
  else if (valueGap > 15) classification = 'UNDERVALUED';
  else if (valueGap < -30) classification = 'SIGNIFICANTLY OVERVALUED';
  else if (valueGap < -15) classification = 'OVERVALUED';

  // Trend direction based on age + production
  const age = lastSeasonStats.age || 28;
  let trajectory = 'STABLE';
  if (age <= 26 && productionScore > 50) trajectory = 'ASCENDING';
  else if (age >= 33 && productionScore < 70) trajectory = 'DECLINING';
  else if (age >= 31) trajectory = 'PLATEAU — WATCH FOR DECLINE';

  const summary = `2025: ${statLine}. ADP ${adp} (implied: ${impliedADP}). ${classification} by ${Math.abs(valueGap)} picks. Age ${age}, trajectory: ${trajectory}. Floor: ${floorCeiling.floor}. Ceiling: ${floorCeiling.ceiling}.`;

  return {
    productionScore: Math.round(productionScore),
    impliedADP,
    actualADP: adp,
    valueGap,
    gapPercent: +gapPct,
    classification,
    trajectory,
    statLine,
    floorCeiling,
    summary,
  };
}
