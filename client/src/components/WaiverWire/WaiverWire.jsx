import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function WaiverWire({ leagueSettings }) {
  const [available, setAvailable] = useState([])
  const [myRoster, setMyRoster] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiRec, setAiRec] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [posFilter, setPosFilter] = useState('ALL')
  const [trendMap, setTrendMap] = useState({})

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) {
       fetchAvailable()
       fetchMyRoster()
    }
  }, [selectedLeague, posFilter])

  async function fetchMyRoster() {
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`);
      setMyRoster(data?.players || []);
    } catch {
      setMyRoster([]);
    }
  }

  const [debugInfo, setDebugInfo] = useState(null)

  async function fetchAvailable() {
    setLoading(true)
    setDebugInfo(null)
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, {
        params: { status: 'A', force: 'true' }
      })
      if (Array.isArray(data)) {
        setAvailable(data)
      } else {
        setAvailable([])
      }
    } catch (err) {
      setDebugInfo({ error: err.message })
      setAvailable([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch value trends for waiver players (non-blocking)
  useEffect(() => {
    if (available.length > 0) {
      const players = available.slice(0, 25).map(p => ({ name: p.name, adp: 200 }))
      axios.post('/api/mlb/roster-value', { players, leagueSize: 12 })
        .then(({ data }) => {
          const map = {}
          ;(data.players || []).forEach(p => { map[p.name] = p.valueTrend })
          setTrendMap(map)
        })
        .catch(() => {})
    }
  }, [available])

  async function getAiRecommendations() {
    setAiLoading(true)
    setAiRec('')
    try {
      const { data } = await axios.post('/api/claude/waiver', {
        available_players: available.slice(0, 20),
        my_roster: myRoster,
        drop_candidates: myRoster.slice(-5)
      })
      setAiRec(data.recommendations)
    } catch (err) {
      const msg = err.response?.data?.error || JSON.stringify(err.response?.data) || err.message || 'AI recommendation failed'
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg)
    } finally {
      setAiLoading(false)
    }
  }

  // Helper: safely display a stat value (Yahoo returns "-" in preseason)
  const safeStat = (val) => {
    if (val === undefined || val === null || val === '-' || val === '-/-') return '—'
    return val
  }
  const safeRate = (val, decimals = 3) => {
    if (val === undefined || val === null || val === '-' || val === '-/-') return '—'
    const n = parseFloat(val)
    if (isNaN(n)) return '—'
    return n.toFixed(decimals).replace(/^0/, '')
  }

  const renderStats = (p) => {
    const isPitcher = p.position.includes('P')
    const hasStats = p.stats && Object.values(p.stats).some(v => v !== '-' && v !== '-/-' && v !== undefined)
    
    if (!hasStats) {
      return <span style={{ fontSize: 13, color: '#5a6a72', fontStyle: 'italic' }}>Preseason — no stats yet</span>
    }
    
    if (isPitcher) {
      return (
        <span style={{ fontSize: 13, color: '#a0aab2' }}>
          W: {safeStat(p.stats?.['28'])} | SV: {safeStat(p.stats?.['32'])} | K: {safeStat(p.stats?.['42'])} | ERA: {safeRate(p.stats?.['26'], 2)} | WHIP: {safeRate(p.stats?.['27'], 2)}
        </span>
      )
    }
    return (
      <span style={{ fontSize: 13, color: '#a0aab2' }}>
        R: {safeStat(p.stats?.['60'])} | HR: {safeStat(p.stats?.['7'])} | RBI: {safeStat(p.stats?.['12'])} | SB: {safeStat(p.stats?.['16'])} | AVG: {safeRate(p.stats?.['3'])}
      </span>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Waiver Wire</h1>
          <p style={{ color: '#7aafc4' }}>Find available players and get AI-powered add/drop advice</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <button className="btn btn-primary" onClick={getAiRecommendations} disabled={aiLoading || available.length === 0}>
            {aiLoading ? 'Analyzing...' : '🤖 AI Advice'}
          </button>
        </div>
      </div>

      {aiRec && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ color: '#007a7a' }}>🤖 Waiver Wire Recommendations</h3>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAiRec('')}>Dismiss</button>
          </div>
          <div className="ai-response">{aiRec}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['ALL', 'SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'OF'].map(pos => (
          <button key={pos} className={`btn ${posFilter === pos ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => setPosFilter(pos)}>{pos}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading">Loading available players...</div>
        ) : (
          <table>
            <thead>
              <tr><th>Player</th><th>Position</th><th>Team</th><th>Trend</th><th>Projected Stats</th><th>Action</th></tr>
            </thead>
            <tbody>
              {available.filter(p => posFilter === 'ALL' || p.position.includes(posFilter)).map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className={`badge badge-${p.position.split(',')[0].toLowerCase().trim()}`}>{p.position}</span></td>
                  <td style={{ color: '#7aafc4' }}>{p.team}</td>
                  <td style={{ textAlign: 'center' }}>
                    {(() => {
                      const t = trendMap[p.name]
                      if (!t) return <span style={{ color: '#4a7a94', fontSize: 12 }}>—</span>
                      const isUnder = t.classification?.includes('UNDERVALUED')
                      const isOver = t.classification?.includes('OVERVALUED')
                      if (isUnder) return <span title={t.summary} style={{ color: '#00a86b', fontSize: 14, cursor: 'help' }}>▲</span>
                      if (isOver) return <span title={t.summary} style={{ color: '#ef4444', fontSize: 14, cursor: 'help' }}>▼</span>
                      return <span title={t.summary} style={{ color: '#4aafdb', fontSize: 12, cursor: 'help' }}>—</span>
                    })()}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{renderStats(p)}</td>
                  <td>
                    <button className="btn btn-success" style={{ fontSize: 11, padding: '4px 10px' }}>Add</button>
                  </td>
                </tr>
              ))}
              {available.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#7aafc4', padding: 32 }}>
                  No available players found. Select a league above to load the waiver wire.
                  {debugInfo && (
                    <pre style={{textAlign: 'left', marginTop: 16, background: '#0a1929', padding: 12, borderRadius: 8}}>
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  )}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
