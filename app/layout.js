'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import { Rajdhani, Space_Grotesk } from 'next/font/google';
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

import { LeagueProvider } from '@/lib/context/LeagueContext';

export default function RootLayout({ children }) {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
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
    <html lang="en" className={`${rajdhani.variable} ${spaceGrotesk.variable}`}>
      <head>
        <title>Goin' Yard HQ</title>
        <meta name="description" content="AI Fantasy Baseball Intelligence" />
      </head>
      <body>
        <Toaster position="top-right" />
        <LeagueProvider>
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
                </div>
              )}
              <main className="main-content">
                {children}
              </main>
            </div>
          </div>
        </LeagueProvider>
      </body>
    </html>
  );
}
