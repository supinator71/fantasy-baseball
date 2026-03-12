import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function TradeFinder({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) loadRoster()
  }, [selectedLeague])

  async function loadRoster() {
    setRosterLoading(true)
    setResult(null)
    setError('')
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`)
      setRoster(data.players || [])
    } catch (err) {
      setError('Could not load roster.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function findTrades() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/claude/trade/find', {
        my_roster: roster,
        all_rosters: [],
        league_standings: []
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Trade finder failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const myAnalysis = result?.myAnalysis

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Trade Finder</h1>
          <p style={{ color: '#7aafc4' }}>AI identifies your surpluses and voids, then generates trade proposals with pitch language</p>
        </div>
        <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
          {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
        </select>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {rosterLoading && <div className="loading">Loading your roster...</div>}

      {/* Roster + trigger */}
      {!rosterLoading && roster.length > 0 && !result && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Roster ({roster.length} players)</h3>
            <button className="btn btn-primary" onClick={findTrades} disabled={loading}
              style={{ padding: '10px 24px', fontSize: 14 }}>
              {loading ? '🤖 Finding trades...' : '🤝 Find Trade Opportunities'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{
                background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6, padding: '4px 10px', fontSize: 12
              }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🤝</div>
          <div className="loading">Analyzing roster compatibility and generating proposals...</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* My roster analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            {myAnalysis?.surpluses?.length > 0 && (
              <div className="card" style={{ background: 'rgba(0,168,107,0.07)', border: '1px solid rgba(0,168,107,0.2)' }}>
                <h3 style={{ color: '#00a86b', fontSize: 14, marginBottom: 10 }}>📤 Your Surplus Positions</h3>
                {myAnalysis.surpluses.map((s, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <span className={`badge badge-${s.position.toLowerCase()}`} style={{ marginRight: 6 }}>{s.position}</span>
                    <span style={{ fontSize: 12, color: '#7aafc4' }}>{s.players?.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}
            {myAnalysis?.voids?.length > 0 && (
              <div className="card" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ color: '#ef4444', fontSize: 14, marginBottom: 10 }}>📥 Your Roster Voids</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {myAnalysis.voids.map((v, i) => (
                    <span key={i} className={`badge badge-${v.toLowerCase()}`}>{v}</span>
                  ))}
                </div>
              </div>
            )}
            {myAnalysis?.sellHigh?.length > 0 && (
              <div className="card" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <h3 style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>📈 Sell High Candidates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {myAnalysis.sellHigh.map((p, i) => (
                    <span key={i} style={{ fontSize: 13, color: '#e2e8f0' }}>{p.name}
                      <span style={{ fontSize: 11, color: '#7aafc4', marginLeft: 8 }}>VOR {p.vor}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trade proposals */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ color: '#007a7a', marginBottom: 12 }}>🎯 AI Trade Proposals</h3>
            <div className="ai-response">{result.proposals}</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={findTrades} disabled={loading}>
              {loading ? '🤖 Re-analyzing...' : '↻ Regenerate'}
            </button>
            <button className="btn btn-ghost" onClick={() => setResult(null)}>Clear</button>
          </div>
        </>
      )}

      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to load your roster and find trade opportunities.</p>
        </div>
      )}
    </div>
  )
}
