import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    try {
      const { data } = await axios.get('/api/yahoo/leagues')
      setLeagues(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: 28 }}>Welcome back. Here's your fantasy baseball overview.</p>

      {!leagueSettings && (
        <div style={{
          background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: 10,
          padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 24 }}>⚙️</span>
          <div>
            <strong>Set up your league</strong>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>
              Go to <a href="/setup" style={{ color: '#3b82f6' }}>League Setup</a> to configure your league settings for personalized AI recommendations.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Draft Assistant', icon: '📋', href: '/draft', desc: 'Real-time draft help' },
          { label: 'My Roster', icon: '👥', href: '/roster', desc: 'Manage your players' },
          { label: 'Waiver Wire', icon: '🔄', href: '/waiver', desc: 'Find hidden gems' },
          { label: 'Start / Sit', icon: '⚡', href: '/startsit', desc: 'Optimize your lineup' },
          { label: 'Trade Analyzer', icon: '🤝', href: '/trade', desc: 'Evaluate trades' },
          { label: 'Standings', icon: '🏆', href: '/standings', desc: 'Track your position' },
        ].map(item => (
          <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2d3748'}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{item.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your Yahoo Leagues</h2>
        {loading ? (
          <div className="loading">Loading leagues...</div>
        ) : leagues.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No active MLB leagues found for the current season.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leagues.map((league, i) => (
              <div key={i} style={{
                background: '#242938', borderRadius: 8, padding: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{league.name || 'League'}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>
                    {league.num_teams} teams • {league.scoring_type} • {league.draft_status}
                  </div>
                </div>
                <a href={`/setup?league=${league.league_key}`} style={{ textDecoration: 'none' }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}>Configure</button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
