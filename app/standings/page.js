'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import AiQuestionBox from '@/components/shared/AiQuestionBox';
import Standings from '@/components/Standings/Standings';

export default function StandingsPage() {
  const { leagues, selectedLeague, setSelectedLeague, aiAnalysis, aiLoading, leagueData } = useLeague();

  // Raw standings data (fetched inside Standings component already)
  // We duplicate a light fetch here just for the AI context string
  const [standingsData, setStandingsData] = useState([]);
  const [aiRec, setAiRec]               = useState('');
  const [aiRecLoading, setAiRecLoading] = useState(false);
  const [aiRecError, setAiRecError]     = useState('');

  useEffect(() => {
    if (selectedLeague) {
      setStandingsData([]);
      setAiRec('');
      fetchStandingsForAi(selectedLeague);
    }
  }, [selectedLeague]);

  async function fetchStandingsForAi(key) {
    try {
      const { data } = await axios.get(`/api/yahoo/league/${key}/standings`);
      if (Array.isArray(data)) setStandingsData(data);
    } catch (e) {
      // non-fatal — Standings component handles its own display
    }
  }

  function buildStandingsBlock() {
    if (!standingsData.length) return 'Standings not yet loaded.';
    return standingsData.slice(0, 12).map((item, i) => {
      const t = item?.team;
      const info = Array.isArray(t)
        ? Object.assign({}, ...(Array.isArray(t[0]) ? t[0] : [t[0]]))
        : (t || {});
      const s = (Array.isArray(t) ? t.find(x => x?.team_standings) : t)?.team_standings || {};
      const out = s?.outcome_totals || {};
      return `  ${i + 1}. ${info.name || 'Team'} — ${out.wins ?? '?'}W-${out.losses ?? '?'}L (.${String(out.percentage ?? '000').replace('.', '')}) GB:${s.games_back || '-'}`;
    }).join('\n');
  }

  async function runStandingsAnalysis() {
    if (!standingsData.length) return;
    setAiRecLoading(true);
    setAiRecError('');
    try {
      const { data } = await axios.post('/api/ai/ask', {
        question: `Analyze these standings and tell me: who is in playoff position, who is in danger, and what's the best strategy for teams trying to climb?`,
        leagueKey: selectedLeague,
        context: `League format: ${leagueData?.scoring_type || 'H2H Points'}. Teams: ${standingsData.length}.
CURRENT STANDINGS:
${buildStandingsBlock()}
Use only the data above. Be specific about team names and records.`,
      });
      setAiRec(data.answer || '');
    } catch (err) {
      setAiRecError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setAiRecLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◎ League Standings</h1>
          <p style={{ color: '#7aafc4' }}>Live standings · AI playoff positioning analysis on demand</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {leagues?.length > 1 && (
            <select
              value={selectedLeague || ''}
              onChange={e => setSelectedLeague(e.target.value)}
              style={{ minWidth: 200, padding: '8px 12px', borderRadius: 6, background: '#122840', color: '#fff', border: '1px solid #1e3d5c' }}
            >
              {leagues.map((l, i) => (
                <option key={i} value={l.league_key}>{l.name || l.league_key}</option>
              ))}
            </select>
          )}
          <button
            className="btn btn-primary"
            onClick={runStandingsAnalysis}
            disabled={aiRecLoading || !standingsData.length}
            style={{ whiteSpace: 'nowrap' }}
          >
            {aiRecLoading ? '⟳ Analyzing...' : '⚡ Get AI Analysis'}
          </button>
        </div>
      </div>

      {/* Master-analyze InsightCard — gameplan section is most relevant for standings context */}
      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading && !aiAnalysis} />

      {/* Deep-dive AI standings narration */}
      {aiRecError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 16, color: '#ef4444' }}>
          {aiRecError}
        </div>
      )}
      {aiRec && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            🏆 Standings Analysis
          </div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {aiRec}
          </div>
        </div>
      )}

      {/* Live standings table */}
      <Standings />

      {/* Follow-up Q&A */}
      {(aiRec || standingsData.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <AiQuestionBox
            context={`League standings:\n${buildStandingsBlock()}\nAI analysis: ${aiRec?.slice(0, 400) || ''}`}
            leagueKey={selectedLeague}
            title="Ask about your Standings"
            icon="🏆"
            placeholder="e.g. What do I need to do to make the playoffs? Who's my biggest threat?"
          />
        </div>
      )}
    </div>
  );
}
