'use client';

import React, { useState } from 'react';
import { useLeague } from '@/lib/context/LeagueContext';
import TradeAnalyzer from '@/components/TradeAnalyzer/TradeAnalyzer';
import TradeFinder from '@/components/TradeFinder/TradeFinder';

export default function TradePage() {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'finder'

  return (
    <div className="trade-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>◈ Trades</h1>
          <p style={{ color: 'var(--text-muted)' }}>Analyze custom trades or let AI find compatible partners</p>
        </div>
        {leagues.length > 0 && (
          <select 
            value={selectedLeague} 
            onChange={e => setSelectedLeague(e.target.value)} 
            style={{ width: 240 }}
          >
            {leagues.map(l => <option key={l.league_key} value={l.league_key}>{l.name}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
        <button
          onClick={() => setActiveTab('analyze')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analyze' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'analyze' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s',
            marginBottom: -2
          }}
        >
          🤝 Analyze a Trade
        </button>
        <button
          onClick={() => setActiveTab('finder')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'finder' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'finder' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s',
            marginBottom: -2
          }}
        >
          💡 Find Trade Partners
        </button>
      </div>
      
      {selectedLeague ? (
        activeTab === 'analyze' ? (
          <TradeAnalyzer />
        ) : (
          <TradeFinder />
        )
      ) : (
        <div className="card">Please select a league to evaluate trades.</div>
      )}
    </div>
  );
}
