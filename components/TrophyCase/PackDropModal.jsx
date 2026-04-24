import React, { useState } from 'react';
import './TrophyCase.css';

export default function PackDropModal({ awardedCard, onClose }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCard, setShowCard] = useState(false);

  if (!awardedCard) return null;

  const handleRip = () => {
    setIsRevealed(true);
    // Wait for rip animation to finish before showing the card drop
    setTimeout(() => {
      setShowCard(true);
    }, 600);
  };

  return (
    <div className="pack-opening-overlay">
      {!showCard ? (
        <div className={`foil-pack ${isRevealed ? 'pack-ripped' : ''}`} onClick={!isRevealed ? handleRip : undefined}>
          <div className="foil-texture"></div>
          <div className="foil-glare"></div>
          <h2 className="strobe-text" style={{ fontSize: 28, textAlign: 'center', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>GALACTIC<br/>LEAGUE</h2>
          <p style={{ color: '#00c8ff', fontWeight: 800, marginTop: 12, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>SERIES 3</p>
          <div className="tap-to-rip">TAP TO RIP FOIL</div>
        </div>
      ) : (
        <div className="pack-shatter-effect">
          <h1 className="pack-title strobe-text">NEW CARD ACQUIRED!</h1>
          <div className={`pack-card-container drop-in ${awardedCard.rarity}`}>
            <img src={awardedCard.img} alt={awardedCard.name} className="pack-card-image" />
            {awardedCard.has_signature && (
              <div className={`card-signature ${awardedCard.sig_style || ''}`}>{awardedCard.signature_name}</div>
            )}
            {awardedCard.has_patch && (
              <div className={`card-patch ${awardedCard.patch_type || 'jersey'}`} />
            )}
            <div className="card-front-nameplate" style={{ borderLeftColor: awardedCard.teamColor || '#fff' }}>
              <div className="plate-name">{awardedCard.playerName || awardedCard.name}</div>
              <div className="plate-team">{awardedCard.team || 'Galactic'} | {awardedCard.position || 'Player'}</div>
            </div>
          </div>
          <div className="pack-card-details slide-up">
            <h2 style={{ color: 'white' }}>{awardedCard.name}</h2>
            <p className={`rarity-tag ${awardedCard.rarity}`}>{awardedCard.rarity.toUpperCase()}</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 24, fontSize: 18, padding: '12px 32px' }}>
              Add to Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
