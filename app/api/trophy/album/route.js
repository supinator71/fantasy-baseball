import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';
import { CARD_COLLECTION } from '@/lib/constants';

export async function GET() {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const trophyCase = db.getTrophyCase(guid);
  const serverToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  
  return NextResponse.json({
    ...trophyCase,
    all_cards: CARD_COLLECTION,
    server_today: serverToday,
  });
}
