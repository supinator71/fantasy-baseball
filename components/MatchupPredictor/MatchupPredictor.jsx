import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LastUpdated from '../shared/LastUpdated'
import PackDropModal from '../TrophyCase/PackDropModal'
import AiQuestionBox from '../shared/AiQuestionBox'

function ConfidenceBadge({ level }) {
  const styles = {
    high:   { background: 'rgba(0,168,107,0.2)',   color: '#00a86b' },
    medium: { background: 'rgba(245,158,11,0.2)',  color: '#f59e0b' },
    low:    { background: 'rgba(239,68,68,0.2)',   color: '#ef4444' },
  }
  const s = styles[level?.toLowerCase()] || styles.medium
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: s.background, color: s.color,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
    }}>{level || 'medium'}</span>
  )
}

export default function MatchupPredictor({ leagueSettings }) {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [matchup, setMatchup] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [cachedAt, setCachedAt] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [awardedCard, setAwardedCard] = useState(null)

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedLeague) fetchMatchup()
  }, [selectedLeague])

  async function fetchMatchup(force = false) {
    setLoading(true)
    setError('')
    setMatchup(null)
    setPrediction(null)
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/matchup${force ? '?force=true' : ''}`)
      if (res.data.error) { setError(res.data.error); return }
      setMatchup(res.data)
      setCachedAt(res.headers['x-cache-updated'] || null)
      setFromCache(res.headers['x-cache-hit'] === 'true')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load matchup data')
    } finally {
      setLoading(false)
    }
  }

  async function checkTrophyUnlocks(predictData) {
    // Check if projecting a Stolen Bases win!
    const sbCat = predictData.categories?.find(c => c.name.includes('SB') || c.name.includes('Stolen'));
    if (sbCat && sbCat.winner === 'me') {
      try {
        const { data } = await axios.post('/api/trophy/award', { trigger: 'stolen_base_win' });
        if (data?.awarded) setAwardedCard(data.awarded);
      } catch (e) {}
    }
  }

  async function getPrediction() {
    if (!matchup) return
    setAiLoading(true)
    try {
      // Proactively fetch waiver targets for the scout to consider
      let waivers = [];
      try {
        const waiverRes = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, { params: { status: 'A' } });
        waivers = Array.isArray(waiverRes.data) ? waiverRes.data.slice(0, 15) : [];
      } catch (e) {
        console.warn('Could not fetch waivers for matchup context');
      }

      const { data } = await axios.post('/api/claude/matchup/predict', {
        my_team: matchup.myTeam,
        opponent: matchup.opponent,
        stat_categories: leagueSettings?.stat_categories || ['R','HR','RBI','SB','AVG','W','SV','K','ERA','WHIP'],
        available_players: waivers,
        week: matchup.week,
        league_key: selectedLeague
      })
      setPrediction(data)
      checkTrophyUnlocks(data)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI prediction failed. Please try again.';
      setError(msg);
    } finally {
      setAiLoading(false)
    }
  }

  const myWins = matchup?.stats?.filter(s => s.my_winning).length || 0
  const oppWins = matchup?.stats?.filter(s => s.opp_winning).length || 0
  
  // Detect start of week: all stat values are 0 or empty
  const noStatsYet = matchup?.stats?.length > 0 && matchup.stats.every(s => {
    const myVal = parseFloat(s.my_value) || 0;
    const oppVal = parseFloat(s.opp_value) || 0;
    return myVal === 0 && oppVal === 0;
  });

  const STAT_DICT = {
    '0': { abbv: 'GP', full: 'Games Played' },
    '1': { abbv: 'R', full: 'Runs' },
    '2': { abbv: 'H', full: 'Hits' },
    '3': { abbv: 'AVG', full: 'Batting Avg' },
    '4': { abbv: 'OBP', full: 'On-Base %' },
    '5': { abbv: 'SLG', full: 'Slugging %' },
    '6': { abbv: 'AB', full: 'At Bats' },
    '7': { abbv: 'R', full: 'Runs' },
    '8': { abbv: 'H', full: 'Hits' },
    '9': { abbv: '1B', full: 'Singles' },
    '10': { abbv: '2B', full: 'Doubles' },
    '11': { abbv: '3B', full: 'Triples' },
    '12': { abbv: 'HR', full: 'Home Runs' },
    '13': { abbv: 'RBI', full: 'Runs Batted In' },
    '14': { abbv: 'SH', full: 'Sacrifice Hits' },
    '15': { abbv: 'SF', full: 'Sacrifice Flies' },
    '16': { abbv: 'SB', full: 'Stolen Bases' },
    '17': { abbv: 'CS', full: 'Caught Stealing' },
    '18': { abbv: 'BB', full: 'Walks (Hitter)' },
    '19': { abbv: 'IBB', full: 'Int. Walks' },
    '20': { abbv: 'HBP', full: 'Hit By Pitch' },
    '21': { abbv: 'K', full: 'Strikeouts (Hitter)' },
    '22': { abbv: 'GIDP', full: 'Grounded Into DP' },
    '23': { abbv: 'CYC', full: 'Hitting for the Cycle' },
    '24': { abbv: 'TB', full: 'Total Bases' },
    '26': { abbv: 'ERA', full: 'Earned Run Avg' },
    '27': { abbv: 'WHIP', full: 'Walks+Hits/Inning' },
    '28': { abbv: 'W', full: 'Wins' },
    '29': { abbv: 'L', full: 'Losses' },
    '30': { abbv: 'CG', full: 'Complete Games' },
    '31': { abbv: 'SHO', full: 'Shutouts' },
    '32': { abbv: 'SV', full: 'Saves' },
    '33': { abbv: 'OUT', full: 'Outs Pitched' },
    '34': { abbv: 'H', full: 'Hits Allowed' },
    '35': { abbv: 'TBF', full: 'Total Batters Faced' },
    '36': { abbv: 'R', full: 'Runs Allowed' },
    '37': { abbv: 'ER', full: 'Earned Runs' },
    '38': { abbv: 'HR', full: 'Home Runs Allowed' },
    '39': { abbv: 'BB', full: 'Walks Issued' },
    '40': { abbv: 'IBB', full: 'Int. Walks Issued' },
    '41': { abbv: 'HBP', full: 'Hit Batsmen' },
    '42': { abbv: 'K', full: 'Strikeouts (Pitcher)' },
    '43': { abbv: 'WP', full: 'Wild Pitches' },
    '44': { abbv: 'BLK', full: 'Balks' },
    '45': { abbv: 'SB', full: 'Stolen Bases Allowed' },
    '46': { abbv: 'CS', full: 'Caught Stealing Allowed' },
    '47': { abbv: 'PKO', full: 'Pickoffs' },
    '48': { abbv: 'GIDP', full: 'Double Plays Induced' },
    '50': { abbv: 'IP', full: 'Innings Pitched' },
    '54': { abbv: 'OPS', full: 'On-Base + Slugging' },
    '55': { abbv: 'OPS', full: 'On-Base + Slugging' },
    '60': { abbv: 'H/AB', full: 'Hits/At Bats' },
    '61': { abbv: 'XBH', full: 'Extra Base Hits' },
    '65': { abbv: 'NSB', full: 'Net Stolen Bases' },
    '83': { abbv: 'QS', full: 'Quality Starts' },
    '84': { abbv: 'BSV', full: 'Blown Saves' },
    '85': { abbv: 'HLD', full: 'Holds' }
  };

  const getStatInfo = (stat_id, name) => {
    // If Yahoo already resolved it to 'HR', just use it.
    if (name && isNaN(parseInt(name))) {
      const match = Object.values(STAT_DICT).find(s => s?.abbv === name);
      return match || { abbv: name, full: name };
    }
    const key = String(stat_id || name).trim();
    return STAT_DICT[key] || { abbv: key, full: 'Unknown Stat' };
  }

  return (
    <div>
      <PackDropModal awardedCard={awardedCard} onClose={() => setAwardedCard(null)} />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>⚔️ Matchup Predictor</h1>
          <p style={{ color: '#7aafc4' }}>
            {matchup ? `Week ${matchup.week} — live stats & AI projection` : 'Current week projections and lineup optimization'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => <option key={i} value={l.league_key}>{l.name || l.league_key}</option>)}
          </select>
          <LastUpdated cachedAt={cachedAt} fromCache={fromCache} ttlLabel="5 min cache"
            onRefresh={() => fetchMatchup(true)} loading={loading} />
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {loading && <div className="loading">Loading matchup data from Yahoo...</div>}

      {matchup && !loading && (
        <>
          {/* No stats banner */}
          {noStatsYet && (
            <div style={{ 
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', 
              borderRadius: 8, padding: 16, marginBottom: 16, color: '#f59e0b',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Week {matchup.week} — No Live Stats Yet</div>
                <div style={{ fontSize: 13, color: '#d4a34a' }}>
                  Stats for this matchup are exactly tied 0 to 0. If it's Monday morning, check back after today's games begin!
                </div>
              </div>
            </div>
          )}
          {/* VS banner */}
          <div className="card" style={{
            marginBottom: 16, padding: '20px 28px',
            background: 'linear-gradient(135deg, #0c2c56 0%, #0c1d35 50%, #003d3d 100%)',
            border: '1px solid #1e3d5c'
          }}>
            <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 16 }}>
              Week {matchup.week} Matchup
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{matchup.myTeam?.name}</div>
                <div style={{ color: '#7aafc4', fontSize: 13, marginTop: 2 }}>{matchup.myTeam?.manager}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: (matchup.myTeam?.total_points || myWins) > (matchup.opponent?.total_points || oppWins) ? '#00a86b' : '#e2e8f0' }}>
                    {matchup.myTeam?.total_points !== null && matchup.myTeam?.total_points !== undefined ? Math.round(matchup.myTeam.total_points) : myWins}
                  </span>
                  <span style={{ fontSize: 13, color: '#7aafc4', marginLeft: 6 }}>{matchup.myTeam?.total_points !== null && matchup.myTeam?.total_points !== undefined ? 'pts' : 'cats'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4aafdb' }}>VS</div>
                <div style={{ fontSize: 11, color: '#4a7a94', marginTop: 4 }}>Current</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{matchup.opponent?.name}</div>
                <div style={{ color: '#7aafc4', fontSize: 13, marginTop: 2 }}>{matchup.opponent?.manager}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: (matchup.opponent?.total_points || oppWins) > (matchup.myTeam?.total_points || myWins) ? '#00a86b' : '#e2e8f0' }}>
                    {matchup.opponent?.total_points !== null && matchup.opponent?.total_points !== undefined ? Math.round(matchup.opponent.total_points) : oppWins}
                  </span>
                  <span style={{ fontSize: 13, color: '#7aafc4', marginLeft: 6 }}>{matchup.opponent?.total_points !== null && matchup.opponent?.total_points !== undefined ? 'pts' : 'cats'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category comparison table */}
          <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
              Live Category Stats
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>{matchup.myTeam?.name}</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Category</th>
                  <th style={{ paddingLeft: 24 }}>{matchup.opponent?.name}</th>
                </tr>
              </thead>
              <tbody>
                {matchup.stats?.length > 0 ? matchup.stats.map((cat, i) => (
                  <tr key={i} style={{
                    background: cat.my_winning ? 'rgba(0,168,107,0.06)' : cat.opp_winning ? 'rgba(239,68,68,0.06)' : 'transparent'
                  }}>
                    <td data-label="My Team" style={{ textAlign: 'right', paddingRight: 24, fontWeight: 600, fontSize: 15,
                      color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#e2e8f0'
                    }}>
                      {cat.my_winning && <span style={{ marginRight: 8, fontSize: 12 }}>▲</span>}
                      {cat.my_value ?? '—'}
                    </td>
                    <td data-label="Category" style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                        background: cat.my_winning ? 'rgba(0,168,107,0.2)' : cat.opp_winning ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                        color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#7aafc4'
                      }}>{getStatInfo(cat.stat_id, cat.name).abbv}</span>
                    </td>
                    <td data-label="Opponent" style={{ paddingLeft: 24, fontWeight: 600, fontSize: 15,
                      color: cat.opp_winning ? '#00a86b' : cat.my_winning ? '#ef4444' : '#e2e8f0'
                    }}>
                      {cat.opp_value ?? '—'}
                      {cat.opp_winning && <span style={{ marginLeft: 8, fontSize: 12 }}>▲</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#7aafc4', padding: 24 }}>
                    No category stats available yet for this week
                  </td></tr>
                )}
              </tbody>
            </table>
            {matchup.stats?.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid #1e3d5c', fontSize: 11, color: '#7aafc4', lineHeight: 1.6 }}>
                <strong style={{ color: '#4aafdb' }}>Key:</strong>{' '}
                {Array.from(new Set(matchup.stats.map(s => s.stat_id || s.name))).map(id => {
                  const info = getStatInfo(id, id);
                  return info.abbv !== info.full ? `${info.abbv} = ${info.full}` : null;
                }).filter(Boolean).join(' • ') || 'No shorthand metrics to display.'}
              </div>
            )}
          </div>

          {/* AI Predict button */}
          {!prediction && (
            <button className="btn btn-primary" onClick={getPrediction} disabled={aiLoading}
              style={{ width: '100%', padding: '14px', fontSize: 15, marginBottom: 16 }}>
              {aiLoading ? '⟳ Analyzing matchup...' : '⚡ Predict Outcome & Optimize Lineup'}
            </button>
          )}
        </>
      )}

      {/* AI Prediction results */}
      {prediction && (
        <>
          {/* Projected score */}
          <div className="card" style={{
            marginBottom: 16, textAlign: 'center', padding: '24px 28px',
            background: 'linear-gradient(135deg, #004d4d, #0c2c56)',
            border: '1px solid #007a7a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/cyborg_mascot_homerun.png" alt="Galactic Slugger Mascot" className="mascot-ai" />
              <div style={{ fontSize: 13, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2 }}>
                AI Projected Score
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 2 }}>{matchup?.myTeam?.name}</div>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1,
                  color: (prediction.projected_my_points || prediction.projected_wins || 0) >= (prediction.projected_opp_points || prediction.projected_losses || 0) ? '#00a86b' : '#ef4444'
                }}>{(prediction.projected_my_points || prediction.projected_wins) ?? '?'}</div>
              </div>
              <div style={{ fontSize: 28, color: '#4a7a94', fontWeight: 300 }}>–</div>
              <div>
                <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 2 }}>{matchup?.opponent?.name}</div>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1,
                  color: (prediction.projected_opp_points || prediction.projected_losses || 0) >= (prediction.projected_my_points || prediction.projected_wins || 0) ? '#00a86b' : '#ef4444'
                }}>{(prediction.projected_opp_points || prediction.projected_losses) ?? '?'}</div>
              </div>
              {!prediction.projected_my_points && prediction.projected_ties > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: '#7aafc4', marginBottom: 2 }}>Ties</div>
                  <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: '#f59e0b' }}>{prediction.projected_ties}</div>
                </div>
              )}
            </div>
            <div style={{ color: '#7aafc4', fontSize: 14, marginBottom: 12 }}>{prediction.summary}</div>
            <ConfidenceBadge level={prediction.overall_confidence} />
          </div>

          {/* Category projections */}
          {prediction.categories?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
                Category Projections
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'right' }}>My Proj.</th>
                    <th style={{ textAlign: 'center', width: 100 }}>Category</th>
                    <th>Opp. Proj.</th>
                    <th>Confidence</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.categories.map((cat, i) => (
                    <tr key={i} style={{
                      background: cat.winner === 'me' ? 'rgba(0,168,107,0.06)' : cat.winner === 'opponent' ? 'rgba(239,68,68,0.06)' : 'transparent'
                    }}>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 15,
                        color: cat.winner === 'me' ? '#00a86b' : cat.winner === 'opponent' ? '#ef4444' : '#e2e8f0'
                      }}>
                        {cat.winner === 'me' && <span style={{ marginRight: 8, fontSize: 12 }}>▲</span>}
                        {cat.my_proj ?? '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                          background: cat.winner === 'me' ? 'rgba(0,168,107,0.2)' : cat.winner === 'opponent' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                          color: cat.winner === 'me' ? '#00a86b' : cat.winner === 'opponent' ? '#ef4444' : '#7aafc4'
                        }}>{cat.name}</span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 15,
                        color: cat.winner === 'opponent' ? '#00a86b' : cat.winner === 'me' ? '#ef4444' : '#e2e8f0'
                      }}>
                        {cat.opp_proj ?? '—'}
                        {cat.winner === 'opponent' && <span style={{ marginLeft: 8, fontSize: 12 }}>▲</span>}
                      </td>
                      <td><ConfidenceBadge level={cat.confidence} /></td>
                      <td style={{ fontSize: 12, color: '#7aafc4', maxWidth: 200 }}>{cat.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Key battlegrounds */}
          {prediction.key_matchups && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>🎯 Key Battlegrounds</h3>
              <div className="ai-response">{prediction.key_matchups}</div>
            </div>
          )}

          {/* Lineup recommendations */}
          {prediction.lineup_recommendations && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#007a7a', marginBottom: 12 }}>⚡ Lineup Optimization</h3>
              <div className="ai-response">{prediction.lineup_recommendations}</div>
            </div>
          )}

          <AiQuestionBox 
            context={`Matchup prediction context: ${prediction.summary} ${prediction.key_matchups} ${prediction.lineup_recommendations}`}
            leagueKey={selectedLeague}
            title="Cross-Examine the Prediction"
            icon="⚖️"
            placeholder="Ask why a certain category is at risk or how to swing a tie..."
            isPro={true} // Forcing true for now as requested for testing
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={getPrediction} disabled={aiLoading}>
              {aiLoading ? '⟳ Re-analyzing...' : '↻ Regenerate Prediction'}
            </button>
            <button className="btn btn-ghost" onClick={() => setPrediction(null)}>Clear</button>
          </div>
        </>
      )}

      {!matchup && !loading && !error && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚔️</div>
          <p style={{ color: '#7aafc4' }}>Select a league above to load your current week's matchup.</p>
        </div>
      )}
    </div>
  )
}
