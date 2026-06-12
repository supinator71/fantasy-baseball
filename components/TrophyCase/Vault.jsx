'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GALACTIC_ROSTER } from '@/lib/rosterData';
import { getPlayerLore, getPlayerSpecialization, getPlayerRatings } from '@/lib/loreService';
import './Vault.css';

const TEAMS = [
  "Brooklyn Biotics",
  "Tokyo Tachyons",
  "Neon City Sliders",
  "Silicon Valley Sentinels",
  "Dallas Tex-Mechs",
  "Osaka Overclockers",
  "Kyoto Kaiju",
  "Roswell Rayguns",
  "Atlanta Aerodynamics",
  "Miami Motherboards",
  "San Juan Synthetics",
  "Havana Hover-Hounds"
];

const TEAM_META = {
  "Brooklyn Biotics":        { color: '#00c8ff', bg: 'rgba(0,200,255,0.05)', symbol: '🔵' },
  "Tokyo Tachyons":          { color: '#ff0088', bg: 'rgba(255,0,136,0.05)', symbol: '🔴' },
  "Neon City Sliders":       { color: '#00ff88', bg: 'rgba(0,255,136,0.05)', symbol: '🟢' },
  "Silicon Valley Sentinels":{ color: '#5555ff', bg: 'rgba(85,85,255,0.05)',  symbol: '🟣' },
  "Dallas Tex-Mechs":        { color: '#ff8800', bg: 'rgba(255,136,0,0.05)',  symbol: '🟠' },
  "Osaka Overclockers":      { color: '#ffcc00', bg: 'rgba(255,204,0,0.05)',  symbol: '🟡' },
  "Kyoto Kaiju":             { color: '#ff4444', bg: 'rgba(255,68,68,0.05)',  symbol: '🔴' },
  "Roswell Rayguns":         { color: '#77ff00', bg: 'rgba(119,255,0,0.05)',  symbol: '🟢' },
  "Atlanta Aerodynamics":    { color: '#aa00ff', bg: 'rgba(170,0,255,0.05)',  symbol: '🟣' },
  "Miami Motherboards":      { color: '#00ffff', bg: 'rgba(0,255,255,0.05)',  symbol: '🔵' },
  "San Juan Synthetics":     { color: '#ff00ff', bg: 'rgba(255,0,255,0.05)',  symbol: '💗' },
  "Havana Hover-Hounds":     { color: '#ccff00', bg: 'rgba(204,255,0,0.05)',  symbol: '🟡' }
};

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState(new Set());
  
  const [activeTab, setActiveTab] = useState('core'); // 'core' | 'league'
  const [selectedTeam, setSelectedTeam] = useState('Brooklyn Biotics');

  useEffect(() => {
    axios.get('/api/trophy/album').then(({ data }) => {
      setCards(data.all_cards || []);
      setUnlockedCards(data.unlocked_cards || []);
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

  const teamMeta = TEAM_META[selectedTeam] || TEAM_META["Brooklyn Biotics"];
  const teamPlayers = GALACTIC_ROSTER.filter(p => p.team === selectedTeam);

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1>{"💎 The Collector's Vault"}</h1>
        <p>Master Reference: Browse all card sets, full team lineups, and player lore</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
        <button
          onClick={() => {
            setActiveTab('core');
            setFlippedIds(new Set());
          }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'core' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'core' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s',
            marginBottom: -2
          }}
        >
          📂 Core set ({cards.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('league');
            setFlippedIds(new Set());
          }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'league' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'league' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s',
            marginBottom: -2
          }}
        >
          🌌 Galactic League Binder (120)
        </button>
      </div>

      {activeTab === 'core' ? (
        <div className="vault-grid">
          {cards.map((card) => (
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
                      <div className={`card-signature ${card.sig_style || ''}`}>{card.signature_name}</div>
                    )}
                    {card.has_patch && (
                      <div className="card-patch" />
                    )}
                    <div className="vault-card-id">CARD #{card.set_num}</div>
                  </div>
                  <div className="vault-card-info">
                    <h3>{card.name}</h3>
                    <span className={`rarity-seal ${card.rarity}`}>{card.rarity.toUpperCase()}</span>
                  </div>
                </div>

                {/* BACK */}
                <div className="vault-card-back">
                  <div className="card-back-3d">
                    <div className="serial">CARD: #{card.set_num}</div>
                    <div className="series">{getSeries(card.id)}</div>
                    {card.serial_total && (
                      <div className="mint-stamp">
                        X / {card.serial_total}
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
      ) : (
        <div>
          {/* Team selector grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 28 }}>
            {TEAMS.map(team => {
              const meta = TEAM_META[team] || { color: '#fff' };
              const isSelected = selectedTeam === team;
              return (
                <button
                  key={team}
                  onClick={() => {
                    setSelectedTeam(team);
                    setFlippedIds(new Set());
                  }}
                  className="btn"
                  style={{
                    fontSize: 12,
                    padding: '8px 10px',
                    minHeight: 36,
                    border: `1px solid ${isSelected ? meta.color : 'rgba(255,255,255,0.08)'}`,
                    background: isSelected ? meta.color : 'rgba(255,255,255,0.02)',
                    color: isSelected ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    justifyContent: 'center',
                    fontWeight: isSelected ? 800 : 500
                  }}
                >
                  <span style={{ marginRight: 4 }}>{meta.symbol}</span>
                  {team.split(' ')[0]}
                </button>
              );
            })}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            📍 Roster for <strong style={{ color: teamMeta.color }}>{selectedTeam}</strong>. Click any card below to flip it and read the player's biometric specialization and lore.
          </div>

          {/* League Grid */}
          <div className="vault-grid">
            {teamPlayers.map(player => {
              const unlocks = unlockedCards.filter(uc => uc.playerName === player.name);
              const isUnlocked = unlocks.length > 0;
              const unlockCount = unlocks.length;
              const isFlipped = flippedIds.has(player.id);
              const lore = getPlayerLore(player);
              const specialization = getPlayerSpecialization(player.position);
              const ratings = getPlayerRatings(player);

              return (
                <div 
                  key={player.id} 
                  className={`vault-card-wrapper ${isFlipped ? 'is-flipped' : ''}`}
                  onClick={() => toggleFlip(player.id)}
                >
                  <div className="vault-card-inner">
                    {/* FRONT */}
                    <div className="vault-card-front" style={{ borderColor: isUnlocked ? teamMeta.color : 'rgba(255,255,255,0.1)' }}>
                      <div className="vault-card-visual" style={{ background: '#000' }}>
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          style={{ 
                            opacity: isUnlocked ? 1 : 0.2, 
                            filter: isUnlocked ? 'none' : 'grayscale(100%)' 
                          }} 
                        />
                        {isUnlocked && unlocks[0].has_signature && (
                          <div className={`card-signature ${unlocks[0].sig_style || ''}`}>{unlocks[0].signature_name}</div>
                        )}
                        {isUnlocked && unlocks[0].has_patch && (
                          <div className={`card-patch ${unlocks[0].patch_type || 'jersey'}`} />
                        )}
                        
                        {/* Owned indicator or lock icon */}
                        {isUnlocked ? (
                          <div className="owned-badge" style={{ 
                            position: 'absolute', top: 12, left: 12, 
                            background: 'rgba(0, 168, 107, 0.85)', color: '#fff', 
                            padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)', border: '1px solid #00a86b'
                          }}>
                            ⭐ OWNED x{unlockCount}
                          </div>
                        ) : (
                          <div className="locked-badge" style={{ 
                            position: 'absolute', top: 12, left: 12, 
                            background: 'rgba(0, 0, 0, 0.65)', color: 'var(--text-muted)', 
                            padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            🔒 LOCKED
                          </div>
                        )}
                        
                        <div className="vault-card-id" style={{ borderColor: teamMeta.color, color: teamMeta.color }}>
                          #{player.jersey_number}
                        </div>
                      </div>
                      
                      <div className="vault-card-info" style={{ background: `linear-gradient(to top, ${teamMeta.bg}, #0a111a)` }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{player.name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{player.position}</span>
                          <span style={{ fontSize: 10, color: teamMeta.color, fontWeight: 700 }}>{teamMeta.symbol}</span>
                        </div>
                      </div>
                    </div>

                    {/* BACK */}
                    <div className="vault-card-back" style={{ borderColor: teamMeta.color }}>
                      <div className="back-header" style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="serial" style={{ color: teamMeta.color }}>UNIT #{player.jersey_number}</div>
                        <div className="series" style={{ fontSize: 11 }}>Series 2: Titanium Grapefruit League</div>
                        {isUnlocked && unlocks[0].serial_total && (
                          <div className="mint-stamp" style={{ fontSize: 16, bottom: 12, right: 12 }}>
                            {unlocks[0].serialPosition} / {unlocks[0].serial_total}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ margin: '12px 0' }}>
                        <h3 style={{ fontSize: 15, color: '#fff', marginBottom: 2 }}>{player.name}</h3>
                        <div style={{ fontSize: 10, color: teamMeta.color, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                          {player.position}
                        </div>

                        {/* Biometric Stats */}
                        <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 6, marginBottom: 12 }}>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PWR</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#ff4444' }}>{ratings.power}</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>SPD</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#00a86b' }}>{ratings.speed}</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>CAL</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#00f0ff' }}>{ratings.calibration}</div>
                          </div>
                        </div>
                        
                        <div style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, marginBottom: 2 }}>SPECIALIZATION</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>{specialization}</div>
                        
                        <div style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, marginBottom: 2 }}>BIOMETRIC LORE</div>
                        <p style={{ fontSize: 11, lineHeight: 1.4, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                          {lore}
                        </p>
                      </div>
                      
                      <div className="back-footer" style={{ borderTop: 'none', padding: 0 }}>
                        <span className="rarity-tag" style={{ color: isUnlocked ? '#ecc94b' : 'var(--text-muted)', fontSize: 10 }}>
                          {isUnlocked ? unlocks[0].rarity.toUpperCase() : 'COMMON'} UNIT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
