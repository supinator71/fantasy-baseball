'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrophyCase.css';

export default function TokenWallet() {
  const [tokens, setTokens] = useState({
    galactic_tokens: 0,
    pitching_precision: 0,
    slugger_shards: 0,
    generals_credits: 0,
    premium_hobby: 0,
    titan_drop: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  async function fetchTokens() {
    try {
      const { data } = await axios.get('/api/trophy/album');
      if (data?.tokens) {
        setTokens(data.tokens);
      }
      setLoading(false);
    } catch (e) {
      console.error('Failed to load wallet balances:', e);
      setLoading(false);
    }
  }

  const tokenMetadata = [
    {
      key: 'galactic_tokens',
      name: 'Galactic Tokens',
      symbol: '🪙',
      color: '#00f0ff',
      value: tokens.galactic_tokens,
      desc: 'Standard currency. Earn 1 token for every 10 points accumulated on the Player Rater.'
    },
    {
      key: 'pitching_precision',
      name: 'Pitching Precision',
      symbol: '🎯',
      color: '#10b981',
      value: tokens.pitching_precision,
      desc: 'Earned by streaming a winning starting pitcher using the Streamonator tool.'
    },
    {
      key: 'slugger_shards',
      name: 'Slugger Shards',
      symbol: '⚡',
      color: '#f59e0b',
      value: tokens.slugger_shards,
      desc: 'Earned by setting a daily lineup that beats Hittertron baseline projections.'
    },
    {
      key: 'generals_credits',
      name: "General's Credits",
      symbol: '🛡️',
      color: '#3b82f6',
      value: tokens.generals_credits,
      desc: 'Earned by active roster moves and evaluating trades inside the War Room.'
    },
    {
      key: 'premium_hobby',
      name: 'Premium Pack Tokens',
      symbol: '📦',
      color: '#a855f7',
      value: tokens.premium_hobby,
      desc: 'Milestone rewards (Audit Grade B or SB wins). Redeem for a Premium Hobby Box.'
    },
    {
      key: 'titan_drop',
      name: 'Elite Pack Tokens',
      symbol: '💎',
      color: '#f43f5e',
      value: tokens.titan_drop,
      desc: 'Elite milestone rewards (Audit Grade A). Redeem for a Titan Syndicate Drop.'
    }
  ];

  if (loading) {
    return (
      <div className="token-wallet-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span className="loading" style={{ padding: 0 }}>⚙️</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hydrating Galactic Wallet...</span>
      </div>
    );
  }

  return (
    <div className="token-wallet-card">
      <div className="wallet-header">
        <h2 style={{ fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <span>🌌 Galactic Token Wallet</span>
        </h2>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Real-time Sync Active
        </span>
      </div>
      
      <div className="wallet-grid">
        {tokenMetadata.map(token => (
          <div key={token.key} className="wallet-token-item" style={{ '--token-glow': token.color }}>
            <div className="wallet-token-info">
              <span className="token-icon" style={{ textShadow: `0 0 10px ${token.color}` }}>{token.symbol}</span>
              <div>
                <div className="token-name">{token.name}</div>
                <div className="token-balance" style={{ color: token.color }}>{token.value}</div>
              </div>
            </div>
            <div className="token-tooltip">
              <strong>{token.name}</strong>
              <p>{token.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
