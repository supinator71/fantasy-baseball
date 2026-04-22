
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Vault.css';

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

  if (loading) return <div className="vault-loading">Opening the Vault...</div>;

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1>💎 The Collector's Vault</h1>
        <p>Master Reference: All 36 Series 1 & 2 Collectibles</p>
      </div>

      <div className="vault-grid">
        {cards.map((card, idx) => (
          <div 
            key={card.id} 
            className={`vault-card-wrapper ${flippedIds.has(card.id) ? 'is-flipped' : ''}`}
            onClick={() => toggleFlip(card.id)}
          >
            <div className="vault-card-inner">
              {/* FRONT */}
              <div className="vault-card-front">
                <div className="vault-card-visual" data-id={card.id}>
                  <img src={card.img} alt={card.name} />
                  {card.has_signature && (
                    <div className="card-signature">{card.signature_name}</div>
                  )}
                  {card.has_patch && (
                    <div className="card-patch" />
                  )}
                  <div className="vault-card-id">#{idx + 1}</div>
                </div>
                <div className="vault-card-info">
                  <h3>{card.name}</h3>
                  <span className={`rarity-seal ${card.rarity}`}>{card.rarity.toUpperCase()}</span>
                </div>
              </div>

              {/* BACK */}
              <div className="vault-card-back">
                <div className="back-header">
                  <div className="serial">CYBORG-ID: {card.id.toUpperCase()}</div>
                  <div className="series">{getSeries(card.id)}</div>
                  {card.serial_total && card.mint_number && (
                    <div className="mint-stamp">
                      MINT Run: {card.mint_number}/{card.serial_total}
                    </div>
                  )}
                </div>
                <div className="back-content">
                  <h4>{card.specialization || 'Player Intelligence'}</h4>
                  <p>{card.lore || "A premium digital collectible celebrating the evolution of the national pastime."}</p>
                </div>
                <div className="back-footer">
                  <div className={`rarity-seal ${card.rarity}`}>{card.rarity.toUpperCase()} UNIT</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
