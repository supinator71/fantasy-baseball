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
      if (Array.isArray(data)) {
        data.forEach(item => {
          const p = item?.player
          if (p && Array.isArray(p)) {
            // Yahoo returns an array: p[0] = info array, p[1] = roster position info
            const infoArray = Array.isArray(p[0]) ? p[0] : [];
            const rosterInfo = p[1] || {};
            
            // Flatten the array of objects [{player_key: "..."}, {name: {full: "..."}}, ...] into one object
            const info = Object.assign({}, ...infoArray);
            
            // Extract name (Yahoo returns as {name: {full: "John Doe"}} or sometimes nested)
            const name = info.name?.full || info.name?.first && `${info.name.first} ${info.name.last}` || info.full_name || 'Unknown';
            
            // Extract eligible positions (variable Yahoo formats)
            let positions = [];
            const ep = info.eligible_positions;
            if (ep) {
              // Could be: [{position: "SS"}, {position: "OF"}] or {position: "SS"} or ["SS", "OF"]
              if (Array.isArray(ep)) {
                positions = ep.map(p => p?.position || p).filter(Boolean);
              } else if (ep.position) {
                positions = Array.isArray(ep.position) ? ep.position.map(p => p?.position || p) : [ep.position];
              }
            }
            if (!positions.length && info.display_position) {
              positions = info.display_position.split(',').map(s => s.trim());
            }
            
            // Extract selected position (lineup slot)
            const selectedPos = rosterInfo?.selected_position;
            let slot = 'BN';
            if (selectedPos) {
              if (Array.isArray(selectedPos)) {
                // Could be [{coverage_type: "week"}, {position: "SS"}] or [{position: "BN"}]
                for (const sp of selectedPos) {
                  if (sp?.position) { slot = sp.position; break; }
                }
              } else if (selectedPos.position) {
                slot = selectedPos.position;
              }
            }
            
            playerList.push({
              name,
              positions,
              team: info.editorial_team_abbr || '',
              status: slot,
              injury: info.status || ''
            })
          }
        })
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
