import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PlayerTrends from './PlayerTrends/PlayerTrends'
import LastUpdated from './shared/LastUpdated'

export default function Dashboard({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [cachedAt, setCachedAt] = useState(null)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues(force = false) {
    setLoading(true)
    try {
      const res = await axios.get(`/api/yahoo/leagues${force ? '?force=true' : ''}`)
      setLeagues(res.data)
      if (res.data[0]?.league_key && !selectedLeague) setSelectedLeague(res.data[0].league_key)
      setCachedAt(res.headers['x-cache-updated'] || null)
      setFromCache(res.headers['x-cache-hit'] === 'true')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#7aafc4', marginBottom: 28 }}>Welcome back. Here's your fantasy baseball overview.</p>

      {!leagueSettings && (
        <div style={{
          background: '#0c2c56', border: '1px solid #007a7a', borderRadius: 10,
          padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 24 }}>⚙️</span>
          <div>
            <strong>Set up your league</strong>
            <p style={{ color: '#7aafc4', fontSize: 13, marginTop: 2 }}>
              Go to <a href="/setup" style={{ color: '#007a7a' }}>League Setup</a> to configure your league settings for personalized AI recommendations.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Draft Assistant',    icon: '📋', href: '/draft',     desc: 'Real-time draft help' },
          { label: 'My Roster',          icon: '👥', href: '/roster',    desc: 'Manage your players' },
          { label: 'Waiver Wire',        icon: '🔄', href: '/waiver',    desc: 'Find hidden gems' },
          { label: 'Start / Sit',        icon: '⚡', href: '/startsit',  desc: 'Optimize your lineup' },
          { label: 'Trade Analyzer',     icon: '🤝', href: '/trade',     desc: 'Evaluate trades' },
          { label: 'Standings',          icon: '🏆', href: '/standings', desc: 'Track your position' },
          { label: 'Matchup Predictor',  icon: '⚔️', href: '/matchup',      desc: 'AI-powered weekly predictions' },
          { label: 'Team Audit',         icon: '📊', href: '/audit',        desc: 'Grade + actionable moves' },
          { label: 'Trade Finder',       icon: '💡', href: '/tradefinder',  desc: 'AI trade proposals with pitch' },
          { label: 'Weekly Game Plan',   icon: '📅', href: '/gameplan',     desc: 'Lineup & daily move optimizer' },
        ].map(item => (
          <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#007a7a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3d5c'}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#7aafc4', fontSize: 13 }}>{item.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your Yahoo Leagues</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {leagues.length > 1 && (
              <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
                {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
              </select>
            )}
            <LastUpdated cachedAt={cachedAt} fromCache={fromCache} ttlLabel="5 min cache"
              onRefresh={() => fetchLeagues(true)} loading={loading} />
          </div>
        </div>
        {loading ? (
          <div className="loading">Loading leagues...</div>
        ) : leagues.length === 0 ? (
          <p style={{ color: '#7aafc4' }}>No active MLB leagues found for the current season.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leagues.map((league, i) => (
              <div key={i} style={{
                background: league.league_key === selectedLeague ? '#0c2c56' : '#122840',
                border: `1px solid ${league.league_key === selectedLeague ? '#007a7a' : '#1e3d5c'}`,
                borderRadius: 8, padding: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', transition: 'all 0.15s'
              }} onClick={() => setSelectedLeague(league.league_key)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{league.name || 'League'}</div>
                  <div style={{ color: '#7aafc4', fontSize: 13 }}>
                    {league.num_teams} teams • {league.scoring_type} • {league.draft_status}
                  </div>
                </div>
                <a href={`/setup?league=${league.league_key}`} style={{ textDecoration: 'none' }}
                  onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}>Configure</button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLeague && <PlayerTrends selectedLeague={selectedLeague} />}
    </div>
  )
}
