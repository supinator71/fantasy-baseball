import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { generateInfiniteCard } from './cardGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';

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

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
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
  }
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
    const today = new Date().toISOString().slice(0, 10);
    const usage = data.ai_usage[yahooGuid];
    if (!usage || usage.date !== today) return { count: 0, date: today };
    return usage;
  },
  incrementAiUsage(yahooGuid) {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    const current = data.ai_usage[yahooGuid];
    if (!current || current.date !== today) data.ai_usage[yahooGuid] = { count: 1, date: today };
    else data.ai_usage[yahooGuid].count++;
    save(data);
  },
  getTrophyCase(yahooGuid) { return load().trophy_cases[yahooGuid] || { unlocked_cards: [], last_daily_pack: null }; },
  awardCard(yahooGuid, cardId, reason) {
    const data = load();
    
    // 1. Generate or fetch card definition
    let cardDef;
    if (cardId === 'random_dynamic') {
      cardDef = generateInfiniteCard();
    } else {
      // Handle legacy/static IDs if needed (fallback to random if not found)
      cardDef = generateInfiniteCard();
    }

    // 2. Increment global serial count for this card identity
    const idToTrack = cardDef.playerName || cardDef.id;
    if (!data.global_stats.cards_issued[idToTrack]) data.global_stats.cards_issued[idToTrack] = 0;
    data.global_stats.cards_issued[idToTrack]++;
    const serialNumber = data.global_stats.cards_issued[idToTrack];

    // 3. Generate hobby numbers
    const cardNumber = Math.floor(Math.random() * 999) + 1;
    const serialPosition = cardDef.serial_total ? (Math.floor(Math.random() * cardDef.serial_total) + 1) : serialNumber;

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
    tc.last_daily_pack = dateStr || new Date().toISOString().slice(0, 10);
    data.trophy_cases[yahooGuid] = tc;
    save(data);
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
  }
};
