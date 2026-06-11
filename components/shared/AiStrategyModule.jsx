'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLeague } from '@/lib/context/LeagueContext';
import AiQuestionBox from '../shared/AiQuestionBox';
import MarkdownRenderer from './MarkdownRenderer';

export default function AiStrategyModule({ title, focus, icon = "⚡" }) {
  const { selectedLeague, leagueData } = useLeague();
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStrategy = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/ai/ask', {
        question: `Analyze my league and provide a detailed ${title} strategy focusing on ${focus}.`,
        leagueKey: selectedLeague,
        context: `This is for the ${title} module of Goin' Yard HQ. Current scoring: ${leagueData?.settings?.scoring_type}.`
      });
      setStrategy(data.answer);
    } catch (err) {
      setStrategy('Failed to generate strategy. Please ensure your Yahoo league is synced.');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague, leagueData, title, focus]);

  useEffect(() => {
    if (selectedLeague) fetchStrategy();
  }, [selectedLeague, fetchStrategy]);

  return (
    <div className="ai-strategy-module">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
        <h3 style={{ margin: 0 }}>THE {title.toUpperCase()} PLAYBOOK</h3>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
        {loading ? (
          <div className="loading">Consulting the Front Office...</div>
        ) : (
          <div className="ai-response" style={{ fontSize: 16, lineHeight: 1.7 }}>
            <MarkdownRenderer text={strategy} />
          </div>
        )}
      </div>

      {strategy && !loading && (
        <div style={{ marginTop: 24 }}>
          <AiQuestionBox 
            context={`Current Strategy: ${strategy}\nModule: ${title}`}
            leagueKey={selectedLeague}
            title={`Ask about your ${title}`}
            placeholder={`e.g. How does this affect my ${focus}?`}
          />
        </div>
      )}
    </div>
  );
}
