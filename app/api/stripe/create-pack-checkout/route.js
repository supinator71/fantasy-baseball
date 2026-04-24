import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/session';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(request) {
  const session = await getSession();
  const guid = session?.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { packId, packName, priceId } = await request.json();

    // Map packId to Stripe Price IDs (these should be set in env vars, using placeholders for now)
    const priceMap = {
      'core_pack': process.env.STRIPE_PRICE_CORE || 'price_123_core',
      'premium_hobby': process.env.STRIPE_PRICE_PREMIUM || 'price_456_premium',
      'titan_drop': process.env.STRIPE_PRICE_TITAN || 'price_789_titan'
    };

    const stripePriceId = priceMap[packId] || priceId;

    if (!stripePriceId) {
       return NextResponse.json({ error: 'Invalid pack selection' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store?success=true&packId=${packId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store?canceled=true`,
      client_reference_id: guid,
      metadata: {
        packId: packId,
        guid: guid
      }
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
