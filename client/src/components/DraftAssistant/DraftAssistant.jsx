import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import DraftBoard from './DraftBoard'

const POSITIONS = ['ALL', 'SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'OF']

// Positional scarcity multipliers — how urgently to address each position
const SCARCITY = {
  C:    2.0,   // catastrophic dropoff after top 5-6
  SS:   1.8,   // scarce — 8-10 good options only
  '2B': 1.4,
  '3B': 1.3,
  SP:   1.2,
  OF:   0.85,  // deep
  '1B': 0.8,
  RP:   0.6,   // mostly streamable
}

const SCARCITY_LABEL = {
  C:    '🚨 Critical',
  SS:   '⚠️ Scarce',
  '2B': '⚠️ Moderate',
  '3B': '📋 Moderate',
  SP:   '📋 Moderate',
  OF:   '✅ Deep',
  '1B': '✅ Deep',
  RP:   '✅ Deep',
}

// Positions eligible for UTIL slot (non-pitchers)
const UTIL_ELIGIBLE = new Set(['C', '1B', '2B', '3B', 'SS', 'OF'])

const DEFAULT_PLAYERS = [
  { player_key: '1',  player_name: 'Aaron Judge',       position: 'OF',    team: 'NYY', adp: 1.2 },
  { player_key: '2',  player_name: 'Shohei Ohtani',     position: 'SP/OF', team: 'LAD', adp: 2.1 },
  { player_key: '3',  player_name: 'Mookie Betts',      position: 'OF/2B', team: 'LAD', adp: 3.4 },
  { player_key: '4',  player_name: 'Ronald Acuna Jr.',  position: 'OF',    team: 'ATL', adp: 4.1 },
  { player_key: '5',  player_name: 'Freddie Freeman',   position: '1B',    team: 'LAD', adp: 5.3 },
  { player_key: '6',  player_name: 'Juan Soto',         position: 'OF',    team: 'NYY', adp: 6.2 },
  { player_key: '7',  player_name: 'Paul Goldschmidt',  position: '1B',    team: 'STL', adp: 7.8 },
  { player_key: '8',  player_name: 'Yordan Alvarez',    position: 'OF/1B', team: 'HOU', adp: 8.4 },
  { player_key: '9',  player_name: 'Gerrit Cole',       position: 'SP',    team: 'NYY', adp: 9.1 },
  { player_key: '10', player_name: 'Jose Ramirez',      position: '3B',    team: 'CLE', adp: 10.3 },
  { player_key: '11', player_name: 'Trea Turner',       position: 'SS',    team: 'PHI', adp: 11.5 },
  { player_key: '12', player_name: 'Julio Rodriguez',   position: 'OF',    team: 'SEA', adp: 12.1 },
  { player_key: '13', player_name: 'Bobby Witt Jr.',    position: 'SS',    team: 'KC',  adp: 13.2 },
  { player_key: '14', player_name: 'Spencer Strider',   position: 'SP',    team: 'ATL', adp: 14.0 },
  { player_key: '15', player_name: 'Corbin Carroll',    position: 'OF',    team: 'ARI', adp: 15.3 },
  { player_key: '16', player_name: 'Bryce Harper',      position: '1B',    team: 'PHI', adp: 16.1 },
  { player_key: '17', player_name: 'Nolan Arenado',     position: '3B',    team: 'STL', adp: 17.4 },
  { player_key: '18', player_name: 'Corey Seager',      position: 'SS',    team: 'TEX', adp: 18.2 },
  { player_key: '19', player_name: 'Blake Snell',       position: 'SP',    team: 'SF',  adp: 19.6 },
  { player_key: '20', player_name: 'Adley Rutschman',   position: 'C',     team: 'BAL', adp: 20.1 },
  { player_key: '21', player_name: 'Will Smith',        position: 'C',     team: 'LAD', adp: 28.4 },
  { player_key: '22', player_name: 'Emmanuel Clase',    position: 'RP',    team: 'CLE', adp: 31.2 },
  { player_key: '23', player_name: 'Edwin Diaz',        position: 'RP',    team: 'NYM', adp: 34.1 },
  { player_key: '24', player_name: 'Zack Wheeler',      position: 'SP',    team: 'PHI', adp: 22.3 },
  { player_key: '25', player_name: 'Max Fried',         position: 'SP',    team: 'ATL', adp: 24.8 },
]

function isMyPickFn(pick, pos, teams) {
  const round = Math.ceil(pick / teams)
  const spot = pick - (round - 1) * teams
  return round % 2 === 1 ? spot === pos : spot === (teams - pos + 1)
}

function primaryPos(position) {
  return String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
}

// All positions a player is eligible for
function allPositions(position) {
  return String(position || '').split('/').map(p => p.split(',')[0].trim().toUpperCase())
}

// Count how many of each position the team already has (starting slots only)
function countFilled(myTeam) {
  const filled = {}
  myTeam.forEach(p => {
    allPositions(p.position).forEach(pos => {
      filled[pos] = (filled[pos] || 0) + 1
    })
  })
  return filled
}

// Expert Smart Score: ADP value + positional urgency + scarcity bonus
function computeSmartScore(player, pickNumber, myTeam, rosterSlots, numTeams, totalRounds) {
  const pos = primaryPos(player.position)
  const positions = allPositions(player.position)
  const adpValue = pickNumber - (player.adp || pickNumber)
  const filled = countFilled(myTeam)
  const currentRound = Math.ceil(pickNumber / numTeams)
  const roundsLeft = Math.max(1, totalRounds - currentRound)

  // Check if any position this player fills still has open slots
  let bestUrgency = -Infinity
  let isFull = true

  for (const p of positions) {
    const required = rosterSlots[p] || 0
    const have = filled[p] || 0
    const need = Math.max(0, required - have)

    if (need > 0) {
      isFull = false
      const scarcity = SCARCITY[p] || 1.0
      const urgency = (need / roundsLeft) * scarcity * 20
      if (urgency > bestUrgency) bestUrgency = urgency
    }
  }

  // Check UTIL slot if no primary slot open but player is UTIL-eligible
  let utilBonus = 0
  if (isFull) {
    const utilRequired = rosterSlots['UTIL'] || 0
    const utilHave = filled['UTIL'] || 0
    const anyPosIsUtilElig = positions.some(p => UTIL_ELIGIBLE.has(p))
    if (anyPosIsUtilElig && utilHave < utilRequired) {
      isFull = false
      utilBonus = 5
    }
  }

  if (isFull) return adpValue - 30   // heavy penalty — you don't need this position

  const urgencyBonus = bestUrgency === -Infinity ? 0 : bestUrgency
  const multiPosBonus = positions.length > 1 ? 8 : 0  // multi-eligibility premium

  return adpValue + urgencyBonus + utilBonus + multiPosBonus
}

// Build roster slot status for display and AI
function getRosterStatus(myTeam, rosterSlots) {
  const filled = countFilled(myTeam)
  const status = {}
  for (const [pos, req] of Object.entries(rosterSlots)) {
    if (pos === 'BN' || pos === 'IL') continue
    const have = Math.min(filled[pos] || 0, req)
    status[pos] = { required: req, have, need: Math.max(0, req - have), full: have >= req }
  }
  return status
}

export default function DraftAssistant({ leagueSettings }) {
  const [players, setPlayers] = useState([])
  const [myTeam, setMyTeam] = useState([])
  const [posFilter, setPosFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [pickNumber, setPickNumber] = useState(1)
  const [aiRec, setAiRec] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('board')
  const [numTeams, setNumTeams] = useState(leagueSettings?.num_teams || 12)
  const [countdown, setCountdown] = useState(null)
  const [timerActive, setTimerActive] = useState(false)
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [liveMode, setLiveMode] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [syncError, setSyncError] = useState('')
  const autoTriggered = useRef(false)
  const countdownRef = useRef(null)
  const syncRef = useRef(null)

  const draftPosition = leagueSettings?.draft_position || 1
  const totalRounds = 23
  const rosterSlots = leagueSettings?.roster_slots || { SP:2, RP:2, C:1, '1B':1, '2B':1, '3B':1, SS:1, OF:3, UTIL:1, BN:4 }

  useEffect(() => {
    loadBoard()
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  const myPick = useMemo(
    () => isMyPickFn(pickNumber, draftPosition, numTeams),
    [pickNumber, draftPosition, numTeams]
  )

  const rosterStatus = useMemo(
    () => getRosterStatus(myTeam, rosterSlots),
    [myTeam, rosterSlots]
  )

  // Auto-trigger AI + countdown when it becomes user's turn
  useEffect(() => {
    if (myPick && !autoTriggered.current && players.length > 0) {
      autoTriggered.current = true
      setActiveTab('pool')
      startCountdown(90)
      getAiRecommendation()
    }
    if (!myPick) {
      autoTriggered.current = false
      stopCountdown()
    }
  }, [myPick, players.length])

  function startCountdown(seconds) {
    setCountdown(seconds)
    setTimerActive(true)
    clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); setTimerActive(false); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function stopCountdown() {
    clearInterval(countdownRef.current)
    setTimerActive(false)
    setCountdown(null)
  }

  useEffect(() => () => clearInterval(countdownRef.current), [])

  const syncNow = useCallback(async () => {
    if (!selectedLeague) return
    try {
      const { data } = await axios.get(`/api/draft/sync/${selectedLeague}`)
      if (data.board) {
        setPlayers(data.board)
        setMyTeam(data.board.filter(p => p.drafted_by === 'me'))
        setPickNumber(data.board.filter(p => p.drafted).length + 1)
      }
      setLastSync(new Date())
      setSyncError('')
    } catch (err) {
      setSyncError(err.response?.data?.error || 'Sync failed')
    }
  }, [selectedLeague])

  useEffect(() => {
    if (liveMode) {
      syncNow()
      syncRef.current = setInterval(syncNow, 10000)
    } else {
      clearInterval(syncRef.current)
    }
    return () => clearInterval(syncRef.current)
  }, [liveMode, syncNow])

  useEffect(() => () => clearInterval(syncRef.current), [])

  async function initFromYahoo() {
    if (!selectedLeague) return toast.error('Select a league first')
    setInitLoading(true)
    try {
      const { data } = await axios.post(`/api/draft/init-yahoo/${selectedLeague}`)
      toast.success(`Loaded ${data.count} players from Yahoo!`)
      await loadBoard()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load Yahoo players')
    } finally {
      setInitLoading(false)
    }
  }

  async function loadBoard() {
    try {
      const { data } = await axios.get('/api/draft/board')
      if (data.length === 0) {
        await axios.post('/api/draft/load', { players: DEFAULT_PLAYERS })
        setPlayers(DEFAULT_PLAYERS.map(p => ({ ...p, drafted: 0 })))
      } else {
        setPlayers(data)
        setMyTeam(data.filter(p => p.drafted_by === 'me'))
        setPickNumber(data.filter(p => p.drafted).length + 1)
      }
    } catch {
      setPlayers(DEFAULT_PLAYERS.map(p => ({ ...p, drafted: 0 })))
    }
  }

  async function markDrafted(player, by = 'other') {
    const round = Math.ceil(pickNumber / numTeams)
    await axios.post('/api/draft/pick', { player_key: player.player_key, drafted_by: by, draft_round: round, draft_pick: pickNumber })
    setPlayers(prev => prev.map(p =>
      p.player_key === player.player_key ? { ...p, drafted: 1, drafted_by: by, draft_round: round, draft_pick: pickNumber } : p
    ))
    if (by === 'me') setMyTeam(prev => [...prev, { ...player, drafted_by: 'me', draft_round: round, draft_pick: pickNumber }])
    setPickNumber(prev => prev + 1)
    stopCountdown()
    toast.success(`${player.player_name} drafted${by === 'me' ? ' to YOUR team' : ''}`)
  }

  async function undoPick(player) {
    await axios.post('/api/draft/undo', { player_key: player.player_key })
    setPlayers(prev => prev.map(p =>
      p.player_key === player.player_key ? { ...p, drafted: 0, drafted_by: null } : p
    ))
    setMyTeam(prev => prev.filter(p => p.player_key !== player.player_key))
    setPickNumber(prev => Math.max(1, prev - 1))
  }

  async function getAiRecommendation() {
    setAiLoading(true)
    setAiRec('')
    try {
      const availableForAI = players
        .filter(p => !p.drafted)
        .map(p => ({
          ...p,
          smartScore: computeSmartScore(p, pickNumber, myTeam, rosterSlots, numTeams, totalRounds)
        }))
        .sort((a, b) => b.smartScore - a.smartScore)
        .slice(0, 25)

      const { data } = await axios.post('/api/claude/draft/recommend', {
        available_players: availableForAI,
        my_roster: myTeam,
        pick_number: pickNumber,
        total_picks: numTeams * totalRounds,
        num_teams: numTeams,
        roster_slots: rosterSlots,
        needs: rosterStatus
      })
      setAiRec(data.recommendation)
    } catch {
      toast.error('AI recommendation failed')
    } finally {
      setAiLoading(false)
    }
  }

  // Compute scores + sort for display
  const availableSorted = useMemo(() => {
    const undrafted = players.filter(p => !p.drafted)
    return undrafted.map(p => ({
      ...p,
      adpValue: +(pickNumber - (p.adp || pickNumber)).toFixed(1),
      smartScore: +computeSmartScore(p, pickNumber, myTeam, rosterSlots, numTeams, totalRounds).toFixed(1),
    })).sort((a, b) => b.smartScore - a.smartScore)
  }, [players, pickNumber, myTeam, rosterSlots, numTeams])

  const filteredAvailable = useMemo(() => {
    return availableSorted.filter(p => {
      const matchPos = posFilter === 'ALL' || p.position.includes(posFilter)
      const matchSearch = p.player_name.toLowerCase().includes(search.toLowerCase())
      return matchPos && matchSearch
    })
  }, [availableSorted, posFilter, search])

  const filteredDrafted = useMemo(() => {
    return players.filter(p => p.drafted && (
      posFilter === 'ALL' || p.position.includes(posFilter)
    ) && p.player_name.toLowerCase().includes(search.toLowerCase()))
  }, [players, posFilter, search])

  const countdownPct = countdown != null ? (countdown / 90) * 100 : 0
  const currentRound = Math.ceil(pickNumber / numTeams)

  // Tier break detection: ADP gap > 12 between consecutive available players
  const tierBreakAfter = useMemo(() => {
    const breaks = new Set()
    const sorted = [...filteredAvailable].sort((a, b) => (a.adp || 999) - (b.adp || 999))
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = (sorted[i + 1]?.adp || 999) - (sorted[i]?.adp || 0)
      if (gap > 12) breaks.add(sorted[i].player_key)
    }
    return breaks
  }, [filteredAvailable])

  // Position status for filter buttons
  function posButtonStyle(pos) {
    if (pos === 'ALL') return {}
    const s = rosterStatus[pos]
    if (!s) return {}
    if (s.full) return { borderColor: '#ef4444', color: '#ef4444' }
    if (s.need > 0 && (SCARCITY[pos] || 1) >= 1.8) return { borderColor: '#f59e0b', color: '#f59e0b' }
    return {}
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Draft Assistant</h1>
          <p style={{ color: '#7aafc4' }}>Smart Score · Scarcity analysis · AI recommendations</p>
        </div>
        <button className="btn btn-primary" onClick={getAiRecommendation} disabled={aiLoading}>
          {aiLoading ? 'Thinking...' : '🤖 AI Pick'}
        </button>
      </div>

      {/* Live sync panel */}
      <div className="card" style={{
        marginBottom: 16, padding: '12px 16px',
        border: liveMode ? '1px solid #00a86b' : '1px solid #1e3d5c',
        background: liveMode ? 'rgba(0,168,107,0.06)' : undefined,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7aafc4', whiteSpace: 'nowrap' }}>Yahoo League:</span>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">Select league...</option>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={initFromYahoo} disabled={initLoading || !selectedLeague}>
            {initLoading ? 'Loading...' : '📥 Load Yahoo Players'}
          </button>
          <button className={`btn ${liveMode ? 'btn-danger' : 'btn-success'}`}
            style={{ fontSize: 12, padding: '6px 14px', fontWeight: 700 }}
            onClick={() => setLiveMode(v => !v)} disabled={!selectedLeague}>
            {liveMode ? '⏹ Stop Live Sync' : '🔴 Go Live'}
          </button>
          {liveMode && <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={syncNow}>↻ Sync Now</button>}
          {liveMode && lastSync && <span style={{ fontSize: 11, color: '#00a86b' }}>✓ {lastSync.toLocaleTimeString()}</span>}
          {syncError && <span style={{ fontSize: 11, color: '#ef4444' }}>{syncError}</span>}
          {liveMode && <span style={{ fontSize: 11, color: '#7aafc4', marginLeft: 'auto' }}>Auto-syncing every 10s</span>}
        </div>
      </div>

      {/* Draft status + roster needs bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Pick</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: myPick ? '#00a86b' : '#e2e8f0' }}>
              #{pickNumber} {myPick && '← YOU'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Round</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{currentRound} / {totalRounds}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Drafted</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{players.filter(p => p.drafted).length}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7aafc4' }}>Available</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{players.filter(p => !p.drafted).length}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#7aafc4' }}>Teams:</label>
            <input type="number" value={numTeams} onChange={e => setNumTeams(+e.target.value)} style={{ width: 60 }} min={8} max={20} />
          </div>
        </div>

        {/* Roster needs grid */}
        <div style={{ borderTop: '1px solid #1e3d5c', paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: '#4a7a94', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Roster Slots — Starting Lineup
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(rosterStatus).map(([pos, s]) => {
              const scarcityMulti = SCARCITY[pos] || 1
              const isCritical = !s.full && s.need > 0 && scarcityMulti >= 1.8
              const isUrgent = !s.full && s.need > 0 && scarcityMulti >= 1.3
              return (
                <div key={pos} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: s.full ? 'rgba(239,68,68,0.1)' : isCritical ? 'rgba(245,158,11,0.15)' : isUrgent ? 'rgba(245,158,11,0.08)' : 'rgba(0,168,107,0.08)',
                  border: `1px solid ${s.full ? '#ef4444' : isCritical ? '#f59e0b' : isUrgent ? '#d97706' : '#00a86b'}`,
                  color: s.full ? '#ef4444' : isCritical ? '#f59e0b' : isUrgent ? '#d97706' : '#00a86b',
                }}>
                  {pos} {s.have}/{s.required}
                  {isCritical && ' 🚨'}
                  {!isCritical && isUrgent && ' ⚠️'}
                  {s.full && ' ✓'}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* YOUR PICK banner */}
      {myPick && (
        <div style={{
          marginBottom: 16, borderRadius: 10, overflow: 'hidden',
          border: '2px solid #00a86b',
          boxShadow: '0 0 24px rgba(0,168,107,0.35), inset 0 0 16px rgba(0,168,107,0.07)',
          background: 'linear-gradient(135deg, #002a1a, #0c2c56)',
        }}>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#00a86b', letterSpacing: 1 }}>⏱ YOUR PICK ON THE CLOCK</div>
            {countdown != null && (
              <div style={{ fontSize: 28, fontWeight: 800, color: countdown <= 15 ? '#ef4444' : '#00a86b', minWidth: 50 }}>
                {countdown}s
              </div>
            )}
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }}
              onClick={() => { stopCountdown(); startCountdown(90) }}>Reset Timer</button>
          </div>
          {countdown != null && (
            <div style={{ height: 4, background: '#0c1d35' }}>
              <div style={{
                height: '100%', width: `${countdownPct}%`,
                background: countdown <= 15 ? '#ef4444' : '#00a86b',
                transition: 'width 1s linear, background 0.3s',
              }} />
            </div>
          )}
        </div>
      )}

      {/* AI Recommendation */}
      {(aiRec || aiLoading) && (
        <div className="card" style={{
          marginBottom: 16,
          border: myPick ? '1px solid #00a86b' : '1px solid #1e3d5c',
          background: myPick ? 'linear-gradient(135deg, #002a1a 0%, #0c2c56 100%)' : undefined,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ color: '#007a7a' }}>🤖 AI Recommendation — Round {currentRound}</h3>
            {aiRec && <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAiRec('')}>Dismiss</button>}
          </div>
          {aiLoading
            ? <div style={{ color: '#7aafc4', fontSize: 14 }}>Analyzing scarcity, tier breaks, and your roster needs...</div>
            : <div className="ai-response">{aiRec}</div>
          }
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { id: 'board',  label: '📊 Board' },
          { id: 'pool',   label: '📋 Player Pool' },
          { id: 'myteam', label: `⭐ My Team (${myTeam.length})` },
        ].map(tab => (
          <button key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 13, padding: '8px 16px' }}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* BOARD */}
      {activeTab === 'board' && (
        <div className="card" style={{ padding: 16 }}>
          <DraftBoard players={players} numTeams={numTeams} draftPosition={draftPosition} currentPick={pickNumber} />
        </div>
      )}

      {/* PLAYER POOL */}
      {activeTab === 'pool' && (
        <>
          {/* Scarcity legend */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', fontSize: 11 }}>
            <span style={{ color: '#4a7a94' }}>Position depth:</span>
            {Object.entries(SCARCITY_LABEL).map(([pos, label]) => (
              <span key={pos} style={{ color: '#7aafc4' }}><strong>{pos}</strong> {label}</span>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search players..." style={{ maxWidth: 200 }} />
            {POSITIONS.map(pos => {
              const s = rosterStatus[pos]
              const extra = posButtonStyle(pos)
              return (
                <button key={pos}
                  className={`btn ${posFilter === pos ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 12, padding: '6px 12px', position: 'relative', ...extra }}
                  onClick={() => setPosFilter(pos)}>
                  {pos}
                  {s && s.full && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 8, background: '#ef4444', borderRadius: '50%', width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>✓</span>}
                </button>
              )
            })}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ maxHeight: 'calc(100vh - 480px)', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th title="Smart Score = ADP value + positional urgency + scarcity bonus">Smart ▼</th>
                    <th title="Raw ADP value: pick# minus ADP">ADP Val</th>
                    <th>Player</th>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>Need</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvailable.map((player, idx) => {
                    const pos = primaryPos(player.position)
                    const posStatus = rosterStatus[pos]
                    const isFull = posStatus?.full
                    const isNeeded = posStatus && !posStatus.full && posStatus.need > 0
                    const isCritical = isNeeded && (SCARCITY[pos] || 1) >= 1.8
                    const isMulti = allPositions(player.position).length > 1
                    const showTierBreak = tierBreakAfter.has(player.player_key)

                    const ss = player.smartScore
                    const ssColor = ss >= 20 ? '#00a86b' : ss >= 5 ? '#f59e0b' : ss >= 0 ? '#7aafc4' : '#ef4444'
                    const avColor = player.adpValue >= 5 ? '#00a86b' : player.adpValue >= 0 ? '#f59e0b' : '#ef4444'

                    return (
                      <React.Fragment key={player.player_key}>
                        <tr style={{
                          background: isFull ? 'rgba(239,68,68,0.04)' : isCritical && isNeeded ? 'rgba(245,158,11,0.05)' : 'transparent',
                          borderLeft: isFull ? '3px solid #ef4444' : isCritical ? '3px solid #f59e0b' : isNeeded ? '3px solid #00a86b' : '3px solid transparent',
                          opacity: isFull ? 0.65 : 1,
                        }}>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 800, color: ssColor }}>
                              {ss > 0 ? `+${ss}` : ss}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 11, color: avColor }}>
                              {player.adpValue > 0 ? `+${player.adpValue}` : player.adpValue}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {player.player_name}
                            {isMulti && <span style={{ fontSize: 9, color: '#7aafc4', marginLeft: 4 }}>MULTI</span>}
                          </td>
                          <td>
                            <span className={`badge badge-${pos.toLowerCase()}`}>{player.position}</span>
                          </td>
                          <td style={{ color: '#7aafc4' }}>{player.team}</td>
                          <td>
                            {isFull
                              ? <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>FULL</span>
                              : isCritical
                                ? <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>🚨 SCARCE</span>
                                : isNeeded
                                  ? <span style={{ fontSize: 11, color: '#00a86b', fontWeight: 700 }}>NEED</span>
                                  : <span style={{ fontSize: 11, color: '#4a7a94' }}>UTIL/BN</span>
                            }
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success" style={{ fontSize: 11, padding: '4px 10px' }}
                                onClick={() => markDrafted(player, 'me')}>Draft Me</button>
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                                onClick={() => markDrafted(player, 'other')}>Taken</button>
                            </div>
                          </td>
                        </tr>
                        {showTierBreak && (
                          <tr>
                            <td colSpan={7} style={{ background: '#0a1e33', color: '#4aafdb', fontSize: 11, textAlign: 'center', padding: '4px', fontWeight: 700, letterSpacing: 1 }}>
                              ▼ TIER DROP — talent level falls significantly below this line ▼
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filteredDrafted.length > 0 && (
                    <>
                      <tr><td colSpan={7} style={{ background: '#122840', color: '#4a7a94', fontSize: 12, textAlign: 'center' }}>— DRAFTED —</td></tr>
                      {filteredDrafted.map(player => (
                        <tr key={player.player_key} style={{ opacity: 0.4 }}>
                          <td>—</td>
                          <td style={{ fontSize: 12, color: '#4a7a94' }}>{player.adp}</td>
                          <td style={{ textDecoration: 'line-through' }}>{player.player_name}</td>
                          <td><span className={`badge badge-${primaryPos(player.position).toLowerCase()}`}>{player.position}</span></td>
                          <td style={{ color: '#7aafc4' }}>{player.team}</td>
                          <td><span style={{ fontSize: 12, color: player.drafted_by === 'me' ? '#007a7a' : '#ef4444' }}>
                            {player.drafted_by === 'me' ? `Mine R${player.draft_round}` : `#${player.draft_pick}`}
                          </span></td>
                          <td>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}
                              onClick={() => undoPick(player)}>Undo</button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Smart Score legend */}
          <div style={{ marginTop: 10, fontSize: 11, color: '#4a7a94', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span><strong style={{ color: '#e2e8f0' }}>Smart Score</strong> = ADP value + positional urgency + scarcity bonus</span>
            <span style={{ color: '#00a86b' }}>Green border = needed slot</span>
            <span style={{ color: '#f59e0b' }}>Yellow border = scarce + needed</span>
            <span style={{ color: '#ef4444' }}>Red border = position full</span>
          </div>
        </>
      )}

      {/* MY TEAM */}
      {activeTab === 'myteam' && (
        <MyTeam team={myTeam} rosterStatus={rosterStatus} onUndo={undoPick} />
      )}
    </div>
  )
}

function MyTeam({ team, rosterStatus, onUndo }) {
  const totalSlots = Object.values(rosterStatus).reduce((s, v) => s + v.required, 0)
  const filledSlots = Object.values(rosterStatus).reduce((s, v) => s + v.have, 0)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Draft Picks ({team.length})</h2>
        <span style={{ fontSize: 13, color: '#7aafc4' }}>Starting slots: {filledSlots} / {totalSlots - (rosterStatus.BN?.required || 0) - (rosterStatus.IL?.required || 0)} filled</span>
      </div>
      {team.length === 0 ? (
        <p style={{ color: '#7aafc4' }}>No picks yet. Use "Draft Me" to add players to your team.</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>Rd</th><th>Player</th><th>Pos</th><th>ADP</th><th>Value</th><th>Team</th><th></th></tr>
          </thead>
          <tbody>
            {[...team].sort((a, b) => (a.draft_pick || 0) - (b.draft_pick || 0)).map(player => {
              const val = +(player.draft_pick - (player.adp || player.draft_pick)).toFixed(1)
              return (
                <tr key={player.player_key}>
                  <td style={{ color: '#7aafc4' }}>{player.draft_pick}</td>
                  <td style={{ color: '#7aafc4' }}>{player.draft_round}</td>
                  <td style={{ fontWeight: 500 }}>{player.player_name}</td>
                  <td><span className={`badge badge-${primaryPos(player.position).toLowerCase()}`}>{player.position}</span></td>
                  <td style={{ color: '#7aafc4', fontSize: 12 }}>{player.adp}</td>
                  <td style={{ fontSize: 12, color: val >= 3 ? '#00a86b' : val >= 0 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                    {val > 0 ? `+${val}` : val}
                  </td>
                  <td style={{ color: '#7aafc4' }}>{player.team}</td>
                  <td><button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => onUndo(player)}>Undo</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
