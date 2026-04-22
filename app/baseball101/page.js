'use client';

import React from 'react';

export default function GlossaryPage() {
  const terms = [
    { term: 'WHIP', def: 'Walks + Hits per Inning Pitched. A measure of a pitcher\'s efficiency at preventing baserunners.' },
    { term: 'ERA', def: 'Earned Run Average. The average number of earned runs a pitcher allows per 9 innings.' },
    { term: 'VORP / VOR', def: 'Value Over Replacement Player. A metric that measures how much value a player provides compared to a "replacement level" player available on the waiver wire.' },
    { term: 'H2H Points', def: 'Head-to-Head Points. A league format where players earn points for specific actions (e.g., 3 pts for a home run). You compete against one opponent each week.' },
    { term: 'H2H Categories', def: 'Head-to-Head Categories. You compete against one opponent in multiple statistical categories (e.g., HR, SB, ERA). Each category is a "win" or "loss".' },
    { term: 'Rotisserie (Roto)', def: 'A format where teams are ranked from first to last in each statistical category. Points are awarded based on rank, and the team with the most total points at the end of the season wins.' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
        The <span style={{ color: 'var(--primary)' }}>Glossary</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 18 }}>
        Everything you need to know to talk like a pro.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {terms.map((item, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--primary)', fontSize: 20, marginBottom: 8, fontWeight: 700 }}>{item.term}</h3>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>{item.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
