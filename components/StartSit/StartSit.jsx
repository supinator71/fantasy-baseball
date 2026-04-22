'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLeague } from '@/lib/context/LeagueContext';
import AiQuestionBox from '../shared/AiQuestionBox';
import InsightCard from '@/components/InsightCard/InsightCard';

export default function StartSit() {
  const { selectedLeague, leagueData, aiAnalysis, aiLoading } = useLeague();
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) loadRoster();
  }, [selectedLeague]);

  async function loadRoster() {
    setRosterLoading(true);
    setResult(null);
    try {
      const { data } = await axios.get(`/api/yahoo/league/${selectedLeague}/myroster`);
      setRoster(data.players || []);
    } catch {
      toast.error('Could not load roster.');
    } finally {
      setRosterLoading(false);
    }
  }

  async function analyzeDailyLineup() {
    if (!roster.length) return toast.error('No roster loaded.');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/claude/startsit', {
        players: roster,
        matchup_context: context || 'TODAY_DAILY_OPTIMIZER: Evaluate my ENTIRE roster for TODAY. Who are the absolute Must-Starts? Who should be immediately benched? Identify my 3 toughest start/sit decisions.',
        scoring_type: leagueData?.scoring_type || 'H2H Points',
        daily_mode: true,
        league_key: selectedLeague,
      });
      setResult(data.analysis);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>⚡ Daily Start/Sit</h1>
        <p style={{ color: '#7aafc4' }}>AI-powered daily lineup optimizer</p>
      </div>

      <InsightCard data={aiAnalysis?.startSit} type="startSit" loading={aiLoading} />

      {/* Roster + detailed analysis button */}
      {rosterLoading ? (
        <div className="loading" style={{ margin: '40px 0' }}>Loading your live roster...</div>
      ) : roster.length > 0 ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Roster ({roster.length} players)</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>Ready for today's analysis.</p>
            </div>
            <button className="btn btn-primary" onClick={analyzeDailyLineup} disabled={loading}
              style={{ padding: '12px 24px', fontSize: 15, background: 'linear-gradient(135deg, #00a86b 0%, #007a7a 100%)' }}>
              {loading ? '⟳ Auto-generating Today\'s Lineup...' : '⚡ Optimize Today\'s Lineup'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roster.map((p, i) => (
              <span key={i} style={{ background: '#122840', border: '1px solid #1e3d5c', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
                <span className={`badge badge-${String(p.position || '').split(',')[0].trim().toLowerCase()}`} style={{ fontSize: 10, marginRight: 6 }}>
                  {String(p.position || '').split(',')[0].trim()}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 48, marginBottom: 16 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚾</div>
          <div className="loading">Select a league to load your roster...</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Additional Context (optional)</h3>
        <textarea rows={3}
          placeholder="e.g. Facing a lefty tonight, need HR upside, streaming SP..."
          value={context} onChange={e => setContext(e.target.value)} />
      </div>

      {result && (
        <div className="card">
          <h3 style={{ color: '#007a7a', marginBottom: 12 }}>Full Daily Analysis</h3>
          <div className="ai-response">{result}</div>
          <AiQuestionBox
            context={`Start/Sit optimization context: ${result}`}
            leagueKey={selectedLeague}
            title="Manager's Hot Seat"
            icon="⚡"
            placeholder="Ask about a specific matchup or second-guess a benching..."
          />
        </div>
      )}
    </div>
  );
}
