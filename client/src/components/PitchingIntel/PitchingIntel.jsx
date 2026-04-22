import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import AiQuestionBox from '../shared/AiQuestionBox'

export default function PitchingIntel({ leagueSettings, subscription }) {
  const [availablePitchers, setAvailablePitchers] = useState([])
  const [myRoster, setMyRoster] = useState([])
  const [myPitchers, setMyPitchers] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiRec, setAiRec] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [posFilter, setPosFilter] = useState('ALL')

  const isPitcher = (pos) => ['SP', 'RP', 'P'].some(x => String(pos).toUpperCase().includes(x));

  const [pitchingContext, setPitchingContext] = useState({ today: [], currentWeekTwoStart: [], nextWeekTwoStart: [] })

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) {
       fetchData()
    }
  }, [selectedLeague])

  async function fetchData() {
    setLoading(true)
    setAiRec('')
    try {
      const [rosterRes, availableRes, contextRes] = await Promise.all([
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`),
        axios.get(`/api/yahoo/league/${selectedLeague}/players`, { params: { status: 'A', force: 'true', position: 'P' } }),
        axios.get('/api/mlb/pitching-context')
      ]);

      const myFullRoster = rosterRes.data?.players || [];
      setMyRoster(myFullRoster);
      setPitchingContext(contextRes.data);

      // Extract my pitchers
      setMyPitchers(myFullRoster.filter(p => isPitcher(p.position)));

      // Identify my pitcher names to exclude from Free Agents
      const rosterNames = myFullRoster.map(p => (p.player_name || p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

      let freeAgents = availableRes.data || [];
      if (!Array.isArray(freeAgents)) freeAgents = [];

      const filteredFA = freeAgents.filter(p => {
        const basicName = (p.player_name || p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return isPitcher(p.position) && !rosterNames.includes(basicName);
      })
      
      setAvailablePitchers(filteredFA);
    } catch (err) {
      toast.error('Failed to parse pitching hub data: ' + err.message);
      setAvailablePitchers([]);
      setMyPitchers([]);
    } finally {
      setLoading(false);
    }
  }

  async function getAiPitchingStrategy() {
    setAiLoading(true)
    setAiRec('')
    try {
      const { data } = await axios.post('/api/claude/pitching', {
        available_players: availablePitchers.slice(0, 20),
        my_roster: myRoster, // Always send FULL roster to backend so AI knows what hitting categories are strong/weak!
        league_key: selectedLeague
      })
      setAiRec(data.recommendations)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI recommendation failed'
      toast.error(msg)
    } finally {
      setAiLoading(false)
    }
  }

  const safeStat = (val) => (val === undefined || val === null || val === '-' || val === '-/-') ? '—' : val;
  const safeRate = (val, decimals = 3) => {
    if (val === undefined || val === null || val === '-' || val === '-/-') return '—'
    const n = parseFloat(val)
    return isNaN(n) ? '—' : n.toFixed(decimals).replace(/^0/, '')
  }

  const renderPitcherStats = (p) => {
    return (
      <span style={{ fontSize: 13, color: '#a0aab2' }}>
        W: {safeStat(p.stats?.['28'])} | SV: {safeStat(p.stats?.['32'])} | K: {safeStat(p.stats?.['42'])} | ERA: {safeRate(p.stats?.['26'], 2)} | WHIP: {safeRate(p.stats?.['27'], 2)}
      </span>
    )
  }

  const renderContextBadges = (p) => {
    const basicName = (p.player_name || p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isProbable = pitchingContext.today?.includes(basicName);
    const isCurrentTwoStart = pitchingContext.currentWeekTwoStart?.includes(basicName);
    const isNextTwoStart = pitchingContext.nextWeekTwoStart?.includes(basicName);

    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {isCurrentTwoStart && <span className="badge" style={{ background: '#d4af37', color: '#000', fontSize: 10 }}>🏆 2-Start (This Wk)</span>}
        {isNextTwoStart && !isCurrentTwoStart && <span className="badge" style={{ background: '#4aafdb', color: '#000', fontSize: 10 }}>🔮 2-Start (Next Wk)</span>}
        {isProbable && <span className="badge" style={{ background: '#00a86b', color: '#fff', fontSize: 10 }}>⚾ Probable Today</span>}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>🎯 Pitching Intel</h1>
          <p style={{ color: '#7aafc4' }}>Command Center for Starting Pitchers, Relievers, and Weekly Streaming</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <button className="btn btn-primary" onClick={getAiPitchingStrategy} disabled={aiLoading || availablePitchers.length === 0}>
            {aiLoading ? '🤖 Building Playbook...' : '⚡ Get Pitching Strategy'}
          </button>
        </div>
      </div>

      {aiRec && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(to bottom, var(--panel-bg), #0c1524)', border: '1px solid #00a86b33' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/cyborg_batflip.png" alt="Goin' Yard Scout" className="mascot-header" style={{height: 48, filter: 'hue-rotate(140deg)'}} />
              <h3 style={{ color: '#00a86b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Pitching Playbook</h3>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAiRec('')}>Dismiss</button>
          </div>
          <div className="ai-response" style={{ fontSize: 15, lineHeight: 1.6 }}>{aiRec}</div>
          
          <AiQuestionBox 
            context={`Pitching strategy context: ${aiRec}`}
            leagueKey={selectedLeague}
            title="Ask the Pitching Coach"
            icon="🎯"
            placeholder="Ask about a specific pitcher or streamer..."
            isPro={subscription?.plan === 'pro'}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 20 }}>
        {/* LEFT: MY ROTATION */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)'}}>
            <h4 style={{ margin: 0, fontSize: 15, color: '#4aafdb' }}>My Current Rotation</h4>
          </div>
          {loading ? (
            <div className="loading" style={{padding: 20}}>Loading roster arms...</div>
          ) : (
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>Pitcher</th><th>Projected Stats</th></tr>
              </thead>
              <tbody>
                {myPitchers.map((p, i) => (
                  <tr key={i}>
                    <td data-label="Pitcher" style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.name} <span className="badge badge-util" style={{fontSize: 10}}>{p.position}</span>
                      </div>
                      {renderContextBadges(p)}
                    </td>
                    <td data-label="Projected Stats" style={{ whiteSpace: 'nowrap' }}>{renderPitcherStats(p)}</td>
                  </tr>
                ))}
                {myPitchers.length === 0 && (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: '#7aafc4', padding: 20 }}>No pitchers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT: TOP FREE AGENTS */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)'}}>
            <h4 style={{ margin: 0, fontSize: 15, color: '#00a86b' }}>Available Free Agent Arms</h4>
          </div>
          
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: 'rgba(0,0,0,0.2)' }}>
            {['ALL', 'SP', 'RP'].map(pos => (
              <button key={pos} className={`btn ${posFilter === pos ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4 }}
                onClick={() => setPosFilter(pos)}>{pos}</button>
            ))}
          </div>

          {loading ? (
            <div className="loading" style={{padding: 20}}>Scouting free agents...</div>
          ) : (
            <table style={{ margin: 0 }}>
              <thead>
                <tr><th>Top Target</th><th>Projected Stats</th></tr>
              </thead>
              <tbody>
                {availablePitchers.filter(p => posFilter === 'ALL' || String(p.position || '').includes(posFilter)).slice(0, 15).map((p, i) => (
                  <tr key={i}>
                    <td data-label="Top Target" style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.name} <span className="badge badge-util" style={{fontSize: 10}}>{p.position}</span> 
                      </div>
                      {renderContextBadges(p)}
                    </td>
                    <td data-label="Projected Stats" style={{ whiteSpace: 'nowrap' }}>{renderPitcherStats(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
