import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaude } from '@/lib/claude';
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

    const pitchers = roster.filter(p => ['SP','RP','P'].includes(String(p.position||'').split('/')[0]));
    const hitters  = roster.filter(p => !['SP','RP','P'].includes(String(p.position||'').split('/')[0]));

    const rosterBlock = [
      'HITTERS:',
      ...hitters.map(buildPlayerLine),
      '',
      'PITCHERS:',
      ...pitchers.map(buildPlayerLine),
    ].join('\n');

    // Pre-compute real VOR for every player using fantasyBrain (not Claude guesses)
    const vorTable = roster.map(p => {
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

    const raw = await callClaude([{
      role: 'user',
      content: `You are Goin' Yard HQ — an expert fantasy baseball roster analyst.

⚠️ SCORING FORMAT: ${scoringLabel}
Tailor ALL advice to this exact format. Do NOT apply Roto logic to H2H leagues.

⚠️ USE ONLY THE STATS BELOW — do not fabricate or use training-data numbers. These are 2026 Yahoo season actuals.

LEAGUE: "${settings.name || league_key}" | Teams: ${settings.num_teams || 10}

MY ROSTER (with stats):
${rosterBlock}

PRE-CALCULATED VOR (engine-computed, use these exact values in vorByPlayer — do NOT change them):
${vorBlock}

Perform a full team audit. Respond ONLY with valid JSON — no markdown fences:
{
  "grade": "B+",
  "championshipPath": "One sentence on this team's path to the playoffs given the actual roster above.",
  "strengths": ["Strength 1 citing actual player stats", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1 citing actual player names", "Weakness 2", "Weakness 3"],
  "moves": [
    {"action": "Specific move — drop X, add Y", "priority": "immediate", "reasoning": "Why in 1 sentence citing stats"},
    {"action": "Specific move 2", "priority": "high", "reasoning": "Why"}
  ],
  "vorByPlayer": [
    {"name": "PlayerName", "position": "SP", "vor": 48, "scarcity": "elite"},
    {"name": "PlayerName2", "position": "OF", "vor": 31, "scarcity": "moderate"}
  ]
}`
    }], 1000);

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
