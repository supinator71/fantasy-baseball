import React from 'react'

const POS_COLORS = {
  SP:   { bg: '#0a1e3a', border: '#2d6fa8', label: '#93c5fd' },
  RP:   { bg: '#002626', border: '#008070', label: '#4de0b0' },
  C:    { bg: '#002a1a', border: '#007850', label: '#6ee7b7' },
  '1B': { bg: '#3a1a02', border: '#c47a0a', label: '#fcd34d' },
  '2B': { bg: '#051628', border: '#1d6090', label: '#7dd3fc' },
  '3B': { bg: '#3a0416', border: '#a02060', label: '#f9a8d4' },
  SS:   { bg: '#002828', border: '#0a9090', label: '#99f6e4' },
  OF:   { bg: '#071830', border: '#1a4a90', label: '#bfdbfe' },
  DH:   { bg: '#18082e', border: '#6040a8', label: '#c4b5fd' },
  P:    { bg: '#0a1e3a', border: '#2d6fa8', label: '#93c5fd' },
}
const DEFAULT_C = { bg: '#0c1d35', border: '#1e3d5c', label: '#7aafc4' }

function primaryPos(position) {
  return String(position || '').split('/')[0].split(',')[0].trim().toUpperCase()
}

function pickToCell(pickNum, numTeams) {
  const round = Math.ceil(pickNum / numTeams)
  const posInRound = (pickNum - 1) % numTeams
  const col = round % 2 === 1 ? posInRound : (numTeams - 1 - posInRound)
  return { round, col }
}

const CELL_W = 112
const CELL_H = 64

export default function DraftBoard({ players, numTeams, draftPosition, currentPick }) {
  const drafted = players.filter(p => p.drafted && p.draft_round && p.draft_pick)
  const maxRound = Math.max(6, Math.ceil((drafted.length + numTeams) / numTeams))
  const displayRounds = Math.min(maxRound, 25)

  // Build grid[round-1][col] = player
  const grid = Array.from({ length: displayRounds }, () => Array(numTeams).fill(null))
  drafted.forEach(p => {
    const { round, col } = pickToCell(p.draft_pick, numTeams)
    if (round >= 1 && round <= displayRounds && col >= 0 && col < numTeams) {
      grid[round - 1][col] = p
    }
  })

  const { round: curRound, col: curCol } = pickToCell(currentPick, numTeams)

  // Position legend
  const posInPlay = [...new Set(players.filter(p => p.drafted).map(p => primaryPos(p.position)))]

  return (
    <div>
      {/* Position legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {Object.entries(POS_COLORS).filter(([k]) => posInPlay.includes(k) || ['SP','RP','OF','SS','C','1B','2B','3B'].includes(k)).map(([pos, c]) => (
          <span key={pos} style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
            background: c.bg, border: `1px solid ${c.border}`, color: c.label
          }}>{pos}</span>
        ))}
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'linear-gradient(90deg,#003d3d,#0c2c56)', border: '1px solid #4aafdb', color: '#4aafdb', fontWeight: 700 }}>★ Mine</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(0,168,107,0.15)', border: '1px solid #00a86b', color: '#00a86b', fontWeight: 700 }}>⏱ On Clock</span>
      </div>

      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '65vh', borderRadius: 8, border: '1px solid #1e3d5c' }}>
        <div style={{ minWidth: 48 + numTeams * (CELL_W + 2) }}>

          {/* Column headers — sticky top */}
          <div style={{
            display: 'flex', position: 'sticky', top: 0, zIndex: 5,
            background: '#060e1a', borderBottom: '2px solid #1e3d5c'
          }}>
            <div style={{ width: 48, flexShrink: 0 }} /> {/* spacer for round labels */}
            {Array.from({ length: numTeams }, (_, i) => {
              const isMyCol = i === draftPosition - 1
              return (
                <div key={i} style={{
                  width: CELL_W, flexShrink: 0, marginRight: 2,
                  padding: '7px 4px', textAlign: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: isMyCol ? '#4aafdb' : '#4a7a94',
                  background: isMyCol ? 'rgba(74,175,219,0.08)' : 'transparent',
                  borderBottom: isMyCol ? '2px solid #4aafdb' : '2px solid transparent',
                }}>
                  {isMyCol ? '★ Me' : `Pk${i + 1}`}
                </div>
              )
            })}
          </div>

          {/* Grid rows */}
          {grid.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', borderBottom: '1px solid #0d1e33' }}>

              {/* Round label — sticky left */}
              <div style={{
                width: 48, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#4a7a94',
                background: '#07111e',
                borderRight: '2px solid #1e3d5c',
                position: 'sticky', left: 0, zIndex: 3,
              }}>
                R{rIdx + 1}
              </div>

              {row.map((cell, cIdx) => {
                const isCurPick = (rIdx + 1 === curRound) && (cIdx === curCol)
                const isMyPick  = cell?.drafted_by === 'me'
                const pos       = cell ? primaryPos(cell.position) : null
                const c         = (pos && POS_COLORS[pos]) ? POS_COLORS[pos] : DEFAULT_C

                return (
                  <div key={cIdx} style={{
                    width: CELL_W, flexShrink: 0, height: CELL_H, marginRight: 2,
                    padding: '5px 7px',
                    background: cell
                      ? isMyPick
                        ? 'linear-gradient(135deg, #003d3d 0%, #0a2444 100%)'
                        : c.bg
                      : isCurPick
                        ? 'rgba(0,168,107,0.1)'
                        : '#0c1d35',
                    border: `1px solid ${
                      isCurPick ? '#00a86b'
                      : isMyPick ? '#4aafdb'
                      : cell     ? c.border
                      : '#152a3e'
                    }`,
                    boxShadow: isCurPick
                      ? '0 0 12px rgba(0,168,107,0.4), inset 0 0 8px rgba(0,168,107,0.08)'
                      : isMyPick
                        ? '0 0 6px rgba(74,175,219,0.25)'
                        : 'none',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    transition: 'background 0.3s',
                  }}>
                    {isCurPick && !cell ? (
                      <div style={{ textAlign: 'center', color: '#00a86b', fontSize: 10, fontWeight: 800, lineHeight: 1.4 }}>
                        ⏱ ON THE<br />CLOCK
                      </div>
                    ) : cell ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 3,
                            background: c.bg, border: `1px solid ${c.border}`, color: c.label,
                            textTransform: 'uppercase', flexShrink: 0,
                          }}>{pos}</span>
                          {isMyPick && (
                            <span style={{ fontSize: 10, color: '#4aafdb', marginLeft: 'auto' }}>★</span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: isMyPick ? '#e2e8f0' : '#b8ccd8',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          lineHeight: 1.2, marginBottom: 2,
                        }}>
                          {cell.player_name}
                        </div>
                        <div style={{ fontSize: 10, color: '#4a7a94' }}>{cell.team}</div>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
