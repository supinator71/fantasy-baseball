import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PlayerTrends from './PlayerTrends/PlayerTrends'
import LastUpdated from './shared/LastUpdated'
import LeagueIntelligence from './shared/LeagueIntelligence'
import FeedbackBox from './shared/FeedbackBox'

export default function Dashboard({ leagueSettings, subscription }) {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [cachedAt, setCachedAt] = useState(null)

  const formatScoringType = (type) => {
    if (!type) return 'Rotisserie';
    const t = String(type).toLowerCase();
    if (t.includes('headpoint')) return 'Head-to-Head (Points)';
    if (t.includes('head')) return 'Head-to-Head (Categories)';
    if (t === 'roto') return 'Rotisserie';
    return type;
  }

  useEffect(() => {
    fetchLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      setSyncing(true)
      axios.get('/api/yahoo/league/' + selectedLeague)
        .catch(err => console.error('Failed to auto-sync league settings', err))
        .finally(() => setSyncing(false))
    }
  }, [selectedLeague])

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
    <div style={{ position: 'relative' }}>
      {/* Hero Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(192,17,31,0.12) 0%, rgba(0,50,120,0.15) 100%)',
        border: '1px solid rgba(192,17,31,0.25)', borderRadius: 16,
        padding: '20px 20px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,17,31,0.15), transparent 70%)',
          pointerEvents: 'none'
        }} />
        <img
          src="/cyborg_batflip.png"
          alt="Goin' Yard Mascot"
          className="mascot-hero"
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
            ⚡ AI-Powered Fantasy Intelligence
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 6vw, 34px)', fontWeight: 800, marginBottom: 4, letterSpacing: -1, lineHeight: 1.1 }}>
            Goin' Yard <span style={{ color: 'var(--primary)' }}>Intelligence</span> HQ
          </h1>
          <p style={{ color: '#7aafc4', fontSize: 14, margin: 0, lineHeight: 1.4 }}>
            Welcome back to <strong style={{ color: '#f8fafc' }}>goinyard.app</strong> — your automated fantasy analytics command center.
          </p>
        </div>
      </div>

      {syncing && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 12,
          padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span className="loading" style={{ padding: 0 }}>⚙️</span>
          <div>
            <strong>Auto-Syncing League Rules...</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              Downloading your specific scoring format and roster limits directly from Yahoo...
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'My Roster',          icon: '👥', href: '/roster',    desc: 'Manage your players' },
          { label: 'Waiver Wire',        icon: '🔄', href: '/waiver',    desc: 'Find hidden gems' },
          { label: 'Start / Sit',        icon: '⚡', href: '/startsit',  desc: 'Optimize your lineup' },
          { label: 'Trade Analyzer',     icon: '🤝', href: '/trade',     desc: 'Evaluate trades' },
          { label: 'Standings',          icon: '🏆', href: '/standings', desc: 'Track your position' },
          { label: 'Matchup Predictor',  icon: '⚔️', href: '/matchup',      desc: 'AI weekly predictions' },
          { label: 'Team Audit',         icon: '📊', href: '/audit',        desc: 'Grade your team' },
          { label: 'Trade Finder',       icon: '💡', href: '/tradefinder',  desc: 'AI trade proposals' },
          { label: 'Weekly Game Plan',   icon: '📅', href: '/gameplan',     desc: 'Lineup optimizer' },
          { label: 'Baseball 101',       icon: '🎓', href: '/baseball101',  desc: 'Beginner metrics guide' },
          { label: 'Pitching Intel',     icon: '🎯', href: '/pitching',   desc: 'Advanced pitcher analytics' },
          { label: 'Trophy Case',        icon: '🏆', href: '/trophy',       desc: 'Gamification unlocks' },
          { label: 'Upgrade to Pro',     icon: '⭐', href: '/upgrade',      desc: 'Unlock infinite AI insights' },
        ].map(item => (
          <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s', padding: '16px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#007a7a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3d5c'}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 13, lineHeight: 1.2 }}>{item.label}</div>
              <div style={{ color: '#7aafc4', fontSize: 12 }}>{item.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your Yahoo Leagues</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {leagues.length > 1 && (
              <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: '100%', maxWidth: 220 }}>
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
                flexWrap: 'wrap', gap: 8,
              cursor: 'pointer', transition: 'all 0.15s'
              }} onClick={() => setSelectedLeague(league.league_key)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{league.name || 'League'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {league.num_teams} teams • {formatScoringType(league.scoring_type)} • {league.draft_status}
                  </div>
                </div>
                {league.league_key === selectedLeague && (
                  <span className="badge badge-success" style={{ background: 'var(--primary)' }}>Active</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
        <LeagueIntelligence leagueKey={selectedLeague} isPro={subscription?.plan === 'pro'} />
        <FeedbackBox />
      </div>

      {selectedLeague && <PlayerTrends selectedLeague={selectedLeague} />}
    </div>
  )
}
