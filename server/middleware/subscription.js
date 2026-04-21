const db = require('../services/database');

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
  
  if (!yahooGuid) return next();

  const sub = db.getSubscription(yahooGuid);
  if (sub && sub.plan === 'pro') return next();

  const usage = db.getAiUsage(yahooGuid);
  if (usage.count >= FREE_DAILY_AI_LIMIT) {
    return res.status(402).json({
      error: 'upgrade_required',
      message: `You've used all ${FREE_DAILY_AI_LIMIT} free AI insights for today! Upgrade to Pro for unlimited access.`,
      usage: { count: usage.count, limit: FREE_DAILY_AI_LIMIT },
      upgrade: true
    });
  }

  db.incrementAiUsage(yahooGuid);
  
  const updated = db.getAiUsage(yahooGuid);
  res.set('X-AI-Usage', `${updated.count}/${FREE_DAILY_AI_LIMIT}`);
  
  next();
}

/**
 * PRO ONLY: Gate the AI Question Box (follow-up) feature.
 */
function checkQuestionAccess(req, res, next) {
  const yahooGuid = req.session?.yahoo_guid;
  const sub = db.getSubscription(yahooGuid);
  
  if (sub && sub.plan === 'pro') return next();
  
  res.status(403).json({ 
    error: 'pro_feature', 
    message: 'The AI Question Box is a Pro Season Pass feature. Upgrade to unlock interactive follow-up analysis!' 
  });
}

/**
 * Gate league access: free = 1 league, pro = max_leagues.
 */
function checkLeagueAccess(req, res, next) {
  const yahooGuid = req.session?.yahoo_guid;
  if (!yahooGuid) return next();

  const sub = db.getSubscription(yahooGuid) || { plan: 'free', max_leagues: 1 };
  const leagueKey = req.body?.league_key || req.query?.league_key;
  
  if (!leagueKey) return next();

  // If user has only 1 league access (Free tier), only allow them to use their "primary" league.
  // For simplicity, we track how many unique leagues they've used.
  const leaguesUsed = db.getLeaguesUsed(yahooGuid);
  
  if (sub.plan === 'free' && leaguesUsed.length >= 1 && !leaguesUsed.includes(leagueKey)) {
    return res.status(403).json({
      error: 'league_limit_reached',
      message: 'Free tier is limited to 1 league. Upgrade to Pro to manage multiple teams!',
      upgrade: true
    });
  }

  // If Pro, check max_leagues
  if (sub.plan === 'pro' && leaguesUsed.length >= sub.max_leagues && !leaguesUsed.includes(leagueKey)) {
    return res.status(403).json({
      error: 'league_limit_reached',
      message: `Your Season Pass covers ${sub.max_leagues} leagues. Add an 'Extra League' slot to manage more!`,
      upgrade: true
    });
  }

  // Track the league being used
  db.trackLeagueUse(yahooGuid, leagueKey);
  next();
}

module.exports = { loadSubscription, checkAiLimit, checkQuestionAccess, checkLeagueAccess };
