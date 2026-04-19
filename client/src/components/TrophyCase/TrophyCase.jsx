import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PackDropModal from './PackDropModal';

import './TrophyCase.css';

export default function TrophyCase() {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Animation State
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);

  useEffect(() => {
    fetchAlbum();
  }, []);

  async function fetchAlbum() {
    try {
      const { data } = await axios.get('/api/trophy/album');
      setCollection(data);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load Collection');
      setLoading(false);
    }
  }

  async function claimDailyPack() {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/trophy/daily-pack');
      
      // Trigger aggressive animation sequence
      setAwardedCard(data.awarded);
      setPackOpening(true);
      
      // Refresh album in background
      fetchAlbum();
    } catch (e) {
      setLoading(false);
      toast.error(e.response?.data?.error || 'Failed to claim pack');
    }
  }

  function renderCard(cardDef) {
    // Check if user has unlocked this specific card id
    const unlocks = collection?.unlocked_cards?.filter(u => u.id === cardDef.id) || [];
    const isUnlocked = unlocks.length > 0;
    const count = unlocks.length;
    
    return (
      <div key={cardDef.id} className={`card-slot ${isUnlocked ? 'unlocked' : 'locked'}`}>
        <div className="card-visual-wrapper">
          <img 
            src={cardDef.img} 
            alt={cardDef.name} 
            className={`card-image ${cardDef.rarity}`} 
          />
          {isUnlocked && cardDef.rarity === 'legendary' && (
            <div className="card-signature">Cyborg 71</div>
          )}
          {!isUnlocked && (
            <div className="lock-overlay">
              <span style={{ fontSize: 32 }}>🔒</span>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>UNDISCOVERED</div>
            </div>
          )}
          {isUnlocked && count > 1 && (
            <div className="dupe-badge">x{count}</div>
          )}
        </div>
        <div className="card-meta">
          <div className="card-name">{isUnlocked ? cardDef.name : '???'}</div>
          <div className={`card-rarity ${cardDef.rarity}`}>
            {cardDef.rarity.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  if (loading && !collection) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading Trophy Case...</div>;
  }

  const { all_cards, unlocked_cards, last_daily_pack } = collection || {};
  
  // Calculate if daily pack is available (Resets at midnight UTC)
  let canClaimDaily = true;
  if (last_daily_pack) {
    const today = new Date().toISOString().slice(0, 10);
    if (typeof last_daily_pack === 'string') {
      canClaimDaily = (last_daily_pack !== today);
    } else {
      canClaimDaily = (Date.now() - last_daily_pack > 20 * 60 * 60 * 1000);
    }
  }
  
  // Only count unlocked cards that still exist in the master collection library
  const validUnlockedIds = unlocked_cards?.filter(c => all_cards?.some(card => card.id === c.id)).map(c => c.id) || [];
  const uniqueUnlocked = new Set(validUnlockedIds).size;

  return (
    <div className="trophy-case-container">
      
      {/* aggressive pack opening modal overlay */}
      <PackDropModal awardedCard={packOpening ? awardedCard : null} onClose={() => setPackOpening(false)} />

      <div className="trophy-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🏆 The Collector's Album</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Earn premium digital trading cards by dominating your league, maintaining an A+ roster, and spotting rising rookies.
          </p>
        </div>
        
        <div className="album-stats-box">
          <div className="stat">
            <div className="stat-value">{uniqueUnlocked} / {all_cards?.length || 0}</div>
            <div className="stat-label">Unique Cards</div>
          </div>
          
          {canClaimDaily ? (
             <button className="btn claim-btn pulse-glow" onClick={claimDailyPack} disabled={loading}>
               🎁 Claim Daily Free Pack!
             </button>
          ) : (
             <div className="claimed-text">Daily Pack Claimed. Check back tomorrow!</div>
          )}
        </div>
      </div>

      <div className="album-grid">
        {all_cards?.map(card => renderCard(card))}
      </div>
    </div>
  );
}
