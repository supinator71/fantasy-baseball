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
    const { instanceId } = await request.json();
    if (!instanceId) {
      return NextResponse.json({ error: 'Missing instanceId parameter' }, { status: 400 });
    }

    const result = db.upgradeCardToCyborg(guid, instanceId);

    return NextResponse.json({
      success: true,
      card: result.upgradedCard,
      tokens: result.tokens
    });
  } catch (error) {
    console.error('Card upgrade API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process card upgrade' }, { status: 500 });
  }
}
