import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpgradePage({ subscription, onUpgradeComplete }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/stripe/pricing').then(({ data }) => setPricing(data)).catch(() => {});
  }, []);

  async function handleCheckout(product) {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/stripe/checkout', { product });
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  const isPro = subscription?.plan === 'pro';

  return (
    <div className="upgrade-page">
      <div className="upgrade-header">
        <h1>⚾ Upgrade to Goin' Yard Pro</h1>
        <p className="upgrade-subtitle">
          An affordable, accessible secondary fantasy assistant to help you learn strategy while you play.
        </p>
      </div>

      <div className="pricing-grid">
        {/* Free Tier */}
        <div className={`pricing-card ${!isPro ? 'current' : ''}`}>
          <div className="pricing-badge">Free</div>
          <div className="pricing-price">$0</div>
          <div className="pricing-period">forever</div>
          <ul className="pricing-features">
            <li>✅ 1 league</li>
            <li>✅ 3 AI insights per day</li>
            <li>✅ All features accessible</li>
            <li>❌ Limited daily usage</li>
            <li>❌ Single league only</li>
          </ul>
          {!isPro && <div className="pricing-current-badge">Your Current Plan</div>}
        </div>

        {/* Pro Tier */}
        <div className={`pricing-card pro ${isPro ? 'current' : 'recommended'}`}>
          {!isPro && <div className="pricing-recommended">⭐ BEST VALUE</div>}
          <div className="pricing-badge pro">Pro Season Pass</div>
          <div className="pricing-price">{pricing?.season_pass?.label || '$15'}</div>
          <div className="pricing-period">one-time • through Sept 2026</div>
          <ul className="pricing-features">
            <li>✅ <strong>2 leagues</strong> included</li>
            <li>✅ <strong>Unlimited</strong> AI insights</li>
            <li>✅ All features — Start/Sit, Trades, Waivers, Game Plan</li>
            <li>✅ Priority analysis speed</li>
            <li>✅ Full season access</li>
          </ul>
          {isPro ? (
            <div className="pricing-current-badge">✅ Your Current Plan</div>
          ) : (
            <button
              className="pricing-cta"
              onClick={() => handleCheckout('season_pass')}
              disabled={loading}
            >
              {loading ? '⏳ Redirecting...' : `Get Season Pass — ${pricing?.season_pass?.label || '$15'}`}
            </button>
          )}
        </div>

        {/* Extra League */}
        {isPro && (
          <div className="pricing-card addon">
            <div className="pricing-badge addon">Add-On</div>
            <div className="pricing-price">$3</div>
            <div className="pricing-period">per extra league</div>
            <ul className="pricing-features">
              <li>✅ Add one more league</li>
              <li>✅ Same unlimited AI access</li>
              <li>✅ Up to 6 leagues total</li>
              <li>📊 Current: {subscription?.max_leagues || 2} leagues</li>
            </ul>
            <button
              className="pricing-cta addon"
              onClick={() => handleCheckout('extra_league')}
              disabled={loading || (subscription?.max_leagues || 2) >= 6}
            >
              {(subscription?.max_leagues || 2) >= 6
                ? 'Max Leagues Reached'
                : loading ? '⏳ Redirecting...' : 'Add Extra League — $3'}
            </button>
          </div>
        )}
      </div>

      <div className="upgrade-footer">
        <p>🔒 Secure payment powered by Stripe. Cancel anytime before purchase.</p>
        <p style={{ opacity: 0.5, fontSize: 12, marginTop: 8 }}>
          Season pass covers April–September 2026. Price auto-adjusts for mid-season signups.
        </p>
      </div>
    </div>
  );
}

// Compact upgrade prompt shown when free users hit the daily limit
export function UpgradePrompt({ usage, onUpgrade }) {
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt-icon">🧠</div>
      <h3>You've used {usage?.count || 3}/{usage?.limit || 3} free insights today</h3>
      <p>Upgrade to Pro for unlimited AI-powered analysis all season long.</p>
      <button className="pricing-cta compact" onClick={onUpgrade}>
        Upgrade Now →
      </button>
    </div>
  );
}
