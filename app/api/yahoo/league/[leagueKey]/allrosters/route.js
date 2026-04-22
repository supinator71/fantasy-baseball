import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStandings, getUserTeamKey, getRoster } from '@/lib/yahooService';

export async function GET(request, { params }) {
  const { leagueKey } = await params;
  const session = await getSession();
  const guid = session?.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
  try {
    const standings = await getStandings(guid, leagueKey);
    const myTeamKey = await getUserTeamKey(guid, leagueKey);
    const allRosters = [];
    const promises = [];
    
    for (const t of (standings || [])) {
      const teamObj = t?.team;
      if (!teamObj) continue;
      const info = Array.isArray(teamObj) ? (Array.isArray(teamObj[0]) ? Object.assign({}, ...teamObj[0]) : teamObj[0]) : teamObj;
      const teamKey = info?.team_key;
      const teamName = info?.name;
      if (!teamKey || teamKey === myTeamKey) continue;
      
      promises.push(
        getRoster(guid, leagueKey, teamKey).then(rosterData => {
          const playerList = [];
          for (const rosterItem of (rosterData || [])) {
            const p = rosterItem?.player;
            if (p && Array.isArray(p)) {
              const pInfo = Array.isArray(p[0]) ? Object.assign({}, ...p[0]) : p[0];
              const name = pInfo.name?.full || pInfo.full_name;
              const pos = pInfo.display_position || '';
              if (name) playerList.push(name + ' (' + pos + ')');
            }
          }
          if (playerList.length > 0) allRosters.push({ team: teamName, players: playerList });
        }).catch(e => console.error(e))
      );
    }
    await Promise.all(promises);
    return NextResponse.json(allRosters);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}