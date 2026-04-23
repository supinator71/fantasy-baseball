'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../trophy/TrophyCase.css';

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState(new Set());

  useEffect(() => {
    axios.get('/api/trophy/album').then(({ data }) => {
      setCards(data.all_cards || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Opening the Vault...</div>;

  return (
    <div className="trophy-case-container">
      <div className="trophy-header" style={{ borderLeft: '4px solid #00c8ff' }}>
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>💎 The Collector's Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>Master Reference: All Collectibles</p>
        </div>
      </div>

      <div className="album-grid">
        {cards.map(cardDef => {
          const isFlipped = flippedIds.has(cardDef.id);
          return (
            <div key={cardDef.id} className="card-slot unlocked">
              <div className={`card-wrapper-3d ${isFlipped ? 'is-flipped' : ''}`} onClick={() => toggleFlip(cardDef.id)}>
                <div className="card-inner-3d">
                  <div className="card-front-3d">
                    <img src={cardDef.img} alt={cardDef.name} className="card-image" />
                    {cardDef.has_signature && (
                      <div className={`card-signature ${cardDef.sig_style || ''}`}>{cardDef.signature_name}</div>
                    )}
                    {cardDef.has_patch && (
                      <div className="card-patch" />
                    )}
                    <div className="card-set-num">CARD #{cardDef.set_num}</div>
                  </div>
                  <div className="card-back-3d" style={{ borderColor: '#00c8ff' }}>
                    <div className="series">{getSeries(cardDef.id)}</div>
                    <div className="back-content">
                      <div style={{ color: '#00c8ff', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>FACTORY SPECIFICATION</div>
                      <h4>{cardDef.specialization || 'Player Intelligence'}</h4>
                      <p>{cardDef.lore || "A premium digital collectible."}</p>
                      <div className="card-serial-stamp" style={{ color: '#00c8ff', borderColor: 'rgba(0,200,255,0.4)' }}>
                        X / {cardDef.serial_total || '∞'}
                      </div>
                    </div>
                    <div className="back-footer">
                      <span className="rarity-tag" style={{ color: '#00c8ff', borderColor: '#00c8ff' }}>{cardDef.rarity.toUpperCase()} UNIT</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-meta">
                <div className="card-name">{cardDef.name}</div>
                <div className={`card-rarity ${cardDef.rarity}`}>{cardDef.rarity.toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
