'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import AiQuestionBox from '@/components/shared/AiQuestionBox';

export default function GameplanPage() {
  const {
    leagues, selectedLeague, setSelectedLeague,
    aiAnalysis, aiLoading,
    refreshAnalysis, refreshesRemaining, refreshLimitReached,
  } = useLeague();

  return (
    <div>
      {/* Header with league selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>📅 Weekly Game Plan</h1>
          <p style={{ color: '#7aafc4' }}>
            Your personalized weekly strategy — auto-generated from your live league data
          </p>
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
          {selectedLeague && (
            <button
              onClick={refreshAnalysis}
              disabled={aiLoading || refreshLimitReached}
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '8px 16px', whiteSpace: 'nowrap' }}
              title={refreshLimitReached ? 'Daily refresh limit reached' : `${refreshesRemaining} refresh${refreshesRemaining !== 1 ? 'es' : ''} remaining today`}
            >
              {aiLoading ? '⟳ Analyzing...' : `🔄 Refresh${refreshesRemaining < 3 ? ` (${refreshesRemaining})` : ''}`}
            </button>
          )}
        </div>
      </div>

      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading && !aiAnalysis} />

      {aiAnalysis?.matchup && (
        <InsightCard data={aiAnalysis.matchup} type="matchup" loading={false} />
      )}

      {aiAnalysis?.pitching && (
        <InsightCard data={aiAnalysis.pitching} type="pitching" loading={false} />
      )}

      {!aiAnalysis && !aiLoading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p style={{ color: '#7aafc4' }}>
            {leagues?.length > 1 ? 'Select a league above to load your weekly strategy.' : 'Your weekly game plan is loading...'}
          </p>
        </div>
      )}

      {(aiAnalysis || aiLoading) && (
        <div style={{ marginTop: 16 }}>
          <AiQuestionBox
            context={`Weekly gameplan: ${JSON.stringify(aiAnalysis?.gameplan || '')}. Matchup: ${JSON.stringify(aiAnalysis?.matchup || '')}`}
            leagueKey={selectedLeague}
            title="Ask About This Week's Strategy"
            icon="📅"
            placeholder="e.g. Should I stream a pitcher this week? Who's my must-start?"
          />
        </div>
      )}
    </div>
  );
}
