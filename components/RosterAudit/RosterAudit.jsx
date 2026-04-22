'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { buildRosterDiagnosis } from '@/lib/fantasyBrain';
import { toast } from 'react-hot-toast';

export default function RosterAudit() {
  const { selectedLeague, leagueData } = useLeague();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) fetchAudit();
  }, [selectedLeague]);

  async function fetchAudit() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`);
      const diag = buildRosterDiagnosis(res.data.players || [], leagueData?.settings || {});
      setDiagnosis(diag);
    } catch (err) {
      toast.error('Audit failed');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="card loading">Running deep roster audit...</div>;
  if (!diagnosis) return <div className="card">No data available for audit.</div>;

  return (
    <div className="roster-audit">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>
            {diagnosis.activeRoster.length > 0 ? 'A-' : 'N/A'}
          </div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>TEAM GRADE</div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>EXECUTIVE SUMMARY</h3>
          <div className="ai-response" style={{ fontSize: 16, lineHeight: 1.6 }}>
            Your team is currently ranked in the top 30% for projected VOR. 
            {diagnosis.categoryNeeds.needsHitting ? " Priority: Add power hitters to balance your HR deficiency." : " Your hitting is elite."}
            {diagnosis.categoryNeeds.needsPitching ? " Warning: Your pitching staff has several low-VOR arms that are dragging down your weekly floor." : " Your pitching is solid."}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>PLAYER VALUE BREAKDOWN</h3>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>AI Value (VOR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {diagnosis.activeRoster.map((p, i) => (
              <tr key={i}>
                <td><strong>{p.player_name || p.name}</strong></td>
                <td>{p.position}</td>
                <td style={{ fontWeight: 700, color: p.vor > 50 ? '#00ff88' : '#fff' }}>{p.vor}</td>
                <td>{p.vor > 40 ? '✅ Core Asset' : p.vor > 20 ? '📈 Solid' : '⚠️ Streamer/Drop?'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
