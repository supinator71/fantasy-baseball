'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });

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

  if (authStatus.loading) return <div className="loading">⚾ Loading HQ...</div>;

  if (!authStatus.authenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 16 }}>
        <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'white' }}>Goin' Yard <span style={{ color: 'var(--primary)' }}>HQ</span></h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.6, fontSize: 15 }}>
            An AI-powered fantasy baseball command center.
          </p>
          <a href="/api/auth/yahoo" style={{ display: 'block', textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12 }}>
              Connect Yahoo Fantasy Account
            </button>
          </a>
        </div>
      </div>
    );
  }

  return <Dashboard subscription={authStatus.subscription} />;
}
