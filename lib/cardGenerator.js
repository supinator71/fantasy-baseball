/**
 * cardGenerator.js — Infinite Galactic League Engine
 * Generates unique cyborg cards with randomized stats, lore, and identities.
 */
import { callClaudeFast } from './claude.js';


import { GALACTIC_ROSTER } from './rosterData.js';

const SPECIALIZATIONS = [
  "Balanced Offense", "Heat Sink Power", "Bullpen Lock", "Neural Strategy",
  "Kinetic Burst", "Gravity Nullifier", "Thermal Reset", "Refractive Shield",
  "Efficiency Mentor", "Pulse Save", "Master Logic", "Hyper-Drive",
  "Photon Reach", "Total Spectrum", "Cinematic Range", "Aerial Denied",
  "Shared Network", "Clutch Protocol", "Haptic Touch", "Precious Metal",
  "Red Line Drive", "Visor Intel", "Digital Soul", "Ink of Ages"
];

const RARITY_POOLS = {
  common: { imgs: ['/cyborg_card_tier1_hitter.png', '/cyborg_batter_series3.png'], serial_total: null },
  uncommon: { imgs: ['/cyborg_card_tier2_holo_premium.png', '/cyborg_pitcher_series3.png'], serial_total: null },
  rare: { imgs: ['/cyborg_card_tier3_prism.png', '/cyborg_catcher_series3.png'], serial_total: 500 },
  epic: { imgs: ['/rookie_prizm_clean.png', '/cyborg_batter_series3.png', '/cyborg_pitcher_series3.png', '/cyborg_catcher_series3.png'], serial_total: 50 },
  legendary: { imgs: ['/arcana_clean.png', '/cyborg_pitcher_series3.png', '/cyborg_catcher_series3.png', '/cyborg_batter_series3.png'], serial_total: 5 }
};

export async function generateInfiniteCard(forceRarity = null, forcePositions = null, isFree = false) {
  const roll = Math.random();
  let rarity = 'common';
  if (isFree) {
    if (forceRarity && (forceRarity === 'common' || forceRarity === 'uncommon')) {
      rarity = forceRarity;
    } else {
      rarity = roll > 0.65 ? 'uncommon' : 'common';
    }
  } else {
    if (forceRarity) {
      rarity = forceRarity;
    } else {
      // Natural rolls: Epic/Legendary are earned via achievements and cannot roll naturally.
      if (roll > 0.90) rarity = 'rare';
      else if (roll > 0.65) rarity = 'uncommon';
    }
  }

  // Pull a random player from the 120-player master roster
  let playerPool = GALACTIC_ROSTER;
  if (Array.isArray(forcePositions) && forcePositions.length > 0) {
    const upperForced = new Set(forcePositions.map(pos => pos.trim().toUpperCase()));
    playerPool = GALACTIC_ROSTER.filter(p => {
      const pPositions = String(p.position || '').split(/[/,]/).map(x => x.trim().toUpperCase());
      return pPositions.some(pos => upperForced.has(pos));
    });
    if (playerPool.length === 0) playerPool = GALACTIC_ROSTER;
  }

  const player = playerPool[Math.floor(Math.random() * playerPool.length)];
  const spec = SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];
  const pool = RARITY_POOLS[rarity];

  const prompt = `You are generating a collectible digital trading card for a cyborg baseball player in the year 2026.
Player Name: ${player.name}
Team: ${player.team}
Position: ${player.position}
Specialization: ${spec}
Rarity: ${rarity}

Write a single sentence of cheeky, cyberpunk baseball lore for this player. Keep it under 20 words. Make it funny or weird. Focus on their cyborg traits malfunctioning, glitching, or being hilariously overpowered for baseball. Do not use quotes.`;

  let lore = `An elite unit from ${player.team} specializing in ${spec}. Optimized for the 2026 Galactic Season.`;
  try {
    const aiResponse = await callClaudeFast([{ role: 'user', content: prompt }], 60);
    if (aiResponse) {
      lore = aiResponse.trim();
      // Remove surrounding quotes if Claude included them
      if (lore.startsWith('"') && lore.endsWith('"')) {
        lore = lore.substring(1, lore.length - 1);
      }
    }
  } catch (err) {
    console.warn('[Card Generator] Failed to generate AI lore, falling back to default:', err.message);
  }

  const card = {
    id: `dyn_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    name: `${player.name} (${rarity.toUpperCase()})`,
    playerName: player.name,
    team: player.team,
    teamColor: player.teamColor,
    position: player.position,
    rarity: rarity,
    specialization: spec,
    img: player.image, // Use their canonical image placeholder instead of randomizing pool.imgs
    serial_total: pool.serial_total,
    lore: lore,
    set_num: player.jersey_number, // Use their actual jersey number instead of random set_num
    has_signature: rarity === 'legendary',
    has_patch: rarity === 'epic' || rarity === 'legendary',
    patch_type: (rarity === 'epic' || rarity === 'legendary') ? ['jersey', 'metal', 'motherboard'][Math.floor(Math.random() * 3)] : null,
    signature_name: rarity === 'legendary' ? player.name : null,
    sig_style: rarity === 'legendary' ? ['classic', 'aggressive', ''][Math.floor(Math.random() * 3)] : null
  };

  return card;
}
