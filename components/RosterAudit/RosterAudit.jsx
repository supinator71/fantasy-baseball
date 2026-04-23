'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { toast } from 'react-hot-toast';

// Grade → color mapping
const GRADE_COLOR = {
  'A+': '#00ff88', 'A': '#00e07a', 'A-': '#22c55e',
  'B+': '#86efac', 'B': '#fbbf24', 'B-': '#f59e0b',
  'C+': '#fb923c', 'C': '#f87171', 'D': '#ef4444',
};

// Priority badge colors
const PRIORITY_COLOR = {
  immediate: '#ef4444',
  high:      '#f59e0b',
  medium:    '#3b82f6',
};

export default function RosterAudit() {
  const { selectedLeague, leagues } = useLeague();
  const [audit, setAudit]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (selectedLeague) runAudit(selectedLeague);
  }, [selectedLeague]);

  async function runAudit(leagueKey) {
    if (!leagueKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/claude/audit', { league_key: leagueKey });
      setAudit(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Audit failed';
      setError(msg);
      toast.error('Roster audit failed — ' + msg);
    } finally {
      setLoading(false);
    }
  }

  const leagueName = leagues?.find(l => l.league_key === selectedLeague)?.name || selectedLeague;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Running Deep Roster Audit…</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Pulling live stats · Calculating VOR · Generating expert analysis
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 16 }}>{error}</div>
        <button className="btn btn-primary" onClick={() => runAudit(selectedLeague)}>
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!audit) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p style={{ color: 'var(--text-muted)' }}>Select a league to run your team audit.</p>
      </div>
    );
  }

  const gradeColor  = GRADE_COLOR[audit.grade] || '#fff';
  const vorByPlayer = audit.vorByPlayer || [];

  // ── Full audit result ──────────────────────────────────────────────────────
  return (
    <div className="roster-audit">

      {/* Header row: grade + championship path */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 20 }}>

        {/* Grade card */}
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>
            {audit.grade}
          </div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                        color: 'var(--text-muted)', marginTop: 8 }}>
            Team Grade
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            VOR {audit.totalVOR} · avg {audit.avgVOR}
          </div>
        </div>

        {/* Championship path */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                        color: 'var(--text-muted)', marginBottom: 10 }}>
            🏆 Championship Path — {leagueName}
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}>
            {audit.championshipPath || 'Analysis loading…'}
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 16, alignSelf: 'flex-start', fontSize: 13 }}
            onClick={() => runAudit(selectedLeague)}
          >
            🔄 Refresh Audit
          </button>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em', color: '#00e07a' }}>
            💪 Strengths
          </h3>
          {(audit.strengths || []).length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {audit.strengths.map((s, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: i < audit.strengths.length - 1
                    ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    fontSize: 14, lineHeight: 1.5 }}>
                  ✅ {s}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No strengths identified yet.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em', color: '#f87171' }}>
            ⚠️ Weaknesses
          </h3>
          {(audit.weaknesses || []).length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {audit.weaknesses.map((w, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: i < audit.weaknesses.length - 1
                    ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    fontSize: 14, lineHeight: 1.5 }}>
                  ⚠️ {w}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No critical weaknesses found.</p>
          )}
        </div>
      </div>

      {/* Recommended moves */}
      {(audit.moves || []).length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em' }}>
            ⚡ Recommended Moves
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {audit.moves.map((move, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8,
                borderLeft: `3px solid ${PRIORITY_COLOR[move.priority] || '#555'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    color: PRIORITY_COLOR[move.priority] || '#aaa',
                    letterSpacing: '0.08em',
                  }}>
                    {move.priority}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{move.action}</span>
                </div>
                {move.reasoning && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {move.reasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOR breakdown table */}
      {vorByPlayer.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 14, textTransform: 'uppercase',
                       letterSpacing: '0.1em' }}>
            📊 Player Value Rankings (VOR)
          </h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th>VOR</th>
                <th>Scarcity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vorByPlayer.map((p, i) => {
                const vorNum = typeof p.vor === 'number' ? p.vor : 0;
                const vorColor = vorNum > 100 ? '#00ff88'
                               : vorNum > 50  ? '#22c55e'
                               : vorNum > 20  ? '#fbbf24'
                               : '#f87171';
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span className={`badge badge-${String(p.position || '').toLowerCase()}`}>
                        {p.position}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: vorColor }}>{vorNum}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {p.scarcity || '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {vorNum > 80 ? '🌟 Core Asset'
                       : vorNum > 40 ? '✅ Solid'
                       : vorNum > 15 ? '📈 Serviceable'
                       : '⚠️ Consider Dropping'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
