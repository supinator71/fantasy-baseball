import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function RosterManager({ leagueSettings }) {
  const [roster, setRoster] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendMap, setTrendMap] = useState({})

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

  // Fetch value trends for roster players (non-blocking)
  async function fetchTrends(playerList) {
    try {
      const players = playerList.map(p => ({ name: p.name, adp: 200 }))
      const { data } = await axios.post('/api/mlb/roster-value', { players, leagueSize: 12 })
      const map = {}
      ;(data.players || []).forEach(p => {
        map[p.name] = p.valueTrend
      })
      setTrendMap(map)
    } catch (e) {
      console.log('Trend fetch skipped:', e.message)
    }
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
            const infoArray = Array.isArray(p[0]) ? p[0] : [];
            const rosterInfo = p[1] || {};
            const info = Object.assign({}, ...infoArray);
            const name = info.name?.full || info.name?.first && `${info.name.first} ${info.name.last}` || info.full_name || 'Unknown';
            let positions = [];
            const ep = info.eligible_positions;
            if (ep) {
              if (Array.isArray(ep)) {
                positions = ep.map(p => p?.position || p).filter(Boolean);
              } else if (ep.position) {
                positions = Array.isArray(ep.position) ? ep.position.map(p => p?.position || p) : [ep.position];
              }
            }
            if (!positions.length && info.display_position) {
              positions = info.display_position.split(',').map(s => s.trim());
            }
            const selectedPos = rosterInfo?.selected_position;
            let slot = 'BN';
            if (selectedPos) {
              if (Array.isArray(selectedPos)) {
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
      // Fetch trends in background
      if (playerList.length > 0) fetchTrends(playerList)
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
          <RosterSection title="Active Lineup" players={active} color="#00a86b" trendMap={trendMap} />
          <RosterSection title="Bench" players={bench} color="#f59e0b" trendMap={trendMap} />
          {il.length > 0 && <RosterSection title="Injured List (IL)" players={il} color="#ef4444" trendMap={trendMap} />}

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

function TrendArrow({ trend }) {
  if (!trend) return <span style={{ color: '#4a7a94', fontSize: 12 }}>—</span>
  const isUnder = trend.classification?.includes('UNDERVALUED')
  const isOver = trend.classification?.includes('OVERVALUED')
  if (isUnder) return <span title={trend.summary} style={{ color: '#00a86b', fontSize: 14, cursor: 'help' }}>▲</span>
  if (isOver) return <span title={trend.summary} style={{ color: '#ef4444', fontSize: 14, cursor: 'help' }}>▼</span>
  return <span title={trend.summary} style={{ color: '#4aafdb', fontSize: 12, cursor: 'help' }}>—</span>
}

function RosterSection({ title, players, color, trendMap = {} }) {
  if (players.length === 0) return null
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color }}>{title} ({players.length})</h2>
      <table>
        <thead>
          <tr><th>Slot</th><th>Player</th><th>Position</th><th>Team</th><th>Trend</th><th>Status</th></tr>
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
              <td style={{ textAlign: 'center' }}>
                <TrendArrow trend={trendMap[p.name]} />
              </td>
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
