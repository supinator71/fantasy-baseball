'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import { toast } from 'react-hot-toast';

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
  const [matchup, setMatchup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchMatchup();
  }, [selectedLeague]);

  async function fetchMatchup() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/matchup`);
      setMatchup(res.data);
    } catch (err) {
      toast.error('Failed to load matchup');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="card loading">Analyzing live matchup...</div>;
  if (!matchup) return <div className="card">No active matchup found.</div>;

  const myScore   = matchup.myTeam?.total_points ?? 0;
  const oppScore  = matchup.opponent?.total_points ?? 0;
  const isPoints  = myScore !== null && oppScore !== null;

  return (
    <div className="matchup-view">
      {/* Score banner */}
      <div className="card" style={{ background: 'linear-gradient(to right, #1a365d, #0f172a)', padding: 40, textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
          Week {matchup.week} — Live Score
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

      <InsightCard data={aiAnalysis?.matchup || aiAnalysis?.gameplan} type="matchup" />

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

