import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function StartSit({ leagueSettings }) {
  const [players, setPlayers] = useState([{ name: '', position: '', opponent: '', ballpark: '' }])
  const [context, setContext] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  function addPlayer() {
    setPlayers(prev => [...prev, { name: '', position: '', opponent: '', ballpark: '' }])
  }

  function updatePlayer(i, field, value) {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function removePlayer(i) {
    setPlayers(prev => prev.filter((_, idx) => idx !== i))
  }

  async function analyze() {
    const filled = players.filter(p => p.name.trim())
    if (filled.length < 2) return toast.error('Add at least 2 players to compare')
    setLoading(true)
    setResult('')
    try {
      const { data } = await axios.post('/api/claude/startsit', {
        players: filled,
        matchup_context: context,
        scoring_type: leagueSettings?.scoring_type || 'Roto 5x5'
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
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Start / Sit</h1>
      <p style={{ color: '#7aafc4', marginBottom: 24 }}>Get AI-powered lineup decisions for your toughest choices</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Players to Compare</h3>
        {players.map((p, i) => (
          <div key={i} className="player-row">
            <input placeholder="Player name" value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} />
            <input placeholder="Position" value={p.position} onChange={e => updatePlayer(i, 'position', e.target.value)} />
            <input placeholder="Opponent (e.g. @NYY)" value={p.opponent} onChange={e => updatePlayer(i, 'opponent', e.target.value)} />
            <input placeholder="Ballpark" value={p.ballpark} onChange={e => updatePlayer(i, 'ballpark', e.target.value)} />
            <button className="btn btn-danger" style={{ fontSize: 12, padding: '6px 10px' }}
              onClick={() => removePlayer(i)} disabled={players.length === 1}>✕</button>
          </div>
        ))}
        <button className="btn btn-ghost" style={{ fontSize: 13, marginTop: 8 }} onClick={addPlayer}>
          + Add Player
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Additional Context (optional)</h3>
        <textarea
          rows={3}
          placeholder="e.g. Facing a lefty tonight, need HR upside, streaming SP for streaming points..."
          value={context}
          onChange={e => setContext(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={analyze} disabled={loading}
        style={{ marginBottom: 16, padding: '12px 24px', fontSize: 15 }}>
        {loading ? '🤖 Analyzing...' : '🤖 Get Start/Sit Advice'}
      </button>

      {result && (
        <div className="card">
          <h3 style={{ color: '#007a7a', marginBottom: 12 }}>AI Analysis</h3>
          <div className="ai-response">{result}</div>
        </div>
      )}
    </div>
  )
}
