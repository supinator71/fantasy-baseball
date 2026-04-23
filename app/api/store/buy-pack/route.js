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
    const { packId, forceRarity } = await request.json();

    const packConfig = {
      'core_pack': { count: 3 },
      'premium_hobby': { count: 5 },
      'titan_drop': { count: 10 }
    };
    
    const count = packConfig[packId]?.count || 1;
    const cards = [];

    // Award the guaranteed hit first
    const hit = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, forceRarity);
    cards.push(hit);

    // Award the rest of the pack with standard randomized rarity
    for (let i = 1; i < count; i++) {
      const standardCard = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, null);
      cards.push(standardCard);
    }

    // We'll return the 'hit' to be showcased in the animation, but the user actually gets all of them.
    return NextResponse.json({ success: true, awarded: hit, total_awarded: count });
  } catch (error) {
    console.error('Store checkout error:', error);
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
