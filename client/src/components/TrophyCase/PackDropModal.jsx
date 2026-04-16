import React from 'react';
import './TrophyCase.css';

export default function PackDropModal({ awardedCard, onClose }) {
  if (!awardedCard) return null;

  return (
    <div className="pack-opening-overlay" onClick={onClose}>
      <div className="pack-shatter-effect">
        <h1 className="pack-title strobe-text">NEW CARD ACQUIRED!</h1>
        <div className={`pack-card-container drop-in ${awardedCard.rarity}`}>
          <img src={awardedCard.img} alt={awardedCard.name} className="pack-card-image" />
        </div>
        <div className="pack-card-details slide-up">
          <h2 style={{ color: 'white' }}>{awardedCard.name}</h2>
          <p className={`rarity-tag ${awardedCard.rarity}`}>{awardedCard.rarity.toUpperCase()}</p>
          <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 24, fontSize: 18 }}>
            Add to Collection
          </button>
        </div>
      </div>
    </div>
  );
}
