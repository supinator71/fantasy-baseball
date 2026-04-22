const data = {
  dates: [
    {
      date: '2026-04-20', // Monday
      games: [{ teams: { away: { team: { id: 1 }, probablePitcher: { fullName: 'Monday Starter' } }, home: { team: { id: 2 }, probablePitcher: { fullName: 'H1' } } } }]
    },
    {
      date: '2026-04-21', // Tuesday (Today)
      games: [{ teams: { away: { team: { id: 1 }, probablePitcher: { fullName: 'T1' } }, home: { team: { id: 2 }, probablePitcher: { fullName: 'Tuesday Starter' } } } }]
    },
    {
      date: '2026-04-25', // Saturday
      games: [{ teams: { away: { team: { id: 1 }, probablePitcher: { fullName: 'Monday Starter' } }, home: { team: { id: 2 }, probablePitcher: { fullName: 'S1' } } } }]
    },
    {
      date: '2026-04-26', // Sunday
      games: [{ teams: { away: { team: { id: 1 }, probablePitcher: { fullName: 'T2' } }, home: { team: { id: 2 }, probablePitcher: { fullName: 'Tuesday Starter' } } } }]
    }
  ]
};

function processSchedule(data, minDateStr = null) {
  const dates = data.dates || [];
  const pitcherStarts = {}; // name -> count of starts >= minDateStr
  const teamGameIndex = {}; 
  const teamGamesRemaining = {};
  
  dates.forEach(d => {
    const isFutureOrToday = !minDateStr || d.date >= minDateStr;
    const games = d.games || [];
    games.forEach(g => {
      const awayId = g.teams?.away?.team?.id;
      const homeId = g.teams?.home?.team?.id;
      const awayP = g.teams.away.probablePitcher?.fullName;
      const homeP = g.teams.home.probablePitcher?.fullName;
      
      if (awayId) {
         if(!teamGameIndex[awayId]) teamGameIndex[awayId] = [];
         teamGameIndex[awayId].push({ pitcher: awayP, date: d.date });
         if (isFutureOrToday) teamGamesRemaining[awayId] = (teamGamesRemaining[awayId] || 0) + 1;
         if (awayP && isFutureOrToday) {
           const name = awayP.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
           pitcherStarts[name] = (pitcherStarts[name] || 0) + 1;
         }
      }
      if (homeId) {
         if(!teamGameIndex[homeId]) teamGameIndex[homeId] = [];
         teamGameIndex[homeId].push({ pitcher: homeP, date: d.date });
         if (isFutureOrToday) teamGamesRemaining[homeId] = (teamGamesRemaining[homeId] || 0) + 1;
         if (homeP && isFutureOrToday) {
           const name = homeP.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
           pitcherStarts[name] = (pitcherStarts[name] || 0) + 1;
         }
      }
    });
  });

  const confirmedTwoStarters = Object.keys(pitcherStarts).filter(name => pitcherStarts[name] >= 2);
  const twoStartPitchers = [...confirmedTwoStarters];

  return { twoStartPitchers: [...new Set(twoStartPitchers)] };
}

console.log('Testing with Monday (2026-04-20):');
console.log(processSchedule(data, '2026-04-20'));

console.log('\nTesting with Tuesday (2026-04-21):');
console.log(processSchedule(data, '2026-04-21'));
