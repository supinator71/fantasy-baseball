import React, { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import DraftBoard from './DraftBoard'

const POSITIONS = ['ALL', 'SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'OF']

const DEFAULT_PLAYERS = [
  { player_key: '1', player_name: 'Aaron Judge', position: 'OF', team: 'NYY', adp: 1.2 },
  { player_key: '2', player_name: 'Shohei Ohtani', position: 'SP/OF', team: 'LAD', adp: 2.1 },
  { player_key: '3', player_name: 'Mookie Betts', position: 'OF/2B', team: 'LAD', adp: 3.4 },
  { player_key: '4', player_name: 'Ronald Acuna Jr.', position: 'OF', team: 'ATL', adp: 4.1 },
  { player_key: '5', player_name: 'Freddie Freeman', position: '1B', team: 'LAD', adp: 5.3 },
  { player_key: '6', player_name: 'Juan Soto', position: 'OF', team: 'NYY', adp: 6.2 },
  { player_key: '7', player_name: 'Paul Goldschmidt', position: '1B', team: 'STL', adp: 7.8 },
  { player_key: '8', player_name: 'Yordan Alvarez', position: 'OF/1B', team: 'HOU', adp: 8.4 },
  { player_key: '9', player_name: 'Gerrit Cole', position: 'SP', team: 'NYY', adp: 9.1 },
  { player_key: '10', player_name: 'Jose Ramirez', position: '3B', team: 'CLE', adp: 10.3 },
  { player_key: '11', player_name: 'Trea Turner', position: 'SS', team: 'PHI', adp: 11.5 },
  { player_key: '12', player_name: 'Julio Rodriguez', position: 'OF', team: 'SEA', adp: 12.1 },
  { player_key: '13', player_name: 'Bobby Witt Jr.', position: 'SS', team: 'KC', adp: 13.2 },
  { player_key: '14', player_name: 'Spencer Strider', position: 'SP', team: 'ATL', adp: 14.0 },
  { player_key: '15', player_name: 'Corbin Carroll', position: 'OF', team: 'ARI', adp: 15.3 },
  { player_key: '16', player_name: 'Bryce Harper', position: '1B', team: 'PHI', adp: 16.1 },
  { player_key: '17', player_name: 'Nolan Arenado', position: '3B', team: 'STL', adp: 17.4 },
  { player_key: '18', player_name: 'Corey Seager', position: 'SS', team: 'TEX', adp: 18.2 },
  { player_key: '19', player_name: 'Blake Snell', position: 'SP', team: 'SF', adp: 19.6 },
  { player_key: '20', player_name: 'Adley Rutschman', position: 'C', team: 'BAL', adp: 20.1 },
  { player_key: '21', player_name: 'Will Smith', position: 'C', team: 'LAD', adp: 28.4 },
  { player_key: '22', player_name: 'Emmanuel Clase', position: 'RP', team: 'CLE', adp: 31.2 },
  { player_key: '23', player_name: 'Edwin Diaz', position: 'RP', team: 'NYM', adp: 34.1 },
  { player_key: '24', player_name: 'Zack Wheeler', position: 'SP', team: 'PHI', adp: 22.3 },
  { player_key: '25', player_name: 'Max Fried', position: 'SP', team: 'ATL', adp: 24.8 },
]

function isMyPickFn(pick, pos, teams) {
  const round = Math.ceil(pick / teams)
  const spotInRound = pick - (round - 1) * teams
  if (round % 2 === 1) return spotInRound === pos
  return spotInRound === (teams - pos + 1)
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
  const autoTriggered = useRef(false)
  const countdownRef = useRef(null)
  const draftPosition = leagueSettings?.draft_position || 1

  useEffect(() => { loadBoard() }, [])

  const myPick = useMemo(
    () => isMyPickFn(pickNumber, draftPosition, numTeams),
    [pickNumber, draftPosition, numTeams]
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
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          setTimerActive(false)
          return 0
        }
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

  async function loadBoard() {
    try {
      const { data } = await axios.get('/api/draft/board')
      if (data.length === 0) {
        await axios.post('/api/draft/load', { players: DEFAULT_PLAYERS })
        setPlayers(DEFAULT_PLAYERS.map(p => ({ ...p, drafted: 0 })))
      } else {
        setPlayers(data)
        setMyTeam(data.filter(p => p.drafted_by === 'me'))
        const drafted = data.filter(p => p.drafted).length
        setPickNumber(drafted + 1)
      }
    } catch {
      setPlayers(DEFAULT_PLAYERS.map(p => ({ ...p, drafted: 0 })))
    }
  }

  async function markDrafted(player, by = 'other') {
    const round = Math.ceil(pickNumber / numTeams)
    await axios.post('/api/draft/pick', {
      player_key: player.player_key,
      drafted_by: by,
      draft_round: round,
      draft_pick: pickNumber
    })
    setPlayers(prev => prev.map(p =>
      p.player_key === player.player_key
        ? { ...p, drafted: 1, drafted_by: by, draft_round: round, draft_pick: pickNumber }
        : p
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
      const available = players.filter(p => !p.drafted).slice(0, 20)
      const needs = getPositionalNeeds()
      const { data } = await axios.post('/api/claude/draft/recommend', {
        available_players: available,
        my_roster: myTeam,
        pick_number: pickNumber,
        total_picks: numTeams * 23,
        needs
      })
      setAiRec(data.recommendation)
    } catch {
      toast.error('AI recommendation failed')
    } finally {
      setAiLoading(false)
    }
  }

  function getPositionalNeeds() {
    const positions = { SP: 0, RP: 0, C: 0, '1B': 0, '2B': 0, '3B': 0, SS: 0, OF: 0 }
    myTeam.forEach(p => {
      const pos = p.position.split('/')[0]
      if (positions[pos] !== undefined) positions[pos]++
    })
    return positions
  }

  const filteredPlayers = players.filter(p => {
    const matchPos = posFilter === 'ALL' || p.position.includes(posFilter)
    const matchSearch = p.player_name.toLowerCase().includes(search.toLowerCase())
    return matchPos && matchSearch
  })

  const available = filteredPlayers
    .filter(p => !p.drafted)
    .map(p => ({ ...p, value: +(pickNumber - p.adp).toFixed(1) }))
    .sort((a, b) => b.value - a.value)

  const drafted = filteredPlayers.filter(p => p.drafted)

  const countdownPct = countdown != null ? (countdown / 90) * 100 : 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Draft Assistant</h1>
          <p style={{ color: '#7aafc4' }}>Visual board · ADP value · AI recommendations</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={getAiRecommendation} disabled={aiLoading}>
            {aiLoading ? 'Thinking...' : '🤖 AI Pick'}
          </button>
        </div>
      </div>

      {/* Draft status bar */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#7aafc4' }}>Current Pick</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: myPick ? '#00a86b' : '#e2e8f0' }}>
            #{pickNumber} {myPick && '← YOUR PICK'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7aafc4' }}>Round</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{Math.ceil(pickNumber / numTeams)}</div>
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
          <input type="number" value={numTeams} onChange={e => setNumTeams(+e.target.value)}
            style={{ width: 60 }} min={8} max={20} />
        </div>
      </div>

      {/* YOUR PICK banner with countdown */}
      {myPick && (
        <div style={{
          marginBottom: 16, borderRadius: 10, overflow: 'hidden',
          border: '2px solid #00a86b',
          boxShadow: '0 0 24px rgba(0,168,107,0.35), inset 0 0 16px rgba(0,168,107,0.07)',
          background: 'linear-gradient(135deg, #002a1a, #0c2c56)',
        }}>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#00a86b', letterSpacing: 1 }}>
              ⏱ YOUR PICK ON THE CLOCK
            </div>
            {countdown != null && (
              <div style={{ fontSize: 28, fontWeight: 800, color: countdown <= 15 ? '#ef4444' : '#00a86b', minWidth: 50 }}>
                {countdown}s
              </div>
            )}
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }}
              onClick={() => { stopCountdown(); startCountdown(90) }}>Reset Timer</button>
          </div>
          {/* Progress bar */}
          {countdown != null && (
            <div style={{ height: 4, background: '#0c1d35' }}>
              <div style={{
                height: '100%',
                width: `${countdownPct}%`,
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
            <h3 style={{ color: '#007a7a' }}>🤖 AI Recommendation</h3>
            {aiRec && <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAiRec('')}>Dismiss</button>}
          </div>
          {aiLoading
            ? <div style={{ color: '#7aafc4', fontSize: 14 }}>Analyzing available players and your roster needs...</div>
            : <div className="ai-response">{aiRec}</div>
          }
        </div>
      )}

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { id: 'board', label: '📊 Board' },
          { id: 'pool', label: '📋 Player Pool' },
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

      {/* BOARD TAB */}
      {activeTab === 'board' && (
        <div className="card" style={{ padding: 16 }}>
          <DraftBoard
            players={players}
            numTeams={numTeams}
            draftPosition={draftPosition}
            currentPick={pickNumber}
          />
        </div>
      )}

      {/* PLAYER POOL TAB */}
      {activeTab === 'pool' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search players..." style={{ maxWidth: 240 }} />
            {POSITIONS.map(pos => (
              <button key={pos} className={`btn ${posFilter === pos ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => setPosFilter(pos)}>{pos}</button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ADP</th>
                    <th>Value</th>
                    <th>Player</th>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {available.map(player => {
                    const val = player.value
                    const valColor = val >= 5 ? '#00a86b' : val >= 0 ? '#f59e0b' : '#ef4444'
                    return (
                      <tr key={player.player_key}>
                        <td style={{ color: '#7aafc4', fontSize: 12 }}>{player.adp}</td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            background: val >= 5 ? 'rgba(0,168,107,0.15)' : val >= 0 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                            color: valColor
                          }}>
                            {val > 0 ? `+${val}` : val}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{player.player_name}</td>
                        <td><span className={`badge badge-${player.position.split('/')[0].toLowerCase()}`}>{player.position}</span></td>
                        <td style={{ color: '#7aafc4' }}>{player.team}</td>
                        <td><span style={{ color: '#00a86b', fontSize: 12 }}>Available</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-success" style={{ fontSize: 11, padding: '4px 10px' }}
                              onClick={() => markDrafted(player, 'me')}>Draft Me</button>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                              onClick={() => markDrafted(player, 'other')}>Taken</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {drafted.length > 0 && (
                    <>
                      <tr><td colSpan={7} style={{ background: '#122840', color: '#4a7a94', fontSize: 12, textAlign: 'center' }}>— DRAFTED —</td></tr>
                      {drafted.map(player => (
                        <tr key={player.player_key} style={{ opacity: 0.4 }}>
                          <td style={{ fontSize: 12 }}>{player.adp}</td>
                          <td>—</td>
                          <td style={{ textDecoration: 'line-through' }}>{player.player_name}</td>
                          <td><span className={`badge badge-${player.position.split('/')[0].toLowerCase()}`}>{player.position}</span></td>
                          <td style={{ color: '#7aafc4' }}>{player.team}</td>
                          <td><span style={{ color: player.drafted_by === 'me' ? '#007a7a' : '#ef4444', fontSize: 12 }}>
                            {player.drafted_by === 'me' ? `Mine (R${player.draft_round})` : `Taken #${player.draft_pick}`}
                          </span></td>
                          <td>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
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
        </>
      )}

      {/* MY TEAM TAB */}
      {activeTab === 'myteam' && (
        <MyTeam team={myTeam} onUndo={undoPick} />
      )}
    </div>
  )
}

function MyTeam({ team, onUndo }) {
  return (
    <div className="card">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>My Draft Picks ({team.length})</h2>
      {team.length === 0 ? (
        <p style={{ color: '#7aafc4' }}>No picks yet. Use "Draft Me" to add players to your team.</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>Round</th><th>Player</th><th>Pos</th><th>ADP</th><th>Team</th><th></th></tr>
          </thead>
          <tbody>
            {team.sort((a, b) => (a.draft_pick || 0) - (b.draft_pick || 0)).map(player => (
              <tr key={player.player_key}>
                <td style={{ color: '#7aafc4' }}>{player.draft_pick}</td>
                <td style={{ color: '#7aafc4' }}>{player.draft_round}</td>
                <td style={{ fontWeight: 500 }}>{player.player_name}</td>
                <td><span className={`badge badge-${player.position.split('/')[0].toLowerCase()}`}>{player.position}</span></td>
                <td style={{ color: '#7aafc4', fontSize: 12 }}>{player.adp}</td>
                <td style={{ color: '#7aafc4' }}>{player.team}</td>
                <td><button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}
                  onClick={() => onUndo(player)}>Undo</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
