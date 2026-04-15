const express = require('express');
const router = express.Router();
const db = require('../db/database');

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Season Pass + Extra League Checkout
// ─────────────────────────────────────────────────────────────────────────────

// Lazy Stripe initialization — won't crash if key isn't set yet
let _stripe = null;
function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured. Add it to your .env file.');
    }
    _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Season pricing — pro-rated based on month
function getSeasonPrice() {
  const month = new Date().getMonth(); // 0=Jan, 3=Apr, etc.
  if (month <= 3) return 2500;   // $25 — March/April (full season)
  if (month <= 5) return 2000;   // $20 — May/June
  if (month <= 6) return 1500;   // $15 — July
  return 1000;                   // $10 — Aug/Sept
}

function getSeasonPriceLabel() {
  const cents = getSeasonPrice();
  return `$${(cents / 100).toFixed(0)}`;
}

// ─── Create Checkout Session ────────────────────────────────────────────────
router.post('/checkout', async (req, res) => {
  const yahooGuid = req.session?.yahoo_guid;
  if (!yahooGuid) {
    return res.status(401).json({ error: 'Must be logged in via Yahoo to upgrade.' });
  }

  const { product } = req.body; // 'season_pass' or 'extra_league'
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  try {
    let lineItems = [];
    let metadata = { yahoo_guid: yahooGuid, product };

    if (product === 'season_pass') {
      const price = getSeasonPrice();
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: "Goin' Yard HQ Pro Season Pass (2026)",
            description: `Full season access through September 2026. 2 leagues, unlimited AI insights.`,
          },
          unit_amount: price,
        },
        quantity: 1,
      }];
    } else if (product === 'extra_league') {
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: "Goin' Yard HQ Extra League Add-On",
            description: 'Add one additional league to your Season Pass.',
          },
          unit_amount: 800, // $8
        },
        quantity: 1,
      }];
    } else {
      return res.status(400).json({ error: 'Invalid product type.' });
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/?upgrade=success`,
      cancel_url: `${baseUrl}/?upgrade=cancelled`,
      metadata,
      client_reference_id: yahooGuid,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Stripe] Checkout error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

// ─── Webhook (Stripe calls this after payment) ─────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const yahooGuid = session.metadata?.yahoo_guid || session.client_reference_id;
    const product = session.metadata?.product;

    if (!yahooGuid) {
      console.error('[Stripe] No yahoo_guid in webhook metadata');
      return res.status(400).send('Missing yahoo_guid');
    }

    console.log(`[Stripe] Payment confirmed for ${yahooGuid}, product: ${product}`);

    if (product === 'season_pass') {
      db.setSubscription(yahooGuid, {
        plan: 'pro',
        season: '2026',
        max_leagues: 2,
        extra_leagues: 0,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer,
        purchased_at: Date.now(),
        amount_paid: session.amount_total,
      });
    } else if (product === 'extra_league') {
      const existing = db.getSubscription(yahooGuid);
      if (existing && existing.plan === 'pro') {
        db.setSubscription(yahooGuid, {
          ...existing,
          extra_leagues: (existing.extra_leagues || 0) + 1,
          max_leagues: (existing.max_leagues || 2) + 1,
        });
      }
    }
  }

  res.json({ received: true });
});

// ─── Check subscription status ──────────────────────────────────────────────
router.get('/status', (req, res) => {
  const yahooGuid = req.session?.yahoo_guid;
  if (!yahooGuid) {
    return res.json({ plan: 'free', max_leagues: 1, season_price: getSeasonPriceLabel() });
  }

  const sub = db.getSubscription(yahooGuid);
  const aiUsage = db.getAiUsage(yahooGuid);

  res.json({
    plan: sub?.plan || 'free',
    max_leagues: sub?.max_leagues || 1,
    extra_leagues: sub?.extra_leagues || 0,
    season: sub?.season || null,
    ai_usage: aiUsage,
    season_price: getSeasonPriceLabel(),
    extra_league_price: '$8',
  });
});

// ─── Get pricing info (no auth required) ────────────────────────────────────
router.get('/pricing', (req, res) => {
  res.json({
    season_pass: {
      price: getSeasonPrice(),
      label: getSeasonPriceLabel(),
      description: 'Pro Season Pass — 2 leagues, unlimited AI',
    },
    extra_league: {
      price: 800,
      label: '$8',
      description: 'Add one extra league',
    },
    free_tier: {
      daily_ai_limit: 3,
      max_leagues: 1,
    }
  });
});

module.exports = router;
