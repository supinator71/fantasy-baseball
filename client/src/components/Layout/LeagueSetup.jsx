import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LeagueSetup({ onSave }) {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [settings, setSettings] = useState({
    league_key: '',
    league_name: '',
    num_teams: 12,
    scoring_type: 'Roto',
    draft_type: 'Snake',
    draft_position: 1,
    roster_slots: { SP: 2, RP: 2, C: 1, '1B': 1, '2B': 1, '3B': 1, SS: 1, OF: 3, UTIL: 1, BN: 4, IL: 2 },
    stat_categories: ['R', 'HR', 'RBI', 'SB', 'AVG', 'W', 'SV', 'K', 'ERA', 'WHIP']
  })
  const [aiStrategy, setAiStrategy] = useState('')
  const [stratLoading, setStratLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => setLeagues(data)).catch(() => {})
    axios.get('/api/yahoo/league/settings/local').then(({ data }) => {
      if (data) setSettings(s => ({ ...s, ...data }))
    }).catch(() => {})
  }, [])

  async function saveSettings() {
    try {
      await axios.post('/api/yahoo/league/save', settings)
      toast.success('League settings saved!')
      onSave?.()
    } catch {
      toast.error('Failed to save settings')
    }
  }

  async function generateStrategy() {
    setStratLoading(true)
    setAiStrategy('')
    try {
      const { data } = await axios.post('/api/claude/draft/strategy', {
        draft_position: settings.draft_position,
        num_teams: settings.num_teams,
        scoring_type: settings.scoring_type,
        roster_slots: settings.roster_slots,
        stat_categories: settings.stat_categories
      })
      setAiStrategy(data.strategy)
    } catch {
      toast.error('Strategy generation failed')
    } finally {
      setStratLoading(false)
    }
  }

  function update(field, value) {
    setSettings(s => ({ ...s, [field]: value }))
  }

  function updateRoster(pos, value) {
    setSettings(s => ({ ...s, roster_slots: { ...s.roster_slots, [pos]: +value } }))
  }

  function toggleCat(cat) {
    setSettings(s => ({
      ...s,
      stat_categories: s.stat_categories.includes(cat)
        ? s.stat_categories.filter(c => c !== cat)
        : [...s.stat_categories, cat]
    }))
  }

  const ALL_CATS = {
    Hitting: ['R', 'HR', 'RBI', 'SB', 'AVG', 'OBP', 'SLG', 'OPS', 'H', 'TB', 'BB', 'XBH'],
    Pitching: ['W', 'SV', 'K', 'ERA', 'WHIP', 'K/9', 'BB/9', 'HD', 'QS', 'IP', 'HLD']
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>League Setup</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>Configure your league settings to get personalized AI recommendations</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Basic Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Yahoo League</label>
              <select value={selectedLeague} onChange={e => {
                setSelectedLeague(e.target.value)
                const l = leagues.find(l => l.league_key === e.target.value)
                if (l) update('league_key', l.league_key) && update('league_name', l.name)
              }} style={{}}>
                <option value="">Select a league...</option>
                {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>League Name</label>
              <input value={settings.league_name} onChange={e => update('league_name', e.target.value)} placeholder="My Fantasy League" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Teams</label>
                <input type="number" value={settings.num_teams} onChange={e => update('num_teams', +e.target.value)} min={4} max={20} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Draft Position</label>
                <input type="number" value={settings.draft_position} onChange={e => update('draft_position', +e.target.value)} min={1} max={20} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Scoring Type</label>
                <select value={settings.scoring_type} onChange={e => update('scoring_type', e.target.value)}>
                  <option>Roto</option>
                  <option>H2H Categories</option>
                  <option>H2H Points</option>
                  <option>Points</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Draft Type</label>
                <select value={settings.draft_type} onChange={e => update('draft_type', e.target.value)}>
                  <option>Snake</option>
                  <option>Auction</option>
                  <option>Linear</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Roster Slots</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(settings.roster_slots).map(([pos, count]) => (
              <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${pos.toLowerCase()}`} style={{ minWidth: 40, textAlign: 'center' }}>{pos}</span>
                <input type="number" value={count} onChange={e => updateRoster(pos, e.target.value)}
                  min={0} max={10} style={{ width: 60 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Scoring Categories</h3>
        {Object.entries(ALL_CATS).map(([group, cats]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{group}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cats.map(cat => (
                <button key={cat}
                  className={`btn ${settings.stat_categories.includes(cat) ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 12, padding: '4px 12px' }}
                  onClick={() => toggleCat(cat)}>{cat}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={saveSettings} style={{ padding: '12px 24px' }}>
          Save Settings
        </button>
        <button className="btn btn-ghost" onClick={generateStrategy} disabled={stratLoading} style={{ padding: '12px 24px' }}>
          {stratLoading ? 'Generating...' : '🤖 Generate Draft Strategy'}
        </button>
      </div>

      {aiStrategy && (
        <div className="card">
          <h3 style={{ color: '#3b82f6', marginBottom: 12 }}>Your Personalized Draft Strategy</h3>
          <div className="ai-response">{aiStrategy}</div>
        </div>
      )}
    </div>
  )
}
