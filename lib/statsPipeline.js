/**
 * statsPipeline.js — 2026 Multi-Sport Stats Pipeline
 * Normalizes metrics from MLB, NBA, and NFL rosters and filters prospects.
 */

const MOCK_MLB_ROSTER = [
  { name: 'Gerrit Cole', team: 'NYY', position: 'SP', stats: { xera: 3.15, swstr_percent: 11.8 } },
  { name: 'Shohei Ohtani', team: 'LAD', position: 'DH/SP', stats: { xera: 3.45, bolts: 4, sprint_speed_percentile: 94 } },
  { name: 'Paul Skenes', team: 'PIT', position: 'SP', stats: { xera: 2.85, swstr_percent: 15.8 } },
  { name: 'Mookie Betts', team: 'LAD', position: 'SS/OF', stats: { xwoba: 0.385, bolts: 1 } },
  { name: 'Corbin Burnes', team: 'BAL', position: 'SP', stats: { xera: 3.25, swstr_percent: 12.5 } },
  { name: 'Aaron Judge', team: 'NYY', position: 'OF', stats: { xwoba: 0.435, bolts: 0 } }
];

const MOCK_NBA_ROSTER = [
  { name: 'Luka Doncic', team: 'LAL', position: 'G', stats: { true_shooting_percent: 62.5, ppg: 31.2 } },
  { name: 'Giannis Antetokounmpo', team: 'MIL', position: 'F', stats: { true_shooting_percent: 61.8, ppg: 28.5 } },
  { name: 'Nikola Jokic', team: 'DEN', position: 'C', stats: { true_shooting_percent: 64.2, ppg: 26.4 } },
  { name: 'Victor Wembanyama', team: 'SAS', position: 'F/C', stats: { true_shooting_percent: 58.5, ppg: 24.8 } }
];

const MOCK_NFL_ROSTER = [
  { name: 'Marvin Harrison Jr.', team: 'ARI', position: 'WR', stats: { projected_air_yards: 1250, touchdowns: 9 } },
  { name: 'Saquon Barkley', team: 'PHI', position: 'RB', stats: { projected_rushing_yards: 1150, touchdowns: 12 } },
  { name: 'Patrick Mahomes', team: 'KC', position: 'QB', stats: { projected_passing_yards: 4400, touchdowns: 32 } },
  { name: 'Justin Jefferson', team: 'MIN', position: 'WR', stats: { projected_air_yards: 1350, touchdowns: 10 } }
];

const MOCK_PROSPECTS = [
  { name: 'Jackson Holliday', rank: 1, team: 'BAL', sport: 'mlb' },
  { name: 'Walker Jenkins', rank: 2, team: 'MIN', sport: 'mlb' },
  { name: 'Dylan Crews', rank: 3, team: 'WAS', sport: 'mlb' },
  { name: 'Junior Caminero', rank: 4, team: 'TB', sport: 'mlb' },
  { name: 'Paul Skenes', rank: 5, team: 'PIT', sport: 'mlb' }
];

function calculatePlanetaryUnlock(player, sport) {
  const s = player.stats || {};
  
  if (sport === 'mlb') {
    // 1. MLB xERA < 3.30 -> Mars
    if (s.xera !== undefined && s.xera < 3.30) {
      return {
        domain: 'The Iron Core of Mars',
        reason: `Elite 2026 xERA (${s.xera.toFixed(2)} < 3.30)`
      };
    }
    // 2. MLB Bolts > 3 or Sprint Speed > 90th percentile -> Saturn
    if ((s.bolts !== undefined && s.bolts > 3) || (s.sprint_speed_percentile !== undefined && s.sprint_speed_percentile > 90)) {
      return {
        domain: 'The Gas Rings of Saturn',
        reason: `Elite Sprint Speed (${s.sprint_speed_percentile || 90}th Percentile)`
      };
    }
    // 3. MLB Swords / SwStr% > 12% -> The Sun
    if (s.swstr_percent !== undefined && s.swstr_percent > 12) {
      return {
        domain: 'The Sun',
        reason: `Exceeding 2026 Steamer SwStr% Mean (${s.swstr_percent.toFixed(1)}% > 12%)`
      };
    }
  }

  if (sport === 'nba') {
    // 4. NBA True Shooting % > 60% -> Venus
    if (s.true_shooting_percent !== undefined && s.true_shooting_percent > 60) {
      return {
        domain: 'The Clouds of Venus',
        reason: `Top Quintile True Shooting % (${s.true_shooting_percent.toFixed(1)}% > 60%)`
      };
    }
  }

  if (sport === 'nfl') {
    // 5. NFL Air Yards > 1200 -> Jupiter
    if (s.projected_air_yards !== undefined && s.projected_air_yards > 1200) {
      return {
        domain: 'The Moons of Jupiter',
        reason: `Projected Air Yards (${s.projected_air_yards.toLocaleString()} > 1,200 Yards)`
      };
    }
  }

  return null;
}

export function getNormalized2026Stats() {
  const prospectsMap = new Map(MOCK_PROSPECTS.map(p => [p.name, p]));

  const mapRoster = (roster, sport) => {
    return roster.map(player => {
      const prospectInfo = prospectsMap.get(player.name);
      return {
        ...player,
        sport,
        isProspect: !!prospectInfo,
        prospectRank: prospectInfo ? prospectInfo.rank : null,
        planetaryUnlock: calculatePlanetaryUnlock(player, sport)
      };
    });
  };

  return {
    sports: {
      mlb: mapRoster(MOCK_MLB_ROSTER, 'mlb'),
      nba: mapRoster(MOCK_NBA_ROSTER, 'nba'),
      nfl: mapRoster(MOCK_NFL_ROSTER, 'nfl')
    },
    prospects: MOCK_PROSPECTS
  };
}
