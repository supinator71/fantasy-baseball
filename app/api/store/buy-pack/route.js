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

    // NOTE: In a real implementation, this endpoint would:
    // 1. Validate a Stripe session ID or process payment
    // 2. Award multiple cards (e.g. 3, 5, or 10 based on pack)
    // 3. Guarantee at least 1 card matches the forceRarity

    // For this mock implementation, we just immediately award 1 guaranteed card
    // so the PackDropModal can show it off.
    const awardedCard = await db.awardCard(guid, 'random_dynamic', `Store Purchase: ${packId}`, forceRarity);

    return NextResponse.json({ success: true, awarded: awardedCard });
  } catch (error) {
    console.error('Store checkout error:', error);
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
