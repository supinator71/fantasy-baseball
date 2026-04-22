'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StartSit from '@/components/StartSit/StartSit';

export default function StartSitPage() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');

  useEffect(() => {
    fetchLeagues();
  }, []);

  async function fetchLeagues() {
    try {
      const res = await axios.get('/api/yahoo/leagues');
      setLeagues(res.data);
      if (res.data[0]?.league_key) setSelectedLeague(res.data[0].league_key);
    } catch (err) {}
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Start/Sit Intelligence</h1>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>
      
      {selectedLeague ? (
        <StartSit leagueKey={selectedLeague} />
      ) : (
        <div className="card">Please select a league to see recommendations.</div>
      )}
    </div>
  );
}
