'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import { scoreWaiverTarget, buildRosterDiagnosis } from '@/lib/fantasyBrain';
import { toast } from 'react-hot-toast';

export default function WaiverWire() {
  const { selectedLeague, leagueData } = useLeague();
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [myRoster, setMyRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    if (selectedLeague) fetchData();
  }, [selectedLeague]);

  async function fetchData() {
    setLoading(true);
    try {
      const [rosterRes, availableRes] = await Promise.all([
        axios.get(`/api/yahoo/league/${selectedLeague}/myroster`),
        axios.get(`/api/yahoo/league/${selectedLeague}/players`, { params: { status: 'A', position: 'ALL' } })
      ]);
      
      const roster = rosterRes.data.players || [];
      setMyRoster(roster);
      
      const diag = buildRosterDiagnosis(roster, leagueData?.settings || {});
      setDiagnosis(diag);

      // Score each available player
      const scored = (availableRes.data || []).map(p => {
        const evaluation = scoreWaiverTarget(p, roster, leagueData?.settings || {}, diag.categoryNeeds);
        return { ...p, ...evaluation };
      }).sort((a,b) => b.score - a.score);

      setAvailablePlayers(scored);
    } catch (err) {
      toast.error('Failed to load waiver data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="waiver-wire">
      {diagnosis && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--primary)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: 8 }}>AI ROSTER DIAGNOSIS</h4>
          <p style={{ margin: 0, fontSize: 14 }}>
            {diagnosis.categoryNeeds.needsPitching && "⚠️ Your rotation is leaking points. Target high-K starters. "}
            {diagnosis.categoryNeeds.needsHitting && "⚠️ Your lineup needs a power boost. Target HR/RBI hitters. "}
            {!diagnosis.categoryNeeds.needsPitching && !diagnosis.categoryNeeds.needsHitting && "✅ Your roster is currently balanced across all categories."}
          </p>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Scouting free agents...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>AI Score</th>
                <th>Priority</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {availablePlayers.slice(0, 20).map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.name || p.player_name}</strong></td>
                  <td><span className="badge">{p.position}</span></td>
                  <td style={{ fontWeight: 800, color: p.score > 60 ? '#00ff88' : '#fff' }}>{p.score}</td>
                  <td>
                    <span className={`tag ${p.priority === 'High' ? 'tag-high' : 'tag-low'}`}>
                      {p.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .tag-high { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.3); }
        .tag-low { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
