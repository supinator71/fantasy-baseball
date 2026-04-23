'use client';

const SECTIONS = [
  {
    title: '📊 Batting Stats',
    items: [
      { term: 'AVG', def: 'Batting Average — Hits ÷ At-Bats. .300 is excellent, .250 is average.' },
      { term: 'HR', def: 'Home Runs — Solo power stat. Huge in every format.' },
      { term: 'RBI', def: 'Runs Batted In — Drives runners home. Lineup spot dependent.' },
      { term: 'R', def: 'Runs Scored — Being driven home. Leadoff/top-of-order hitters score more.' },
      { term: 'SB', def: 'Stolen Bases — Speed stat. Scarce in modern MLB — value it.' },
      { term: 'OBP', def: 'On-Base Percentage — Hits + BB + HBP ÷ PA. Better than AVG for true value.' },
      { term: 'SLG', def: 'Slugging Percentage — Total bases ÷ At-Bats. Power indicator.' },
      { term: 'OPS', def: 'On-Base + Slugging combined. .850+ is elite; .700 is average.' },
      { term: 'wOBA', def: 'Weighted On-Base Average — Best single hitter metric. League avg ~.320.' },
      { term: 'BB', def: 'Walks — Free passes. Count as points in H2H Points leagues.' },
      { term: 'HBP', def: 'Hit By Pitch — Counts like a walk in many formats.' },
      { term: 'XBH', def: 'Extra-Base Hits — Doubles + Triples + HRs.' },
    ]
  },
  {
    title: '⚾ Pitching Stats',
    items: [
      { term: 'ERA', def: 'Earned Run Average — Earned runs per 9 innings. Under 3.50 is elite.' },
      { term: 'WHIP', def: 'Walks + Hits per Inning Pitched. Under 1.15 is elite; 1.30 is average.' },
      { term: 'K', def: 'Strikeouts — The premier pitching counting stat.' },
      { term: 'W', def: 'Wins — Team-dependent. A great pitcher can have a bad W-L record.' },
      { term: 'SV', def: 'Saves — Closers only. Must enter with ≤3-run lead and record final 3 outs.' },
      { term: 'HLD', def: 'Holds — Setup men who enter in save situations and hand off the lead.' },
      { term: 'QS', def: 'Quality Start — 6+ IP, 3 ER or fewer. Rewards workload + effectiveness.' },
      { term: 'IP', def: 'Innings Pitched — Volume stat. Matters for ERA/WHIP ratio stability.' },
      { term: 'K/9', def: 'Strikeouts per 9 innings. 10+ is elite.' },
      { term: 'BB/9', def: 'Walks per 9 innings. Under 2.5 is excellent control.' },
      { term: 'FIP', def: 'Fielding Independent Pitching — ERA based only on K, BB, HR. True skill indicator.' },
      { term: 'xFIP', def: 'Expected FIP — Normalizes HR rate. Predicts future ERA better than ERA itself.' },
    ]
  },
  {
    title: '📈 Advanced / Sabermetric Terms',
    items: [
      { term: 'VOR', def: 'Value Over Replacement — How much better a player is vs. a waiver pickup at the same position. The core Goin\' Yard scoring metric.' },
      { term: 'ADP', def: 'Average Draft Position — Where players go on average in mock drafts. Used to find value.' },
      { term: 'BABIP', def: 'Batting Average on Balls In Play. High BABIP (.350+) often regresses; low BABIP (.250-) often improves.' },
      { term: 'Hard%', def: 'Hard-Hit Rate — Balls hit 95+ mph exit velocity. Correlates with future success.' },
      { term: 'Barrel%', def: 'Ideal launch angle + exit velocity combo. Best predictor of HR/XBH production.' },
      { term: 'xBA', def: 'Expected Batting Average based on exit velocity and launch angle. Cuts through luck.' },
      { term: 'xERA', def: 'Expected ERA based on contact quality allowed. Better than ERA for future projections.' },
      { term: 'SVOP', def: 'Save Opportunities — Closers can\'t get saves without them. Track this for closer streamers.' },
      { term: 'LOB%', def: 'Left On Base % — Pitchers strand ~72% of runners on average. High LOB% regresses.' },
    ]
  },
  {
    title: '🏆 League Format Glossary',
    items: [
      { term: 'H2H Points', def: 'Head-to-Head Points — Each stat earns points weekly. Win/lose vs. one opponent. Most beginner-friendly.' },
      { term: 'H2H Categories', def: 'Head-to-Head Categories — Win/lose each individual stat category weekly. Requires balanced roster.' },
      { term: 'Roto', def: 'Rotisserie — Season-long category rankings. Every point matters all year. Strategic drops/adds.' },
      { term: 'Streaming', def: 'Adding a pitcher from waivers for 1-2 starts, then dropping them. Key H2H Points strategy.' },
      { term: '2-Start SP', def: 'A starting pitcher with two scheduled starts in a given week. Huge value in H2H formats.' },
      { term: 'Waiver Priority', def: 'Claim order for players dropped. Lower priority = earlier claim. Guard yours early.' },
      { term: 'FAAB', def: 'Free Agent Acquisition Budget — Blind bid system for waiver adds. Budget wisely.' },
      { term: 'Holds Strategy', def: 'In H2H Categories, targeting HLD accumulation via high-leverage relievers is an underused edge.' },
    ]
  },
  {
    title: '📅 Season Strategy Terms',
    items: [
      { term: 'Punt', def: 'Intentionally ignoring a category to dominate others. "Punting saves" = streaming SPs instead.' },
      { term: 'Handcuff', def: 'Rostering a backup behind an injury-prone star (especially RBs in football — in baseball, a closer backup).' },
      { term: 'Upside Play', def: 'A player with lower floor but high ceiling — worth the risk if you need production.' },
      { term: 'Floor', def: 'The minimum production you can reliably expect from a player each week.' },
      { term: 'Ceiling', def: 'The maximum production a player could deliver in a great week/season.' },
      { term: 'Regression', def: 'Stats moving back toward career averages. High BABIP regresses down; low BABIP regresses up.' },
      { term: 'IL Stash', def: 'Holding an injured player to activate later, saving a roster spot for depth.' },
      { term: 'Sell High', def: 'Trading a player at peak value before regression hits. Often after a hot streak.' },
      { term: 'Buy Low', def: 'Acquiring a player after a cold streak when their price is down but underlying skills are intact.' },
    ]
  },
];

export default function Baseball101Page() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>🎓 Baseball 101</h1>
        <p style={{ color: '#7aafc4' }}>
          Definitions, acronyms, and strategy terms — everything you need to understand fantasy baseball
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SECTIONS.map((section, si) => (
          <div key={si} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #1e3d5c',
              fontSize: 14, fontWeight: 700, color: '#4aafdb',
              background: 'rgba(74,175,219,0.06)'
            }}>
              {section.title}
            </div>
            <div style={{ padding: '8px 0' }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: 12,
                  padding: '10px 20px',
                  borderBottom: ii < section.items.length - 1 ? '1px solid rgba(30,61,92,0.5)' : 'none',
                }}>
                  <div style={{
                    fontFamily: 'monospace', fontWeight: 700, fontSize: 13,
                    color: '#00a86b', letterSpacing: 0.5, paddingTop: 1
                  }}>
                    {item.term}
                  </div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.55 }}>
                    {item.def}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(74,175,219,0.06)', border: '1px solid #1e3d5c', fontSize: 12, color: '#7aafc4' }}>
        💡 Tip: The Goin' Yard AI uses VOR (Value Over Replacement) as its primary player scoring metric — every audit, waiver score, and trade evaluation is grounded in this number.
      </div>
    </div>
  );
}
