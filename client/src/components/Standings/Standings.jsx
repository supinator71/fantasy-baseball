import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Standings({ leagueSettings }) {
  const [standings, setStandings] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) fetchStandings()
  }, [selectedLeague])

  async function fetchStandings() {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/standings`)
      const teams = []
      if (data) {
        const count = data['@attributes']?.count || 0
        for (let i = 0; i < count; i++) {
          const t = data[i]?.team
          if (t) teams.push({
            name: t[0]?.name || 'Team',
            manager: t[0]?.managers?.[0]?.manager?.nickname || '',
            rank: t[2]?.team_standings?.rank || i + 1,
            wins: t[2]?.team_standings?.outcome_totals?.wins || 0,
            losses: t[2]?.team_standings?.outcome_totals?.losses || 0,
            ties: t[2]?.team_standings?.outcome_totals?.ties || 0,
            pct: t[2]?.team_standings?.outcome_totals?.percentage || '0',
            points: t[2]?.team_standings?.points_for || 0
          })
        }
        teams.sort((a, b) => a.rank - b.rank)
      }
      setStandings(teams)
    } catch {
      setStandings([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Standings</h1>
          <p style={{ color: '#7aafc4' }}>Current league standings from Yahoo Fantasy</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <button className="btn btn-primary" onClick={fetchStandings} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading">Loading standings...</div>
        ) : (
          <table>
            <thead>
              <tr><th>Rank</th><th>Team</th><th>Manager</th><th>W</th><th>L</th><th>T</th><th>Pct</th></tr>
            </thead>
            <tbody>
              {standings.map((team, i) => (
                <tr key={i} style={team.rank <= 4 ? { background: 'rgba(0, 168, 107, 0.05)' } : {}}>
                  <td>
                    <span style={{
                      display: 'inline-block', width: 28, height: 28, borderRadius: '50%',
                      background: team.rank === 1 ? '#f59e0b' : team.rank <= 4 ? '#0c2c56' : '#122840',
                      color: team.rank === 1 ? '#000' : '#e2e8f0',
                      textAlign: 'center', lineHeight: '28px', fontSize: 13, fontWeight: 700
                    }}>{team.rank}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{team.name}</td>
                  <td style={{ color: '#7aafc4' }}>{team.manager}</td>
                  <td style={{ color: '#00a86b' }}>{team.wins}</td>
                  <td style={{ color: '#ef4444' }}>{team.losses}</td>
                  <td style={{ color: '#7aafc4' }}>{team.ties}</td>
                  <td>{(+team.pct * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {standings.length === 0 && !loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#7aafc4', padding: 32 }}>
                  No standings data. Select a league above.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {standings.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: '#4a7a94' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></span>
            1st place
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#0c2c56' }}></span>
            Playoff position
          </span>
        </div>
      )}
    </div>
  )
}
