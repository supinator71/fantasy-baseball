import React from 'react';

export default function BackgroundMural() {
  return (
    <div className="mural-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      {/* Left Column Scatter (pushed right to avoid Sidebar) */}
      <img src="/card-hitter.png" alt="" style={{ position: 'absolute', top: '10%', left: '15%', width: 320, opacity: 0.25, transform: 'rotate(-15deg)' }} />
      <img src="/card-slide.png" alt="" style={{ position: 'absolute', top: '55%', left: '12%', width: 380, opacity: 0.3, transform: 'rotate(25deg)' }} />
      
      {/* Right Column Scatter */}
      <img src="/card-pitcher.png" alt="" style={{ position: 'absolute', top: '5%', right: '-5%', width: 350, opacity: 0.3, transform: 'rotate(15deg)' }} />
      <img src="/card-swing.png" alt="" style={{ position: 'absolute', top: '45%', right: '-10%', width: 380, opacity: 0.25, transform: 'rotate(-20deg)' }} />

      {/* Bottom Scatter (raised up so they don't clip off the bottom of the monitor) */}
      <img src="/card-hitter.png" alt="" style={{ position: 'absolute', bottom: '-2%', right: '25%', width: 360, opacity: 0.15, transform: 'rotate(70deg)' }} />
      <img src="/card-slide.png" alt="" style={{ position: 'absolute', bottom: '-5%', left: '30%', width: 390, opacity: 0.2, transform: 'rotate(-45deg)' }} />
    </div>
  );
}
