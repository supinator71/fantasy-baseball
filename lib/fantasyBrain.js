/**
 * fantasyBrain.js — Expert fantasy baseball logic engine
 */

export const FORMAT = { ROTO: 'ROTO', H2H_CAT: 'H2H_CAT', H2H_POINTS: 'H2H_POINTS' }

export function detectFormat(scoringType) {
  const raw = String(scoringType || '').toLowerCase().trim()
  if (raw.includes('point') || raw === 'h2h_pts' || raw === 'pts') return FORMAT.H2H_POINTS
  if (raw.includes('head') || raw.includes('h2h') || raw.includes('categories') || raw === 'cat') return FORMAT.H2H_CAT
  return FORMAT.ROTO
}

const HITTING_PTS = { R: 1.9, '1B': 2.6, '2B': 5.2, '3B': 7.8, HR: 10.4, RBI: 1.9, SB: 4.2, BB: 2.6, HBP: 2.6 }
const PITCHING_PTS = { W: 8, SV: 8, OUT: 1, HA: -1.3, ER: -3, BBA: -1.3, HBPA: -1.3, K: 3 }

export function computePlayerPoints(stats = {}, isPitcher = false, statMapping = null) {
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

const POSITIONAL_DATA = {
  C: {
    tier: 'elite',
    draftWindow: 'rounds 3-7',
    replacementDropoff: 'massive',
    notes: 'Only 3-4 viable starters in a 12-team league. Elite C worth a 3rd rounder. CRITICAL RULE: Never roster a backup catcher unless it is a 2-catcher league. Holding a backup C on the bench is a complete waste of a roster spot.',
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

export function getPositionalScarcity(position, leagueSize = 12) {
  const parts = String(position || '').split(/[/, ]+/).map(p => p.trim().toUpperCase()).filter(Boolean)
  const scarcityOrder = { elite: 5, scarce: 4, moderate: 3, deep: 2, replacement: 1 }
  let bestData = POSITIONAL_DATA['OF']
  let bestScore = -1
  parts.forEach(p => {
    const data = POSITIONAL_DATA[p]
    if (data) {
      const score = scarcityOrder[data.tier] || 0
      if (score > bestScore) {
        bestScore = score
        bestData = data
      }
    }
  })
  return {
    tier: bestData.tier,
    draftWindow: bestData.draftWindow,
    replacementDropoff: bestData.replacementDropoff,
    replacementLevel: bestData.replacementLevel,
    notes: bestData.notes,
    urgencyScore: { elite: 10, scarce: 8, moderate: 5, deep: 2, replacement: 0 }[bestData.tier] || 3,
  }
}

const DEFAULT_CATS = ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']

export function analyzeCategories(myStats = {}, leagueStandings = [], scoringType = 'Points', leagueStatCategories = null) {
  const result = { topPerformers: [], weaknesses: [], advice: '', format: '' }
  const fmt = detectFormat(scoringType)
  result.format = fmt
  const cats = (leagueStatCategories && leagueStatCategories.length > 0) ? leagueStatCategories : DEFAULT_CATS
  if (fmt === FORMAT.H2H_POINTS) {
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
  const oppRaw = leagueStandings[0]?.stats || leagueStandings[0] || {}
  const inverseCats = ['ERA', 'WHIP', 'BB9', 'BBA', 'L'] 
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
    const totalCats = cats.length || 10
    const winTarget = Math.ceil(totalCats / 2) + 1
    result.advice = `H2H CATEGORIES (${totalCats} cats): You need to win ${winTarget}+ categories this week. Swing categories: ${result.weaknesses.slice(0, 3).join(', ') || 'TBD'}. Target waiver adds and streaming specifically aimed at flipping those weak cats. Safe to punt 1-2 hopeless cats and load up on the rest.`
  }
  return result
}

const SGP_DENOMINATORS = {
  HR: 6.5, R: 25, RBI: 25, SB: 6, AVG_BASELINE: 0.252,
  W: 5.5, SV: 6.5, K: 40, ERA_BASELINE: 4.00, WHIP_BASELINE: 1.30
}

function _computeVOR(playerStats, pos, leagueSize, scoringType, statMapping) {
  const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P'
  const fmt = detectFormat(scoringType)
  if (fmt === FORMAT.H2H_POINTS) {
    const rawPts = computePlayerPoints(playerStats, isPitcher, statMapping)
    if (rawPts <= 0) return 0
    return Math.round(Math.max(0, rawPts / 5))
  }
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
      const scarcity = getPositionalScarcity(pos, leagueSize)
      const baseline = scarcity.replacementLevel.AVG || SGP_DENOMINATORS.AVG_BASELINE
      sgpTotal += ((avg - baseline) * Math.min(ab, 150)) / 15
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
  if (fmt === FORMAT.H2H_CAT && !isPitcher) sgpTotal *= 1.1
  if (sgpTotal <= -10) return 0
  return Math.round(Math.max(0, (sgpTotal + 2) * 7))
}

export function calculateVOR(playerStats = {}, position, leagueSize = 12, scoringType = 'Points', statMapping = null) {
  if (!playerStats || Object.keys(playerStats).length === 0) return 0
  const parts = String(position || '').split(/[/, ]+/).map(p => p.trim().toUpperCase()).filter(Boolean)
  if (parts.length === 0) return _computeVOR(playerStats, 'OF', leagueSize, scoringType, statMapping)
  let maxVOR = 0
  parts.forEach(pos => {
    const v = _computeVOR(playerStats, pos, leagueSize, scoringType, statMapping)
    if (v > maxVOR) maxVOR = v
  })
  return maxVOR
}

export function buildRosterDiagnosis(roster = [], settings = {}, sharedMatchup = null, pitchingContext = null) {
  const scoringType = settings.scoring_type || 'Points'
  const fmt = detectFormat(scoringType)
  const leagueSize = settings.num_teams || 12
  
  const activeRoster = roster.map(p => ({
    ...p,
    vor: calculateVOR(p.stats, p.position, leagueSize, scoringType)
  })).sort((a,b) => b.vor - a.vor)

  const catAnalysis = analyzeCategories({}, [sharedMatchup?.opponent || {}], scoringType, settings.stat_categories)
  const categoryNeeds = { needsPitching: catAnalysis.weaknesses.some(w => ['ERA','WHIP','W','K','SV','HLD'].includes(w)), needsHitting: catAnalysis.weaknesses.some(w => ['AVG','HR','RBI','R','SB'].includes(w)) }

  let promptBlock = `MY CURRENT TEAM ROSTER (Calculated 2026 VOR):\n`
  activeRoster.forEach(p => {
    const isProbable = pitchingContext?.today?.includes((p.player_name || p.name || '').toLowerCase())
    const tags = [isProbable ? '⚾ STARTING TODAY' : ''].filter(Boolean).join(' ')
    promptBlock += `- **${p.player_name || p.name}** (${p.position}) [VOR: ${p.vor}] ${tags}\n`
  })
  
  return { activeRoster, categoryNeeds, promptBlock }
}

export function evaluateTrade(giving = [], receiving = [], myRoster = [], leagueContext = {}) {
  const leagueSize = leagueContext.num_teams || 12
  const scoringType = leagueContext.scoring_type || 'Points'
  const statMapping = leagueContext.statMap || null
  const givingVOR = giving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize, scoringType, statMapping), 0)
  const receivingVOR = receiving.reduce((sum, p) => sum + calculateVOR(p.stats || {}, p.position, leagueSize, scoringType, statMapping), 0)
  const givingScarcity = giving.reduce((sum, p) => sum + getPositionalScarcity(p.position, leagueSize).urgencyScore, 0)
  const receivingScarcity = receiving.reduce((sum, p) => sum + getPositionalScarcity(p.position, leagueSize).urgencyScore, 0)
  const myPositions = myRoster.map(p => String(p.position || '').split('/')[0].toUpperCase())
  const rosterNeedBonus = receiving.reduce((bonus, p) => {
    const pos = String(p.position || '').split('/')[0].toUpperCase()
    const countAtPos = myPositions.filter(mp => mp === pos).length
    if (countAtPos === 0) return bonus + 15
    return bonus
  }, 0)
  const vorDelta = receivingVOR - givingVOR
  const scarcityDelta = receivingScarcity - givingScarcity
  let score = (vorDelta * 0.6) + (scarcityDelta * 2) + rosterNeedBonus
  score = Math.max(-100, Math.min(100, Math.round(score)))
  const verdict = score >= 60 ? 'smash accept' : score >= 20 ? 'accept' : score >= -15 ? 'fair' : score >= -45 ? 'decline' : 'insulting'
  return { score, verdict, reasoning: `VOR delta: ${vorDelta.toFixed(0)}, Scarcity delta: ${scarcityDelta.toFixed(0)}`, counterOffer: score < -15 ? 'Ask for more value' : '' }
}

export function scoreWaiverTarget(player = {}, myRoster = [], leagueSettings = {}, categoryNeeds = null, pitchingContext = null) {
  let score = 30
  const pos = String(player.position || '').split('/')[0].toUpperCase()
  const leagueSize = leagueSettings.num_teams || 12
  const scarcity = getPositionalScarcity(pos, leagueSize)
  const myPositions = myRoster.map(p => String(p.position || '').split('/')[0].toUpperCase())
  const countAtPos = myPositions.filter(p => p === pos).length
  const required = (leagueSettings.roster_slots || {})[pos] || 1
  if (countAtPos < required) score += scarcity.urgencyScore * 3
  if (categoryNeeds) {
    if (['SP','RP','P'].includes(pos) && categoryNeeds.needsPitching) score += 18
    else if (!['SP','RP','P'].includes(pos) && categoryNeeds.needsHitting) score += 12
  }
  score = Math.min(100, Math.max(0, Math.round(score)))
  return { score, priority: score >= 70 ? 'High' : 'Low', reasoning: `Positional need for ${pos}` }
}

export function generatePlayerIntelligence(data) {
  if (!data || !data.stats) return null;
  const type = data.type;
  const s = data.stats;
  let summary = '';
  if (type === 'hitter') {
    summary = `Hitter producing ${s.AVG} AVG with ${s.HR} HR in 2026.`;
  } else {
    summary = `Pitcher with ${s.ERA} ERA and ${s.K} K in 2026.`;
  }
  return { summary };
}

export function getDraftStrategy(pos, num, type) {
  return { recommended: 'Stars & Scrubs', strategy: { overview: 'Focus on elite hitting early.' } };
}
