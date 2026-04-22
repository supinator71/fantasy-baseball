'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLeague } from '@/lib/context/LeagueContext';

export default function RosterPage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchRoster(selectedLeague);
  }, [selectedLeague]);

  async function fetchRoster(leagueKey) {
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/roster/${leagueKey}`);
      setRoster(res.data.players || []);
    } catch (err) {
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>My Roster</h1>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 240 }}>
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading roster...</div>
        ) : roster.length === 0 ? (
          <p>No players found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Position</th>
                <th>Team</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p, i) => {
                const info = p.player || p;
                const name = info[0]?.name?.full || info.name || 'Unknown';
                const pos = info[0]?.display_position || info.position || '???';
                const team = info[0]?.editorial_team_abbr || info.team || '';
                const status = info[0]?.status || info.status || '';
                
                return (
                  <tr key={i}>
                    <td><strong>{name}</strong></td>
                    <td><span className={`badge badge-${pos.toLowerCase()}`}>{pos}</span></td>
                    <td>{team}</td>
                    <td>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
