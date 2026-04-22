const express = require('express');
const router = express.Router();
const db = require('../services/database');

// Master dictionary of all collectible cards in the application
const CARD_COLLECTION = [
  // --- SERIES 1: CORE SET ---
  { id: 'base_hitter', name: 'Cyber Hitter (Base)', img: '/cyborg_card_tier1_hitter.png', rarity: 'common', specialization: 'Balanced Offense', lore: 'The foundational unit of the Cyber-League. Optimized for contact and high-velocity exit speeds.' },
  { id: 'base_pitcher', name: 'Cyber Pitcher (Base)', img: '/cyborg_card_tier1_pitcher.png', rarity: 'common', specialization: 'Heat Sink Power', lore: 'Equipped with a liquid-cooled arm capable of sustaining 110mph fastballs for 9 innings.' },
  { id: 'base_closer', name: 'Bullpen Closer (Base)', img: '/cyborg_bullpen_closer.png', rarity: 'common', specialization: 'High-Stress Lock', lore: 'Designed to compute high-leverage outcomes in milliseconds. A true ninth-inning firewall.' },
  { id: 'base_manager', name: 'Lara Jupiter (Manager)', img: '/lara_jupiter.png', rarity: 'common', specialization: 'Neural Strategy', lore: 'Lara Jupiter possesses a neural link to every player on the field, adjusting shifts based on real-time wind data.' },
  { id: 'base_steal', name: 'Stealing Second (Base)', img: '/cyborg_stealing_second.png', rarity: 'common', specialization: 'Kinetic Burst', lore: 'Hydraulic leg boosters allow for a 0-to-20mph burst in under two steps.' },
  { id: 'base_catch', name: 'Diving Catch (Base)', img: '/cyborg_diving_catch.png', rarity: 'common', specialization: 'Gravity Nullifier', lore: 'Internal gyroscopes allow for mid-air adjustments that defy traditional physics.' },
  { id: 'gatorade', name: 'Gatorade Glitch', img: '/cyborg_gatorade_glitch.png', rarity: 'common', specialization: 'Thermal Reset', lore: 'A rare cooling malfunction that results in a localized neon mist celebration.' },

  // Uncommon
  { id: 't2_holo', name: 'Holographic Foil Base', img: '/cyborg_card_tier2_holo_premium.png', rarity: 'uncommon', specialization: 'Refractive Shield', lore: 'A premium-plated unit that reflects stadium lights to distract opposing batters.' },
  { id: 'coach_woman', name: 'Holographic Coach', img: '/cyborg_coach_card_woman.png', rarity: 'uncommon', specialization: 'Efficiency Mentor', lore: 'Specializes in optimizing the swing-path of younger cyborg units.' },
  { id: 'unc_closer', name: 'Bullpen Closer (Refractor)', img: '/cyborg_bullpen_closer.png', rarity: 'uncommon', specialization: 'Pulse Save', lore: 'A specialized refractor variant of the standard firewall closer.' },
  { id: 'unc_manager', name: 'Lara Jupiter (Foil)', img: '/lara_jupiter.png', rarity: 'uncommon', specialization: 'Master Logic', lore: 'An upgraded Lara Jupiter unit with access to the legendary "Big Data" archives.' },
  { id: 'unc_steal', name: 'Stealing Second (Hyper)', img: '/cyborg_stealing_second.png', rarity: 'uncommon', specialization: 'Hyper-Drive', lore: 'Equipped with illegal sub-light thrusters for impossible steal percentages.' },
  { id: 'unc_catch', name: 'Diving Catch (Glow Edition)', img: '/cyborg_diving_catch.png', rarity: 'uncommon', specialization: 'Photon Reach', lore: 'Glow-wire armor allows for better visibility during night-cycle games.' },
  
  // Rare
  { id: 't3_prism', name: 'Diamond Prism Showcase', img: '/cyborg_card_tier3_prism.png', rarity: 'rare', specialization: 'Total Spectrum', lore: 'The apex of the Series 1 manufacturing line. Flawless in every metric.', serial_total: 500 },
  { id: 'sp_wide', name: 'Rookie Silver Prizm (Wide)', img: '/cyborg_silver_prism_wide.png', rarity: 'rare', specialization: 'Cinematic Range', lore: 'Captures the raw power of a rookie unit making their debut on the grand stage.', serial_total: 100 },
  { id: 'sp_medium', name: 'Rookie Silver Prizm (Wall Rob)', img: '/cyborg_silver_prism_medium.png', rarity: 'rare', specialization: 'Aerial Denied', lore: 'Commemorating the first time a cyborg cleared the 40-foot outfield wall to rob a homer.', serial_total: 100 },
  { id: 'jump_kid', name: 'Team Celebration Foil', img: '/cyborg_team_jump_kid.png', rarity: 'rare', specialization: 'Shared Network', lore: 'A rare capture of multiple units celebrating a walk-off victory in perfect sync.', serial_total: 250 },
  { id: 'rare_walkoff', name: 'Walk-Off Homer (Silver Prizm)', img: '/cyborg_walkoff_homer.png', rarity: 'rare', specialization: 'Clutch Protocol', lore: 'The sound of the bat hitting the ball was heard three city blocks away.', serial_total: 100 },

  // Epic
  { id: 'sp_hand', name: 'Rookie Silver Prizm (Pack Pull)', img: '/cyborg_silver_prism_hand.png', rarity: 'epic', specialization: 'Haptic Touch', lore: 'This card features a piece of authentic synthetic jersey material from the draft day.', has_patch: true, serial_total: 50 },
  { id: 'epic_catch', name: 'Diving Catch (Gold /10)', img: '/cyborg_diving_catch.png', rarity: 'epic', specialization: 'Precious Metal', lore: 'Only 10 of these units were ever manufactured. A masterpiece of engineering.', serial_total: 10 },
  { id: 'epic_closer', name: 'Closer (Ruby Wave)', img: '/cyborg_bullpen_closer.png', rarity: 'epic', specialization: 'Red Line Drive', lore: 'Optimized for high-heat environments where standard units often melt down.', serial_total: 50 },

  // Legendary
  { id: 'sp_closeup', name: 'Rookie True Gold (Visor Edition)', img: '/cyborg_silver_prism_closeup.png', rarity: 'legendary', specialization: 'Visor Intel', lore: 'Provides a direct view into the targeting HUD of a Hall-of-Fame unit.', serial_total: 25 },
  { id: 'arcana_hand', name: 'Homerun Arcana (Signed)', img: '/cyborg_card_hand_arcana.png', rarity: 'legendary', specialization: 'Digital Soul', lore: 'Rumored to be haunted by the spirit of a pre-cyber baseball legend.', has_signature: true, signature_name: 'The Legend', serial_total: 5 },
  { id: 'leg_walkoff', name: 'Walk-Off Homer (Autograph Edition)', img: '/cyborg_walkoff_homer.png', rarity: 'legendary', specialization: 'Ink of Ages', lore: 'Personally signed with conductive liquid-gold ink by the leagues top slugger.', has_signature: true, signature_name: 'Slugger Prime', serial_total: 1 },

  // --- SERIES 2: TITANIUM GRAPEFRUIT LEAGUE ---
  { id: 'tgl_bk_hit', name: 'Brooklyn Biotics (Jaxson Jones)', img: '/tgl_brooklyn_hitter_v3_1776486966054.png', rarity: 'common', specialization: 'Heavy Artillery', lore: 'Known for his "Inertia Swing" that calculates ball trajectory in 0.02ms.' },
  { id: 'tgl_tok_stl', name: 'Tokyo Tachyons (Kenji Ryuko)', img: '/tgl_tokyo_stealer_v2_1776486720704.png', rarity: 'common', specialization: 'Warp Speed', lore: 'Kenji\'s speed is so high it often triggers stadium motion sensors incorrectly.' },
  { id: 'tgl_neo_inf', name: 'Neon City Sliders (Dash Maverick)', img: '/tgl_neoncity_infielder_v2_1776486734283.png', rarity: 'common', specialization: 'Flash Defense', lore: 'Dash can cover the entire left side of the infield in a single stride.' },
  { id: 'tgl_sv_pit', name: 'Silicon Valley Sentinels (Alan T. Turing)', img: '/tgl_siliconvalley_pitcher_v2_1776486747529.png', rarity: 'rare', specialization: 'Grav-Curve', lore: 'Alan\'s curveball is actually a calculated gravitational anomaly.', serial_total: 500 },
  { id: 'tgl_dal_cow', name: 'Dallas Tex-Mechs (Colt Smith)', img: '/tgl_dallas_cowboy_v3_1776486978084.png', rarity: 'rare', specialization: 'Rawhide Tech', lore: 'Traditional aesthetic meets state-of-the-art power-steering arms.', serial_total: 500 },
  { id: 'tgl_osa_hit', name: 'Osaka Overclockers (Daiki Moto)', img: '/tgl_osaka_hitter_v2_1776486782371.png', rarity: 'epic', specialization: 'Overdrive', lore: 'When the game is on the line, Daiki can overclock his processors by 300%.', serial_total: 50 },
  { id: 'tgl_kyo_kai', name: 'Kyoto Kaiju (Ryu Tanaka)', img: '/tgl_kyoto_kaiju_pitcher_v2_1776486797035.png', rarity: 'epic', specialization: 'Scale Armor', lore: 'His delivery is as unpredictable as a monster rising from the deep.', serial_total: 50 },
  { id: 'tgl_ros_inf', name: 'Roswell Rayguns (Zorblax Smith)', img: '/tgl_roswell_infielder_v2_1776486811710.png', rarity: 'legendary', specialization: 'Abduction Play', lore: 'Rumored to have been scouted from a crash site in the Nevada desert.', serial_total: 5 },

  // --- SERIES 2: DIVERSITY EXPANSION (TEAMS 9-12) ---
  { id: 'tgl_atl_hit', name: 'Atlanta Aerodynamics (DeAndre Carter)', img: '/tgl_atlanta_hitter_1776487205901.png', rarity: 'rare', specialization: 'Aero-Boost', lore: 'Uses wing-fins to adjust his swing arc mid-flight for maximum elevation.', serial_total: 500 },
  { id: 'tgl_mia_stl', name: 'Miami Motherboards (Mateo Rodriguez)', img: '/tgl_miami_stealer_1776487217131.png', rarity: 'epic', specialization: 'Port-Scan', lore: 'Can predict a pitcher\'s pickoff move by scanning their frequency.', serial_total: 50 },
  { id: 'tgl_sj_inf', name: 'San Juan Synthetics (Luis Fernandez)', img: '/tgl_sanjuan_infielder_1776487227839.png', rarity: 'legendary', specialization: 'Bio-Sync', lore: 'A perfect 50/50 mix of human muscle and synthetic carbon-fiber bone.', serial_total: 5 },
  { id: 'tgl_hav_pit', name: 'Havana Hover-Hounds (Javier Gomez)', img: '/tgl_havana_pitcher_1776487239413.png', rarity: 'common', specialization: 'Mag-Lev Slide', lore: 'Hover-tech allows Javier to pitch from a completely frictionless stance.' }
];

