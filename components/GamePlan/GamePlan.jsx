import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useLeague } from '@/lib/context/LeagueContext'
import InsightCard from '@/components/InsightCard/InsightCard'
import MarkdownRenderer from '../shared/MarkdownRenderer'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_EMOJI = {
  monday: '🟢', tuesday: '🔵', wednesday: '🟣',
  thursday: '🟠', friday: '🔴', saturday: '🟡', sunday: '⚪'
}

function ProjectionBadge({ projection }) {
  if (!projection) return null
  const conf = projection.confidence
  const confColor = conf === 'high' ? '#10b981' : conf === 'medium' ? '#f59e0b' : '#ef4444'
  
  return (
    <div className="scoreboard-badge">
      <div className="scoreboard-content">
        {projection.myProjected && (
          <div className="stat-group">
            <span className="stat-label">My Projected</span>
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
  const { leagues, selectedLeague: ctxLeague, leagueData, aiAnalysis, aiLoading, refreshAnalysis } = useLeague()
  const [localLeagues, setLocalLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [roster, setRoster] = useState([])
  const [matchup, setMatchup] = useState(null)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Use leagues from context, fall back to local fetch
  const allLeagues = leagues.length ? leagues : localLeagues

  const loadRoster = useCallback(async () => {
    setRosterLoading(true)
    setRoster([])
    setPlan(null)
    setMatchup(null)
    setError('')
    try {
      // Fetch roster and matchup in parallel
      const [rosterRes, matchupRes] = await Promise.allSettled([
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`),
        axios.get(`/api/yahoo/league/${selectedLeague}/matchup`)
      ])

      if (rosterRes.status === 'fulfilled') {
        setRoster(rosterRes.value.data.players || [])
      } else {
        setError('Could not load roster.')
      }

      if (matchupRes.status === 'fulfilled') {
        const m = matchupRes.value.data
        // Build matchup object for the gameplan API
        if (m && m.myTeam && m.opponent) {
          const myStats = {}
          const oppStats = {}
          ;(m.stats || []).forEach(s => {
            if (s.name) {
              myStats[s.name] = s.my_value ?? s.value
              oppStats[s.name] = s.opp_value ?? s.value
            }
          })
          setMatchup({
            opponent_name: m.opponent?.name || 'Opponent',
            my_stats: myStats,
            opp_stats: oppStats,
            week: m.week
          })
        }
      }
      // Matchup fetch failure is non-critical — plan still works without it
    } catch (err) {
      setError('Could not load roster.')
    } finally {
      setRosterLoading(false)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (ctxLeague && !selectedLeague) setSelectedLeague(ctxLeague)
  }, [ctxLeague, selectedLeague])

  useEffect(() => {
    if (selectedLeague) loadRoster()
  }, [selectedLeague, loadRoster])

  async function generatePlan() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/claude/gameplan', {
        my_roster: roster,
        opponent: matchup,
        week_context: matchup?.week ? `Week ${matchup.week} matchup vs ${matchup.opponent_name || 'opponent'}` : '',
        league_key: selectedLeague,
        leagueSettings: leagueData || leagueSettings || {}  // leagueData from context has scoring_type, name, num_teams
      })
      setPlan(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Game plan generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gameplan-page animate-fade-in">
      {/* Header */}
      <header className="module-header">
        <div className="header-text">
          <h1 className="text-gradient">▦ Weekly Game Planner</h1>
          <p className="text-muted">AI-optimized strategy for your current matchup</p>
        </div>
        <div className="header-actions">
          <div className="input-group">
            <label>League</label>
            <select 
              value={selectedLeague} 
              onChange={e => setSelectedLeague(e.target.value)}
              className="league-selector"
            >
              {allLeagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading roster */}
      {rosterLoading && (
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Scouting your roster...</p>
        </div>
      )}

      {/* Quick AI Snapshot from master analysis */}
      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading} onRefresh={refreshAnalysis} />

      {/* CTA: Generate Plan */}
      {!rosterLoading && roster.length > 0 && !plan && !loading && (
        <section className="gameplan-cta card">
          <div className="gameplan-cta-inner">
            <div className="gameplan-cta-icon">📅</div>
            <div className="gameplan-cta-text">
              <h3>Ready for Week {matchup?.week || ''} Analysis</h3>
              <p className="text-muted">
                Your roster has <strong>{roster.length}</strong> active players.
                {matchup ? ` Matchup: vs ${matchup.opponent_name}.` : ''} Generate a full AI strategy breakdown.
              </p>
            </div>
            <button className="btn btn-primary btn-large" onClick={generatePlan} disabled={loading}>
              Generate Weekly Strategy
            </button>
          </div>
        </section>
      )}

      {/* Loading AI */}
      {loading && (
        <section className="card gameplan-loading">
          <div className="ai-processing-visual">
            <div className="orbit-ring"></div>
            <div className="center-node">🤖</div>
          </div>
          <h3>Constructing Game Plan</h3>
          <p className="text-muted">Simulating matchups, checking streaming options, and weighting category needs...</p>
        </section>
      )}

      {/* Results */}
      {plan && (
        <div className="gameplan-results animate-slide-up">
          
          {/* Top Row: Projection + Swing Categories */}
          <div className="gameplan-top-row">
            {plan.weeklyProjection && (
              <div className="card gameplan-section">
                <h4 className="section-title">📊 Strategic Outlook</h4>
                <ProjectionBadge projection={plan.weeklyProjection} />
              </div>
            )}

            {plan.swingCategories?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">🎯 Swing Categories</h4>
                <div className="target-capsules">
                  {plan.swingCategories.map((cat, i) => (
                    <div key={i} className="cat-target">{cat}</div>
                  ))}
                </div>
                <p className="tiny-advice">{plan.catAnalysis?.advice || 'Focus strategy here for maximum impact.'}</p>
              </div>
            )}
          </div>

          {/* Middle Row: Optimal Lineup + Streaming Targets */}
          <div className="gameplan-columns">
            {plan.lineupOptimizer?.starters?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">⚡ Optimal Lineup</h4>
                <div className="tactical-list">
                  {plan.lineupOptimizer.starters.map((p, i) => (
                    <div key={i} className="tactical-item">
                      <div className="item-meta">
                        <span className="pos-pill">{p.position || '??'}</span>
                        <span className="item-name">{p.player_name || p.player}</span>
                      </div>
                      <p className="item-logic">{p.reasoning || p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.lineupOptimizer?.volumePlays?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">🔥 Extra Volume (7-Game Week)</h4>
                <div className="tactical-list">
                  {plan.lineupOptimizer.volumePlays.map((p, i) => (
                    <div key={i} className="tactical-item highlight-hover">
                      <div className="item-meta">
                        <span className="pos-pill accent">{p.position || '??'}</span>
                        <span className="item-name">{p.player_name || p.player}</span>
                      </div>
                      <p className="item-logic">{p.reasoning || p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Key Decisions + Daily Timeline */}
          <div className="gameplan-columns">
            {plan.keyDecisions?.length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">🧠 Key Decisions</h4>
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

            {plan.dailyMoves && Object.keys(plan.dailyMoves).length > 0 && (
              <div className="card gameplan-section">
                <h4 className="section-title">📅 Daily Playbook</h4>
                <div className="timeline-stack">
                  {DAY_ORDER.filter(day => plan.dailyMoves[day]).map(day => (
                    <div key={day} className="timeline-event">
                      <div className="event-day">
                        <span className="day-emoji">{DAY_EMOJI[day]}</span>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </div>
                      <div className="event-content">{plan.dailyMoves[day]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Raw Fallback */}
          {plan.rawPlan && (
            <div className="card gameplan-section">
              <h4 className="section-title">📝 Full Briefing</h4>
              <div className="ai-response-prose">
                <MarkdownRenderer text={plan.rawPlan} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="gameplan-footer">
            <button className="btn btn-ghost" onClick={generatePlan} disabled={loading}>
              {loading ? 'Recalculating...' : '↻ Refresh Analysis'}
            </button>
            <button className="btn btn-ghost" onClick={() => setPlan(null)}>Reset View</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <p className="text-muted">Select a league to generate a weekly tactical game plan.</p>
        </div>
      )}
    </div>
  )
}
