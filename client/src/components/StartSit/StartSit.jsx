import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function StartSit({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [context, setContext] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

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
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`)
      setRoster(data.players || [])
    } catch (err) {
      toast.error('Could not load roster.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function analyzeDailyLineup() {
    if (!roster.length) return toast.error('No roster loaded.')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await axios.post('/api/claude/startsit', {
        players: roster,
        matchup_context: 'TODAY_DAILY_OPTIMIZER: Evaluate my ENTIRE roster for TODAY. Who are the absolute Must-Starts today? Who should be immediately benched? Identify my 3 toughest start/sit decisions and tell me what to do.',
        scoring_type: leagueSettings?.scoring_type || 'Roto 5x5',
        daily_mode: true
      })
      setResult(data.analysis)
    } catch {
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Daily Start/Sit</h1>
          <p style={{ color: '#7aafc4' }}>AI-powered daily lineup optimizer</p>
        </div>
        <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
          {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
        </select>
      </div>

      {rosterLoading ? (
        <div className="loading" style={{ margin: '40px 0' }}>Loading your live roster...</div>
      ) : roster.length > 0 ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Roster ({roster.length} players)</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>Ready for today's analysis.</p>
            </div>
            <button className="btn btn-primary" onClick={analyzeDailyLineup} disabled={loading}
              style={{ padding: '12px 24px', fontSize: 15, background: 'linear-gradient(135deg, #00a86b 0%, #007a7a 100%)' }}>
              {loading ? '🤖 Auto-generating Today\'s Lineup...' : '🤖 Optimize Today\'s Lineup'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{ background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 48, marginBottom: 16 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚾</div>
          <div className="loading">Select a league to load your roster...</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Additional Context (optional)</h3>
        <textarea
          rows={3}
          placeholder="e.g. Facing a lefty tonight, need HR upside, streaming SP for streaming points..."
          value={context}
          onChange={e => setContext(e.target.value)}
        />
      </div>



      {result && (
        <div className="card">
          <h3 style={{ color: '#007a7a', marginBottom: 12 }}>AI Analysis</h3>
          <div className="ai-response">{result}</div>
        </div>
      )}
    </div>
  )
}
