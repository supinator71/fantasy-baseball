import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { packId } = await request.json();

    const packConfig = {
      'core_pack': { count: 3 },
      'premium_hobby': { count: 5 },
      'titan_drop': { count: 10 },
      'precision_pitching': { count: 3 },
      'slugger_shards': { count: 3 },
      'generals_trade': { count: 3 }
    };
    
    const count = packConfig[packId]?.count || 1;
    const cards = [];
    let forceRarity = null;
    let forcePositions = null;

    if (packId === 'premium_hobby') {
      try {
        db.deductToken(guid, 'premium_hobby', 1);
      } catch (err) {
        return NextResponse.json({ error: 'Insufficient Premium Tokens. Earn them via achievements!' }, { status: 400 });
      }
      // Guaranteed rare or epic for the hit
      forceRarity = Math.random() < 0.15 ? 'epic' : 'rare';
    } else if (packId === 'titan_drop') {
      try {
        db.deductToken(guid, 'titan_drop', 1);
      } catch (err) {
        return NextResponse.json({ error: 'Insufficient Elite Tokens. Earn them via A-Grade Audits!' }, { status: 400 });
      }
      // Guaranteed legendary for the hit
      forceRarity = 'legendary';
    } else if (packId === 'precision_pitching') {
      try {
        db.deductToken(guid, 'pitching_precision', 10);
      } catch (err) {
        return NextResponse.json({ error: 'Insufficient Pitching Precision. Stream winning pitchers to earn tokens!' }, { status: 400 });
      }
      forceRarity = 'rare';
      forcePositions = ['SP', 'RP', 'P'];
    } else if (packId === 'slugger_shards') {
      try {
        db.deductToken(guid, 'slugger_shards', 10);
      } catch (err) {
        return NextResponse.json({ error: 'Insufficient Slugger Shards. Beat Hittertron projections to earn tokens!' }, { status: 400 });
      }
      forceRarity = 'rare';
      forcePositions = ['1B', '2B', '3B', 'SS', 'OF', 'C'];
    } else if (packId === 'generals_trade') {
      try {
        db.deductToken(guid, 'generals_credits', 10);
      } catch (err) {
        return NextResponse.json({ error: "Insufficient General's Credits. Make roster moves and evaluate trades to earn tokens!" }, { status: 400 });
      }
      forceRarity = 'rare';
      forcePositions = ['C', 'SS', '2B', '3B'];
    } else if (packId === 'core_pack') {
      // Core Draft Pack guarantees 1 uncommon or better
      forceRarity = 'uncommon';
    }

    // Award the guaranteed hit first
    const hit = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, forceRarity, forcePositions);
    cards.push(hit);

    // Award the rest of the pack with standard randomized rarity (which is capped at Rare)
    for (let i = 1; i < count; i++) {
      const standardCard = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, null, forcePositions);
      cards.push(standardCard);
    }

    const updatedTrophy = db.getTrophyCase(guid);

    // Return the 'hit' to be showcased in the animation, plus the updated tokens
    return NextResponse.json({ 
      success: true, 
      awarded: hit, 
      total_awarded: count,
      tokens: updatedTrophy.tokens
    });
  } catch (error) {
    console.error('Store purchase error:', error);
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
