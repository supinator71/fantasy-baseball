import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function TradeAnalyzer({ leagueSettings }) {
  const [giving, setGiving] = useState('')
  const [receiving, setReceiving] = useState('')
  const [myRoster, setMyRoster] = useState('')
  const [theirRoster, setTheirRoster] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function analyze() {
    if (!giving.trim() || !receiving.trim()) return toast.error('Enter players on both sides of the trade')
    setLoading(true)
    setResult('')
    try {
      const { data } = await axios.post('/api/claude/trade', {
        giving: giving.split(',').map(p => p.trim()),
        receiving: receiving.split(',').map(p => p.trim()),
        my_roster: myRoster.split(',').map(p => p.trim()).filter(Boolean),
        their_roster: theirRoster.split(',').map(p => p.trim()).filter(Boolean)
      })
      setResult(data.analysis)
    } catch {
      toast.error('Trade analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Trade Analyzer</h1>
      <p style={{ color: '#7aafc4', marginBottom: 24 }}>Evaluate any trade with AI-powered fairness analysis</p>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ color: '#ef4444', marginBottom: 12 }}>You Give</h3>
          <textarea
            rows={4}
            placeholder="Player names separated by commas&#10;e.g. Aaron Judge, Gerrit Cole"
            value={giving}
            onChange={e => setGiving(e.target.value)}
          />
        </div>
        <div className="card">
          <h3 style={{ color: '#00a86b', marginBottom: 12 }}>You Receive</h3>
          <textarea
            rows={4}
            placeholder="Player names separated by commas&#10;e.g. Mookie Betts, Spencer Strider"
            value={receiving}
            onChange={e => setReceiving(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 14 }}>My Full Roster (optional — improves analysis)</h3>
          <textarea rows={3} placeholder="All my players, comma separated"
            value={myRoster} onChange={e => setMyRoster(e.target.value)} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 14 }}>Their Full Roster (optional)</h3>
          <textarea rows={3} placeholder="Their players, comma separated"
            value={theirRoster} onChange={e => setTheirRoster(e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={analyze} disabled={loading}
        style={{ padding: '12px 24px', fontSize: 15, marginBottom: 16 }}>
        {loading ? '🤖 Analyzing Trade...' : '🤖 Analyze Trade'}
      </button>

      {result && (
        <div className="card">
          <h3 style={{ color: '#007a7a', marginBottom: 12 }}>Trade Analysis</h3>
          <div className="ai-response">{result}</div>
        </div>
      )}
    </div>
  )
}
