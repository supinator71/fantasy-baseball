
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Vault.css';

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/trophy/album').then(({ data }) => {
      setCards(data.all_cards || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="vault-loading">Opening the Vault...</div>;

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1>💎 The Collector's Vault</h1>
        <p>Master Reference: All 36 Series 1 & 2 Collectibles</p>
      </div>

      <div className="vault-grid">
        {cards.map((card, idx) => (
          <div key={card.id} className={`vault-card-item ${card.rarity}`}>
            <div className="vault-card-visual">
              <img src={card.img} alt={card.name} />
              <div className="vault-card-id">#{idx + 1}</div>
            </div>
            <div className="vault-card-info">
              <h3>{card.name}</h3>
              <span className={`rarity-tag ${card.rarity}`}>{card.rarity.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
