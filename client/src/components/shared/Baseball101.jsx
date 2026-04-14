import React from 'react'

export default function Baseball101() {
  return (
    <div className="main-content">
      <h1 style={{ fontSize: 32, marginBottom: 8, color: 'var(--text-main)' }}>🎓 Baseball 101</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>
        The beginner's guide to understanding the sport and dominating your fantasy league.
      </p>

      {/* The Core Objective */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚾</span> The absolute basics
        </h2>
        <p style={{ color: 'var(--text-main)', fontSize: 15, lineHeight: 1.6 }}>
          Baseball is a game played between two teams taking turns hitting and fielding. The objective is to score more <strong>Runs</strong>. 
          A run is scored when a hitter safely rounds all four bases and crosses home plate. 
          The fielding team tries to get three <strong>Outs</strong>. Once they get three outs, it is their turn to hit. 
          There are nine innings in a standard game.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Hitting Stats */}
        <div className="card">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18 }}>
            Hitter Dictionary (Offense)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>AVG (Batting Average)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hits divided by At-Bats. A good average is around .270. Anything over .300 is elite.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>HR (Home Run)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hitting the ball out of the park, instantly scoring a run for the hitter and anyone else on base.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>RBI (Runs Batted In)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You get an RBI when your hit successfully brings a teammate across home plate to score a run.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>SB (Stolen Base)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Running to the next base while the pitcher is throwing the ball to the catcher. Huge for fantasy points!</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>OBP & OPS</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>On-Base Percentage (how often you get on base via hits or walks). OPS is OBP + Slugging (power).</div>
            </div>
          </div>
        </div>

        {/* Pitching Stats */}
        <div className="card">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16, fontSize: 18 }}>
            Pitcher Dictionary (Defense)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>ERA (Earned Run Average)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>How many runs a pitcher gives up per 9 innings. <strong>Lower is better!</strong> An ERA under 3.50 is fantastic.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>WHIP</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Walks + Hits per Inning Pitched. How many guys get on base against you. Under 1.20 is great.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>K (Strikeout)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Getting three strikes on a batter. Pitchers who strike out many batters are highly prized in fantasy.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>W (Wins) & QS (Quality Starts)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You get a Win if your team leads when you leave of the game. A Quality Start is 6+ innings allowing 3 runs or less.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>SV (Saves)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>A specialized stat for Relief Pitchers who come into the 9th inning to protect a close lead.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fantasy Formats */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: 16, fontSize: 20 }}>Fantasy League Formats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 8, fontSize: 16 }}>Head-to-Head (Points)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Works like fantasy football. Every action (a home run, a strikeout) earns physical points. The person with the most total points at the end of the week wins the matchup. Starting Pitchers are extremely valuable here.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 8, fontSize: 16 }}>Head-to-Head (Categories)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Instead of one total score, you battle your opponent across ~10 different categories (e.g., who hit the most Home Runs?). You get a win for every category you beat them in. Balanced teams thrive here.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, color: '#eab308', marginBottom: 8, fontSize: 16 }}>Rotisserie (Roto)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              No weekly matchups! You rank against every team in the league simultaneously across all stat categories over the entire 162-game season. It requires extreme consistency and patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
