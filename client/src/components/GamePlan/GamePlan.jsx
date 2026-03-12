import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function ProjectionBadge({ projection }) {
  if (!projection) return null
  const conf = projection.confidence
  const confColor = conf === 'high' ? '#00a86b' : conf === 'medium' ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      {projection.myProjected && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#7aafc4', marginBottom: 2 }}>My Projected</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#00a86b' }}>{projection.myProjected}</div>
        </div>
      )}
      {projection.opponentProjected && (
        <>
          <div style={{ fontSize: 20, color: '#4a7a94' }}>–</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#7aafc4', marginBottom: 2 }}>Opponent</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{projection.opponentProjected}</div>
          </div>
        </>
      )}
      {conf && (
        <span style={{
          padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', background: `${confColor}22`, color: confColor
        }}>{conf} confidence</span>
      )}
    </div>
  )
}

export default function GamePlan({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) loadRoster()
  }, [selectedLeague])

  async function loadRoster() {
    setRosterLoading(true)
    setPlan(null)
    setError('')
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`)
      setRoster(data.players || [])
    } catch (err) {
      setError('Could not load roster.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function generatePlan() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/claude/gameplan', {
        my_roster: roster,
        matchup: null,
        week_number: null
      })
      setPlan(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Game plan generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Weekly Game Plan</h1>
          <p style={{ color: '#7aafc4' }}>AI-optimized lineup, streaming targets, daily moves, and swing category strategy</p>
        </div>
        <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
          {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
        </select>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {rosterLoading && <div className="loading">Loading your roster...</div>}

      {!rosterLoading && roster.length > 0 && !plan && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Ready to plan (roster: {roster.length} players)</h3>
            <button className="btn btn-primary" onClick={generatePlan} disabled={loading}
              style={{ padding: '10px 24px', fontSize: 14 }}>
              {loading ? '🤖 Building plan...' : '📅 Generate Weekly Game Plan'}
            </button>
          </div>
          <p style={{ color: '#7aafc4', fontSize: 13, margin: 0 }}>
            Generates optimal lineup, streaming targets, daily decisions, and category strategy for this week.
          </p>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>📅</div>
          <div className="loading">Building your weekly game plan...</div>
          <p style={{ color: '#7aafc4', fontSize: 13, marginTop: 8 }}>Optimizing lineup, scheduling targets, analyzing categories...</p>
        </div>
      )}

      {/* Plan results */}
      {plan && (
        <>
          {/* Weekly projection */}
          {plan.weeklyProjection && (
            <div className="card" style={{
              marginBottom: 16, padding: '20px 28px',
              background: 'linear-gradient(135deg, #004d4d, #0c2c56)',
              border: '1px solid #007a7a'
            }}>
              <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
                Weekly Projection
              </div>
              <ProjectionBadge projection={plan.weeklyProjection} />
            </div>
          )}

          {/* Swing categories */}
          {plan.swingCategories?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <h3 style={{ color: '#f59e0b', marginBottom: 10, fontSize: 15 }}>🎯 Swing Categories This Week</h3>
              <p style={{ color: '#7aafc4', fontSize: 13, marginBottom: 10 }}>Focus effort here — these categories are closest to shifting in your favor.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {plan.swingCategories.map((cat, i) => (
                  <span key={i} style={{
                    background: 'rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: 6,
                    padding: '6px 14px', fontSize: 14, fontWeight: 700
                  }}>{cat}</span>
                ))}
              </div>
            </div>
          )}

          {/* Optimal lineup + streaming */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {plan.optimalLineup?.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
                  ⚡ Optimal Lineup
                </div>
                <div style={{ padding: '8px 0' }}>
                  {plan.optimalLineup.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '8px 16px', borderBottom: i < plan.optimalLineup.length - 1 ? '1px solid #0c2c56' : 'none'
                    }}>
                      <span className={`badge badge-${String(p.position || '').toLowerCase()}`} style={{ flexShrink: 0, marginTop: 2 }}>
                        {p.position}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.player}</div>
                        <div style={{ fontSize: 11, color: '#7aafc4' }}>{p.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {plan.streamingTargets?.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#00a86b', textTransform: 'uppercase', letterSpacing: 1 }}>
                  🔥 Streaming Targets
                </div>
                <div style={{ padding: '8px 0' }}>
                  {plan.streamingTargets.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '8px 16px', borderBottom: i < plan.streamingTargets.length - 1 ? '1px solid #0c2c56' : 'none'
                    }}>
                      <span className={`badge badge-${String(p.position || '').toLowerCase()}`} style={{ flexShrink: 0, marginTop: 2 }}>
                        {p.position}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.player}</div>
                        <div style={{ fontSize: 11, color: '#7aafc4' }}>{p.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key decisions */}
          {plan.keyDecisions?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>🧠 Key Decisions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.keyDecisions.map((d, i) => (
                  <div key={i} style={{
                    background: '#122840', border: '1px solid #1e3d5c', borderRadius: 8, padding: '12px 16px',
                    borderLeft: '3px solid #4aafdb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, color: '#7aafc4' }}>{d.decision}</div>
                      <span style={{ background: 'rgba(0,168,107,0.15)', color: '#00a86b', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        → {d.recommendation}
                      </span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{d.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily moves */}
          {plan.dailyMoves && Object.keys(plan.dailyMoves).length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>📅 Daily Moves</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DAY_ORDER.filter(d => plan.dailyMoves[d]).map(day => (
                  <div key={day} style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                    padding: '10px 14px', background: '#122840', borderRadius: 8, border: '1px solid #1e3d5c'
                  }}>
                    <div style={{ width: 76, flexShrink: 0, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: '#4aafdb', paddingTop: 1 }}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>{plan.dailyMoves[day]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw plan fallback */}
          {plan.rawPlan && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>📅 Weekly Game Plan</h3>
              <div className="ai-response">{plan.rawPlan}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={generatePlan} disabled={loading}>
              {loading ? '🤖 Re-analyzing...' : '↻ Regenerate Plan'}
            </button>
            <button className="btn btn-ghost" onClick={() => setPlan(null)}>Clear</button>
          </div>
        </>
      )}

      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to generate your weekly game plan.</p>
        </div>
      )}
    </div>
  )
}
