'use client';

import React from 'react';
import { useLeague } from '@/lib/context/LeagueContext';
import InsightCard from '@/components/InsightCard/InsightCard';
import AiQuestionBox from '@/components/shared/AiQuestionBox';

export default function GameplanPage() {
  const { selectedLeague, aiAnalysis, aiLoading } = useLeague();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>📅 Weekly Game Plan</h1>
        <p style={{ color: '#7aafc4' }}>
          Your personalized weekly strategy — auto-generated from your live league data
        </p>
      </div>

      {/* InsightCard: gameplan section from master analyze — loads automatically, no button needed */}
      <InsightCard data={aiAnalysis?.gameplan} type="gameplan" loading={aiLoading && !aiAnalysis} />

      {/* Matchup outlook as secondary context */}
      {aiAnalysis?.matchup && (
        <InsightCard data={aiAnalysis.matchup} type="matchup" loading={false} />
      )}

      {/* Pitching context */}
      {aiAnalysis?.pitching && (
        <InsightCard data={aiAnalysis.pitching} type="pitching" loading={false} />
      )}

      {!aiAnalysis && !aiLoading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p style={{ color: '#7aafc4' }}>Select a league above — your weekly game plan loads automatically.</p>
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
