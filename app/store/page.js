'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PackDropModal from '../../components/TrophyCase/PackDropModal';
import './Store.css';

export default function Store() {
  const [loading, setLoading] = useState(false);
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);

  const packs = [
    {
      id: 'core_pack',
      name: 'Core Draft Pack',
      price: '$2.99',
      color: '#4299e1',
      description: 'A solid starting point. Contains 3 digital collectibles.',
      guarantee: 'Guarantees 1 Uncommon or better.',
      forceRarity: 'uncommon' // Mocking the guarantee for the single card we award for now
    },
    {
      id: 'premium_hobby',
      name: 'Premium Hobby Box',
      price: '$9.99',
      color: '#9f7aea',
      description: 'For serious collectors. Contains 5 digital collectibles.',
      guarantee: 'Guarantees 1 Rare or Epic, plus higher chance of patches.',
      forceRarity: 'rare',
      popular: true
    },
    {
      id: 'titan_drop',
      name: 'Titan Syndicate Drop',
      price: '$24.99',
      color: '#d69e2e',
      description: 'The ultimate score. Contains 10 digital collectibles.',
      guarantee: 'Guarantees 1 Legendary autographed card.',
      forceRarity: 'legendary'
    }
  ];

  async function handleBuyPack(pack) {
    // In the future, this will redirect to a Stripe checkout session.
    // For now, we simulate the purchase and award the guaranteed card immediately.
    try {
      setLoading(true);
      toast.success(`Mock Purchase: ${pack.name} acquired!`);
      
      const { data } = await axios.post('/api/store/buy-pack', {
        packId: pack.id,
        forceRarity: pack.forceRarity
      });
      
      setAwardedCard(data.awarded);
      setPackOpening(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error('Failed to process purchase.');
    }
  }

  return (
    <div className="store-container">
      <PackDropModal awardedCard={packOpening ? awardedCard : null} onClose={() => setPackOpening(false)} />
      
      <div className="store-header">
        <h1>🛍️ The Collector's Store</h1>
        <p>Expand your roster with premium digital collectibles. Discover rare variants, jersey patches, and liquid-gold autographs.</p>
      </div>

      <div className="store-grid">
        {packs.map(pack => (
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
              
              <button 
                className="btn buy-btn" 
                onClick={() => handleBuyPack(pack)}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Buy ${pack.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
