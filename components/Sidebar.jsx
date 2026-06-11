'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useGalacticMode } from '@/lib/context/GalacticThemeContext';

export default function Sidebar({ authenticated, isOpen, onClose, subscription }) {
  const pathname = usePathname();
  const { galacticModeEnabled, toggleGalacticMode } = useGalacticMode();

  const navItems = [
    { href: '/',            label: 'Dashboard',             icon: '⚾' },
    { href: '/roster',      label: 'My Roster',             icon: '👥' },
    { href: '/waiver',      label: 'Waiver Wire',           icon: '🔄' },
    { href: '/startsit',    label: 'Start / Sit',           icon: '⚡' },
    { href: '/trade',       label: 'Trades',                icon: '⇌' },
    { href: '/standings',   label: 'Standings',             icon: '🏆' },
    { href: '/matchup',     label: 'Matchup Predictor',     icon: '⚔️' },
    { href: '/tradeblock',  label: 'League Trade Block',    icon: '🤝' },
    { href: '/trophy',      label: 'Collector\'s Album',    icon: '🎴' },
    { href: '/vault',       label: 'Vault (Gallery)',       icon: '🏛️' },
    { href: '/store',       label: 'Card Store (FREE)',     icon: '🛍️' },
  ];

  if (!authenticated) return null;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            ⚾ Goin' Yard <span style={{ color: 'var(--primary)' }}>HQ</span>
          </div>
          
          {/* Galactic Mode Toggle Switch */}
          <div className="galactic-sidebar-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)', transition: 'all 0.3s' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: galacticModeEnabled ? '#00f0ff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
              🌌 {galacticModeEnabled ? 'GALACTIC MODE' : 'STANDARD'}
            </span>
            <label className="galactic-switch">
              <input type="checkbox" checked={galacticModeEnabled} onChange={toggleGalacticMode} />
              <span className="galactic-slider round"></span>
            </label>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 20 }}>
          {navItems.filter(item => galacticModeEnabled || !['/tradeblock', '/trophy', '/vault', '/store'].includes(item.href)).map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={async () => {
              await axios.post('/api/auth/logout');
              window.location.href = '/';
            }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: '#f87171' }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>
    </>
  );
}
