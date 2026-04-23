'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLeague } from '@/lib/context/LeagueContext';
import AiQuestionBox from '../shared/AiQuestionBox';

export default function StartSit() {
  const { selectedLeague, leagueData } = useLeague();
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const autoRanRef = useRef(false);

  useEffect(() => {
    if (selectedLeague) {
      autoRanRef.current = false;
      loadRoster();
    }
  }, [selectedLeague]);

  // Auto-run daily analysis once when roster loads
  useEffect(() => {
    if (roster.length > 0 && !result && !loading && !autoRanRef.current) {
      autoRanRef.current = true;
      analyzeDailyLineup();
    }
  }, [roster]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <img src="/cyborg_batter_ready.png" alt="Batter Ready" style={{ height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(0,168,107,0.4))' }} />
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>⚡ Daily Start/Sit</h1>
          <p style={{ color: '#7aafc4' }}>AI-powered daily lineup optimizer</p>
        </div>
      </div>

      {/* Roster + re-analyze button */}
      {rosterLoading ? (
        <div className="loading" style={{ margin: '40px 0' }}>Loading your live roster...</div>
      ) : roster.length > 0 ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Roster ({roster.length} players)</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
                {loading ? 'Generating today\'s analysis...' : result ? 'Analysis complete — scroll down for recommendations.' : 'Ready for today\'s analysis.'}
              </p>
            </div>
            <button className="btn btn-primary" onClick={analyzeDailyLineup} disabled={loading}
              style={{ padding: '12px 24px', fontSize: 15, background: 'linear-gradient(135deg, #00a86b 0%, #007a7a 100%)' }}>
              {loading ? '⟳ Analyzing Today\'s Lineup...' : '↻ Re-analyze Lineup'}
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

      {loading && !result && (
        <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 16 }}>
          <div className="loading" style={{ fontSize: 15 }}>⚡ Building your personalized daily lineup...</div>
          <p style={{ color: '#7aafc4', fontSize: 12, marginTop: 8 }}>Checking MLB schedules, starting lineups, and your bench...</p>
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
          <h3 style={{ color: '#007a7a', marginBottom: 12 }}>Today's Lineup Analysis</h3>
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
