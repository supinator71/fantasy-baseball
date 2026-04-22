import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';
import { getRandomCardId, CARD_COLLECTION } from '@/lib/constants';

export async function POST() {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const trophyCase = db.getTrophyCase(guid);
  const lastClaim = trophyCase.last_daily_pack || '';
  
  if (lastClaim === today) {
    return NextResponse.json({ error: 'Already claimed today' }, { status: 429 });
  }

  const cardId = getRandomCardId();
  const cardInfo = CARD_COLLECTION.find(c => c.id === cardId);
  
  db.awardCard(guid, cardId, 'Daily Pack');
  db.updateDailyPackTimer(guid, today);

  return NextResponse.json({ card: cardInfo });
}
