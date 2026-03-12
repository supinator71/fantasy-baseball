import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function RosterManager({ leagueSettings }) {
  const [roster, setRoster] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    try {
      const { data } = await axios.get('/api/yahoo/leagues')
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    } catch {}
  }

  async function fetchRoster() {
    if (!selectedLeague) return
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/roster`)
      const playerList = []
      if (data) {
        const count = data['@attributes']?.count || 0
        for (let i = 0; i < count; i++) {
          const p = data[i]?.player
          if (p) playerList.push({
            name: p[0]?.full?.name || p[0]?.name?.full || 'Unknown',
            positions: p[0]?.eligible_positions?.position || [],
            team: p[0]?.editorial_team_abbr || '',
            status: p[1]?.selected_position?.[1]?.position || 'BN',
            injury: p[0]?.status || ''
          })
        }
      }
      setRoster(playerList)
    } catch (err) {
      toast.error('Could not load roster from Yahoo. Showing empty roster.')
      setRoster([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedLeague) fetchRoster()
  }, [selectedLeague])

  const active = roster.filter(p => p.status !== 'BN' && p.status !== 'IL')
  const bench = roster.filter(p => p.status === 'BN')
  const il = roster.filter(p => p.status === 'IL')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>My Roster</h1>
          <p style={{ color: '#7aafc4' }}>Your current lineup pulled from Yahoo Fantasy</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => (
              <option key={i} value={l.league_key}>{l.name || l.league_key}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={fetchRoster} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading your roster from Yahoo...</div>
      ) : (
        <>
          <RosterSection title="Active Lineup" players={active} color="#00a86b" />
          <RosterSection title="Bench" players={bench} color="#f59e0b" />
          {il.length > 0 && <RosterSection title="Injured List (IL)" players={il} color="#ef4444" />}

          {roster.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <p style={{ color: '#7aafc4' }}>No roster data available. Make sure your Yahoo league is active and try refreshing.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RosterSection({ title, players, color }) {
  if (players.length === 0) return null
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color }}>{title} ({players.length})</h2>
      <table>
        <thead>
          <tr><th>Slot</th><th>Player</th><th>Position</th><th>Team</th><th>Status</th></tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i}>
              <td style={{ color: '#7aafc4', fontSize: 12, fontWeight: 600 }}>{p.status}</td>
              <td style={{ fontWeight: 500 }}>{p.name}</td>
              <td>
                {(Array.isArray(p.positions) ? p.positions : [p.positions]).map((pos, j) => (
                  <span key={j} className={`badge badge-${String(pos).toLowerCase()}`} style={{ marginRight: 4 }}>{pos}</span>
                ))}
              </td>
              <td style={{ color: '#7aafc4' }}>{p.team}</td>
              <td>
                {p.injury ? (
                  <span style={{ color: '#ef4444', fontSize: 12 }}>{p.injury}</span>
                ) : (
                  <span style={{ color: '#00a86b', fontSize: 12 }}>Active</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
