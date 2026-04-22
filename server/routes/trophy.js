const express = require('express');
const router = express.Router();
const db = require('../services/database');

// Master dictionary of all collectible cards in the application
const CARD_COLLECTION = [
  // Core Set (Base)
  { id: 'base_hitter', name: 'Cyber Hitter (Base)', img: '/cyborg_card_tier1_hitter.png', rarity: 'common' },
  { id: 'base_pitcher', name: 'Cyber Pitcher (Base)', img: '/cyborg_card_tier1_pitcher.png', rarity: 'common' },
  { id: 'base_closer', name: 'Bullpen Closer (Base)', img: '/cyborg_bullpen_closer.png', rarity: 'common' },
  { id: 'base_manager', name: 'Tactical Manager (Base)', img: '/cyborg_cyber_manager.png', rarity: 'common' },
  { id: 'base_steal', name: 'Stealing Second (Base)', img: '/cyborg_stealing_second.png', rarity: 'common' },
  { id: 'base_catch', name: 'Diving Catch (Base)', img: '/cyborg_diving_catch.png', rarity: 'common' },
  { id: 'gatorade', name: 'Gatorade Glitch', img: '/cyborg_gatorade_glitch.png', rarity: 'common' },

  // Uncommon Variations (Foil / Minor visual tweaks)
  { id: 't2_holo', name: 'Holographic Foil Base', img: '/cyborg_card_tier2_holo_premium.png', rarity: 'uncommon' },
  { id: 'coach_woman', name: 'Holographic Coach', img: '/cyborg_coach_card_woman.png', rarity: 'uncommon' },
  { id: 'unc_closer', name: 'Bullpen Closer (Refractor)', img: '/cyborg_bullpen_closer.png', rarity: 'uncommon' },
  { id: 'unc_manager', name: 'Tactical Manager (Foil)', img: '/cyborg_cyber_manager.png', rarity: 'uncommon' },
  { id: 'unc_steal', name: 'Stealing Second (Hyper)', img: '/cyborg_stealing_second.png', rarity: 'uncommon' },
  { id: 'unc_catch', name: 'Diving Catch (Glow Edition)', img: '/cyborg_diving_catch.png', rarity: 'uncommon' },
  
  // Rare Variations (Prizms / Special Moments)
  { id: 't3_prism', name: 'Diamond Prism Showcase', img: '/cyborg_card_tier3_prism.png', rarity: 'rare' },
  { id: 'sp_wide', name: 'Rookie Silver Prizm (Wide)', img: '/cyborg_silver_prism_wide.png', rarity: 'rare' },
  { id: 'sp_medium', name: 'Rookie Silver Prizm (Wall Rob)', img: '/cyborg_silver_prism_medium.png', rarity: 'rare' },
  { id: 'jump_kid', name: 'Team Celebration Foil', img: '/cyborg_team_jump_kid.png', rarity: 'rare' },
  { id: 'rare_walkoff', name: 'Walk-Off Homer (Silver Prizm)', img: '/cyborg_walkoff_homer.png', rarity: 'rare' },

  // Epic Variations (Extremely hard to pull)
  { id: 'sp_hand', name: 'Rookie Silver Prizm (Pack Pull)', img: '/cyborg_silver_prism_hand.png', rarity: 'epic' },
  { id: 'epic_catch', name: 'Diving Catch (Gold /10)', img: '/cyborg_diving_catch.png', rarity: 'epic' },
  { id: 'epic_closer', name: 'Closer (Ruby Wave)', img: '/cyborg_bullpen_closer.png', rarity: 'epic' },

  // Legendary (Signatures & Ultimate Pulls)
  { id: 'sp_closeup', name: 'Rookie True Gold (Visor Edition)', img: '/cyborg_silver_prism_closeup.png', rarity: 'legendary' },
  { id: 'arcana_hand', name: 'Homerun Arcana (Signed)', img: '/cyborg_card_hand_arcana.png', rarity: 'legendary' },
  { id: 'leg_walkoff', name: 'Walk-Off Homer (Autograph Edition)', img: '/cyborg_walkoff_homer.png', rarity: 'legendary' },

  // --- SERIES 2: TITANIUM GRAPEFRUIT LEAGUE ---
  { id: 'tgl_bk_hit', name: 'Brooklyn Biotics (Jaxson Jones)', img: '/tgl_brooklyn_hitter_v3_1776486966054.png', rarity: 'common' },
  { id: 'tgl_tok_stl', name: 'Tokyo Tachyons (Kenji Ryuko)', img: '/tgl_tokyo_stealer_v2_1776486720704.png', rarity: 'common' },
  { id: 'tgl_neo_inf', name: 'Neon City Sliders (Dash Maverick)', img: '/tgl_neoncity_infielder_v2_1776486734283.png', rarity: 'common' },
  { id: 'tgl_sv_pit', name: 'Silicon Valley Sentinels (Alan T. Turing)', img: '/tgl_siliconvalley_pitcher_v2_1776486747529.png', rarity: 'rare' },
  { id: 'tgl_dal_cow', name: 'Dallas Tex-Mechs (Colt Smith)', img: '/tgl_dallas_cowboy_v3_1776486978084.png', rarity: 'rare' },
  { id: 'tgl_osa_hit', name: 'Osaka Overclockers (Daiki Moto)', img: '/tgl_osaka_hitter_v2_1776486782371.png', rarity: 'epic' },
  { id: 'tgl_kyo_kai', name: 'Kyoto Kaiju (Ryu Tanaka)', img: '/tgl_kyoto_kaiju_pitcher_v2_1776486797035.png', rarity: 'epic' },
  { id: 'tgl_ros_inf', name: 'Roswell Rayguns (Zorblax Smith)', img: '/tgl_roswell_infielder_v2_1776486811710.png', rarity: 'legendary' },

  // --- SERIES 2: DIVERSITY EXPANSION (TEAMS 9-12) ---
  { id: 'tgl_atl_hit', name: 'Atlanta Aerodynamics (DeAndre Carter)', img: '/tgl_atlanta_hitter_1776487205901.png', rarity: 'rare' },
  { id: 'tgl_mia_stl', name: 'Miami Motherboards (Mateo Rodriguez)', img: '/tgl_miami_stealer_1776487217131.png', rarity: 'epic' },
  { id: 'tgl_sj_inf', name: 'San Juan Synthetics (Luis Fernandez)', img: '/tgl_sanjuan_infielder_1776487227839.png', rarity: 'legendary' },
  { id: 'tgl_hav_pit', name: 'Havana Hover-Hounds (Javier Gomez)', img: '/tgl_havana_pitcher_1776487239413.png', rarity: 'common' }
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
      return { ...u, ...meta };
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
