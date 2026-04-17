const fs = require('fs');
const path = require('path');
const axios = require('axios');

const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

// Force an active token refresh
async function forceRefreshToken(req, refresh_token) {
  try {
    const credentials = Buffer.from(
      `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
    ).toString('base64');
    
    const response = await axios.post(YAHOO_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
    const expiresAt = Date.now() + expires_in * 1000;
    
    const guid = req?.session?.yahoo_guid;
    if (req && req.session) {
      req.session.tokens = { access_token, refresh_token: new_refresh_token, expires_at: expiresAt };
    }
    if (guid) {
      db.setToken(guid, { access_token, refresh_token: new_refresh_token, expires_at: expiresAt });
    }
    
    return access_token;
  } catch (err) {
    console.error('[Yahoo OAuth] CRITICAL error forcefully refreshing token', err.message);
    throw new Error('Failed to refresh token');
  }
}

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'data.json');

const DEFAULT_DATA = {
  tokens: {},            // map: { [yahoo_guid]: { access_token, refresh_token, expires_at } }
  league_settings: {},   // map: { [league_key]: settingsObj }
  draft_board: [],
  my_roster: [],
  notes: [],
  subscriptions: {},     // map: { [yahoo_guid]: { plan, season, max_leagues, ... } }
  user_profiles: {},     // map: { [yahoo_guid]: { name, email, created_at } }
  trophy_cases: {},      // map: { [yahoo_guid]: { unlocked_cards: [{ id, unlocked_at, reason }] } }
  ai_usage: {}           // map: { [yahoo_guid]: { count, date } }
};

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data.trophy_cases) data.trophy_cases = {};
      if (!data.ai_usage) data.ai_usage = {};
      return data;
    }
  } catch {}
  return { ...DEFAULT_DATA };
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Simple synchronous DB interface mimicking SQLite prepare/run/get/all
const db = {
  prepare(query) {
    return {
      run(...args) {
        const data = load();
        // League settings — stored per league_key
        if (query.includes('INSERT OR REPLACE INTO league_settings')) {
          if (!data.league_settings || typeof data.league_settings !== 'object' || Array.isArray(data.league_settings)) {
            data.league_settings = {};
          }
          const leagueKey = args[0];
          data.league_settings[leagueKey] = {
            league_key: args[0], league_name: args[1], num_teams: args[2],
            scoring_type: args[3], draft_type: args[4], draft_position: args[5],
            roster_slots: args[6], stat_categories: args[7], updated_at: args[8]
          };
          save(data);
        }
        // Draft board
        else if (query.includes('INSERT OR IGNORE INTO draft_board')) {
          const exists = data.draft_board.find(p => p.player_key === args[0]);
          if (!exists) {
            data.draft_board.push({ player_key: args[0], player_name: args[1], position: args[2], team: args[3], adp: args[4], drafted: 0, drafted_by: null, draft_round: null, draft_pick: null });
          }
          save(data);
        } else if (query.includes('UPDATE draft_board SET drafted = 1')) {
          const p = data.draft_board.find(p => p.player_key === args[3]);
          if (p) { p.drafted = 1; p.drafted_by = args[0]; p.draft_round = args[1]; p.draft_pick = args[2]; }
          save(data);
        } else if (query.includes('UPDATE draft_board SET drafted = 0')) {
          const p = data.draft_board.find(p => p.player_key === args[0]);
          if (p) { p.drafted = 0; p.drafted_by = null; p.draft_round = null; p.draft_pick = null; }
          save(data);
        } else if (query.includes('DELETE FROM draft_board')) {
          data.draft_board = [];
          save(data);
        }
      },
      get(...args) {
        const data = load();
        if (query.includes('FROM league_settings')) {
          // Support lookup by league_key arg, or fall back to most recently updated
          const map = data.league_settings;
          if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
          const leagueKey = args[0];
          if (leagueKey && map[leagueKey]) return map[leagueKey];
          // Fallback: return the most recently updated entry
          const entries = Object.values(map);
          if (!entries.length) return null;
          return entries.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))[0];
        }
        if (query.includes('COUNT(*) as count FROM draft_board WHERE drafted = 1')) return { count: data.draft_board.filter(p => p.drafted).length };
        if (query.includes('COUNT(*) as count FROM draft_board WHERE drafted_by')) return { count: data.draft_board.filter(p => p.drafted_by === 'me').length };
        if (query.includes('COUNT(*) as count FROM draft_board')) return { count: data.draft_board.length };
        return null;
      },
      all(...args) {
        const data = load();
        if (query.includes('FROM draft_board WHERE drafted = 0')) {
          let results = data.draft_board.filter(p => !p.drafted);
          if (query.includes('position LIKE')) {
            const match = query.match(/position LIKE '%(.+?)%'/);
            if (match) results = results.filter(p => p.position && p.position.includes(match[1]));
          }
          return results.sort((a, b) => (a.adp || 0) - (b.adp || 0));
        }
        if (query.includes("drafted_by = 'me'")) {
          return data.draft_board.filter(p => p.drafted_by === 'me').sort((a, b) => (a.draft_pick || 0) - (b.draft_pick || 0));
        }
        if (query.includes('FROM draft_board')) {
          return data.draft_board.sort((a, b) => (a.adp || 0) - (b.adp || 0));
        }
        return [];
      }
    };
  },
  transaction(fn) {
    return function(...args) {
      return fn(...args);
    };
  },
  exec() {},

  // ── Subscription helpers ─────────────────────────────────────────────
  async getAccessToken(req) {
    const guid = req?.session?.yahoo_guid;
    if (!guid) throw new Error('Not authenticated (missing session guid)');
    
    const row = db.getToken(guid);
    if (!row) throw new Error('Not authenticated with Yahoo');

    // Auto-refresh if naturally expired
    if (Date.now() > row.expires_at - 60000) {
      console.log('[Yahoo OAuth] Token naturally expired, auto-refreshing...');
      return await forceRefreshToken(req, row.refresh_token);
    }
    return row.access_token;
  },

  getToken(yahooGuid) {
    if (!yahooGuid) return null;
    const data = load();
    return data.tokens ? data.tokens[yahooGuid] : null;
  },

  setToken(yahooGuid, tokenData) {
    if (!yahooGuid) return;
    const data = load();
    if (!data.tokens) data.tokens = {};
    data.tokens[yahooGuid] = tokenData;
    save(data);
  },

  deleteToken(yahooGuid) {
    if (!yahooGuid) return;
    const data = load();
    if (data.tokens && data.tokens[yahooGuid]) {
      delete data.tokens[yahooGuid];
      save(data);
    }
  },

  getSubscription(yahooGuid) {
    const data = load();
    if (!data.subscriptions) data.subscriptions = {};
    return data.subscriptions[yahooGuid] || null;
  },

  setSubscription(yahooGuid, sub) {
    const data = load();
    if (!data.subscriptions) data.subscriptions = {};
    data.subscriptions[yahooGuid] = { ...sub, updated_at: Date.now() };
    save(data);
  },

  setUserProfile(yahooGuid, profile) {
    const data = load();
    if (!data.user_profiles) data.user_profiles = {};
    data.user_profiles[yahooGuid] = { ...profile, updated_at: Date.now() };
    save(data);
  },

  getUserProfile(yahooGuid) {
    const data = load();
    return data.user_profiles?.[yahooGuid] || null;
  },

  // AI usage tracking for free tier (3 calls/day)
  getAiUsage(yahooGuid) {
    const data = load();
    if (!data.ai_usage) data.ai_usage = {};
    const usage = data.ai_usage[yahooGuid];
    if (!usage) return { count: 0, date: null };
    // Reset if it's a new day
    const today = new Date().toISOString().slice(0, 10);
    if (usage.date !== today) return { count: 0, date: today };
    return usage;
  },

  incrementAiUsage(yahooGuid) {
    const data = load();
    if (!data.ai_usage) data.ai_usage = {};
    const today = new Date().toISOString().slice(0, 10);
    const current = data.ai_usage[yahooGuid];
    if (!current || current.date !== today) {
      data.ai_usage[yahooGuid] = { count: 1, date: today };
    } else {
      data.ai_usage[yahooGuid].count++;
    }
    save(data);
    return data.ai_usage[yahooGuid];
  },

  // ── Gamification / Trophy Case ───────────────────────────────────────
  getTrophyCase(yahooGuid) {
    if (!yahooGuid) return { unlocked_cards: [], last_daily_pack: null };
    const data = load();
    if (!data.trophy_cases) data.trophy_cases = {};
    const tc = data.trophy_cases[yahooGuid];
    return tc || { unlocked_cards: [], last_daily_pack: null };
  },

  awardCard(yahooGuid, cardId, reason) {
    if (!yahooGuid) return false;
    const data = load();
    if (!data.trophy_cases) data.trophy_cases = {};
    
    let tc = data.trophy_cases[yahooGuid];
    if (!tc) tc = { unlocked_cards: [], last_daily_pack: null };
    
    // Check if already unlocked to prevent duplicates of unique cards, though duplicate trading cards is a real thing. 
    // We will allow duplicates because pulling dupes is part of card collecting!
    tc.unlocked_cards.push({
      id: cardId,
      unlocked_at: Date.now(),
      reason: reason || 'Random Drop'
    });
    
    data.trophy_cases[yahooGuid] = tc;
    save(data);
    return true;
  },

  updateDailyPackTimer(yahooGuid) {
    if (!yahooGuid) return;
    const data = load();
    if (!data.trophy_cases) data.trophy_cases = {};
    let tc = data.trophy_cases[yahooGuid];
    if (!tc) tc = { unlocked_cards: [], last_daily_pack: null };
    tc.last_daily_pack = Date.now();
    data.trophy_cases[yahooGuid] = tc;
    save(data);
  }
};

module.exports = db;
