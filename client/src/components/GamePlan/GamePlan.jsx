import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function ProjectionBadge({ projection }) {
  if (!projection) return null
  const conf = projection.confidence
  const confColor = conf === 'high' ? '#10b981' : conf === 'medium' ? '#f59e0b' : '#ef4444'
  
  return (
    <div className="scoreboard-badge">
      <div className="scoreboard-content">
        {projection.myProjected && (
          <div className="stat-group">
            <span className="stat-label">Proj. My Points</span>
            <span className="stat-value text-success">{projection.myProjected}</span>
          </div>
        )}
        <div className="scoreboard-divider">VS</div>
        {projection.opponentProjected && (
          <div className="stat-group">
            <span className="stat-label">Opponent Proj.</span>
            <span className="stat-value text-danger">{projection.opponentProjected}</span>
          </div>
        )}
      </div>
      {conf && (
        <div className="confidence-indicator" style={{ borderColor: confColor, color: confColor }}>
          <span className="pulse-dot" style={{ backgroundColor: confColor }}></span>
          {conf} Confidence
        </div>
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
        week_number: null,
        league_key: selectedLeague
      })
      setPlan(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Game plan generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="game-plan-container animate-fade-in">
      {/* Strategic Header */}
      <header className="module-header">
        <div className="header-text">
          <h1 className="text-gradient">Weekly Game Planner</h1>
          <p className="text-muted">AI-optimized strategy for current matchup, daily moves, and category swinging.</p>
        </div>
        <div className="header-actions">
          <div className="input-group">
            <label>Current League</label>
            <select 
              value={selectedLeague} 
              onChange={e => setSelectedLeague(e.target.value)}
              className="league-selector"
            >
              {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
            </select>
          </div>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger mb-24">
          <span className="alert-icon">⚠️</span>
          <div className="alert-body">{error}</div>
        </div>
      )}

      {rosterLoading && (
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Scouting your roster...</p>
        </div>
      )}

      {/* Action Card: No Plan Yet */}
      {!rosterLoading && roster.length > 0 && !plan && !loading && (
        <section className="action-card glass-card">
          <div className="action-visual">📅</div>
          <div className="action-content">
            <h3>Ready for Week Analysis</h3>
            <p>Your roster has {roster.length} active players. It's time to build a strategy.</p>
            <button className="btn btn-primary btn-large btn-glow" onClick={generatePlan} disabled={loading}>
              {loading ? 'Analyzing...' : 'Generate Weekly Strategy'}
            </button>
          </div>
        </section>
      )}

      {/* Building State */}
      {loading && (
        <section className="loading-state-full card mb-24">
          <div className="ai-processing-visual">
            <div className="orbit-ring"></div>
            <div className="center-node">🤖</div>
          </div>
          <h3>Constructing Game Plan</h3>
          <p className="text-muted">Simulating weekly matchups, checking streaming availability, and weighting category needs...</p>
        </section>
      )}

      {/* Plan Results Dashboard */}
      {plan && (
        <div className="strategic-dashboard animate-slide-up">
          
          {/* Top Level Intel */}
          <div className="dash-row top-intel">
            {plan.weeklyProjection && (
              <div className="card scoreboard-card">
                <h4 className="card-label">Strategic Outlook</h4>
                <ProjectionBadge projection={plan.weeklyProjection} />
              </div>
            )}

            {plan.swingCategories?.length > 0 && (
              <div className="card categories-card">
                <h4 className="card-label">🎯 High-Impact Swing Categories</h4>
                <div className="target-capsules">
                  {plan.swingCategories.map((cat, i) => (
                    <div key={i} className="cat-target pulse-soft">{cat}</div>
                  ))}
                </div>
                <p className="tiny-advice">{plan.catAnalysis?.advice || 'Focus strategy here for maximum impact.'}</p>
              </div>
            )}
          </div>

          {/* Tactics Grid */}
          <div className="tactics-grid">
            {/* Optimal Lineup Column */}
            {plan.optimalLineup?.length > 0 && (
              <div className="card col-card lineup-col">
                <header className="card-header-compact">
                  <span className="icon">⚡</span>
                  <h4>Optimal Lineup</h4>
                </header>
                <div className="tactical-list">
                  {plan.optimalLineup.map((p, i) => (
                    <div key={i} className="tactical-item">
                      <div className="item-meta">
                        <span className={`pos-badge pos-${String(p.position || '').toLowerCase()}`}>{p.position}</span>
                        <span className="item-name">{p.player}</span>
                      </div>
                      <p className="item-logic">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming Targets Column */}
            {plan.streamingTargets?.length > 0 && (
              <div className="card col-card streaming-col">
                <header className="card-header-compact text-accent">
                  <span className="icon">🔥</span>
                  <h4>Stream Targets</h4>
                </header>
                <div className="tactical-list">
                  {plan.streamingTargets.map((p, i) => (
                    <div key={i} className="tactical-item highlight-hover">
                      <div className="item-meta">
                        <span className={`pos-badge pos-${String(p.position || '').toLowerCase()}`}>{p.position}</span>
                        <span className="item-name">{p.player}</span>
                      </div>
                      <p className="item-logic">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strategic Narrative & Daily Timeline */}
          <div className="dash-row bottom-intel">
            {/* Key Decisions */}
            {plan.keyDecisions?.length > 0 && (
              <div className="card col-card decision-log">
                <header className="card-header-main mb-16">
                  <div className="icon-wrap">🧠</div>
                  <h4>Master Strategy Decisions</h4>
                </header>
                <div className="decision-stack">
                  {plan.keyDecisions.map((d, i) => (
                    <div key={i} className="decision-node">
                      <div className="node-top">
                        <p className="node-question">{d.decision}</p>
                        <span className="node-verdict">RECO: {d.recommendation}</span>
                      </div>
                      <p className="node-reasoning">{d.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Timeline */}
            {plan.dailyMoves && Object.keys(plan.dailyMoves).length > 0 && (
              <div className="card col-card timeline-col">
                <header className="card-header-main mb-16">
                  <div className="icon-wrap">📅</div>
                  <h4>Tactical Timeline</h4>
                </header>
                <div className="timeline-stack">
                  {DAY_ORDER.filter(day => plan.dailyMoves[day]).map(day => (
                    <div key={day} className="timeline-event">
                      <div className="event-day">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                      <div className="event-content">{plan.dailyMoves[day]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Raw Fallback if needed */}
          {plan.rawPlan && (
            <div className="card mb-24 glass-card">
              <h4 className="card-label mb-12">Detailed Briefing</h4>
              <div className="ai-response-prose text-sm">{plan.rawPlan}</div>
            </div>
          )}

          {/* Footer Actions */}
          <footer className="plan-footer">
            <button className="btn btn-secondary" onClick={generatePlan} disabled={loading}>
              {loading ? 'Recalculating...' : '↻ Refresh Analysis'}
            </button>
            <button className="btn btn-ghost" onClick={() => setPlan(null)}>Reset View</button>
          </footer>
        </div>
      )}

      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="empty-state-placeholder card py-48">
          <div className="icon-large mb-16">📂</div>
          <p className="text-muted">Select a league from the menu above to initiate a weekly tactical scan.</p>
        </div>
      )}
    </div>
  )
}

