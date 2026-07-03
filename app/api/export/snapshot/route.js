import { NextResponse } from 'next/server';
import { getLeagues, getUserTeamKey, getRoster, getBatchPlayerStats, getStandings, getTransactions, getScoreboard, toArray } from '@/lib/yahooService';
import { db } from '@/lib/database';

// Read-only export of this account's live Yahoo fantasy data (roster, standings,
// recent transactions, current-week opponent) for every MLB league the
// authenticated user belongs to.
// Auth: ?token=<EXPORT_TOKEN> — a separate shared secret, NOT the Yahoo credentials.
// Intended for a personal scheduled pull (not a browser session), so it reads
// the one stored Yahoo token directly from the server's token store instead of
// requiring a session cookie.
//
// 2026-07-03: two fixes.
// 1) Rosters no longer truncate at 25 players — getBatchPlayerStats now chunks
//    key batches instead of slice(0, 25)-ing them (see lib/yahooService.js).
// 2) Each league now includes an `opponent` block (team_key, name, week,
//    roster) resolved from the current-week scoreboard.

function buildSlotMap(rosterData) {
  const slotMap = {};
  for (const rosterItem of (rosterData || [])) {
    const p = rosterItem?.player;
    if (!p || !Array.isArray(p)) continue;
    const infoArray = Array.isArray(p[0]) ? p[0] : [];
    const info = Object.assign({}, ...infoArray);
    if (!info.player_key) continue;

    let slot = 'BN';
    const selPos = p[1]?.selected_position;
    if (selPos) {
      if (Array.isArray(selPos)) {
        const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
        slot = posItem?.position || 'BN';
      } else if (typeof selPos === 'object' && selPos.position) {
        slot = selPos.position;
      } else if (typeof selPos === 'string') {
        slot = selPos;
      }
    }
    slotMap[info.player_key] = slot;
  }
  return slotMap;
}

function extractPlayerKeys(rosterData) {
  const keys = [];
  for (const rosterItem of (rosterData || [])) {
    const p = rosterItem?.player;
    if (p && Array.isArray(p)) {
      const infoArray = Array.isArray(p[0]) ? p[0] : [];
      const info = Object.assign({}, ...infoArray);
      if (info.player_key) keys.push(info.player_key);
    }
  }
  return keys;
}

// Roster (raw Yahoo) -> flat [{key,name,...,slot}] via batch stats + slot map.
async function buildFlatRoster(guid, leagueKey, rosterData) {
  const playerKeys = extractPlayerKeys(rosterData);
  if (!playerKeys.length) return [];
  const slotMap = buildSlotMap(rosterData);
  const stats = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);
  return stats.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
}

// Find the current-week matchup containing myTeamKey and return
// { team_key, name, week } for the other side. Defensive against Yahoo's
// object-with-numeric-keys shapes; returns null rather than throwing.
function findOpponent(matchups, myTeamKey) {
  if (!myTeamKey) return null;
  for (const mItem of toArray(matchups)) {
    let m = mItem?.matchup ?? mItem;
    if (Array.isArray(m)) {
      m = Object.assign({}, ...m.filter(x => x && typeof x === 'object' && !Array.isArray(x)));
    }
    if (!m || typeof m !== 'object') continue;
    const week = m.week ?? null;
    const teamsNode = m?.['0']?.teams || m?.teams;
    const pair = [];
    for (const tItem of toArray(teamsNode)) {
      const t = tItem?.team;
      if (!t || !Array.isArray(t)) continue;
      const infoArr = Array.isArray(t[0]) ? t[0] : t;
      const info = Object.assign({}, ...infoArr.filter(x => x && typeof x === 'object' && !Array.isArray(x)));
      if (info.team_key) pair.push({ team_key: info.team_key, name: info.name || '' });
    }
    if (pair.some(p => p.team_key === myTeamKey)) {
      const opp = pair.find(p => p.team_key !== myTeamKey);
      if (opp) return { ...opp, week };
    }
  }
  return null;
}

export async function GET(request) {
  const expected = process.env.EXPORT_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'EXPORT_TOKEN is not configured on the server' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const provided = searchParams.get('token');
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const guid = db.getAnyGuid();
  if (!guid) {
    return NextResponse.json({ error: 'No Yahoo account is connected to this app' }, { status: 401 });
  }

  try {
    const allLeagues = await getLeagues(guid);
    const mlbLeagues = (allLeagues || []).filter(l => l && l.league_key);

    const leagues = {};
    for (const league of mlbLeagues) {
      const leagueKey = league.league_key;
      const leagueId = leagueKey.split('.l.')[1] || leagueKey;

      try {
        const teamKey = await getUserTeamKey(guid, leagueKey);
        let players = [];
        if (teamKey) {
          const rosterData = await getRoster(guid, leagueKey, teamKey);
          players = await buildFlatRoster(guid, leagueKey, rosterData);
        }

        const standings = await getStandings(guid, leagueKey);
        const transactions = await getTransactions(guid, leagueKey);

        // --- current-week opponent (for the 3x-daily newsletter) ---
        let opponent = null;
        if (teamKey) {
          try {
            const matchups = await getScoreboard(guid, leagueKey);
            opponent = findOpponent(matchups, teamKey);
            if (opponent) {
              const oppRosterData = await getRoster(guid, leagueKey, opponent.team_key);
              opponent.roster = await buildFlatRoster(guid, leagueKey, oppRosterData);
            }
          } catch (oppErr) {
            // Never let opponent trouble sink the whole league entry —
            // surface it instead of silently omitting the block.
            opponent = { error: oppErr.message };
          }
        }

        leagues[leagueId] = {
          league_key: leagueKey,
          league_name: league.name || '',
          team_key: teamKey || null,
          roster: players,
          opponent,
          standings,
          recent_transactions: (transactions || []).slice(0, 15),
        };
      } catch (innerErr) {
        leagues[leagueId] = { league_key: leagueKey, error: innerErr.message };
      }
    }

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      for_date: new Date().toISOString().slice(0, 10),
      leagues,
    });
  } catch (err) {
    console.error('[Export Snapshot] Failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
