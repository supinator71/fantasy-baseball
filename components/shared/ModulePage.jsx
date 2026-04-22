'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';

export default function GenericModulePage({ title = "Module Intelligence", children }) {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>{title}</h1>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <div className="card">
          {children || <p>Intelligence engine is analyzing your league data... Check back in a moment.</p>}
        </div>
      ) : (
        <div className="card">Please select a league.</div>
      )}
    </div>
  );
}
