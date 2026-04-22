'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';
import TradeAnalyzer from '@/components/TradeAnalyzer/TradeAnalyzer';

export default function TradePage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();

  return (
    <div className="trade-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Trade Analyzer</h1>
        {leagues.length > 0 && (
          <select 
            value={selectedLeague} 
            onChange={e => setSelectedLeague(e.target.value)} 
            style={{ width: 240 }}
          >
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <TradeAnalyzer />
      ) : (
        <div className="card">Please select a league to evaluate trades.</div>
      )}
    </div>
  );
}
