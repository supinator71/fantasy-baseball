import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { generateInfiniteCard } from './cardGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

// Helper to get YYYY-MM-DD string in Pacific Time
function getPTDateString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

// Force an active token refresh
export async function forceRefreshToken(guid, refresh_token) {
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
    
    const tokenData = { access_token, refresh_token: new_refresh_token, expires_at: expiresAt };
    if (guid) {
      db.setToken(guid, tokenData);
    }
    
    return access_token;
  } catch (err) {
    console.error('[Yahoo OAuth] CRITICAL error forcefully refreshing token', err.message);
    throw new Error('Failed to refresh token');
  }
}

// Railway: use mounted volume path if set; fall back to /tmp (always writable in containers)
function resolveDbDir() {
  const candidates = [
    process.env.RAILWAY_VOLUME_MOUNT_PATH,
    process.env.DATA_DIR,
    path.join(process.cwd(), 'db'),
    '/tmp/goinyard-db',
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      // Verify we can actually write here
      fs.accessSync(dir, fs.constants.W_OK);
      console.log(`[DB] Using data directory: ${dir}`);
      return dir;
    } catch {
      console.warn(`[DB] Cannot write to ${dir}, trying next...`);
    }
  }
  throw new Error('[DB] No writable data directory found');
}

const DB_DIR  = resolveDbDir();
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
  ai_usage: {},           // map: { [yahoo_guid]: { count, date } }
  leagues_used: {},       // map: { [yahoo_guid]: [league_key1, league_key2] }
  feedback: [],           // [{ yahoo_guid, text, created_at }]
  global_stats: {         // Track global metrics
    cards_issued: {}      // map: { [card_id]: count }
  },
  trade_block: [],
  analysis_cache: {},    // map: { [guid:leagueKey:YYYY-MM-DD]: { analysis, scoredWaiver, lineupRecs, model, cached_at } }
  force_refresh_counts: {} // map: { [guid:YYYY-MM-DD]: count } — tracks daily Haiku force-refreshes per user
};

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data.tokens) data.tokens = {};
      if (!data.league_settings) data.league_settings = {};
      if (!data.draft_board) data.draft_board = [];
      if (!data.subscriptions) data.subscriptions = {};
      if (!data.user_profiles) data.user_profiles = {};
      if (!data.trophy_cases) data.trophy_cases = {};
      if (!data.ai_usage) data.ai_usage = {};
      if (!data.leagues_used) data.leagues_used = {};
      if (!data.feedback) data.feedback = [];
      if (!data.global_stats) data.global_stats = { cards_issued: {} };
      if (!data.global_stats.cards_issued) data.global_stats.cards_issued = {};
      if (!data.analysis_cache) data.analysis_cache = {};
      if (!data.force_refresh_counts) data.force_refresh_counts = {};
      return data;
    }
  } catch {}
  return { ...DEFAULT_DATA };
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  prepare(query) {
    return {
      run(...args) {
        const data = load();
        if (query.includes('INSERT OR REPLACE INTO league_settings')) {
          const leagueKey = args[0];
          const guid = args[9]; // We'll pass the guid as the last argument
          if (!data.league_settings[guid]) data.league_settings[guid] = {};
          data.league_settings[guid][leagueKey] = {
            league_key: args[0], league_name: args[1], num_teams: args[2],
            scoring_type: args[3], draft_type: args[4], draft_position: args[5],
            roster_slots: args[6], stat_categories: args[7], updated_at: args[8]
          };
          save(data);
        } else if (query.includes('INSERT OR IGNORE INTO draft_board')) {
          const exists = data.draft_board.find(p => p.player_key === args[0]);
          if (!exists) {
            data.draft_board.push({ player_key: args[0], player_name: args[1], position: args[2], team: args[3], adp: args[4], drafted: 0 });
          }
          save(data);
        } else if (query.includes('UPDATE draft_board SET drafted = 1')) {
          const p = data.draft_board.find(p => p.player_key === args[3]);
          if (p) { p.drafted = 1; p.drafted_by = args[0]; p.draft_round = args[1]; p.draft_pick = args[2]; }
          save(data);
        } else if (query.includes('UPDATE draft_board SET drafted = 0')) {
          const p = data.draft_board.find(p => p.player_key === args[0]);
          if (p) { p.drafted = 0; p.drafted_by = null; }
          save(data);
        } else if (query.includes('DELETE FROM draft_board')) {
          data.draft_board = [];
          save(data);
        }
      },
      get(...args) {
        const data = load();
        if (query.includes('FROM league_settings')) {
          const leagueKey = args[0];
          const guid = args[1];
          return (data.league_settings[guid] && data.league_settings[guid][leagueKey]) || null;
        }
        if (query.includes('COUNT(*) as count FROM draft_board')) {
          return { count: data.draft_board.length };
        }
        return null;
      },
      all(...args) {
        const data = load();
        if (query.includes('FROM draft_board WHERE drafted = 0')) {
          return data.draft_board.filter(p => !p.drafted).sort((a,b) => a.adp - b.adp);
        }
        return [];
      }
    };
  },
  transaction(fn) { return fn; },
  exec() {},

  async getAccessToken(guid) {
    if (!guid) throw new Error('Not authenticated');
    const row = db.getToken(guid);
    if (!row) throw new Error('No token found');
    if (Date.now() > row.expires_at - 60000) return await forceRefreshToken(guid, row.refresh_token);
    return row.access_token;
  },
  getToken(yahooGuid) { return load().tokens[yahooGuid] || null; },
  getAnyGuid() {
    const guids = Object.keys(load().tokens);
    return guids.length ? guids[0] : null;
  },
  setToken(yahooGuid, tokenData) {
    const data = load();
    data.tokens[yahooGuid] = tokenData;
    save(data);
  },
  deleteToken(yahooGuid) {
    const data = load();
    delete data.tokens[yahooGuid];
    save(data);
  },
  getSubscription(yahooGuid) { return load().subscriptions[yahooGuid] || null; },
  setSubscription(yahooGuid, sub) {
    const data = load();
    data.subscriptions[yahooGuid] = { ...sub, updated_at: Date.now() };
    save(data);
  },
  setUserProfile(yahooGuid, profile) {
    const data = load();
    data.user_profiles[yahooGuid] = { ...profile, updated_at: Date.now() };
    save(data);
  },
  getUserProfile(yahooGuid) { return load().user_profiles[yahooGuid] || null; },
  getAiUsage(yahooGuid) {
    const data = load();
    const today = getPTDateString();
    const usage = data.ai_usage[yahooGuid];
    if (!usage || usage.date !== today) return { count: 0, date: today };
    return usage;
  },
  incrementAiUsage(yahooGuid) {
    const data = load();
    const today = getPTDateString();
    const current = data.ai_usage[yahooGuid];
    if (!current || current.date !== today) data.ai_usage[yahooGuid] = { count: 1, date: today };
    else data.ai_usage[yahooGuid].count++;
    save(data);
  },
  getTrophyCase(yahooGuid) {
    const data = load();
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    if (!tc.tokens) tc.tokens = {};
    tc.tokens = {
      premium_hobby: tc.tokens.premium_hobby || 0,
      titan_drop: tc.tokens.titan_drop || 0,
      pitching_precision: tc.tokens.pitching_precision || 0,
      slugger_shards: tc.tokens.slugger_shards || 0,
      generals_credits: tc.tokens.generals_credits || 0,
      galactic_tokens: tc.tokens.galactic_tokens || 0
    };
    return tc;
  },
  awardToken(yahooGuid, tokenType, amount = 1) {
    const data = load();
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    if (!tc.tokens) tc.tokens = {};
    tc.tokens = {
      premium_hobby: tc.tokens.premium_hobby || 0,
      titan_drop: tc.tokens.titan_drop || 0,
      pitching_precision: tc.tokens.pitching_precision || 0,
      slugger_shards: tc.tokens.slugger_shards || 0,
      generals_credits: tc.tokens.generals_credits || 0,
      galactic_tokens: tc.tokens.galactic_tokens || 0
    };
    tc.tokens[tokenType] = (tc.tokens[tokenType] || 0) + amount;
    data.trophy_cases[yahooGuid] = tc;
    save(data);
    return tc.tokens;
  },
  deductToken(yahooGuid, tokenType, amount = 1) {
    const data = load();
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    if (!tc.tokens) tc.tokens = {};
    tc.tokens = {
      premium_hobby: tc.tokens.premium_hobby || 0,
      titan_drop: tc.tokens.titan_drop || 0,
      pitching_precision: tc.tokens.pitching_precision || 0,
      slugger_shards: tc.tokens.slugger_shards || 0,
      generals_credits: tc.tokens.generals_credits || 0,
      galactic_tokens: tc.tokens.galactic_tokens || 0
    };
    if ((tc.tokens[tokenType] || 0) < amount) {
      throw new Error(`Insufficient tokens for ${tokenType}`);
    }
    tc.tokens[tokenType] -= amount;
    data.trophy_cases[yahooGuid] = tc;
    save(data);
    return tc.tokens;
  },
  upgradeCardToCyborg(yahooGuid, instanceId) {
    const data = load();
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    if (!tc.tokens) tc.tokens = {};
    tc.tokens = {
      premium_hobby: tc.tokens.premium_hobby || 0,
      titan_drop: tc.tokens.titan_drop || 0,
      pitching_precision: tc.tokens.pitching_precision || 0,
      slugger_shards: tc.tokens.slugger_shards || 0,
      generals_credits: tc.tokens.generals_credits || 0,
      galactic_tokens: tc.tokens.galactic_tokens || 0
    };

    const cardIndex = tc.unlocked_cards.findIndex(c => c.id === instanceId);
    if (cardIndex === -1) {
      throw new Error("Card not found in your collection");
    }

    const card = tc.unlocked_cards[cardIndex];
    if (card.is_cyborg) {
      throw new Error("Card is already Cyborg Enhanced");
    }
    if (card.rarity === 'legendary') {
      throw new Error("Legendary cards cannot be further upgraded");
    }

    // Determine type: Pitcher vs Hitter
    const position = String(card.position || '').toUpperCase();
    const isPitcher = position.includes('SP') || position.includes('RP') || position.includes('P');
    const tokenType = isPitcher ? 'pitching_precision' : 'slugger_shards';

    if ((tc.tokens[tokenType] || 0) < 20) {
      const needed = 20 - (tc.tokens[tokenType] || 0);
      const tokenName = isPitcher ? 'Pitching Precision Tokens' : 'Slugger Shards';
      throw new Error(`Insufficient funds. You need ${needed} more ${tokenName} to upgrade.`);
    }

    // Deduct tokens and upgrade card
    tc.tokens[tokenType] -= 20;
    card.is_cyborg = true;
    card.name = `[CYBORG] ${card.name}`;

    data.trophy_cases[yahooGuid] = tc;
    save(data);

    return { upgradedCard: card, tokens: tc.tokens };
  },
  async awardCard(yahooGuid, cardId, reason, forceRarity = null, forcePositions = null) {
    const data = load();
    
    // 1. Generate or fetch card definition
    const isFree = String(reason || '').includes('daily_pack') || String(reason || '').includes('core_pack');
    let cardDef;
    if (cardId === 'random_dynamic') {
      cardDef = await generateInfiniteCard(forceRarity, forcePositions, isFree);
    } else {
      // Handle legacy/static IDs if needed (fallback to random if not found)
      cardDef = await generateInfiniteCard(forceRarity, forcePositions, isFree);
    }

    // 2. Increment global serial count for this card identity
    const idToTrack = cardDef.playerName || cardDef.id;
    if (!data.global_stats.cards_issued[idToTrack]) data.global_stats.cards_issued[idToTrack] = 0;
    data.global_stats.cards_issued[idToTrack]++;
    const serialNumber = data.global_stats.cards_issued[idToTrack];

    // 3. Generate hobby numbers
    const cardNumber = Math.floor(Math.random() * 999) + 1;
    // To prevent duplicate serials, we assign sequentially based on the global count.
    const serialPosition = serialNumber;

    // 4. Save to user's trophy case
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    const stampedCard = { 
      ...cardDef,
      serial: serialNumber,
      serialPosition: serialPosition,
      cardNumber: cardNumber,
      unlocked_at: Date.now(), 
      reason 
    };

    tc.unlocked_cards.push(stampedCard);
    
    data.trophy_cases[yahooGuid] = tc;
    save(data);
    
    return stampedCard;
  },
  updateDailyPackTimer(yahooGuid, dateStr) {
    const data = load();
    let tc = data.trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null };
    tc.last_daily_pack = dateStr || getPTDateString();
    data.trophy_cases[yahooGuid] = tc;
    save(data);
  },
  
  // ── Trade Block ────────
  getTradeBlockListings() {
    const data = load();
    return data.trade_block || [];
  },
  postToTradeBlock(yahooGuid, instanceId, seeking) {
    const data = load();
    if (!data.trade_block) data.trade_block = [];
    
    // Check if card is already listed
    if (data.trade_block.find(t => t.instanceId === instanceId)) {
      throw new Error("Card is already on the trade block");
    }

    const listing = {
      id: `tb_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      user: yahooGuid,
      instanceId,
      seeking,
      timestamp: Date.now(),
      offers: []
    };
    data.trade_block.push(listing);
    save(data);
    return listing;
  },
  removeTradeListing(listingId, yahooGuid) {
    const data = load();
    if (!data.trade_block) return false;
    const initialLen = data.trade_block.length;
    data.trade_block = data.trade_block.filter(t => !(t.id === listingId && t.user === yahooGuid));
    if (data.trade_block.length !== initialLen) {
      save(data);
      return true;
    }
    return false;
  },
  addTradeOffer(listingId, buyerGuid, offerInstanceId) {
    const data = load();
    if (!data.trade_block) return null;
    const listingIndex = data.trade_block.findIndex(t => t.id === listingId);
    if (listingIndex === -1) throw new Error("Trade listing not found or already closed");
    const listing = data.trade_block[listingIndex];
    if (listing.user === buyerGuid) throw new Error("You cannot make an offer on your own listing");
    
    const buyerVault = data.trophy_cases[buyerGuid]?.unlocked_cards || [];
    const offerCard = buyerVault.find(c => c.instanceId === offerInstanceId);
    if (!offerCard) throw new Error("You do not own the card you are trying to offer");
    
    if (!listing.offers) listing.offers = [];
    listing.offers.push({
      offerId: `off_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      buyerGuid,
      offerInstanceId,
      timestamp: Date.now()
    });
    
    data.trade_block[listingIndex] = listing;
    save(data);
    return listing;
  },
  updateShowcasePrivacy(yahooGuid, isPublic) {
    const data = load();
    let profile = data.user_profiles[yahooGuid] || {};
    profile.public_showcase = isPublic;
    data.user_profiles[yahooGuid] = profile;
    save(data);
  },
  getPublicShowcases() {
    const data = load();
    const publicUsers = [];
    for (const [guid, profile] of Object.entries(data.user_profiles || {})) {
      if (profile.public_showcase) {
        const tc = data.trophy_cases[guid];
        publicUsers.push({
          guid,
          username: profile.team_name || 'Anonymous Manager',
          cardCount: tc?.unlocked_cards?.length || 0,
          legendaryCount: tc?.unlocked_cards?.filter(c => c.rarity === 'legendary').length || 0
        });
      }
    }
    return publicUsers;
  },
  saveLeagueSettings(yahooGuid, leagueKey, settings) {
    const data = load();
    if (!data.league_settings) data.league_settings = {};
    if (!data.league_settings[yahooGuid]) data.league_settings[yahooGuid] = {};
    data.league_settings[yahooGuid][leagueKey] = { ...settings, updated_at: Date.now() };
    save(data);
  },
  getLeagueSettings(yahooGuid, leagueKey) {
    const data = load();
    return data.league_settings?.[yahooGuid]?.[leagueKey] || null;
  },
  getLeaguesUsed(yahooGuid) { return load().leagues_used[yahooGuid] || []; },
  trackLeagueUse(yahooGuid, leagueKey) {
    const data = load();
    let used = data.leagues_used[yahooGuid] || [];
    if (!used.includes(leagueKey)) {
      used.push(leagueKey);
      data.leagues_used[yahooGuid] = used;
      save(data);
    }
  },
  addFeedback(yahooGuid, text) {
    const data = load();
    data.feedback.push({ yahoo_guid: yahooGuid || 'anonymous', text, created_at: Date.now() });
    save(data);
  },
  getAllFeedback() {
    return load().feedback || [];
  },

  // ── Analysis cache — one Sonnet/Haiku call per league per day ──────────────
  getAnalysisCache(yahooGuid, leagueKey) {
    const today = getPTDateString(); // YYYY-MM-DD in PT
    const key   = `${yahooGuid}:${leagueKey}:${today}`;
    const data  = load();
    return data.analysis_cache?.[key] || null;
  },
  setAnalysisCache(yahooGuid, leagueKey, payload) {
    const today = getPTDateString();
    const key   = `${yahooGuid}:${leagueKey}:${today}`;
    const data  = load();
    if (!data.analysis_cache) data.analysis_cache = {};
    // Prune entries older than 3 days to keep data.json lean
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    for (const k of Object.keys(data.analysis_cache)) {
      const datePart = k.split(':')[2];
      if (datePart && datePart < cutoff) delete data.analysis_cache[k];
    }
    data.analysis_cache[key] = { ...payload, cached_at: Date.now() };
    save(data);
  },

  // ── Force-refresh rate limiting — max Haiku calls per user per day ────────
  DAILY_FORCE_LIMIT: 1, // Baseline: 1 Haiku force-refresh per user per day (100% free)

  getForceRefreshCount(yahooGuid) {
    const today = getPTDateString();
    const key   = `${yahooGuid}:${today}`;
    return load().force_refresh_counts?.[key] || 0;
  },

  incrementForceRefreshCount(yahooGuid) {
    const today = getPTDateString();
    const key   = `${yahooGuid}:${today}`;
    const data  = load();
    if (!data.force_refresh_counts) data.force_refresh_counts = {};
    // Prune keys older than 2 days
    const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    for (const k of Object.keys(data.force_refresh_counts)) {
      const datePart = k.split(':')[1];
      if (datePart && datePart < cutoff) delete data.force_refresh_counts[k];
    }
    data.force_refresh_counts[key] = (data.force_refresh_counts[key] || 0) + 1;
    save(data);
    return data.force_refresh_counts[key];
  },
};




