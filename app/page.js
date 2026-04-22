'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data } = await axios.get('/api/auth/status');
      setAuthStatus({ ...data, loading: false });
      if (data.authenticated) {
        fetchLeagues();
      }
    } catch {
      setAuthStatus({ authenticated: false, loading: false });
    }
  }

  async function fetchLeagues() {
    setLoading(true);
    try {
      const res = await axios.get('/api/yahoo/leagues');
      setLeagues(res.data);
      if (res.data[0]?.league_key) setSelectedLeague(res.data[0].league_key);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (authStatus.loading) return <div className="loading">⚾ Loading...</div>;

  if (!authStatus.authenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 16 }}>
        <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'white' }}>Goin' Yard <span style={{ color: 'var(--primary)' }}>HQ</span></h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.6, fontSize: 15 }}>
            An AI-powered fantasy baseball command center.
          </p>
          <a href="/api/auth/yahoo" style={{ display: 'block', textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12 }}>
              Connect Yahoo Fantasy Account
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(192,17,31,0.12) 0%, rgba(0,50,120,0.15) 100%)',
        border: '1px solid rgba(192,17,31,0.25)', borderRadius: 16,
        padding: '20px 20px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ fontSize: '34px', fontWeight: 800, marginBottom: 4 }}>
            Goin' Yard <span style={{ color: 'var(--primary)' }}>Intelligence</span> HQ
          </h1>
          <p style={{ color: '#7aafc4', fontSize: 14 }}>
            Your automated fantasy analytics command center.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your Yahoo Leagues</h2>
        {loading ? (
          <div className="loading">Loading leagues...</div>
        ) : leagues.length === 0 ? (
          <p style={{ color: '#7aafc4' }}>No active MLB leagues found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leagues.map((league, i) => (
              <div key={i} className="card" style={{
                background: league.league_key === selectedLeague ? 'rgba(192, 17, 31, 0.1)' : 'var(--bg-card)',
                borderColor: league.league_key === selectedLeague ? 'var(--primary)' : 'var(--border)',
                cursor: 'pointer'
              }} onClick={() => setSelectedLeague(league.league_key)}>
                <div style={{ fontWeight: 600 }}>{league.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {league.num_teams} teams • {league.scoring_type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
