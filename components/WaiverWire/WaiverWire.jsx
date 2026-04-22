'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { toast } from 'react-hot-toast';
import AiQuestionBox from '@/components/shared/AiQuestionBox';
import InsightCard from '@/components/InsightCard/InsightCard';

const PRIORITY_COLORS = {
  'MUST ADD':             { bg: 'rgba(0,168,107,0.15)',  color: '#00a86b', border: 'rgba(0,168,107,0.4)' },
  'CHAMPIONSHIP STREAM':  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
  'CRITICAL STREAM':      { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  'High priority':        { bg: 'rgba(74,175,219,0.12)', color: '#4aafdb', border: 'rgba(74,175,219,0.3)' },
  'Speculative add':      { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' },
  'Monitor':              { bg: 'rgba(255,255,255,0.04)', color: '#64748b', border: 'rgba(255,255,255,0.07)' },
  'Pass':                 { bg: 'rgba(239,68,68,0.08)',  color: '#7f1d1d', border: 'rgba(239,68,68,0.15)' },
};

export default function WaiverWire() {
  const { selectedLeague, aiAnalysis, aiLoading, scoredWaiver } = useLeague();
  // Also fetch fresh waiver players locally for display
  const [localPlayers, setLocalPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchPlayers();
  }, [selectedLeague]);

  async function fetchPlayers() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, {
        params: { status: 'A' }
      });
      setLocalPlayers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load available players');
    } finally {
      setLoading(false);
    }
  }

  // Use pre-scored waiver targets from context if available, else fall back to local list
  const displayPlayers = scoredWaiver?.length > 0
    ? scoredWaiver
    : localPlayers.slice(0, 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>🔍 Waiver Wire Intel</h1>
          <p style={{ color: '#7aafc4' }}>Free agents ranked by fantasyBrain scoring + AI recommendation</p>
        </div>
      </div>

      <InsightCard data={aiAnalysis?.waiver} type="waiver" loading={aiLoading} />

      {/* Player table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3d5c', fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
          {scoredWaiver?.length > 0 ? `Top ${displayPlayers.length} Ranked Free Agents` : 'Available Free Agents'}
        </div>
        {loading ? (
          <div className="loading" style={{ padding: 32 }}>Scouting free agents...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th>Score</th>
                <th>Priority</th>
                <th style={{ maxWidth: 280 }}>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {displayPlayers.map((p, i) => {
                const priority = p.waiverScore?.priority || p.priority || '—';
                const score    = p.waiverScore?.score    ?? p.score    ?? '—';
                const reason   = p.waiverScore?.reasoning || p.reasoning || '';
                const style    = PRIORITY_COLORS[priority] || PRIORITY_COLORS['Speculative add'];
                return (
                  <tr key={i}>
                    <td style={{ color: '#4a7a94', fontSize: 12, width: 32 }}>{i + 1}</td>
                    <td><strong>{p.name || p.player_name}</strong></td>
                    <td><span className="badge">{p.position}</span></td>
                    <td style={{ fontWeight: 800, fontSize: 16,
                      color: score >= 80 ? '#00a86b' : score >= 60 ? '#f59e0b' : '#e2e8f0'
                    }}>{score}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                        background: style.bg, color: style.color,
                        border: `1px solid ${style.border}`,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap'
                      }}>{priority}</span>
                    </td>
                    <td style={{ fontSize: 12, color: '#7aafc4', maxWidth: 280 }}>{reason}</td>
                  </tr>
                );
              })}
              {displayPlayers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#7aafc4' }}>
                  No players available. Try refreshing.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AiQuestionBox
        context={`Waiver wire analysis: ${aiAnalysis?.waiver || ''} Top targets: ${displayPlayers.slice(0,5).map(p => p.name || p.player_name).join(', ')}`}
        leagueKey={selectedLeague}
        title="Ask About a Specific Player"
        icon="🔍"
        placeholder="Should I add [player name]? Who should I drop to make room?"
      />
    </div>
  );
}
