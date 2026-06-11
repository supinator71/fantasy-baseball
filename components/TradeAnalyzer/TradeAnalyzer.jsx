/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { evaluateTrade } from '@/lib/fantasyBrain';
import { toast } from 'react-hot-toast';

export default function TradeAnalyzer() {
  const { leagues, selectedLeague, leagueData } = useLeague();
  const [myRoster, setMyRoster] = useState([]);
  const [giving, setGiving] = useState([]);
  const [receiving, setReceiving] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMyRoster = useCallback(async () => {
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`);
      setMyRoster(res.data.players || []);
    } catch (err) {
      console.error('Failed to load roster', err);
    }
  }, [selectedLeague]);

  const runEvaluation = useCallback(() => {
    if (giving.length === 0 && receiving.length === 0) {
      setEvalResult(null);
      return;
    }
    const result = evaluateTrade(giving, receiving, myRoster, leagueData?.settings || {});
    setEvalResult(result);
  }, [giving, receiving, myRoster, leagueData]);

  const searchPlayers = useCallback(async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/players`, {
        params: { status: 'A', position: 'ALL', search: searchQuery }
      });
      setSearchResults(res.data || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague, searchQuery]);

  useEffect(() => {
    if (selectedLeague) fetchMyRoster();
  }, [selectedLeague, fetchMyRoster]);

  useEffect(() => {
    runEvaluation();
  }, [giving, receiving, runEvaluation]);

  const addToGiving = (p) => {
    if (!giving.find(x => x.player_key === p.player_key)) setGiving([...giving, p]);
  };

  const addToReceiving = (p) => {
    if (!receiving.find(x => x.player_key === p.player_key)) setReceiving([...receiving, p]);
  };

  const removeFromGiving = (key) => setGiving(giving.filter(p => p.player_key !== key));
  const removeFromReceiving = (key) => setReceiving(receiving.filter(p => p.player_key !== key));

  return (
    <div className="trade-analyzer">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        {/* SIDE A: GIVING */}
        <div className="card" style={{ borderTop: '4px solid #ff4444' }}>
          <h3 style={{ color: '#ff4444', marginBottom: 16 }}>SENDING AWAY</h3>
          <div style={{ minHeight: 120, border: '2px dashed rgba(255,68,68,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            {giving.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>Click players from your roster below</p>
            ) : (
              giving.map(p => (
                <div key={p.player_key} className="trade-pill" onClick={() => removeFromGiving(p.player_key)}>
                  <span>{p.name || p.player_name}</span>
                  <span className="remove">×</span>
                </div>
              ))
            )}
          </div>
          
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Select from My Roster:</h4>
            {myRoster.map(p => (
              <div key={p.player_key} className="roster-item-small" onClick={() => addToGiving(p)}>
                <strong>{p.name || p.player_name}</strong> ({p.position})
              </div>
            ))}
          </div>
        </div>

        {/* SIDE B: RECEIVING */}
        <div className="card" style={{ borderTop: '4px solid #00c8ff' }}>
          <h3 style={{ color: '#00c8ff', marginBottom: 16 }}>RECEIVING</h3>
          <div style={{ minHeight: 120, border: '2px dashed rgba(0,200,255,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            {receiving.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>Search and add players below</p>
            ) : (
              receiving.map(p => (
                <div key={p.player_key} className="trade-pill-b" onClick={() => removeFromReceiving(p.player_key)}>
                  <span>{p.name || p.player_name}</span>
                  <span className="remove">×</span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Search league players..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchPlayers()}
            />
            <button className="btn btn-primary" onClick={searchPlayers} disabled={loading}>Search</button>
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {searchResults.map(p => (
              <div key={p.player_key} className="roster-item-small" onClick={() => addToReceiving(p)}>
                <strong>{p.name || p.player_name}</strong> ({p.position})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VERDICT SECTION */}
      {evalResult && (
        <div className="card verdict-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0,200,255,0.05) 0%, rgba(0,0,0,0.5) 100%)',
          border: '1px solid var(--primary)',
          textAlign: 'center',
          padding: 40
        }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            AI VERDICT: <span style={{ color: evalResult.score > 0 ? '#00ff88' : '#ff4444' }}>{evalResult.verdict}</span>
          </h2>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>SCORE: {evalResult.score} / 100</div>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto', color: 'var(--text-muted)' }}>{evalResult.reasoning}</p>
          {evalResult.counterOffer && (
             <div style={{ marginTop: 24, color: '#ffcc00', fontWeight: 700 }}>💡 PRO TIP: {evalResult.counterOffer}</div>
          )}
        </div>
      )}

      <style jsx>{`
        .trade-pill, .trade-pill-b {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,68,68,0.1);
          border: 1px solid rgba(255,68,68,0.3);
          padding: 4px 12px;
          border-radius: 20px;
          margin: 4px;
          cursor: pointer;
          font-weight: 700;
        }
        .trade-pill-b {
          background: rgba(0,200,255,0.1);
          border: 1px solid rgba(0,200,255,0.3);
        }
        .remove { opacity: 0.5; }
        .roster-item-small {
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          font-size: 14px;
        }
        .roster-item-small:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
