'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import { LeagueProvider } from '@/lib/context/LeagueContext';
import { GalacticThemeProvider, useGalacticMode } from '@/lib/context/GalacticThemeContext';
import { SWRConfig } from 'swr';

const swrOptions = {
  fetcher: (url) => axios.get(url).then(res => res.data),
  revalidateOnFocus: false, 
  dedupingInterval: 10000, 
};

function InnerLayout({ children }) {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { galacticModeEnabled, toggleGalacticMode } = useGalacticMode();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isAuthError = 
          error.response?.status === 401 ||
          (error.response?.status === 500 && (
            error.response?.data?.error?.includes('refresh token') ||
            error.response?.data?.error?.includes('Not authenticated') ||
            error.response?.data?.error?.includes('No token found')
          ));

        if (isAuthError) {
          if (window.location.pathname !== '/') {
            toast.error('Session expired. Please sign in again.', { duration: 5000 });
            setAuthStatus({ authenticated: false, loading: false });
            axios.post('/api/auth/logout').finally(() => {
              window.location.href = '/';
            });
          }
        }
        return Promise.reject(error);
      }
    );

    checkAuth();

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  async function checkAuth() {
    try {
      const { data } = await axios.get('/api/auth/status');
      setAuthStatus({ ...data, loading: false });
    } catch {
      setAuthStatus({ authenticated: false, loading: false });
    }
  }

  return (
    <div className="app-layout">
      <Sidebar 
        authenticated={authStatus.authenticated} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        subscription={authStatus.subscription}
      />
      <div className="app-body">
        {authStatus.authenticated && (
          <div className="mobile-topbar">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <span style={{ fontWeight: 700 }}>⚾ Goin' Yard HQ</span>
            
            {/* Galactic Mode Toggle in Mobile Header */}
            <div className="galactic-toggle-container" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: galacticModeEnabled ? '#00f0ff' : '#64748b' }}>
                🌌 {galacticModeEnabled ? 'GALACTIC' : 'STD'}
              </span>
              <label className="galactic-switch">
                <input type="checkbox" checked={galacticModeEnabled} onChange={toggleGalacticMode} />
                <span className="galactic-slider round"></span>
              </label>
            </div>
          </div>
        )}
        <main className="main-content">
          {/* ── Cyborg Card Mural Background ── */}
          <div className="mural-container" style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
            transition: 'opacity 0.5s ease'
          }}>
            {[
              { src: '/cyborg_card_tier1_hitter.png',   top: '2%',  left: '3%',   rotate: '-8deg',  opacity: galacticModeEnabled ? 0.25 : 0.13, width: 200 },
              { src: '/cyborg_card_tier2_holo_premium.png', top: '18%', left: '1%',  rotate: '5deg',   opacity: galacticModeEnabled ? 0.22 : 0.10, width: 180 },
              { src: '/cyborg_card_tier3_prism.png',    top: '55%', left: '2%',   rotate: '-4deg',  opacity: galacticModeEnabled ? 0.24 : 0.12, width: 190 },
              { src: '/cyborg_card_tier2_holo.png',     top: '78%', left: '4%',   rotate: '7deg',   opacity: galacticModeEnabled ? 0.20 : 0.09, width: 170 },
              { src: '/cyborg_card_tier1_pitcher.png',  top: '5%',  right: '3%',  rotate: '9deg',   opacity: galacticModeEnabled ? 0.25 : 0.13, width: 200 },
              { src: '/cyborg_silver_prism_wide.png',   top: '30%', right: '1%',  rotate: '-6deg',  opacity: galacticModeEnabled ? 0.22 : 0.10, width: 185 },
              { src: '/card-hitter.png',                top: '62%', right: '2%',  rotate: '5deg',   opacity: galacticModeEnabled ? 0.24 : 0.12, width: 190 },
              { src: '/card-pitcher.png',               top: '82%', right: '4%',  rotate: '-9deg',  opacity: galacticModeEnabled ? 0.20 : 0.09, width: 175 },
            ].map((card, i) => (
              <img
                key={i}
                src={card.src}
                alt=""
                style={{
                  position: 'absolute',
                  top:     card.top,
                  left:    card.left,
                  right:   card.right,
                  width:   card.width,
                  opacity: card.opacity,
                  transform: `rotate(${card.rotate})`,
                  borderRadius: 16,
                  filter: galacticModeEnabled 
                    ? 'saturate(1.8) brightness(1.1) drop-shadow(0 0 15px rgba(0, 240, 255, 0.4))' 
                    : 'saturate(1.2) brightness(0.9)',
                  transition: 'all 0.5s ease',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              />
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ClientLayoutWrapper({ children, initialGalacticMode }) {
  return (
    <SWRConfig value={swrOptions}>
      <GalacticThemeProvider initialGalacticMode={initialGalacticMode}>
        <LeagueProvider>
          <InnerLayout>
            <Toaster position="top-right" />
            {children}
          </InnerLayout>
        </LeagueProvider>
      </GalacticThemeProvider>
    </SWRConfig>
  );
}
