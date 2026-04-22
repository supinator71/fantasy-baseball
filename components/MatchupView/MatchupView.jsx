'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { analyzeCategories } from '@/lib/fantasyBrain';
import { toast } from 'react-hot-toast';

export default function MatchupView() {
  const { selectedLeague, leagueData } = useLeague();
  const [matchup, setMatchup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchMatchup();
  }, [selectedLeague]);

  async function fetchMatchup() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/matchup`);
      const data = res.data;
      
      const analysis = analyzeCategories(
        data.myTeam?.stats || {}, 
        [data.opponent?.stats || {}], 
        leagueData?.settings?.scoring_type || 'Points',
        leagueData?.settings?.stat_categories
      );

      setMatchup({ ...data, analysis });
    } catch (err) {
      toast.error('Failed to load matchup');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="card loading">Analyzing live matchup...</div>;
  if (!matchup) return <div className="card">No active matchup found.</div>;

  return (
    <div className="matchup-view">
      <div className="card" style={{ background: 'linear-gradient(to right, #1a365d, #0f172a)', padding: 40, textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{matchup.myTeam?.name}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--primary)' }}>{matchup.myTeam?.points || 0}</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, opacity: 0.3 }}>VS</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{matchup.opponent?.name}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#ff4444' }}>{matchup.opponent?.points || 0}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>AI BATTLE PLAN</h3>
        <div className="ai-response" style={{ fontSize: 16, lineHeight: 1.6 }}>
          {matchup.analysis.advice}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {matchup.analysis.topPerformers.map(cat => (
              <span key={cat} className="badge" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>Winning {cat}</span>
            ))}
            {matchup.analysis.weaknesses.map(cat => (
              <span key={cat} className="badge" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>Losing {cat}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
