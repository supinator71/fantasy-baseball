import { NextResponse } from 'next/server';
import { getLeagues, getUserTeamKey, getRoster, getBatchPlayerStats, getStandings, getTransactions } from '@/lib/yahooService';
import { db } from '@/lib/database';

// Read-only export of this account's live Yahoo fantasy data (roster, standings,
// recent transactions) for every MLB league the authenticated user belongs to.
// Auth: ?token=<EXPORT_TOKEN> — a separate shared secret, NOT the Yahoo credentials.
// Intended for a personal scheduled pull (not a browser session), so it reads
// the one stored Yahoo token directly from the server's token store instead of
// requiring a session cookie.

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
          const playerKeys = [];
          for (const rosterItem of (rosterData || [])) {
            const p = rosterItem?.player;
            if (p && Array.isArray(p)) {
              const infoArray = Array.isArray(p[0]) ? p[0] : [];
              const info = Object.assign({}, ...infoArray);
              if (info.player_key) playerKeys.push(info.player_key);
            }
          }
          if (playerKeys.length) {
            const slotMap = buildSlotMap(rosterData);
            const stats = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);
            players = stats.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
          }
        }

        const standings = await getStandings(guid, leagueKey);
        const transactions = await getTransactions(guid, leagueKey);

        leagues[leagueId] = {
          league_key: leagueKey,
          league_name: league.name || '',
          team_key: teamKey || null,
          roster: players,
          standings,
          recent_transactions: (transactions || []).slice(0, 15),
        };
      } catch (innerErr) {
        leagues[leagueId] = { league_key: leagueKey, error: innerErr.message };
      }
    }

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      leagues,
    });
  } catch (err) {
    console.error('[Export Snapshot] Failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
