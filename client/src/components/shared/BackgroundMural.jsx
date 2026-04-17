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
      {/* Left Column Scatter */}
      <img src="/cyborg_card_tier1_hitter.png" alt="" style={{ position: 'absolute', top: '10%', left: '18%', width: 320, opacity: 0.15, transform: 'rotate(-15deg)' }} />
      <img src="/cyborg_stealing_second.png" alt="" style={{ position: 'absolute', top: '65%', left: '22%', width: 380, opacity: 0.15, transform: 'rotate(25deg)' }} />
      
      {/* Center Scatter */}
      <img src="/cyborg_diving_catch.png" alt="" style={{ position: 'absolute', top: '-12%', left: '50%', width: 380, opacity: 0.15, transform: 'rotate(8deg)', transformOrigin: 'center' }} />
      <img src="/cyborg_walkoff_homer.png" alt="" style={{ position: 'absolute', bottom: '-8%', left: '48%', width: 360, opacity: 0.15, transform: 'rotate(-75deg)' }} />

      {/* Right Column Scatter */}
      <img src="/cyborg_card_tier1_pitcher.png" alt="" style={{ position: 'absolute', top: '8%', right: '-5%', width: 350, opacity: 0.15, transform: 'rotate(15deg)' }} />
      <img src="/cyborg_bullpen_closer.png" alt="" style={{ position: 'absolute', top: '55%', right: '-8%', width: 380, opacity: 0.15, transform: 'rotate(-20deg)' }} />
    </div>
  );
}
