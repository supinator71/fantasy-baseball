'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLeague } from '@/lib/context/LeagueContext';
import RosterAudit from '@/components/RosterAudit/RosterAudit';

export default function RosterPage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lineup'); // 'lineup' | 'audit'

  const fetchRoster = useCallback(async (leagueKey) => {
    setLoading(true);
    try {
      // myroster returns clean parsed { name, position, team, status, injury } objects
      const res = await axios.get(`/api/yahoo/league/${leagueKey}/myroster`);
      setRoster(res.data.players || []);
    } catch (err) {
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLeague) fetchRoster(selectedLeague);
  }, [selectedLeague, fetchRoster]);

  const active = roster.filter(p => p.slot !== 'BN' && p.slot !== 'IL');
  const bench  = roster.filter(p => p.slot === 'BN');
  const il     = roster.filter(p => p.slot === 'IL');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◈ My Roster</h1>
          <p style={{ color: 'var(--text-muted)' }}>Your current lineup pulled from Yahoo Fantasy</p>
        </div>
        {leagues.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
              {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => fetchRoster(selectedLeague)} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
        <button
          onClick={() => setActiveTab('lineup')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'lineup' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'lineup' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s',
            marginBottom: -2
          }}
        >
          📋 My Lineup
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'audit' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s',
            marginBottom: -2
          }}
        >
          🔬 AI Roster Audit
        </button>
      </div>

      {activeTab === 'lineup' ? (
        loading ? (
          <div className="loading">Loading your roster from Yahoo...</div>
        ) : roster.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <p style={{ color: 'var(--text-muted)' }}>
              No roster data available. Make sure your Yahoo league is active and try refreshing.
            </p>
          </div>
        ) : (
          <>
            <RosterSection title="Active Lineup" players={active} color="#00a86b" />
            <RosterSection title="Bench" players={bench} color="#f59e0b" />
            <RosterSection title="Injured List (IL)" players={il} color="#ef4444" />
          </>
        )
      ) : (
        <RosterAudit />
      )}
    </div>
  );
}

function RosterSection({ title, players, color }) {
  if (!players.length) return null;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color }}>
        {title} ({players.length})
      </h2>
      <table>
        <thead>
          <tr>
            <th>Slot</th>
            <th>Player</th>
            <th>Position</th>
            <th>Team</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{p.slot}</td>
              <td><strong>{p.name}</strong></td>
              <td>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`}>
                  {p.position}
                </span>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>{p.team}</td>
              <td>
                {p.injury
                  ? <span style={{ color: '#ef4444', fontSize: 12 }}>{p.injury}</span>
                  : <span style={{ color: '#00a86b', fontSize: 12 }}>Active</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
