import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('yahoo_auth_token');
    
    // We get the listing ID and the instanceId of the card being offered
    const { listingId, offerInstanceId } = await request.json();

    if (!listingId || !offerInstanceId) {
      return NextResponse.json({ error: "Missing listing ID or offer card ID" }, { status: 400 });
    }

    let buyerGuid = "mock-user-123"; // Fallback for testing
    if (tokenCookie) {
      const parsed = JSON.parse(tokenCookie.value);
      buyerGuid = parsed.guid;
    }

    const listing = db.addTradeOffer(listingId, buyerGuid, offerInstanceId);

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
