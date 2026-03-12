import React, { useState, useEffect } from 'react'
import axios from 'axios'

const TREND_META = {
  hot:     { icon: '🔥', label: 'Hot',     color: '#ff6b35', bg: 'rgba(255,107,53,0.15)',  border: 'rgba(255,107,53,0.35)' },
  rising:  { icon: '⚡', label: 'Rising',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)'  },
  neutral: { icon: '😐', label: 'Neutral', color: '#7aafc4', bg: 'rgba(122,175,196,0.07)', border: 'rgba(122,175,196,0.2)' },
  cold:    { icon: '🥶', label: 'Cold',    color: '#4a7a94', bg: 'rgba(74,122,148,0.08)',  border: 'rgba(74,122,148,0.2)' },
}

function TrendBadge({ trend }) {
  const m = TREND_META[trend] || TREND_META.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 5,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: 0.5
    }}>
      {m.icon} {m.label}
    </span>
  )
}

function StatRow({ label, recent, season, lowerBetter }) {
  if (recent === undefined && season === undefined) return null
  const r = parseFloat(recent)
  const s = parseFloat(season)
  const improved = !isNaN(r) && !isNaN(s) && s > 0 &&
    (lowerBetter ? r < s * 0.95 : r > s * 1.05)
  const worsened = !isNaN(r) && !isNaN(s) && s > 0 &&
    (lowerBetter ? r > s * 1.05 : r < s * 0.95)

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
      <span style={{ fontSize: 11, color: '#4a7a94', width: 36 }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: improved ? '#00a86b' : worsened ? '#ef4444' : '#e2e8f0'
      }}>
        {recent !== undefined ? recent : '—'}
        {improved && <span style={{ fontSize: 10, marginLeft: 3 }}>▲</span>}
        {worsened && <span style={{ fontSize: 10, marginLeft: 3 }}>▼</span>}
      </span>
      <span style={{ fontSize: 11, color: '#4a7a94' }}>
        {season !== undefined ? season : '—'} <span style={{ fontSize: 9 }}>szn</span>
      </span>
    </div>
  )
}

function PlayerCard({ player, highlight }) {
  const m = TREND_META[player.trend] || TREND_META.neutral
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${m.bg}, #0c1d35)` : '#0c1d35',
      border: `1px solid ${highlight ? m.border : '#1e3d5c'}`,
      borderRadius: 10, padding: '12px 14px',
      transition: 'border-color 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{player.name}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className={`badge badge-${String(player.position).split(',')[0].trim().toLowerCase()}`}>
              {player.position}
            </span>
            <span style={{ fontSize: 11, color: '#4a7a94' }}>{player.team}</span>
          </div>
        </div>
        <TrendBadge trend={player.trend} />
      </div>
      <div style={{ borderTop: '1px solid #1e3d5c', paddingTop: 8, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a7a94', marginBottom: 4 }}>
          <span>7-day</span><span>season</span>
        </div>
        {(player.displayStats || []).map((s, i) => (
          <StatRow key={i} {...s} />
        ))}
        {(!player.displayStats || player.displayStats.length === 0) && (
          <div style={{ fontSize: 12, color: '#4a7a94' }}>No recent stats available</div>
        )}
      </div>
    </div>
  )
}

export default function PlayerTrends({ selectedLeague }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('roster')
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedLeague) fetchTrends()
  }, [selectedLeague])

  async function fetchTrends() {
    setLoading(true)
    setError('')
    try {
      const { data: res } = await axios.get(`/api/yahoo/league/${selectedLeague}/trends`)
      setData(res)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load player trends')
    } finally {
      setLoading(false)
    }
  }

  const hotCount = data?.myPlayers?.filter(p => p.trend === 'hot').length || 0
  const risingCount = data?.myPlayers?.filter(p => p.trend === 'rising').length || 0
  const coldCount = data?.myPlayers?.filter(p => p.trend === 'cold').length || 0
  const faCount = data?.freeAgents?.length || 0

  return (
    <div className="card" style={{ marginTop: 28 }}>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Player Trends</h2>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            {data && (
              <>
                <span style={{ color: '#ff6b35' }}>🔥 {hotCount} Hot</span>
                <span style={{ color: '#f59e0b' }}>⚡ {risingCount} Rising</span>
                <span style={{ color: '#4a7a94' }}>🥶 {coldCount} Cold</span>
              </>
            )}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={fetchTrends} disabled={loading} style={{ fontSize: 12 }}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #1e3d5c', paddingBottom: 0 }}>
        {[
          { key: 'roster', label: 'My Roster' },
          { key: 'fa',     label: `🔥 FA Pickups${faCount ? ` (${faCount})` : ''}` }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: activeTab === tab.key ? '#007a7a' : '#7aafc4',
              borderBottom: activeTab === tab.key ? '2px solid #007a7a' : '2px solid transparent',
              marginBottom: -1
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: 13, padding: '8px 0' }}>{error}</div>
      )}

      {loading && <div className="loading" style={{ padding: 24 }}>Fetching player stats...</div>}

      {!loading && data && activeTab === 'roster' && (
        <>
          {data.myPlayers.length === 0 ? (
            <p style={{ color: '#7aafc4', fontSize: 13 }}>No roster data found. Make sure your league is configured.</p>
          ) : (
            <>
              {/* Hot & Rising up top with highlight */}
              {data.myPlayers.filter(p => p.trend === 'hot' || p.trend === 'rising').length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Trending Up
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {data.myPlayers.filter(p => p.trend === 'hot' || p.trend === 'rising').map((p, i) => (
                      <PlayerCard key={i} player={p} highlight={true} />
                    ))}
                  </div>
                </div>
              )}
              {/* Neutral & Cold */}
              {data.myPlayers.filter(p => p.trend === 'neutral' || p.trend === 'cold').length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Neutral / Cold
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {data.myPlayers.filter(p => p.trend === 'neutral' || p.trend === 'cold').map((p, i) => (
                      <PlayerCard key={i} player={p} highlight={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!loading && data && activeTab === 'fa' && (
        <>
          {data.freeAgents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>😐</div>
              <p style={{ color: '#7aafc4', fontSize: 13 }}>
                No hot free agents detected right now. Check back later in the week as stats update.
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 14, padding: '8px 12px',
                background: 'rgba(0,168,107,0.08)', borderRadius: 8, border: '1px solid rgba(0,168,107,0.2)' }}>
                🎯 These free agents are outperforming their season averages this week — grab them before other managers do.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {data.freeAgents.map((p, i) => (
                  <PlayerCard key={i} player={p} highlight={true} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {!loading && !data && !error && (
        <p style={{ color: '#7aafc4', fontSize: 13 }}>Select a league on the dashboard to load trends.</p>
      )}

      {/* Legend */}
      {data && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid #1e3d5c', flexWrap: 'wrap' }}>
          {Object.entries(TREND_META).map(([key, m]) => (
            <span key={key} style={{ fontSize: 11, color: m.color }}>
              {m.icon} {m.label}: {key === 'hot' ? '>20% above avg' : key === 'rising' ? '7-20% above' : key === 'neutral' ? 'near avg' : '>7% below avg'}
            </span>
          ))}
          <span style={{ fontSize: 11, color: '#4a7a94', marginLeft: 'auto' }}>vs last 7-day stats</span>
        </div>
      )}
    </div>
  )
}
