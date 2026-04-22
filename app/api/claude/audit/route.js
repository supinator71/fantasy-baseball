import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';

// Yahoo stat ID → human-readable name
const STAT_MAP = {
  '7': 'R', '12': 'HR', '13': 'RBI', '16': 'SB', '3': 'AVG',
  '18': 'BB', '20': 'HBP', '28': 'W', '32': 'SV', '42': 'K',
  '26': 'ERA', '27': 'WHIP', '50': 'IP', '83': 'QS', '85': 'HLD',
};

const SCORING_TYPE_MAP = {
  'headpoint': 'H2H Points (weekly head-to-head, each stat earns points)',
  'headone':   'H2H Categories (weekly matchup, win/tie/lose each category)',
  'roto':      'Rotisserie (season-long category ranking)',
};

const IL_SLOTS    = new Set(['IL', 'IL+', 'IL7', 'IL10', 'IL15', 'IL60']);
const IL_STATUSES = new Set(['IL', 'IL10', 'IL15', 'IL60', 'DL', 'O', 'OUT', 'SUSP', 'NA']);
const DTD_STATUSES = new Set(['DTD', 'Q', 'QUESTIONABLE']);

function playerILTag(p) {
  const slot   = String(p.slot   || '').toUpperCase();
  const status = String(p.status || '').toUpperCase();
  if (IL_SLOTS.has(slot) || [...IL_STATUSES].some(s => status.includes(s))) return '[⛔IL]';
  if ([...DTD_STATUSES].some(s => status.includes(s))) return '[⚠️DTD]';
  return '';
}

function buildPlayerLine(p) {
  const stats = p.stats || {};
  const parts = Object.entries(stats)
    .filter(([id, v]) => STAT_MAP[id] && v !== '-' && v !== '' && v !== undefined && v !== null)
    .map(([id, v]) => `${STAT_MAP[id]}:${v}`);
  return `  • ${p.name} (${p.position}) [${p.slot || 'BN'}] — ${parts.join(' ') || 'no stats yet'}`;
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    // Accept both 'roster' and 'my_roster' field names
    const body = await request.json();
    const roster = body.my_roster || body.roster || [];
    const { league_key } = body;

    const settings = db.getLeagueSettings(guid, league_key) || {};
    const scoringLabel = SCORING_TYPE_MAP[settings.scoring_type] || settings.scoring_type || 'H2H Points';

    const ilPlayers     = roster.filter(p =>  playerILTag(p).includes('IL'));
    const activePlayers = roster.filter(p => !playerILTag(p).includes('IL'));

    const pitchers = activePlayers.filter(p => ['SP','RP','P'].includes(String(p.position||'').split('/')[0]));
    const hitters  = activePlayers.filter(p => !['SP','RP','P'].includes(String(p.position||'').split('/')[0]));

    const rosterBlock = [
      'ACTIVE HITTERS:',
      ...hitters.map(buildPlayerLine),
      '',
      'ACTIVE PITCHERS:',
      ...pitchers.map(buildPlayerLine),
      '',
      'ON IL (do NOT recommend as starters, strengths, or trade targets):',
      ...ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔IL/${p.status || '?'}]`),
    ].join('\n');

    // Pre-compute real VOR — active players only (IL excluded)
    const vorTable = activePlayers.map(p => {
      const rawPos = String(p.position || '').split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, rawPos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const scarcity = brain.getPositionalScarcity(rawPos, settings.num_teams || 10);
      return {
        name: p.name,
        position: rawPos,
        vor: typeof vor === 'object' ? (vor.vor ?? vor.score ?? 0) : (vor ?? 0),
        scarcity: scarcity.tier || 'moderate',
      };
    }).sort((a, b) => b.vor - a.vor);

    const vorBlock = vorTable.map(p => `  ${p.name} (${p.position}): VOR ${p.vor} [${p.scarcity}]`).join('\n');

    const raw = await callClaudeFast([{
      role: 'user',
      content: `You are Goin' Yard HQ — an expert fantasy baseball roster analyst.

⚠️ SCORING FORMAT: ${scoringLabel}
Tailor ALL advice to this exact format. Do NOT apply Roto logic to H2H leagues.

⚠️ DATA RULE: Use ONLY the stats and VOR values provided below — do NOT use training data for any player stat, ERA, AVG, HR, or VOR value.
DO NOT cite stats not shown in the roster block below. If a stat is missing, say "stats not yet available."

LEAGUE: "${settings.name || league_key}" | Teams: ${settings.num_teams || 10}

MY ACTIVE ROSTER (2026 Yahoo season stats):
${rosterBlock}

PRE-CALCULATED VOR (engine-computed — copy these exact values into vorByPlayer, do NOT change them):
${vorBlock}

⛔ IL PLAYERS (do NOT list as strengths or suggest starting):
${ilPlayers.length ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [${p.status || 'injured'}]`).join('\n') : '  None'}

Perform a full team audit. Respond ONLY with valid JSON — no markdown fences:
{
  "grade": "[letter grade A-F based on roster VOR above]",
  "championshipPath": "[one sentence on this team's path to the playoffs using the actual roster above]",
  "strengths": ["[strength 1 — cite player name and actual stat from the roster data above]", "[strength 2]", "[strength 3]"],
  "weaknesses": ["[weakness 1 — cite player name or category with actual stat from above]", "[weakness 2]", "[weakness 3]"],
  "moves": [
    {"action": "[specific move: drop X, add Y]", "priority": "immediate", "reasoning": "[why, citing actual stats from above]"},
    {"action": "[specific move 2]", "priority": "high", "reasoning": "[why]"}
  ],
  "vorByPlayer": ${JSON.stringify(vorTable.map(p => ({ name: p.name, position: p.position, vor: p.vor, scarcity: p.scarcity })))}
}`
    }], 1500);

    // Parse JSON response
    let parsed = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    } catch {
      parsed = { grade: '?', raw };
    }

    return NextResponse.json({
      ...parsed,
      vorByPlayer: vorTable,  // Always use engine-computed VOR, not Claude's
    });
  } catch (err) {
    console.error('[claude/audit]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
