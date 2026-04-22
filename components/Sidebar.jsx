'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';

export default function Sidebar({ authenticated, isOpen, onClose, subscription }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/',            label: 'Dashboard',             icon: '⚾' },
    { href: '/roster',      label: 'My Roster',             icon: '👥' },
    { href: '/waiver',      label: 'Waiver Wire',           icon: '🔄' },
    { href: '/startsit',    label: 'Start / Sit',           icon: '⚡' },
    { href: '/trade',       label: 'Trade Analyzer',        icon: '⇌' },
    { href: '/pitching',    label: 'Pitching Intel',        icon: '🎯' },
    { href: '/standings',   label: 'Standings',             icon: '🏆' },
    { href: '/matchup',     label: 'Matchup Predictor',     icon: '⚔️' },
    { href: '/audit',       label: 'Team Audit',            icon: '📊' },
    { href: '/tradefinder', label: 'Trade Finder',          icon: '💡' },
    { href: '/gameplan',    label: 'Weekly Game Plan',      icon: '📅' },
    { href: '/baseball101', label: 'Baseball 101',          icon: '🎓' },
    { href: '/trophy',      label: 'Trophy Case',           icon: '🏆' },
    { href: '/vault',       label: 'Collector\'s Vault',    icon: '💎' },
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
          {subscription?.plan === 'pro' && (
            <span className="badge" style={{ background: 'var(--primary)', color: 'white', marginTop: 4 }}>PRO</span>
          )}
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 20 }}>
          {navItems.map(item => {
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
