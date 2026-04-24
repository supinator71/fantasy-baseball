import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';

export async function GET(request) {
  try {
    const listings = db.getTradeBlockListings();
    
    // We need to resolve the 'instanceId' back to the actual card data so the UI can render it
    // Wait, the listing just has instanceId and user guid.
    // For a global market, we need to inject the full card object from that user's trophy case!
    const resolvedListings = listings.map(listing => {
      const sellerCase = db.getTrophyCase(listing.user);
      const card = sellerCase?.unlocked_cards?.find(c => c.instanceId === listing.instanceId);
      const sellerProfile = db.getUserProfile(listing.user) || {};
      return {
        ...listing,
        card: card || null,
        username: sellerProfile.team_name || 'Anonymous Collector'
      };
    }).filter(l => l.card !== null);

    return NextResponse.json({ listings: resolvedListings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('yahoo_auth_token');
    
    if (!tokenCookie) {
      // TEMP FOR TESTING
      const { instanceId, seeking } = await request.json();
      const listing = db.postToTradeBlock("mock-user-123", instanceId, seeking);
      return NextResponse.json({ success: true, listing });
    }

    const { guid } = JSON.parse(tokenCookie.value);
    const { instanceId, seeking } = await request.json();
    
    if (!instanceId || !seeking) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = db.postToTradeBlock(guid, instanceId, seeking);
    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