// Helper to pull a random card based on rarity weights
function getRandomCardId() {
  // Weights: common=60%, uncommon=25%, rare=10%, epic=4%, legendary=1%
  const roll = Math.random();
  let targetRarity = 'common';
  if (roll > 0.99) targetRarity = 'legendary';
  else if (roll > 0.95) targetRarity = 'epic';
  else if (roll > 0.85) targetRarity = 'rare';
  else if (roll > 0.60) targetRarity = 'uncommon';

  const pool = CARD_COLLECTION.filter(c => c.rarity === targetRarity);
  // Fallback to common if pool empty for some reason
  if (pool.length === 0) return CARD_COLLECTION[0].id;
  
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked.id;
}

// 1. Get the user's complete Trophy Case
router.get('/album', (req, res) => {
  const guid = req.session?.yahoo_guid;
  if (!guid) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const tc = db.getTrophyCase(guid);
    
    // Enrich unlocked data with full card metadata
    const unlocked = tc.unlocked_cards.map(u => {
      const meta = CARD_COLLECTION.find(c => c.id === u.id);
      let mintNumber = null;
      
      if (meta?.serial_total) {
        if (meta.serial_total === 1) {
          mintNumber = 1;
        } else {
          // Deterministic unique number based on ID and timestamp
          const seed = u.unlocked_at || 12345;
          // Simple hash
          const hash = (seed * 9301 + 49297) % 233280;
          mintNumber = (hash % meta.serial_total) + 1;
        }
      }

      return { ...u, ...meta, mint_number: mintNumber };
    });

    res.json({
      success: true,
      last_daily_pack: tc.last_daily_pack,
      unlocked_cards: unlocked,
      collection_size: CARD_COLLECTION.length,
      all_cards: CARD_COLLECTION // sending dictionary so UI can render silhouettes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Claim Daily Free Pack
router.post('/daily-pack', (req, res) => {
  const guid = req.session?.yahoo_guid;
  if (!guid) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { clientDate } = req.body;
    const tc = db.getTrophyCase(guid);
    
    // Support both the legacy millisecond timestamp and the new date string format
    const today = clientDate || new Date().toISOString().slice(0, 10);
    let claimedToday = false;
    
    if (tc.last_daily_pack) {
      if (typeof tc.last_daily_pack === 'string') {
        claimedToday = (tc.last_daily_pack === today);
      } else {
        const TWENTY_HOURS = 20 * 60 * 60 * 1000;
        claimedToday = (Date.now() - tc.last_daily_pack < TWENTY_HOURS);
      }
    }
    
    if (claimedToday) {
      return res.status(400).json({ error: 'Daily pack not ready yet. Resets at midnight.' });
    }

    const cardId = getRandomCardId();
    db.awardCard(guid, cardId, 'Daily Pack Drop');
    db.updateDailyPackTimer(guid, today);

    const meta = CARD_COLLECTION.find(c => c.id === cardId);
    res.json({ success: true, awarded: meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Award specific milestone card (Internal use or specific triggers)
router.post('/award', (req, res) => {
  const guid = req.session?.yahoo_guid;
  if (!guid) return res.status(401).json({ error: 'Not authenticated' });

  const { trigger } = req.body;
  let cardId;
  let reason;

  try {
    if (trigger === 'audit_aplus') {
      cardId = 't3_prism';
      reason = 'Perfect Team Audit Score';
    } else if (trigger === 'audit_b') {
      cardId = 't1_pitcher';
      reason = 'Solid Team Compilation';
    } else if (trigger === 'drafted_rookie') {
      cardId = 'sp_wide';
      reason = 'Drafted Top Prospect';
    } else if (trigger === 'stolen_base_win') {
      cardId = 'steal';
      reason = 'Matchup SB Dominance';
    } else {
      // General milestone drop
      cardId = getRandomCardId();
      reason = trigger || 'Milestone Achieved';
    }

    db.awardCard(guid, cardId, reason);
    const meta = CARD_COLLECTION.find(c => c.id === cardId);
    
    res.json({ success: true, awarded: meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, CARD_COLLECTION };
