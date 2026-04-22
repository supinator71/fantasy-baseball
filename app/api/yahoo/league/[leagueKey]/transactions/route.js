import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTransactions, toArray } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  if (!session?.yahoo_guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const raw = await getTransactions(session.yahoo_guid, leagueKey);
    const cleaned = [];
    if (Array.isArray(raw)) {
      raw.forEach(txn => {
        const playersObj = txn.players;
        if (!playersObj) return;
        const players = toArray(playersObj);
        players.forEach(p => {
          const pData = p.player;
          if (!Array.isArray(pData)) return;
          const pInfo = Array.isArray(pData[0]) ? Object.assign({}, ...pData[0]) : pData[0];
          const pTxn = pData[1]?.transaction_data || pData[2]?.transaction_data || {};
          if (pInfo && pInfo.name) {
            cleaned.push({
              player_name: pInfo.name.full || pInfo.name.ascii_first + ' ' + pInfo.name.ascii_last,
              type: pTxn.type || txn.type, 
              team_name: pTxn.destination_team_name || pTxn.source_team_name || 'Unknown',
              timestamp: new Date(parseInt(txn.timestamp) * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })
            });
          }
        });
      });
    }
    return NextResponse.json(cleaned);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}