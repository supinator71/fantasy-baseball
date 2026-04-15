/**
 * rateLimiter.js — Protects AI endpoints from runaway API usage
 * Uses in-memory per-IP counters with daily reset windows.
 */

// { ip: { count, windowStart } }
const counters = new Map();

const DAILY_LIMIT = 40;          // AI calls per IP per day
const WINDOW_MS   = 24 * 60 * 60 * 1000; // 24 hours

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Middleware factory — call with a label for logging.
 * Usage: router.post('/waiver', rateLimiter('waiver'), handler)
 */
function rateLimiter(endpoint = 'ai') {
  return (req, res, next) => {
    const ip  = getClientIp(req);
    const now = Date.now();
    let entry = counters.get(ip);

    // Reset window if expired
    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      entry = { count: 0, windowStart: now };
    }

    entry.count++;
    counters.set(ip, entry);

    const remaining = Math.max(0, DAILY_LIMIT - entry.count);
    const resetAt   = new Date(entry.windowStart + WINDOW_MS).toISOString();

    // Set informational headers always
    res.set('X-RateLimit-Limit',     String(DAILY_LIMIT));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset',     resetAt);

    if (entry.count > DAILY_LIMIT) {
      console.warn(`[RateLimit] ${ip} exceeded daily AI limit on /${endpoint} (${entry.count}/${DAILY_LIMIT})`);
      return res.status(429).json({
        error: `Daily AI call limit reached (${DAILY_LIMIT}/day). Resets at ${resetAt}. Upgrade for unlimited access.`,
        retryAfter: resetAt,
        limitReached: true,
      });
    }

    console.log(`[RateLimit] ${ip} → /${endpoint} (${entry.count}/${DAILY_LIMIT})`);
    next();
  };
}

// Expose counters for an admin stats endpoint
function getStats() {
  const now = Date.now();
  return [...counters.entries()].map(([ip, e]) => ({
    ip,
    callsToday: e.count,
    remaining: Math.max(0, DAILY_LIMIT - e.count),
    windowStart: new Date(e.windowStart).toISOString(),
    resetsAt: new Date(e.windowStart + WINDOW_MS).toISOString(),
    expired: now - e.windowStart >= WINDOW_MS,
  }));
}

module.exports = { rateLimiter, getStats };
