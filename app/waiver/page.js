'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function WaiverPage() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(res => {
      setLeagues(res.data);
      if (res.data[0]?.league_key) setSelectedLeague(res.data[0].league_key);
    });
  }, []);

  async function getRecommendations() {
    setLoading(true);
    try {
      // Fetch roster and available players first
      const [rosterRes, waiverRes] = await Promise.all([
        axios.get(`/api/yahoo/roster/${selectedLeague}`),
        axios.get(`/api/yahoo/leagues`) // Placeholder for getPlayers
      ]);
      
      const { data } = await axios.post('/api/claude/waiver', {
        league_key: selectedLeague,
        my_roster: rosterRes.data.players,
        available_players: [] // Need to implement getPlayers route
      });
      setAnalysis(data.recommendations);
    } catch (err) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Ask the Scout</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 16 }}>Select a league and ask for the best waiver wire pickups.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ flex: 1 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={getRecommendations} disabled={loading}>
            {loading ? 'Consulting Scout...' : 'Get Recommendations'}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="ai-response">
          {analysis}
        </div>
      )}
    </div>
  );
}
