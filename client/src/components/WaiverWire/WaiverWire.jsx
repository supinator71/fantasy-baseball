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

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) fetchAvailable()
  }, [selectedLeague, posFilter])

  async function fetchAvailable() {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, {
        params: { status: 'FA' }
      })
      const players = []
      if (Array.isArray(data)) {
        data.forEach(item => {
          const p = item?.player
          if (p && Array.isArray(p)) {
            const infoArray = Array.isArray(p[0]) ? p[0] : [];
            const ownershipObj = p[1] || {};
            const info = Object.assign({}, ...infoArray);
            
            players.push({
               key: info.player_key,
               name: info.name?.full || info.full_name || 'Unknown',
               position: info.display_position || '',
               team: info.editorial_team_abbr || '',
               ownership: ownershipObj.ownership?.ownership_type || 'free_agent'
            })
          }
        })
      }
      setAvailable(players)
    } catch {
      setAvailable([])
    } finally {
      setLoading(false)
    }
  }

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
    } catch {
      toast.error('AI recommendation failed')
    } finally {
      setAiLoading(false)
    }
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
          <button className="btn btn-primary" onClick={getAiRecommendations} disabled={aiLoading}>
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
              <tr><th>Player</th><th>Position</th><th>Team</th><th>Ownership</th><th>Action</th></tr>
            </thead>
            <tbody>
              {available.filter(p => posFilter === 'ALL' || p.position.includes(posFilter)).map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className={`badge badge-${p.position.split(',')[0].toLowerCase().trim()}`}>{p.position}</span></td>
                  <td style={{ color: '#7aafc4' }}>{p.team}</td>
                  <td><span style={{ color: '#00a86b', fontSize: 12 }}>Free Agent</span></td>
                  <td>
                    <button className="btn btn-success" style={{ fontSize: 11, padding: '4px 10px' }}>Add</button>
                  </td>
                </tr>
              ))}
              {available.length === 0 && !loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#7aafc4', padding: 32 }}>
                  No available players found. Select a league above to load the waiver wire.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
