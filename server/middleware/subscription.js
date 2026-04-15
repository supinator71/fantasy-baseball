const db = require('../db/database');

const FREE_DAILY_AI_LIMIT = 3;

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if user is Pro subscriber. Non-blocking — sets req.isPro and req.subscription.
 */
function loadSubscription(req, res, next) {
  const yahooGuid = req.session?.yahoo_guid;
  req.yahooGuid = yahooGuid;
  req.isPro = false;
  req.subscription = { plan: 'free', max_leagues: 1 };

  if (yahooGuid) {
    const sub = db.getSubscription(yahooGuid);
    if (sub && sub.plan === 'pro') {
      req.isPro = true;
      req.subscription = sub;
    }
  }
  next();
}

/**
 * Gate AI endpoints for free users: 3 calls/day max.
 * Pro users pass through unlimited.
 */
function checkAiLimit(req, res, next) {
  const yahooGuid = req.session?.yahoo_guid;
  
  // No GUID = can't track usage, let them through (backward compatibility)
  if (!yahooGuid) return next();

  // Pro users have unlimited access
  const sub = db.getSubscription(yahooGuid);
  if (sub && sub.plan === 'pro') return next();

  // Free tier: check daily limit
  const usage = db.getAiUsage(yahooGuid);
  if (usage.count >= FREE_DAILY_AI_LIMIT) {
    return res.status(402).json({
      error: 'upgrade_required',
      message: `You've used all ${FREE_DAILY_AI_LIMIT} free AI insights for today! Upgrade to Pro for unlimited access.`,
      usage: { count: usage.count, limit: FREE_DAILY_AI_LIMIT },
      upgrade: true
    });
  }

  // Increment usage counter
  db.incrementAiUsage(yahooGuid);
  
  // Add usage info to response headers so frontend can show counter
  const updated = db.getAiUsage(yahooGuid);
  res.set('X-AI-Usage', `${updated.count}/${FREE_DAILY_AI_LIMIT}`);
  
  next();
}

/**
 * Gate league access: free = 1 league, pro = max_leagues.
 * Expects league_key in req.body or req.query.
 */
function checkLeagueAccess(req, res, next) {
  // For now, don't block — just pass through.
  // League gating will be implemented when we add multi-league UI.
  next();
}

module.exports = { loadSubscription, checkAiLimit, checkLeagueAccess };
