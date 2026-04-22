import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const trophyCase = db.getTrophyCase(guid);
  // Return in the format the frontend expects (if it expects 'unlocked_cards')
  return NextResponse.json(trophyCase);
}
