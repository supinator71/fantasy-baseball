import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

async function getLiveProbablePitchers() {
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, {
      params: { sportId: 1, hydrate: 'probablePitcher' },
      timeout: 8000
    });

    const pitchers = new Set();
    const games = data.dates?.[0]?.games || [];
    
    games.forEach(g => {
      if (g.teams?.away?.probablePitcher?.fullName) {
        pitchers.add(g.teams.away.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
      if (g.teams?.home?.probablePitcher?.fullName) {
        pitchers.add(g.teams.home.probablePitcher.fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    });

    return Array.from(pitchers);
  } catch (err) {
    console.error(`[MLB Stats] Failed to fetch probable pitchers:`, err.message);
    return [];
  }
}

async function getTwoStartPitchers() {
  try {
    const now = new Date();
    const day = now.getDay();

    const currentMondayDate = new Date(now);
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    currentMondayDate.setDate(now.getDate() - daysSinceMonday);
    
    const nextMondayDate = new Date(now);
    const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
    nextMondayDate.setDate(now.getDate() + daysUntilNextMonday);

    const cMonStr = currentMondayDate.toISOString().split('T')[0];
    const cSunStr = new Date(currentMondayDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nMonStr = nextMondayDate.toISOString().split('T')[0];
    const nSunStr = new Date(nextMondayDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [currentData, nextData] = await Promise.all([
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: cMonStr, endDate: cSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(res => res.data).catch(() => ({ dates: [] })),
      axios.get(`${BASE_URL}/schedule`, {
        params: { sportId: 1, startDate: nMonStr, endDate: nSunStr, hydrate: 'probablePitcher' },
        timeout: 8000
      }).then(res => res.data).catch(() => ({ dates: [] }))
    ]);

    function processWeek(data) {
      const starts = {};
      (data.dates || []).forEach(d => {
        (d.games || []).forEach(g => {
          [g.teams?.away?.probablePitcher?.fullName, g.teams?.home?.probablePitcher?.fullName].forEach(name => {
            if (name) {
              const basic = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              starts[basic] = (starts[basic] || 0) + 1;
            }
          });
        });
      });
      return Object.keys(starts).filter(n => starts[n] >= 2);
    }

    return {
      currentWeek: processWeek(currentData),
      nextWeek: processWeek(nextData)
    };
  } catch (err) {
    return { currentWeek: [], nextWeek: [] };
  }
}

export async function GET() {
  const [today, twoStart] = await Promise.all([
    getLiveProbablePitchers(),
    getTwoStartPitchers()
  ]);

  return NextResponse.json({
    today,
    currentWeekTwoStart: twoStart.currentWeek,
    nextWeekTwoStart: twoStart.nextWeek
  });
}
