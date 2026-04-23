import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoster, getUserTeamKey, getBatchPlayerStats } from '@/lib/yahooService';
import { getLiveProbablePitchers } from '@/lib/mlbStatsService';
import * as brain from '@/lib/fantasyBrain';
import { db } from '@/lib/database';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session.yahoo_guid;

  if (!guid) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const teamKey = await getUserTeamKey(guid, leagueKey);
    if (!teamKey) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

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

    if (!playerKeys.length) {
      return NextResponse.json({ players: [] });
    }

    let players = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);

    // MLB Stats API Override for Probable Pitchers
    try {
      const probablePitchers = await getLiveProbablePitchers();
      if (probablePitchers.length > 0) {
        players.forEach(p => {
          if (p.position === 'SP' || String(p.position).includes('SP/')) {
            const normName = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (probablePitchers.includes(normName)) {
              p.is_starting = 'Yes';
            } else {
              p.is_starting = 'No';
            }
          }
        });
      }
    } catch (err) {
      console.error('[Yahoo Roster] Failed to override probable pitchers:', err.message);
    }

    // Build a map of player_key → lineup slot (selected_position)
    const slotMap = {};
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (!p || !Array.isArray(p)) continue;
      const infoArray = Array.isArray(p[0]) ? p[0] : [];
      const info = Object.assign({}, ...infoArray);
      if (!info.player_key) continue;

      // selected_position can be in p[1] or nested differently
      // Yahoo returns it as [{coverage_type, date}, {position: 'C'}]
      let slot = 'BN';
      const selPos = p[1]?.selected_position;
      if (selPos) {
        if (Array.isArray(selPos)) {
          // Find whichever item actually has the position key
          const posItem = selPos.find(s => s && typeof s === 'object' && s.position);
          slot = posItem?.position || 'BN';
        } else if (selPos && typeof selPos === 'object' && selPos.position) {
          slot = selPos.position;
        } else if (typeof selPos === 'string') {
          slot = selPos;
        }
      }
      slotMap[info.player_key] = slot;
    }

    players = players.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));

    // ── Compute VOR for every player using the same engine as TeamAudit ──────
    const settings = db.getLeagueSettings(guid, leagueKey) || {};
    const numTeams    = settings.num_teams    || 10;
    const scoringType = settings.scoring_type || 'headpoint';
    players = players.map(p => {
      const rawPos  = String(p.position || '').split('/')[0].trim();
      const vorRaw  = brain.calculateVOR(p.stats || {}, rawPos, numTeams, scoringType);
      const vor     = typeof vorRaw === 'object' ? (vorRaw.vor ?? vorRaw.score ?? 0) : (vorRaw ?? 0);
      const scarcity = brain.getPositionalScarcity(rawPos, numTeams);
      return { ...p, vor: Math.round(vor), vorScarcity: scarcity.tier || 'moderate' };
    });

    // Sort by VOR descending so Dashboard and other consumers get ranked order
    const sorted = [...players].sort((a, b) => b.vor - a.vor);

    return NextResponse.json({ players: sorted, teamKey });
  } catch (err) {
    console.error('[Pitching Hub] Roster fetch failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
