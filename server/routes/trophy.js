const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Master dictionary of all collectible cards in the application
const CARD_COLLECTION = [
  { id: 't1_hitter', name: 'Tier 1 Hitter', img: '/cyborg_card_tier1_hitter.png', rarity: 'common' },
  { id: 't1_pitcher', name: 'Tier 1 Pitcher', img: '/cyborg_card_tier1_pitcher.png', rarity: 'common' },
  { id: 't2_holo', name: 'Holographic Foil Base', img: '/cyborg_card_tier2_holo.png', rarity: 'uncommon' },
  { id: 't3_prism', name: 'Diamond Prism Showcase', img: '/cyborg_card_tier3_prism.png', rarity: 'rare' },
  
  { id: 'gatorade', name: 'Gatorade Glitch', img: '/cyborg_gatorade_glitch.png', rarity: 'common' },
  { id: 'steal', name: 'Stealing Second', img: '/cyborg_stealing_second.png', rarity: 'common' },
  
  { id: 'sp_wide', name: 'Rookie Silver Prizm (Wide)', img: '/cyborg_silver_prism_wide.png', rarity: 'rare' },
  { id: 'sp_medium', name: 'Rookie Silver Prizm (Wall Rob)', img: '/cyborg_silver_prism_medium.png', rarity: 'rare' },
  { id: 'sp_closeup', name: 'Rookie Silver Prizm (Visor)', img: '/cyborg_silver_prism_closeup.png', rarity: 'legendary' },
  { id: 'sp_hand', name: 'Rookie Silver Prizm (Pack Pull)', img: '/cyborg_silver_prism_hand.png', rarity: 'epic' },
  
  { id: 'arcana_hand', name: 'Homerun Arcana', img: '/cyborg_card_hand_arcana.png', rarity: 'legendary' },
  { id: 'coach_woman', name: 'Holographic Coach', img: '/cyborg_coach_card_woman.png', rarity: 'uncommon' },
  { id: 'jump_kid', name: 'Team Celebration Foil', img: '/cyborg_team_jump_kid.png', rarity: 'rare' }
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
    const tc = db.getTrophyCase(guid);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    if (tc.last_daily_pack && (now - tc.last_daily_pack < TWENTY_FOUR_HOURS)) {
      return res.status(400).json({ error: 'Daily pack not ready yet' });
    }

    const cardId = getRandomCardId();
    db.awardCard(guid, cardId, 'Daily Pack Drop');
    db.updateDailyPackTimer(guid);

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
