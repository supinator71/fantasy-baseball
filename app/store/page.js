'use client';
 
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PackDropModal from '../../components/TrophyCase/PackDropModal';
import './Store.css';
 
export default function Store() {
  const [loading, setLoading] = useState(false);
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);
  const [tokens, setTokens] = useState({ premium_hobby: 0, titan_drop: 0 });
 
  const fetchTokens = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/trophy/album');
      if (data?.tokens) {
        setTokens(data.tokens);
      }
    } catch (e) {
      console.error('Failed to fetch tokens:', e);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);
 
  async function handleBuyPack(pack) {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/store/buy-pack', {
        packId: pack.id
      });
      setAwardedCard(data.awarded);
      if (data?.tokens) {
        setTokens(data.tokens);
      }
      setPackOpening(true);
      toast.success(`${pack.name} opened successfully!`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to open your pack. Please try again.');
    } finally {
      setLoading(false);
    }
  }
 
  const packList = [
    {
      id: 'core_pack',
      name: 'Core Draft Pack',
      price: 'FREE',
      color: '#4299e1',
      description: 'A solid starting point. Contains 3 digital collectibles.',
      guarantee: 'Guarantees 1 Uncommon or better.',
      buttonText: 'Open Free Pack',
      disabled: false,
      instructions: 'Unlimited free pack openings!'
    },
    {
      id: 'premium_hobby',
      name: 'Premium Hobby Box',
      price: `${tokens.premium_hobby} Available`,
      color: '#9f7aea',
      description: 'For serious collectors. Contains 5 digital collectibles.',
      guarantee: 'Guarantees 1 Rare or Epic, plus higher chance of patches.',
      popular: true,
      buttonText: tokens.premium_hobby > 0 ? `Open Box (${tokens.premium_hobby} Left)` : 'Earn via Achievements',
      disabled: tokens.premium_hobby <= 0,
      instructions: 'Earn by getting a B-Grade Team Audit or a Stolen Bases projection win!'
    },
    {
      id: 'titan_drop',
      name: 'Titan Syndicate Drop',
      price: `${tokens.titan_drop} Available`,
      color: '#d69e2e',
      description: 'The ultimate score. Contains 10 digital collectibles.',
      guarantee: 'Guarantees 1 Legendary autographed card.',
      buttonText: tokens.titan_drop > 0 ? `Open Drop (${tokens.titan_drop} Left)` : 'Earn via A-Grade Audit',
      disabled: tokens.titan_drop <= 0,
      instructions: 'Earn by scoring a perfect A-Grade on your Team Audit!'
    }
  ];
 
  return (
    <div className="store-container">
      <PackDropModal awardedCard={packOpening ? awardedCard : null} onClose={() => setPackOpening(false)} />
      
      <div className="store-header">
        <h1>🛍️ The Collector's Store</h1>
        <p>Expand your roster with premium digital collectibles. Discover rare variants, jersey patches, and liquid-gold autographs — all free for the 2026 season!</p>
      </div>
 
      <div className="store-grid">
        {packList.map(pack => (
          <div key={pack.id} className={`store-card ${pack.popular ? 'popular' : ''}`} style={{ '--pack-color': pack.color }}>
            {pack.popular && <div className="popular-badge">MOST POPULAR</div>}
            
            <div className="pack-visual">
              <div className="pack-foil-effect"></div>
              <h2>{pack.name}</h2>
            </div>
            
            <div className="pack-details">
              <div className="pack-price">{pack.price}</div>
              <p className="pack-desc">{pack.description}</p>
              <div className="pack-guarantee">✨ {pack.guarantee}</div>
              
              <div style={{ fontSize: 11, color: '#7aafc4', textAlign: 'center', marginBottom: 16, minHeight: 32 }}>
                ℹ️ {pack.instructions}
              </div>
              
              <button 
                className="btn buy-btn" 
                onClick={() => handleBuyPack(pack)}
                disabled={loading || pack.disabled}
                style={pack.disabled ? { background: '#2d3748', cursor: 'not-allowed', borderColor: '#4a5568', color: '#a0aec0', boxShadow: 'none' } : {}}
              >
                {loading ? 'Opening...' : pack.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
