import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/database';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { guid, packId } = session.metadata || {};

    if (packId && guid) {
      console.log(`[Stripe Webhook] Fulfillment for ${guid} (Pack: ${packId})`);
      
      const packConfig = {
        'core_pack': { count: 3, forceRarity: null },
        'premium_hobby': { count: 5, forceRarity: 'rare' },
        'titan_drop': { count: 10, forceRarity: 'legendary' }
      };
      
      const config = packConfig[packId];
      if (config) {
        // We actually do the db fulfillment here. 
        // But since we also have a "success=true" flow on the frontend (for instant pack opening animation),
        // we need to make sure we don't double-award.
        // For the MVP, we can just rely on the frontend `/api/store/buy-pack` if webhook is too complex to sync with animations.
        // OR we just use the webhook to record it and the frontend to claim it.
        // For now, let's keep it simple: the frontend handles the claim on return to show the animation.
        // This webhook could be used for email receipts or background logging.
      }
    }
  }

  return NextResponse.json({ received: true });
}
