import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { callClaudeFast } from '@/lib/claude';
import { db } from '@/lib/database';
import * as brain from '@/lib/fantasyBrain';
import * as mlbStats from '@/lib/mlbStatsService';

const STAT_GUARDRAIL = `⚠️ DATA RULE: Use ONLY the player stats and schedule data provided in this prompt.
DO NOT use your training data to supply ERA, AVG, HR, or any other stat values.
DO NOT recommend pitchers not listed in the confirmed probable pitcher schedule below.
`;

function tryParseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  const session = await getSession();
  const guid = session.yahoo_guid;
  if (!guid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { my_roster, opponent, week_context, league_key, leagueSettings: clientSettings } = await request.json();
    // Client always has fresh Yahoo league data — use it. DB entry is fallback.
    const dbSettings = db.getLeagueSettings(guid, league_key) || {};
    const settings = { ...dbSettings, ...clientSettings };
    const pitching = await mlbStats.getTwoStartPitchers().catch(() => ({ currentWeek: [], nextWeek: [], today: [], pitcherDetails: {} }));

    const nowDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });

    // ── Split roster into active vs IL — IL players shown separately ──────────
    const IL_TAGS = new Set(['IL','IL+','IL7','IL10','IL15','IL60','O','OUT','SUSP','NA','DL']);
    const isIL = p => IL_TAGS.has(String(p.status || '').toUpperCase()) || IL_TAGS.has(String(p.slot || '').toUpperCase());
    const activePlayers = (my_roster || []).filter(p => !isIL(p));
    const ilPlayers     = (my_roster || []).filter(p => isIL(p));

    const buildLine = p => {
      const pos = String(p.position || '').split('/')[0].trim();
      const vor = brain.calculateVOR(p.stats || {}, pos, settings.num_teams || 10, settings.scoring_type || 'headpoint');
      const statStr = Object.entries(p.stats || {})
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      const norm = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const detail = pitching.pitcherDetails?.[norm];
      const schedTag = detail ? ` [${detail.label}]` : '';
      const mlbStatus = p.is_starting === 'Yes' ? ' [MLB: Starting Today]' : (p.is_starting === 'No' ? ' [MLB: Not Starting/Bench]' : ' [MLB: No Game/Unknown]');
      return `  • ${p.name} (${p.position}, ${p.team || '?'}) [Fantasy Slot:${p.slot || 'BN'}]${schedTag}${mlbStatus} VOR:${vor.toFixed(1)} | ${statStr || 'no stats'}`;
    };

    const activeBlock = activePlayers.length
      ? activePlayers.map(buildLine).join('\n')
      : '  (no active players)';
    const ilBlock = ilPlayers.length
      ? ilPlayers.map(p => `  • ${p.name} (${p.position}) [⛔ IL SLOT — ${p.status || 'injured'}]`).join('\n')
      : '  None';

    const twoStartNames = (pitching.remainingTwoStarters || []).join(', ') || 'None';
    const nextWeekNames = (pitching.nextWeek || []).slice(0, 8).join(', ') || 'None';

    // ── Run lineup optimizer ─────────────────────────────────────────────────
    const weekSchedule = {};
    activePlayers.forEach(p => {
      const team = String(p.team || '').toUpperCase();
      weekSchedule[team] = brain.getWeeklyGameCount(team, settings.current_week || 1);
    });
    const lineupOpt = brain.optimizeLineup(activePlayers, weekSchedule, settings.scoring_type, settings.num_teams || 10);
    const diagnosis = brain.buildRosterDiagnosis(my_roster || [], settings || {});

    const lineupOptStarters = lineupOpt.starters?.slice(0, 10).map(p => `${p.player_name} — ${p.weekGames} games, confidence: ${p.confidence}`).join('\n') || 'None';
    const volumePlays = lineupOpt.volumePlays?.map(p => p.player_name).join(', ') || 'None';

    const scoringLabel = settings.scoring_type === 'headpoint' ? 'H2H Points'
      : settings.scoring_type === 'headone' ? 'H2H Categories'
      : settings.scoring_type === 'roto'    ? 'Rotisserie'
      : settings.scoring_type               || 'H2H Points';

    const prompt = `${STAT_GUARDRAIL}
League: ${settings.name || league_key || '?'} | Format: ${scoringLabel} | As of: ${nowDay}

⛔⛔⛔ YAHOO IL RULES — READ THIS BEFORE GIVING ANY ADVICE ⛔⛔⛔
IL (Injured List) slots are COMPLETELY SEPARATE from active roster slots in Yahoo Fantasy.
- Dropping an IL player frees an IL slot — it does NOT free an active lineup spot.
- You CANNOT add an active player by dropping an IL player. It is mechanically impossible in Yahoo.
- The ONLY way to open an active roster spot is to drop a NON-IL player (someone from the ACTIVE ROSTER section below).
- Players in the "ON IL" section below occupy IL-only slots. They do NOT block any active roster moves.
- DO NOT mention IL players as drop candidates for roster upgrades. Period.
- The ONLY valid reason to drop an IL player is if you need that IL slot for a different injured player.

📅 DAILY STARTING LINEUP RULES:
1. [Fantasy Slot: BN] = Fantasy Bench. [Fantasy Slot: C/1B/OF/Util/SP/RP] = Active Lineup.
2. [MLB: Starting Today] = confirmed in today's MLB lineup. [MLB: Not Starting/Bench] = benched in real life. [MLB: No Game/Unknown] = team off or lineup not posted.
3. Do not recommend "starting" someone already in an active slot. If a player is [MLB: Not Starting/Bench] or [MLB: No Game/Unknown] and in an active slot, recommend moving them to BN.
4. ⚠️ POSITION MATCHING RULE: When recommending lineup changes, daily moves, or key decisions, you MUST ensure that the player's position eligibility matches the slot you are recommending them for. For example, do NOT suggest playing a 3B player (like Josh Jung) or a 1B/2B/OF player (like Spencer Steer) in a Catcher (C) slot, nor a hitter in a pitching slot. Align all recommendations with the exact matching positions.

ACTIVE ROSTER (these are your only drop candidates if you need to make room):
${activeBlock}

ON IL (⛔ these players occupy IL-ONLY slots — dropping them does NOT open an active spot):
${ilBlock}

CONFIRMED 2-START PITCHER SCHEDULE (as of ${nowDay}):
- Full 2-start value remaining this week: ${twoStartNames}
- Next week 2-start targets: ${nextWeekNames}
- Starting today: ${(pitching.today || []).join(', ') || 'None'}

LINEUP OPTIMIZER RESULTS (active players only):
Top starters:
${lineupOptStarters}
Volume Plays (7-game teams): ${volumePlays}

POINTS ANALYSIS: ${opponent ? (brain.analyzeCategories(opponent.my_stats || {}, [{ stats: opponent.opp_stats || {} }], settings.scoring_type)?.advice || '') : (diagnosis.catAnalysis?.advice || '')}

${opponent ? `MATCHUP: vs ${opponent.opponent_name || 'opponent'}\nTheir projected stats: ${JSON.stringify(opponent.opp_stats || {})}` : 'No specific matchup data — optimize for maximum total points output.'}
Week context: ${week_context || ''}

You are the Goin' Yard HQ interface — a strict translation layer for our proprietary mathematical fantasy engine.
Identify must-starts (prioritize pitchers with remaining starts this week), streaming targets from the confirmed schedule,
and lineup slots to maximize for the ${settings.scoring_type || 'this'} format.

CRITICAL JSON ESCAPING RULES: You MUST use double quotes for all JSON keys and string values. Do NOT use single quotes for JSON properties. If you need to use a quote inside your text prose, use single quotes (e.g., "He is a 'must-start' player"). You MUST NOT use raw newlines inside string values; use the literal sequence \\n.
Return ONLY valid JSON (no markdown wrapping):
{
  "weeklyProjection": { "myProjected": "350 pts", "opponentProjected": "310 pts", "confidence": "medium" },
  "swingCategories": ["Total Points"],
  "dailyMoves": {
    "monday": "A clear sentence about what to do Monday",
    "tuesday": "A clear sentence about Tuesday's move",
    "wednesday": "A clear sentence about Wednesday's adjustment",
    "thursday": "A clear sentence about Thursday's adjustment",
    "friday": "A clear sentence about Friday's adjustment",
    "saturday": "A clear sentence about Saturday's adjustment",
    "sunday": "A clear sentence about Sunday's adjustment"
  },
  "keyDecisions": [{ "decision": "A readable question about the decision", "recommendation": "Player name", "reasoning": "A persuasive sentence explaining why in terms of points" }]
}`;

    const text = await callClaudeFast([{ role: 'user', content: prompt }], 1500);
    const parsed = tryParseJSON(text);

    if (parsed) {
      return NextResponse.json({
        ...parsed,
        gameplan: text,
        lineupOptimizer: lineupOpt,
        catAnalysis: diagnosis.catAnalysis
      });
    }

    // Robust Fallback
    const _myProj = text.match(/"myProjected"\s*:\s*"([^"]+)"/i);
    const _oppProj = text.match(/"opponentProjected"\s*:\s*"([^"]+)"/i);
    const _conf = text.match(/"confidence"\s*:\s*"([^"]+)"/i);

    return NextResponse.json({
      gameplan: text,
      rawPlan: text,
      weeklyProjection: {
        myProjected: _myProj ? _myProj[1] : '?',
        opponentProjected: _oppProj ? _oppProj[1] : '?',
        confidence: _conf ? _conf[1] : 'low',
      },
      lineupOptimizer: lineupOpt,
      catAnalysis: diagnosis.catAnalysis,
      optimalLineup: [],
      volumePlays: [],
      swingCategories: [],
      keyDecisions: [],
      dailyMoves: {}
    });

  } catch (err) {
    console.error('[claude/gameplan]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
