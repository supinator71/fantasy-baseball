import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as yahoo from '@/lib/yahooService';
import * as brain from '@/lib/fantasyBrain';
import fs from 'fs';

const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
  '9': '1B', '10': '2B', '11': '3B', '34': 'HA', '37': 'ER', '39': 'BBA'
};

function extractPotentialNames(text) {
  if (!text) return [];
  const regex = /\b([A-Z][a-zA-Z0-9\.\-]*)\b/g;
  const matches = [...text.matchAll(regex)].map(m => m[1]);
  
  const stopWords = new Set([
    'I', 'We', 'You', 'He', 'They', 'Should', 'Would', 'Could', 'Will', 'Can',
    'What', 'Who', 'Which', 'Why', 'How', 'Where', 'When', 'Is', 'Are', 'Was', 'Were',
    'Add', 'Drop', 'Trade', 'Waiver', 'Waivers', 'Roster', 'Rosters', 'Team', 'Teams',
    'League', 'Leagues', 'Player', 'Players', 'Free', 'Agent', 'Agents', 'MLB', 'Yahoo',
    'Goin', 'Yard', 'HQ', 'Scout', 'Intel', 'WaiverScore', 'VOR', 'Stats', 'Pitcher', 'Pitchers',
    'Batter', 'Batters', 'Atlanta', 'Braves', 'New', 'York', 'Boston', 'Red', 'Sox', 'San',
    'Francisco', 'Los', 'Angeles', 'Dodgers', 'Angels', 'Chicago', 'Cubs', 'White',
    'Houston', 'Astros', 'Oakland', 'Athletics', 'Miami', 'Marlins', 'Tampa', 'Bay', 'Rays',
    'Toronto', 'Blue', 'Jays', 'Seattle', 'Mariners', 'Texas', 'Rangers', 'Detroit',
    'Tigers', 'Kansas', 'City', 'Royals', 'Minnesota', 'Twins', 'Cleveland', 'Guardians',
    'St', 'Louis', 'Cardinals', 'Milwaukee', 'Brewers', 'Pittsburgh', 'Pirates',
    'Cincinnati', 'Reds', 'Colorado', 'Rockies', 'San', 'Diego', 'Padres', 'Arizona', 'Diamondbacks',
    'Philadelphia', 'Phillies', 'Washington', 'Nationals', 'Baltimore', 'Orioles'
  ]);

  const potential = [];
  let i = 0;
  while (i < matches.length) {
    const word = matches[i];
    if (stopWords.has(word)) {
      i++;
      continue;
    }
    
    if (i + 1 < matches.length && !stopWords.has(matches[i+1])) {
      const pair = `${word} ${matches[i+1]}`;
      if (text.includes(pair)) {
        potential.push(pair);
        i += 2;
        continue;
      }
    }
    
    potential.push(word);
    i++;
  }
  return [...new Set(potential)];
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { question, context, league_key } = await request.json();
    const settings = db.getLeagueSettings(guid, league_key) || {};

    let rosterBlock = '';
    let faBlock = '';
    let searchBlock = '';
    try {
      const teamKey = await yahoo.getUserTeamKey(guid, league_key);
      const [rosterRaw, freeAgents] = await Promise.all([
        teamKey ? yahoo.getRoster(guid, league_key, teamKey).catch(() => []) : [],
        yahoo.getPlayers(guid, league_key, 'A', 0, null).catch(() => [])
      ]);

      let roster = [];
      if (teamKey && rosterRaw?.length) {
        const playerKeys = [];
        const slotMap = {};
        for (const item of rosterRaw) {
          const p = item?.player;
          if (Array.isArray(p)) {
            const info = Object.assign({}, ...(Array.isArray(p[0]) ? p[0] : []));
            if (info.player_key) {
              playerKeys.push(info.player_key);
              let pos = 'BN';
              const spObj = p.find(x => x && x.selected_position);
              if (spObj && spObj.selected_position) {
                const sp = spObj.selected_position;
                if (Array.isArray(sp)) {
                  const pItem = sp.find(x => x && x.position);
                  if (pItem) pos = pItem.position;
                } else if (sp[1] && sp[1].position) {
                  pos = sp[1].position;
                } else if (sp.position) {
                  pos = sp.position;
                }
              }
              slotMap[info.player_key] = pos;
            }
          }
        }
        if (playerKeys.length) {
          const fetchedRoster = await yahoo.getBatchPlayerStats(guid, league_key, playerKeys, null);
          roster = fetchedRoster.map(rp => ({ ...rp, slot: slotMap[rp.key] || 'BN' }));
        }
      }

      const getPlayerLine = (p) => {
        const team = p.team ? `, ${p.team}` : '';
        const stats = p.stats || {};
        const statStr = Object.entries(stats)
          .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined && v !== null)
          .map(([id, v]) => `${STAT_MAP[id]}:${v}`)
          .join(' ') || 'no stats';
        
        const rawPos = String(p.position || '').split('/')[0].trim();
        const numTeams = settings.num_teams || 10;
        const scoringType = settings.scoring_type || 'headpoint';
        const vorRaw = brain.calculateVOR(stats, rawPos, numTeams, scoringType);
        const vor = typeof vorRaw === 'object' ? (vorRaw.vor ?? vorRaw.score ?? 0) : (vorRaw ?? 0);
        
        return `  • ${p.name} (${p.position}${team}) [Slot:${p.slot || 'FA'}] VOR:${Math.round(vor)} — ${statStr}`;
      };

      if (roster.length) {
        rosterBlock = `MY CURRENT ROSTER:\n${roster.map(getPlayerLine).join('\n')}`;
      }
      if (freeAgents.length) {
        faBlock = `TOP AVAILABLE FREE AGENTS:\n${freeAgents.slice(0, 15).map(getPlayerLine).join('\n')}`;
      }

      // Search for any mentioned players in the user's question
      const queryNames = extractPotentialNames(question);
      console.log('[ask] Extracted potential names:', queryNames);

      if (queryNames.length) {
        const searchPromises = queryNames.map(name => 
          yahoo.searchPlayers(guid, league_key, name).catch(err => {
            console.warn(`[ask] Search failed for ${name}:`, err.message);
            return [];
          })
        );
        const searchResults = await Promise.all(searchPromises);
        const uniqueKeys = new Set();
        const searchedPlayers = [];
        for (const list of searchResults) {
          for (const p of list) {
            if (!uniqueKeys.has(p.key)) {
              uniqueKeys.add(p.key);
              searchedPlayers.push(p);
            }
          }
        }
        if (searchedPlayers.length) {
          searchBlock = `SEARCHED PLAYERS (FROM USER QUESTION):\n${searchedPlayers.map(getPlayerLine).join('\n')}`;
        }
      }
    } catch (e) {
      console.warn('[ask] Roster/FA/Search fetch failed for context:', e.message);
    }

    const systemRosterContext = [
      rosterBlock || null,
      faBlock || null,
      searchBlock || null
    ].filter(Boolean).join('\n\n');

    console.log('[ask] league_key:', league_key);
    console.log('[ask] rosterBlock length:', rosterBlock?.length || 0);
    console.log('[ask] faBlock length:', faBlock?.length || 0);
    console.log('[ask] searchBlock length:', searchBlock?.length || 0);
    console.log('[ask] systemRosterContext length:', systemRosterContext?.length || 0);

    const systemPrompt = [
      `You are Goin' Yard HQ, a friendly but strictly evidence-based translation layer for our proprietary mathematical fantasy engine for the 2026 MLB season.`,
      `CRITICAL DIRECTIVE: The manager's current roster, active slots, stats, and VOR scores are ALREADY provided in the "=== REAL-TIME LEAGUE DATA ===" block of the user message. You MUST NOT ask the manager to supply their roster, bench, or player list. Under no circumstances should you say "Before I can give you drop recommendations, I need to see your roster/bench" or ask them to list their players.`,
      `If the manager asks about making a drop or add, examine their roster context directly, identify the lowest-VOR or backup players on their bench, and provide a concrete, immediate drop recommendation based on the mathematical VOR values.`,
      `Use ONLY the player names, stats, teams, and VOR scores listed in the user message context to answer the question. Do not make up players or stats not present in the context.`
    ].join('\n\n');

    const promptText = [
      settings.name ? `League: ${settings.name} (${settings.scoring_type})` : null,
      systemRosterContext ? `=== REAL-TIME LEAGUE DATA ===\n${systemRosterContext}` : `=== REAL-TIME LEAGUE DATA ===\n(No roster context could be loaded from the server API)`,
      context ? `=== ANALYSIS CONTEXT ===\n${context}` : null,
      `=== MANAGER'S QUESTION ===\n${question}`
    ].filter(Boolean).join('\n\n');

    try {
      const ideScratch = 'C:\\Users\\supri\\.gemini\\antigravity-ide\\scratch';
      if (fs.existsSync(ideScratch)) {
        fs.writeFileSync(`${ideScratch}\\askPrompt.txt`, promptText, 'utf8');
      } else if (fs.existsSync('scratch')) {
        fs.writeFileSync('scratch/askPrompt.txt', promptText, 'utf8');
      }
    } catch (err) {
      console.error('[ask] Failed to write prompt log:', err.message);
    }

    const text = await callClaudeFast([
      { role: 'user', content: promptText }
    ], 800, systemPrompt);

    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error('[claude/ask]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
