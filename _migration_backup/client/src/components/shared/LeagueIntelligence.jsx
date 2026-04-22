import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function LeagueIntelligence({ leagueKey, isPro }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (leagueKey && isPro) {
      fetchTransactions();
    }
  }, [leagueKey, isPro]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/yahoo/league/${leagueKey}/transactions`);
      setTransactions(data.slice(0, 10)); // Show last 10
    } catch (err) {
      toast.error('Failed to fetch rival intelligence.');
    } finally {
      setLoading(false);
    }
  }

  if (!isPro) {
    return (
      <div className="card league-intel locked" style={{ position: 'relative', overflow: 'hidden', minHeight: 200 }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(12, 29, 53, 0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, textAlign: 'center', padding: 20
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🕵️‍♂️</div>
          <h4 style={{ margin: '0 0 8px 0', color: 'white' }}>League Intelligence</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 240 }}>
            Unlock "Spy Mode" to track rival adds/drops and snoop on transaction trends.
          </p>
          <a href="/upgrade" className="btn btn-primary">Upgrade to Pro</a>
        </div>
        <div style={{ opacity: 0.1 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ height: 14, width: '60%', background: 'white', marginBottom: 8 }} />
              <div style={{ height: 10, width: '40%', background: 'white' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card league-intel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🕵️‍♂️</span>
          <h4 style={{ margin: 0 }}>League Intelligence</h4>
        </div>
        <button className="btn btn-ghost" onClick={fetchTransactions} disabled={loading} style={{ fontSize: 12 }}>
          {loading ? 'Refreshing...' : '↻ Sync'}
        </button>
      </div>

      <div className="txn-list">
        {transactions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No recent major transactions detected.
          </div>
        )}
        
        {transactions.map((txn, idx) => {
          // Yahoo transaction structure is complex, we'll need to parse it carefully in the route
          return (
            <div key={idx} className="txn-item" style={{ 
              padding: '12px 0', 
              borderBottom: idx === transactions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              gap: 12
            }}>
              <div className="txn-type-icon" style={{ 
                width: 32, height: 32, borderRadius: 8, 
                background: txn.type === 'add' ? 'rgba(0, 168, 107, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                {txn.type === 'add' ? '📈' : '📉'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{txn.player_name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txn.timestamp}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {txn.type === 'add' ? 'Added by ' : 'Dropped by '} <strong>{txn.team_name}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
