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
      'titan_drop': { count: 10 }
    };
    
    const count = packConfig[packId]?.count || 1;
    const cards = [];
    let forceRarity = null;

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
    } else if (packId === 'core_pack') {
      // Core Draft Pack guarantees 1 uncommon or better
      forceRarity = 'uncommon';
    }

    // Award the guaranteed hit first
    const hit = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, forceRarity);
    cards.push(hit);

    // Award the rest of the pack with standard randomized rarity (which is capped at Rare)
    for (let i = 1; i < count; i++) {
      const standardCard = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, null);
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
