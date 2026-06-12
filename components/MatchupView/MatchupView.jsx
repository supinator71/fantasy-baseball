'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import { toast } from 'react-hot-toast';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

// Convert the [{stat_id, name, value}] array from the API into {R: 8, HR: 2, ...}
function statsArrayToMap(statsArr) {
  const map = {};
  for (const s of (statsArr || [])) {
    if (s.name && !isNaN(parseInt(s.name)) === false) {
      map[s.name] = s.value;
    } else if (s.stat_id) {
      map[s.stat_id] = s.value;
    }
  }
  return map;
}

export default function MatchupView() {
  const { selectedLeague, leagueData, aiAnalysis } = useLeague();
  const [aiPrediction, setAiPrediction]     = useState(null);
  const [aiPredLoading, setAiPredLoading]   = useState(false);
  const [aiPredError, setAiPredError]       = useState('');

  // SWR automatically handles caching, deduping, and background refresh!
  const { data: matchup, error, isLoading: loading, mutate } = useSWR(
    selectedLeague ? `/api/yahoo/league/${selectedLeague}/matchup` : null
  );

  // Clear previous prediction when league changes
  useEffect(() => {
    setAiPrediction(null);
  }, [selectedLeague]);

  // Auto-run prediction when matchup data loads and is not loading
  useEffect(() => {
    if (matchup && !loading && !aiPrediction && !aiPredLoading) {
      runMatchupPrediction();
    }
  }, [matchup, loading, aiPrediction, aiPredLoading]);

  async function runMatchupPrediction() {
    setAiPredLoading(true);
    setAiPredError('');
    try {
      const { data } = await axios.post('/api/claude/matchup/predict', {
        league_key: selectedLeague,
        matchup_data: matchup,
      });
      setAiPrediction(data.prediction || data.analysis || data.summary || JSON.stringify(data));
    } catch (err) {
      setAiPredError(err.response?.data?.error || 'Prediction failed. Try again.');
    } finally {
      setAiPredLoading(false);
    }
  }

  if (loading) return <div className="card loading">Analyzing live matchup...</div>;
  if (!matchup) return <div className="card">No active matchup found. Select a league above.</div>;

  const myScore   = matchup.myTeam?.total_points ?? 0;
  const oppScore  = matchup.opponent?.total_points ?? 0;
  const isPoints  = myScore !== null && oppScore !== null;

  return (
    <div className="matchup-view">
      {/* Score banner */}
      <div className="card" style={{ background: 'linear-gradient(to right, #1a365d, #0f172a)', padding: 40, textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <img src="/cyborg_mascot_homerun.png" alt="Home Run Mascot" style={{ height: 56, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(74,175,219,0.5))' }} />
          <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2 }}>Week {matchup.week} — Live Score</div>
          <button 
            onClick={async () => {
              try {
                await mutate();
                await runMatchupPrediction();
                toast.success('Matchup & prediction refreshed!');
              } catch (e) {
                toast.error('Refresh failed.');
              }
            }}
            disabled={loading || aiPredLoading}
            style={{ 
              fontSize: 11, background: 'none', border: '1px solid #1e3d5c', borderRadius: 4, 
              padding: '2px 8px', color: '#7aafc4', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
            }}
          >
            {loading || aiPredLoading ? '⟳ ...' : '↻ Refresh'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{matchup.myTeam?.name}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: myScore >= oppScore ? 'var(--primary)' : '#e2e8f0' }}>
              {isPoints ? Math.round(myScore) : '—'}
            </div>
            {isPoints && <div style={{ fontSize: 12, color: '#7aafc4', marginTop: 4 }}>pts</div>}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, opacity: 0.3 }}>VS</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{matchup.opponent?.name}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: oppScore > myScore ? '#ff4444' : '#e2e8f0' }}>
              {isPoints ? Math.round(oppScore) : '—'}
            </div>
            {isPoints && <div style={{ fontSize: 12, color: '#7aafc4', marginTop: 4 }}>pts</div>}
          </div>
        </div>
      </div>

      {/* Live deficit banner — replaces stale cached InsightCard */}
      {(() => {
        const gap    = parseFloat(oppScore) - parseFloat(myScore);
        const gapAbs = Math.abs(gap).toFixed(1);
        const losing = gap > 0;
        const urgent = gap > 75;
        const close  = Math.abs(gap) <= 30;
        const color  = urgent ? '#ef4444' : close ? '#f59e0b' : losing ? '#fb923c' : '#00a86b';
        const bg     = urgent ? 'rgba(239,68,68,0.1)' : close ? 'rgba(245,158,11,0.1)' : losing ? 'rgba(251,146,60,0.08)' : 'rgba(0,168,107,0.1)';
        const icon   = urgent ? '🚨' : close ? '⚡' : losing ? '⚠️' : '✅';
        const msg    = losing
          ? `${icon} You are DOWN ${gapAbs} pts — ${urgent ? 'URGENT: make aggressive moves NOW' : 'make lineup moves to close the gap'}`
          : `${icon} You are leading by ${gapAbs} pts — stay the course`;
        return (
          <div style={{ background: bg, border: `1px solid ${color}`, borderRadius: 12, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, color, fontSize: 15 }}>{msg}</div>
              {losing && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>AI analysis loading below — check your bench for immediate upgrades</div>}
            </div>
          </div>
        );
      })()}

      {/* AI Prediction button + result */}
      {aiPredError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {aiPredError}
        </div>
      )}
      {aiPrediction ? (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #06b6d4' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            ⚔️ Deep Matchup Prediction
          </div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7 }}>
            <MarkdownRenderer text={aiPrediction} />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12, fontSize: 12 }} onClick={runMatchupPrediction} disabled={aiPredLoading}>
            {aiPredLoading ? '⟳ Re-running...' : '↻ Re-run Prediction'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={runMatchupPrediction} disabled={aiPredLoading}>
            {aiPredLoading ? '⟳ Predicting...' : '⚔️ Get AI Prediction'}
          </button>
        </div>
      )}

      {/* Category table */}
      {matchup.stats?.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              {matchup.stats.map((cat, i) => (
                <tr key={i} style={{ background: cat.my_winning ? 'rgba(0,168,107,0.06)' : cat.opp_winning ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                  <td style={{ textAlign: 'right', paddingRight: 24, fontWeight: 600,
                    color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#e2e8f0'
                  }}>{cat.my_winning && '▲ '}{cat.my_value ?? '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                      background: cat.my_winning ? 'rgba(0,168,107,0.2)' : cat.opp_winning ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                      fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                      color: cat.my_winning ? '#00a86b' : cat.opp_winning ? '#ef4444' : '#7aafc4'
                    }}>{cat.name}</span>
                  </td>
                  <td style={{ paddingLeft: 24, fontWeight: 600,
                    color: cat.opp_winning ? '#00a86b' : cat.my_winning ? '#ef4444' : '#e2e8f0'
                  }}>{cat.opp_value ?? '—'}{cat.opp_winning && ' ▲'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

