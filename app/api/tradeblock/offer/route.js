import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/database');

export async function POST(request) {
  try {
    const cookieStore = cookies();
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

    const data = db.load();
    const tradeBlock = data.trade_block || [];
    
    // Find the listing
    const listingIndex = tradeBlock.findIndex(t => t.id === listingId);
    if (listingIndex === -1) {
      return NextResponse.json({ error: "Trade listing not found or already closed" }, { status: 404 });
    }

    const listing = tradeBlock[listingIndex];

    // Ensure users can't offer on their own listings
    if (listing.user === buyerGuid) {
      return NextResponse.json({ error: "You cannot make an offer on your own listing" }, { status: 400 });
    }

    // Ensure the offer card exists in the buyer's vault
    const buyerVault = data.trophy_cases[buyerGuid]?.unlocked_cards || [];
    const offerCard = buyerVault.find(c => c.instanceId === offerInstanceId);
    
    if (!offerCard) {
      return NextResponse.json({ error: "You do not own the card you are trying to offer" }, { status: 400 });
    }

    // Add the offer to the listing
    if (!listing.offers) listing.offers = [];
    listing.offers.push({
      offerId: `off_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      buyerGuid: buyerGuid,
      offerInstanceId: offerInstanceId,
      timestamp: Date.now()
    });

    tradeBlock[listingIndex] = listing;
    data.trade_block = tradeBlock;
    
    db.save(data);

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
