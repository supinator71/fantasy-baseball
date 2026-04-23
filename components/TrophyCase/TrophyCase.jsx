
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PackDropModal from './PackDropModal';
import './TrophyCase.css';

export default function TrophyCase() {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packOpening, setPackOpening] = useState(false);
  const [awardedCard, setAwardedCard] = useState(null);
  const [flippedIds, setFlippedIds] = useState(new Set());

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

  const toggleFlip = (id) => {
    const newFlipped = new Set(flippedIds);
    if (newFlipped.has(id)) newFlipped.delete(id);
    else newFlipped.add(id);
    setFlippedIds(newFlipped);
  };

  const getSeries = (id) => {
    if (id.startsWith('tgl_')) return 'Series 2: Titanium Grapefruit League';
    return 'Series 1: Goin\' Yard Core Set';
  };

  function renderCard(cardDef) {
    const unlocks = collection?.unlocked_cards?.filter(u => u.id === cardDef.id) || [];
    const isUnlocked = unlocks.length > 0;
    const count = unlocks.length;
    const isFlipped = flippedIds.has(cardDef.id);
    
    return (
      <div key={cardDef.id} className={`card-slot ${isUnlocked ? 'unlocked' : 'locked'}`}>
        <div 
          className={`card-wrapper-3d ${isFlipped && isUnlocked ? 'is-flipped' : ''}`}
          onClick={() => isUnlocked && toggleFlip(cardDef.id)}
        >
          <div className="card-inner-3d">
            {/* FRONT */}
            <div className="card-front-3d" data-id={cardDef.id}>
              <img src={cardDef.img} alt={cardDef.name} className="card-image" />
              {isUnlocked && cardDef.has_signature && (
                <div className={`card-signature ${cardDef.sig_style || ''}`}>{cardDef.signature_name}</div>
              )}
              {isUnlocked && cardDef.has_patch && (
                <div className="card-patch" />
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
              <div className="card-set-num">CARD #{cardDef.set_num}</div>
            </div>

            {/* BACK */}
            <div className="card-back-3d">
              <div className="series">{getSeries(cardDef.id)}</div>
              {isUnlocked && cardDef.serial_total && unlocks[0]?.serialPosition && (
                <div className="mint-stamp">
                  {unlocks[0].serialPosition} / {cardDef.serial_total}
                </div>
              )}
              <div className="back-content">
                <h4>{cardDef.specialization || 'Player Intelligence'}</h4>
                <p>{cardDef.lore || "A premium digital collectible celebrating the evolution of the national pastime."}</p>
              </div>
              <div className="back-footer">
                <span className="rarity-tag">{cardDef.rarity.toUpperCase()} UNIT</span>
              </div>
            </div>
          </div>
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

  const { all_cards, unlocked_cards, last_daily_pack, server_today } = collection || {};
  // Use server's Pacific Time date — consistent across all devices
  const todayPT = server_today || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  
  let canClaimDaily = true;
  if (last_daily_pack) {
    if (typeof last_daily_pack === 'string') canClaimDaily = (last_daily_pack !== todayPT);
    else canClaimDaily = (Date.now() - last_daily_pack > 20 * 60 * 60 * 1000);
  }
  
  const validUnlockedIds = unlocked_cards?.filter(c => all_cards?.some(card => card.id === c.id)).map(c => c.id) || [];
  const uniqueUnlocked = new Set(validUnlockedIds).size;

  const sortedCards = [...(all_cards || [])].sort((a, b) => {
    const aUnlocked = validUnlockedIds.includes(a.id);
    const bUnlocked = validUnlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  async function claimDailyPack() {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/trophy/daily-pack');
      setAwardedCard(data.awarded);
      setPackOpening(true);
      fetchAlbum();
    } catch (e) {
      setLoading(false);
      toast.error(e.response?.data?.error || 'Failed to claim pack');
    }
  }

  return (
    <div className="trophy-case-container">
      <PackDropModal awardedCard={packOpening ? awardedCard : null} onClose={() => setPackOpening(false)} />
      <div className="trophy-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🏆 The Collector's Album</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Earn premium digital trading cards by dominating your league, maintaining an A+ roster, and spotting rising rookies.
            <a href="/vault" style={{ color: 'var(--primary)', marginLeft: 8, textDecoration: 'none', fontWeight: 600 }}>View Full Collection →</a>
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
        {sortedCards.map(card => renderCard(card))}
      </div>
    </div>
  );
}
