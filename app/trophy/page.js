'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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

  async function claimDailyPack() {
    try {
      setLoading(true);
      const localToday = new Date().toLocaleDateString('en-CA');
      const { data } = await axios.post('/api/trophy/daily-pack', { clientDate: localToday });
      setAwardedCard(data.awarded);
      setPackOpening(true);
      fetchAlbum();
    } catch (e) {
      setLoading(false);
      toast.error(e.response?.data?.error || 'Failed to claim pack');
    }
  }

  if (loading && !collection) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading Trophy Case...</div>;
  }

  const { all_cards, unlocked_cards, last_daily_pack } = collection || {};
  const validUnlockedIds = unlocked_cards?.filter(c => all_cards?.some(card => card.id === c.id)).map(c => c.id) || [];
  const uniqueUnlocked = new Set(validUnlockedIds).size;

  const sortedCards = [...(all_cards || [])].sort((a, b) => {
    const aUnlocked = validUnlockedIds.includes(a.id);
    const bUnlocked = validUnlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <div className="trophy-case-container">
      {packOpening && awardedCard && (
        <div className="pack-opening-overlay" onClick={() => setPackOpening(false)}>
          <div className="pack-shatter-effect">
            <div className="strobe-text">YOU UNLOCKED</div>
            <div className={`pack-card-container ${awardedCard.rarity} drop-in`}>
              <img src={awardedCard.img} alt={awardedCard.name} className="pack-card-image" />
            </div>
            <div className="pack-card-details slide-up">
              <h2>{awardedCard.name}</h2>
              <div className={`card-rarity ${awardedCard.rarity}`}>{awardedCard.rarity.toUpperCase()}</div>
            </div>
            <div style={{ marginTop: 40, color: 'var(--text-muted)', fontSize: 13 }}>Click anywhere to continue</div>
          </div>
        </div>
      )}

      <div className="trophy-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🏆 The Collector's Album</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Earn premium digital trading cards by dominating your league.
            <a href="/vault" style={{ color: 'var(--primary)', marginLeft: 8, textDecoration: 'none', fontWeight: 600 }}>View Full Collection →</a>
          </p>
        </div>
        <div className="album-stats-box">
          <div className="stat">
            <div className="stat-value">{uniqueUnlocked} / {all_cards?.length || 0}</div>
            <div className="stat-label">Unique Cards</div>
          </div>
          <button className="btn claim-btn pulse-glow" onClick={claimDailyPack} disabled={loading}>
            🎁 Claim Daily Free Pack!
          </button>
        </div>
      </div>

      <div className="album-grid">
        {sortedCards.map(cardDef => {
          const unlocks = unlocked_cards?.filter(u => u.id === cardDef.id) || [];
          const isUnlocked = unlocks.length > 0;
          const count = unlocks.length;
          const isFlipped = flippedIds.has(cardDef.id);
          
          return (
            <div key={cardDef.id} className={`card-slot ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className={`card-wrapper-3d ${isFlipped && isUnlocked ? 'is-flipped' : ''}`} onClick={() => isUnlocked && toggleFlip(cardDef.id)}>
                <div className="card-inner-3d">
                  <div className="card-front-3d">
                    <img src={cardDef.img} alt={cardDef.name} className="card-image" />
                    {isUnlocked && count > 1 && <div className="dupe-badge">x{count}</div>}
                    <div className="card-set-num">No. {unlocks[0]?.cardNumber || cardDef.set_num}</div>
                    {isUnlocked && cardDef.has_signature && (
                      <div className="card-signature">{cardDef.signature_name || 'Authentic Autograph'}</div>
                    )}
                    {isUnlocked && cardDef.has_patch && (
                      <div className="card-patch" title="Authentic Jersey Material"></div>
                    )}
                    {!isUnlocked && (
                      <div className="lock-overlay">
                        <span style={{ fontSize: 32 }}>🔒</span>
                        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>UNDISCOVERED</div>
                      </div>
                    )}
                  </div>
                  <div className="card-back-3d">
                    <div className="series">{getSeries(cardDef.id)}</div>
                    <div className="back-content">
                      <div style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{unlocks[0]?.team?.toUpperCase() || 'UNASSIGNED UNIT'}</div>
                      <h4>{cardDef.specialization || 'Player Intelligence'}</h4>
                      <p>{cardDef.lore || "A premium digital collectible."}</p>
                      {unlocks[0]?.serial && (cardDef.rarity === 'rare' || cardDef.rarity === 'epic' || cardDef.rarity === 'legendary') && (
                        <div style={{ marginTop: 20, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.15em', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8, display: 'inline-block', fontFamily: 'var(--font-heading)' }}>
                          {unlocks[0].serialPosition || 1} / {cardDef.serial_total || '∞'}
                        </div>
                      )}
                    </div>
                    <div className="back-footer">
                      <span className="rarity-tag">{cardDef.rarity.toUpperCase()} UNIT</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-meta">
                <div className="card-name">{isUnlocked ? cardDef.name : '???'}</div>
                <div className={`card-rarity ${cardDef.rarity}`}>{cardDef.rarity.toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
