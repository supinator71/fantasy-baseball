'use client';
import React, { useState } from 'react';
import { GALACTIC_ROSTER as rosterData } from '@/lib/rosterData';
import '@/components/TrophyCase/TrophyCase.css';

export default function TestGallery() {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ padding: 40, background: '#050a15', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: 20 }}>Roster Test Gallery</h1>
      <p style={{ color: '#aaa', marginBottom: 40 }}>Click any card to flip it over. All 120 base cards rendered in Legendary foil for testing purposes.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {rosterData.map(player => {
          // Mock a cardDef for rendering
          const cardDef = {
            id: player.id,
            name: player.name,
            playerName: player.name,
            team: player.team,
            teamColor: player.teamColor,
            position: player.position,
            set_num: player.jersey_number,
            rarity: 'legendary',
            img: player.image || '/generic.png',
            has_signature: true,
            has_patch: true,
            patch_type: 'jersey',
            sig_style: 'classic',
            signature_name: player.name,
            specialization: 'Core Player',
            lore: `Drafted from ${player.home_planet || 'Earth'} to dominate the Galactic League.`
          };

          const isFlipped = flippedCards[player.id];

          return (
            <div className="card-container-3d" key={player.id} style={{ transform: 'scale(0.8)', margin: -20 }}>
              <div 
                className={`card-wrapper-3d ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => toggleFlip(player.id)}
              >
                <div className="card-inner-3d">
                  {/* FRONT */}
                  <div className="card-front-3d legendary" data-id={cardDef.id}>
                    <img src={cardDef.img} alt={cardDef.name} className="card-image" />
                    <div className={`card-signature ${cardDef.sig_style}`}>{cardDef.signature_name}</div>
                    <div className={`card-patch ${cardDef.patch_type}`} />
                    <div className="card-front-nameplate" style={{ borderLeftColor: cardDef.teamColor || '#fff' }}>
                      <div className="plate-name">{cardDef.playerName}</div>
                      <div className="plate-team">{cardDef.team} | {cardDef.position}</div>
                    </div>
                    <div className="card-set-num">CARD #{cardDef.set_num}</div>
                  </div>

                  {/* BACK */}
                  <div className="card-back-3d">
                    <div className="series">SERIES 1</div>
                    <div className="mint-stamp">1 / 500</div>
                    <div className="back-content" style={{ padding: '0 12px' }}>
                      <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{cardDef.playerName}</h3>
                      <div style={{ fontSize: 11, color: cardDef.teamColor || '#00c8ff', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                        {cardDef.team} | {cardDef.position}
                      </div>
                      
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>SPECIFICATION</div>
                      <h4 style={{ marginBottom: 12 }}>{cardDef.specialization}</h4>
                      
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>BIOMETRIC LORE</div>
                      <p style={{ fontSize: 12, lineHeight: 1.4 }}>{cardDef.lore}</p>
                    </div>
                    <div className="back-footer">
                      <span className="rarity-tag">{cardDef.rarity.toUpperCase()} UNIT</span>
                      <div className="card-trademark">© 2046 Galactic Baseball Auth. TM Goin' Yard Collectibles.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
