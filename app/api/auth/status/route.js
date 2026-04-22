import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ authenticated: false });
  }

  const subscription = db.getSubscription(guid) || { plan: 'free' };

  return NextResponse.json({
    authenticated: true,
    yahoo_guid: guid,
    subscription,
  });
}
