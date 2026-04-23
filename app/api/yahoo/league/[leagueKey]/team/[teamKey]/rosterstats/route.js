
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoster, getBatchPlayerStats } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey, teamKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const rosterData = await getRoster(guid, leagueKey, teamKey);
    const playerKeys = [];

    // Build slot map while extracting player keys
    const slotMap = {};
    for (const rosterItem of (rosterData || [])) {
      const p = rosterItem?.player;
      if (!p || !Array.isArray(p)) continue;
      const infoArray = Array.isArray(p[0]) ? p[0] : [];
      const info = Object.assign({}, ...infoArray);
      if (!info.player_key) continue;
      playerKeys.push(info.player_key);

      // Parse selected_position → slot (mirrors myroster logic)
      let slot = 'BN';
      const selPos = p[1]?.selected_position;
      if (selPos) {
        if (Array.isArray(selPos)) {
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

    if (!playerKeys.length) return NextResponse.json({ players: [], teamKey });
    let players = await getBatchPlayerStats(guid, leagueKey, playerKeys, null);
    players = players.map(p => ({ ...p, slot: slotMap[p.key] || 'BN' }));
    return NextResponse.json({ players, teamKey });
  } catch (err) {
    console.error('[rosterstats]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
