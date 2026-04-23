/**
 * cardGenerator.js — Infinite Galactic League Engine
 * Generates unique cyborg cards with randomized stats, lore, and identities.
 */
import { callClaudeFast } from './claude.js';


const TEAMS = [
  { name: "Brooklyn Biotics", city: "Brooklyn", color: "#00c8ff" },
  { name: "Tokyo Tachyons", city: "Tokyo", color: "#ff0088" },
  { name: "Neon City Sliders", city: "Neon City", color: "#00ff88" },
  { name: "Silicon Valley Sentinels", city: "Silicon Valley", color: "#5555ff" },
  { name: "Dallas Tex-Mechs", city: "Dallas", color: "#ff8800" },
  { name: "Osaka Overclockers", city: "Osaka", color: "#ffcc00" },
  { name: "Kyoto Kaiju", city: "Kyoto", color: "#ff4444" },
  { name: "Roswell Rayguns", city: "Roswell", color: "#77ff00" },
  { name: "Atlanta Aerodynamics", city: "Atlanta", color: "#aa00ff" },
  { name: "Miami Motherboards", city: "Miami", color: "#00ffff" },
  { name: "San Juan Synthetics", city: "San Juan", color: "#ff00ff" },
  { name: "Havana Hover-Hounds", city: "Havana", color: "#ccff00" }
];

const PLAYER_NAMES = [
  "Jaxson Jones", "Kenji Ryuko", "Dash Maverick", "Alan T. Turing", "Colt Smith", 
  "Daiki Moto", "Ryu Tanaka", "Zorblax Smith", "DeAndre Carter", "Mateo Rodriguez",
  "Luis Fernandez", "Javier Gomez", "Unit 7-B", "Vector Prime", "Echo Echo",
  "Nova Starlight", "Titan X", "Syborg-1", "Aero Vance", "Turbo Tim",
  "Cyborg Catcher", "Metallic Mike", "Pulse Rider", "Silicon Sam", "Laser Larry"
];

const SPECIALIZATIONS = [
  "Balanced Offense", "Heat Sink Power", "Bullpen Lock", "Neural Strategy",
  "Kinetic Burst", "Gravity Nullifier", "Thermal Reset", "Refractive Shield",
  "Efficiency Mentor", "Pulse Save", "Master Logic", "Hyper-Drive",
  "Photon Reach", "Total Spectrum", "Cinematic Range", "Aerial Denied",
  "Shared Network", "Clutch Protocol", "Haptic Touch", "Precious Metal",
  "Red Line Drive", "Visor Intel", "Digital Soul", "Ink of Ages"
];

const RARITY_POOLS = {
  common: { img: '/cyborg_card_tier1_hitter.png', serial_total: null },
  uncommon: { img: '/cyborg_card_tier2_holo_premium.png', serial_total: null },
  rare: { img: '/cyborg_card_tier3_prism.png', serial_total: 500 },
  epic: { img: '/rookie_prizm_clean.png', serial_total: 50 },
  legendary: { img: '/arcana_clean.png', serial_total: 5 }
};

export async function generateInfiniteCard(forceRarity = null) {
  const roll = Math.random();
  let rarity = 'common';
  if (forceRarity) {
    rarity = forceRarity;
  } else {
    if (roll > 0.995) rarity = 'legendary';
    else if (roll > 0.97) rarity = 'epic';
    else if (roll > 0.88) rarity = 'rare';
    else if (roll > 0.65) rarity = 'uncommon';
  }

  const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  const name = PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
  const spec = SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];
  const pool = RARITY_POOLS[rarity];

  const prompt = `You are generating a collectible digital trading card for a cyborg baseball player in the year 2026.
Player Name: ${name}
Team: ${team.name}
Specialization: ${spec}
Rarity: ${rarity}

Write a single sentence of cheeky, cyberpunk baseball lore for this player. Keep it under 20 words. Make it funny or weird. Focus on their cyborg traits malfunctioning, glitching, or being hilariously overpowered for baseball. Do not use quotes.`;

  let lore = `An elite unit from ${team.name} specializing in ${spec}. Optimized for the 2026 Galactic Season.`;
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
    name: `${name} (${rarity.toUpperCase()})`,
    playerName: name,
    team: team.name,
    teamColor: team.color,
    rarity: rarity,
    specialization: spec,
    img: pool.img,
    serial_total: pool.serial_total,
    lore: lore,
    set_num: Math.floor(Math.random() * 9000) + 1000,
    has_signature: rarity === 'legendary',
    has_patch: rarity === 'epic',
    signature_name: rarity === 'legendary' ? name : null
  };

  return card;
}
