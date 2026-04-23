'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { toast } from 'react-hot-toast';
import AiQuestionBox from '@/components/shared/AiQuestionBox';
import InsightCard from '@/components/InsightCard/InsightCard';

const PRIORITY_COLORS = {
  'MUST ADD':             { bg: 'rgba(0,168,107,0.15)',   color: '#00a86b', border: 'rgba(0,168,107,0.4)' },
  'CHAMPIONSHIP STREAM':  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
  'HIGH PRIORITY STREAM': { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  'CRITICAL STREAM':      { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  'High priority':        { bg: 'rgba(74,175,219,0.12)',  color: '#4aafdb', border: 'rgba(74,175,219,0.3)' },
  'Speculative add':      { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' },
  'Monitor':              { bg: 'rgba(255,255,255,0.04)', color: '#64748b', border: 'rgba(255,255,255,0.07)' },
  'Pass':                 { bg: 'rgba(239,68,68,0.08)',   color: '#7f1d1d', border: 'rgba(239,68,68,0.15)' },
};

export default function WaiverWire() {
  const { selectedLeague, aiAnalysis, aiLoading, scoredWaiver } = useLeague();

  // Raw free-agent list (fetched on load, no Claude needed)
  const [rawPlayers, setRawPlayers]       = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  // Deep-dive AI analysis result
  const [aiRecs, setAiRecs]         = useState(null);   // { recommendations, scored }
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiRecsError, setAiRecsError]     = useState('');

  useEffect(() => {
    if (selectedLeague) {
      setRawPlayers([]);
      setAiRecs(null);
      fetchPlayers();
    }
  }, [selectedLeague]);

  // ── Step 1: fetch free agents automatically on load ──────────────────────
  async function fetchPlayers() {
    setPlayersLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, {
        params: { status: 'A' }
      });
      setRawPlayers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load free agents');
    } finally {
      setPlayersLoading(false);
    }
  }

  // ── Step 2: "Get AI Analysis" button → deep-dive Claude call ─────────────
  async function runWaiverAnalysis() {
    setAiRecsLoading(true);
    setAiRecsError('');
    try {
      // Use scored list if already available from context, else raw players
      const available = scoredWaiver?.length > 0 ? scoredWaiver : rawPlayers;
      const { data } = await axios.post('/api/claude/waiver', {
        league_key: selectedLeague,
        available_players: available.slice(0, 25),
        // my_roster is fetched server-side in the waiver route
      });
      setAiRecs(data);
    } catch (err) {
      setAiRecsError(err.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setAiRecsLoading(false);
    }
  }

  // Prefer engine-scored from master analyze; fall back to raw players
  const displayPlayers = scoredWaiver?.length > 0
    ? scoredWaiver
    : rawPlayers.slice(0, 25);

  const isLoading = playersLoading || (aiLoading && !scoredWaiver?.length);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/cyborg_mascot_pointing.png" alt="Goin' Yard Scout" style={{ height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(74,175,219,0.4))' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>🔍 Waiver Wire Intel</h1>
            <p style={{ color: '#7aafc4' }}>Free agents ranked by fantasyBrain engine score · AI add/drop recommendations on demand</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={runWaiverAnalysis}
          disabled={aiRecsLoading || isLoading}
          style={{ whiteSpace: 'nowrap' }}
        >
          {aiRecsLoading ? '⟳ Analyzing...' : '⚡ Get AI Analysis'}
        </button>
      </div>

      {/* Master-analyze InsightCard — shows on load from cache, no button needed */}
      <InsightCard data={aiAnalysis?.waiver} type="waiver" loading={aiLoading && !aiAnalysis} />

      {/* Deep-dive AI narration result */}
      {aiRecsError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {aiRecsError}
        </div>
      )}

      {aiRecs?.recommendations && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #4aafdb' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4aafdb', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            ⚡ AI Add/Drop Recommendations
          </div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {aiRecs.recommendations}
          </div>
        </div>
      )}

      {/* Free-agent table — loads automatically, engine-scored */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #1e3d5c',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7aafc4', textTransform: 'uppercase', letterSpacing: 1 }}>
            {scoredWaiver?.length > 0
              ? `Top ${displayPlayers.length} Engine-Ranked Free Agents`
              : `Available Free Agents (${displayPlayers.length})`}
          </span>
          <button
            onClick={fetchPlayers}
            disabled={playersLoading}
            style={{ fontSize: 11, background: 'none', border: '1px solid #1e3d5c', borderRadius: 4, padding: '3px 10px', color: '#7aafc4', cursor: 'pointer' }}
          >
            {playersLoading ? '...' : '↻ Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="loading" style={{ padding: 32 }}>Scouting free agents...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th>Team</th>
                <th>Score</th>
                <th>Priority</th>
                <th style={{ maxWidth: 260 }}>Reasoning</th>
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
                    <td style={{ color: '#7aafc4', fontSize: 12 }}>{p.team}</td>
                    <td style={{
                      fontWeight: 800, fontSize: 16,
                      color: score >= 80 ? '#00a86b' : score >= 60 ? '#f59e0b' : '#e2e8f0'
                    }}>{score !== '—' ? score : '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap'
                      }}>{priority}</span>
                    </td>
                    <td style={{ fontSize: 12, color: '#7aafc4', maxWidth: 260 }}>{reason}</td>
                  </tr>
                );
              })}
              {displayPlayers.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7aafc4' }}>
                  No players loaded yet. Select a league above.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AiQuestionBox
        context={`Waiver wire. Top targets: ${displayPlayers.slice(0,5).map(p => p.name || p.player_name).join(', ')}. AI recs: ${aiRecs?.recommendations?.slice(0,200) || aiAnalysis?.waiver?.headline || ''}`}
        leagueKey={selectedLeague}
        title="Ask About a Specific Player"
        icon="🔍"
        placeholder="Should I add [player name]? Who should I drop to make room?"
      />
    </div>
  );
}
