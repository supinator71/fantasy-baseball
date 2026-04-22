import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLeague } from '@/lib/context/LeagueContext'

function parseTeamInfo(teamData) {
  if (!teamData) return null
  const t = teamData.team || teamData
  if (!t) return null

  // t is usually an array like [{name, team_key, ...}, {team_standings: ...}, ...]
  // But can also be a flat object
  let info = {}
  let standings = null

  if (Array.isArray(t)) {
    // First element is info (could be array of sub-objects or a single object)
    if (Array.isArray(t[0])) {
      info = Object.assign({}, ...t[0])
    } else {
      info = t[0] || {}
    }
    // Search remaining elements for team_standings
    for (let i = 1; i < t.length; i++) {
      if (t[i]?.team_standings) {
        standings = t[i].team_standings
        break
      }
    }
  } else {
    info = t
    standings = t.team_standings
  }

  // Extract manager name
  let manager = ''
  const managers = info.managers
  if (managers) {
    if (Array.isArray(managers)) {
      manager = managers[0]?.manager?.nickname || managers[0]?.nickname || ''
    } else if (managers.manager) {
      manager = managers.manager?.nickname || ''
    }
  }

  const outcome = standings?.outcome_totals || {}
  return {
    name: info.name || 'Unknown Team',
    team_key: info.team_key || '',
    manager,
    rank: parseInt(standings?.rank) || 99,
    wins: parseInt(outcome.wins) || 0,
    losses: parseInt(outcome.losses) || 0,
    ties: parseInt(outcome.ties) || 0,
    pct: parseFloat(outcome.percentage) || 0,
    points_for: parseFloat(standings?.points_for) || 0,
    points_against: parseFloat(standings?.points_against) || 0,
    games_back: standings?.games_back || '-',
    streak: standings?.streak?.value || ''
  }
}

export default function Standings() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague()
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedLeague) fetchStandings(selectedLeague)
  }, [selectedLeague])

  async function fetchStandings(leagueKey) {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/api/yahoo/league/${leagueKey}/standings`)
      const teams = []

      if (data && Array.isArray(data)) {
        for (const item of data) {
          const parsed = parseTeamInfo(item)
          if (parsed) teams.push(parsed)
        }
      } else if (data && typeof data === 'object') {
        const count = parseInt(data['@attributes']?.count) || Object.keys(data).filter(k => /^\d+$/.test(k)).length
        for (let i = 0; i < count; i++) {
          const parsed = parseTeamInfo(data[i] || data[String(i)])
          if (parsed) teams.push(parsed)
        }
      }

      teams.sort((a, b) => a.rank - b.rank)
      setStandings(teams)
      if (teams.length === 0) setError('No standings data available for this league yet.')
    } catch (err) {
      setError('Could not load standings. Make sure you are connected to Yahoo.')
      setStandings([])
    } finally {
      setLoading(false)
    }
  }

  const numTeams = standings.length
  const playoffCutoff = Math.ceil(numTeams / 2) // typically top half makes playoffs

  return (
    <div className="standings-container animate-fade-in">
      <header className="module-header">
        <div className="header-text">
          <h1 className="text-gradient">◎ League Standings</h1>
          <p className="text-muted">Live standings from your Yahoo Fantasy league</p>
        </div>
        <div className="header-actions">
          <div className="input-group">
            <label>League</label>
            <select
              value={selectedLeague}
              onChange={e => setSelectedLeague(e.target.value)}
              className="league-selector"
            >
              {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost" onClick={() => fetchStandings(selectedLeague)} disabled={loading}>
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Loading standings...</p>
        </div>
      )}

      {!loading && standings.length > 0 && (
        <>
          {/* Standings Legend */}
          <div className="standings-legend">
            <span className="legend-item">
              <span className="legend-dot gold"></span> 1st Place
            </span>
            <span className="legend-item">
              <span className="legend-dot playoff"></span> Playoff Position (Top {playoffCutoff})
            </span>
          </div>

          {/* Desktop Table */}
          <div className="card standings-card">
            <table className="standings-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Team</th>
                  <th>Manager</th>
                  <th style={{ textAlign: 'center' }}>W</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'center' }}>T</th>
                  <th style={{ textAlign: 'center' }}>Win %</th>
                  <th style={{ textAlign: 'right' }}>GB</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, i) => {
                  const isFirst = team.rank === 1
                  const isPlayoff = team.rank <= playoffCutoff
                  const isLast = team.rank === numTeams

                  return (
                    <tr key={i} className={`standings-row ${isPlayoff ? 'playoff' : ''} ${isFirst ? 'first-place' : ''} ${isLast ? 'last-place' : ''}`}>
                      <td data-label="Rank">
                        <div className={`rank-badge ${isFirst ? 'gold' : isPlayoff ? 'playoff' : 'standard'}`}>
                          {team.rank}
                        </div>
                      </td>
                      <td data-label="Team">
                        <span className="team-name">{team.name}</span>
                      </td>
                      <td data-label="Manager">
                        <span className="manager-name">{team.manager}</span>
                      </td>
                      <td data-label="W" style={{ textAlign: 'center' }}>
                        <span className="wins-value">{team.wins}</span>
                      </td>
                      <td data-label="L" style={{ textAlign: 'center' }}>
                        <span className="losses-value">{team.losses}</span>
                      </td>
                      <td data-label="T" style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{team.ties}</span>
                      </td>
                      <td data-label="Win %" style={{ textAlign: 'center' }}>
                        <div className="pct-cell">
                          <span className="pct-value">{(team.pct * 100).toFixed(1)}%</span>
                          <div className="pct-bar">
                            <div
                              className="pct-fill"
                              style={{
                                width: `${team.pct * 100}%`,
                                background: isFirst
                                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                  : isPlayoff
                                  ? 'linear-gradient(90deg, var(--secondary), #0066ff)'
                                  : 'rgba(255,255,255,0.15)'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td data-label="GB" style={{ textAlign: 'right' }}>
                        <span style={{ color: team.games_back === '-' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 600 }}>
                          {team.games_back}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {/* Playoff cutoff line */}
                {standings.length > playoffCutoff && (
                  <tr className="playoff-cutoff-row">
                    <td colSpan={8}>
                      <div className="playoff-cutoff-line">
                        <span>━━ Playoff Cutoff ━━</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && standings.length === 0 && (
        <div className="empty-state-placeholder card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <p className="text-muted">Select a league above to view standings.</p>
        </div>
      )}
    </div>
  )
}
