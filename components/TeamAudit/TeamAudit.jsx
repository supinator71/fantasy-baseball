import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import PackDropModal from '../TrophyCase/PackDropModal'
import { useLeague } from '@/lib/context/LeagueContext'
import InsightCard from '@/components/InsightCard/InsightCard'
import MarkdownRenderer from '@/components/shared/MarkdownRenderer'

function GradeBadge({ grade }) {
  const g = String(grade || '').charAt(0).toUpperCase()
  const color = g === 'A' ? '#00a86b' : g === 'B' ? '#4aafdb' : g === 'C' ? '#f59e0b' : '#ef4444'
  return (
    <div style={{
      width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 30, fontWeight: 800, flexShrink: 0,
      background: `${color}22`, border: `3px solid ${color}`, color
    }}>{grade || '?'}</div>
  )
}

function PriorityBadge({ priority }) {
  const colors = {
    immediate: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    high:      { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    medium:    { bg: 'rgba(74,175,219,0.15)', color: '#4aafdb' },
  }
  const s = colors[priority?.toLowerCase()] || colors.medium
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
    }}>{priority || 'medium'}</span>
  )
}

export default function TeamAudit({ leagueSettings }) {
  const { selectedLeague, aiAnalysis, aiLoading } = useLeague()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [currentLoadedTeam, setCurrentLoadedTeam] = useState('')
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [awardedCard, setAwardedCard] = useState(null)

  useEffect(() => {
    if (selectedLeague) loadData()
  }, [selectedLeague])

  useEffect(() => {
    if (selectedTeam && roster.length && selectedTeam !== currentLoadedTeam) {
      loadSpecificTeamRoster(selectedTeam)
    }
  }, [selectedTeam])

  // Auto-run audit whenever roster populates — Rich-Data-On-Load pattern
  useEffect(() => {
    if (roster.length > 0 && !loading) {
      runAudit()
    }
  }, [roster])

  async function loadData() {
    setRosterLoading(true)
    setRoster([])
    setAudit(null)
    setError('')
    setTeams([])
    
    try {
      const [teamsRes, rosterRes] = await Promise.allSettled([
        axios.get(`/api/yahoo/league/${selectedLeague}/standings`),
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`)
      ])

      // Parse teams
      if (teamsRes.status === 'fulfilled' && teamsRes.value.data) {
        const parsedTeams = (teamsRes.value.data || []).map(t => {
          const teamObj = t?.team
          const info = Array.isArray(teamObj) ? (Array.isArray(teamObj[0]) ? Object.assign({}, ...teamObj[0]) : teamObj[0]) : teamObj
          return { team_key: info?.team_key, name: info?.name }
        }).filter(t => t.team_key)
        setTeams(parsedTeams)
      }

      // Parse roster
      if (rosterRes.status === 'fulfilled' && rosterRes.value.data) {
        setRoster(rosterRes.value.data.players || [])
        if (rosterRes.value.data.teamKey) {
          setSelectedTeam(rosterRes.value.data.teamKey)
          setCurrentLoadedTeam(rosterRes.value.data.teamKey)
        }
      } else {
        setError('Could not load roster. Make sure your league is configured.')
      }

    } catch (err) {
      console.error('Data load error:', err)
      setError('Initial data load failed.')
    } finally {
      setRosterLoading(false)
    }
  }

  async function loadSpecificTeamRoster(teamKey) {
    setRosterLoading(true)
    setRoster([])
    setAudit(null)
    setError('')
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/team/${teamKey}/rosterstats`)
      setRoster(data.players || [])
      setCurrentLoadedTeam(teamKey)
    } catch (err) {
      setError(`Could not load roster for selected team.`)
    } finally {
      setRosterLoading(false)
    }
  }

  async function checkTrophyUnlocks(auditData) {
    const grade = auditData?.grade || '';
    if (grade.startsWith('A')) {
      try {
        const { data } = await axios.post('/api/trophy/award', { trigger: 'audit_aplus' });
        if (data?.success) {
          toast.success('🏆 Elite Achievement! You earned 1x Titan Syndicate Drop token. Go to the Store to open it!');
        }
      } catch (e) {}
    } else if (grade.startsWith('B')) {
      try {
        const { data } = await axios.post('/api/trophy/award', { trigger: 'audit_b' });
        if (data?.success) {
          toast.success('🏆 Milestone! You earned 1x Premium Hobby Box token. Go to the Store to open it!');
        }
      } catch (e) {}
    }
  }

  async function runAudit() {
    if (!roster.length) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/claude/audit', {
        my_roster: roster,
        league_key: selectedLeague,
      })
      setAudit(data)
      checkTrophyUnlocks(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Audit failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PackDropModal awardedCard={awardedCard} onClose={() => setAwardedCard(null)} />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/cyborg_analyst.png" alt="Cyborg Analyst" style={{ height: 72, width: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(74,175,219,0.4))' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>▣ Team Audit</h1>
            <p style={{ color: '#7aafc4' }}>AI-powered roster analysis — grades, VOR rankings, and actionable moves</p>
          </div>
        </div>
        {teams.length > 0 && (
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} style={{ minWidth: 200, padding: '8px 12px', borderRadius: 6, background: '#122840', color: '#fff', border: '1px solid #1e3d5c' }}>
            {teams.map((t, i) => <option key={i} value={t.team_key}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Auto-run loading state */}
      {loading && !audit && (
        <div className="card" style={{ textAlign: 'center', padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="loading" style={{ padding: 0 }}>⚙️</span>
          <div>
            <strong>Running AI Roster Analysis...</strong>
            <p style={{ color: '#7aafc4', fontSize: 13, margin: '4px 0 0' }}>Computing VOR, grades, and recommendations from your live stats</p>
          </div>
        </div>
      )}


      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Roster preview */}
      {/* Roster chip preview — shown while audit is running */}
      {rosterLoading && <div className="loading">Loading your roster...</div>}

      {!rosterLoading && roster.length > 0 && !audit && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Roster ({roster.length} players) — Running analysis...</h3>
            <button className="btn btn-primary" onClick={runAudit} disabled={loading}
              style={{ padding: '10px 24px', fontSize: 14 }}>
              {loading ? '⟳ Analyzing...' : '⟳ Re-run Audit'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{
                background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6,
                padding: '4px 10px', fontSize: 12
              }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img 
              src="/cyborg_analyst.png" 
              alt="Cyborg Baseball Analyst" 
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glow)', boxShadow: '0 0 24px rgba(0, 200, 255, 0.25)' }} 
            />
          </div>
          <div className="loading">Running deep roster analysis...</div>
          <p style={{ color: '#7aafc4', fontSize: 13, marginTop: 8 }}>Calculating VOR, positional scarcity, category profile...</p>
        </div>
      )}

      {/* Audit results */}
      {audit && (
        <>
          {/* Grade banner */}
          <div className="card" style={{
            marginBottom: 16, padding: '24px 28px',
            background: 'linear-gradient(135deg, #0c2c56 0%, #0c1d35 100%)',
            border: '1px solid #1e3d5c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <GradeBadge grade={audit.grade} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                  Overall Grade
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  {audit.grade} — Your Roster
                </div>
                {audit.championshipPath && (
                  <p style={{ color: '#7aafc4', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    {audit.championshipPath}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {audit.strengths?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#00a86b', marginBottom: 12, fontSize: 15 }}>✅ Strengths</h3>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {audit.strengths.map((s, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {audit.weaknesses?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#ef4444', marginBottom: 12, fontSize: 15 }}>⚠️ Weaknesses</h3>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {audit.weaknesses.map((w, i) => (
                    <li key={i} style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(!audit.strengths || audit.strengths.length === 0) && audit.raw && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#4aafdb', marginBottom: 12, fontSize: 15 }}>🧠 Deep Analysis</h3>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.6 }}>
                <MarkdownRenderer text={audit.raw.replace(/```json/g, '').replace(/```/g, '')} />
              </div>
            </div>
          )}

          {/* Actionable moves */}
          {audit.moves?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>⚡ Recommended Moves</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {audit.moves.map((move, i) => (
                  <div key={i} style={{
                    background: '#122840', border: '1px solid #1e3d5c',
                    borderRadius: 8, padding: '12px 16px',
                    borderLeft: `3px solid ${move.priority === 'immediate' ? '#ef4444' : move.priority === 'high' ? '#f59e0b' : '#4aafdb'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{move.action}</div>
                      <PriorityBadge priority={move.priority} />
                    </div>
                    <p style={{ color: '#7aafc4', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{move.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VOR table */}
          {audit.vorByPlayer?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
                Value Over Replacement Rankings
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Pos</th>
                    <th>VOR Score</th>
                    <th>Scarcity</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.vorByPlayer.map((p, i) => (
                    <tr key={i}>
                      <td data-label="Player" style={{ fontWeight: 600 }}>{p.name}</td>
                      <td data-label="Pos">
                        <span className={`badge badge-${String(p.position || '').toLowerCase()}`}>{p.position}</span>
                      </td>
                      <td data-label="VOR Score">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: Math.max(4, (p.vor / 100) * 80), height: 6, borderRadius: 3,
                            background: p.vor >= 70 ? '#00a86b' : p.vor >= 40 ? '#f59e0b' : '#ef4444'
                          }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.vor}/100</span>
                        </div>
                      </td>
                      <td data-label="Scarcity">
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                          background: p.scarcity === 'elite' ? 'rgba(239,68,68,0.15)' : p.scarcity === 'scarce' ? 'rgba(245,158,11,0.15)' : 'rgba(74,175,219,0.1)',
                          color: p.scarcity === 'elite' ? '#ef4444' : p.scarcity === 'scarce' ? '#f59e0b' : '#4aafdb'
                        }}>{p.scarcity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={runAudit} disabled={loading}>
              {loading ? '⟳ Re-analyzing...' : '↻ Re-run Audit'}
            </button>
            <button className="btn btn-ghost" onClick={() => setAudit(null)}>Clear</button>
          </div>
        </>
      )}

      {!rosterLoading && !roster.length && !error && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to load your roster and run an AI audit.</p>
        </div>
      )}
    </div>
  )
}
