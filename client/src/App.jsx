import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'

import Dashboard from './components/Dashboard'
import DraftAssistant from './components/DraftAssistant/DraftAssistant'
import RosterManager from './components/RosterManager/RosterManager'
import WaiverWire from './components/WaiverWire/WaiverWire'
import StartSit from './components/StartSit/StartSit'
import TradeAnalyzer from './components/TradeAnalyzer/TradeAnalyzer'
import Standings from './components/Standings/Standings'
import LeagueSetup from './components/Layout/LeagueSetup'

export default function App() {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true })
  const [leagueSettings, setLeagueSettings] = useState(null)

  useEffect(() => {
    checkAuth()
    loadLeagueSettings()

    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, '', '/')
      checkAuth()
    }
  }, [])

  async function checkAuth() {
    try {
      const { data } = await axios.get('/auth/status')
      setAuthStatus({ ...data, loading: false })
    } catch {
      setAuthStatus({ authenticated: false, loading: false })
    }
  }

  async function loadLeagueSettings() {
    try {
      const { data } = await axios.get('/api/yahoo/league/settings/local')
      setLeagueSettings(data)
    } catch {}
  }

  if (authStatus.loading) {
    return <div className="loading" style={{ height: '100vh', fontSize: 18 }}>Loading Fantasy Baseball HQ...</div>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1f2e', color: '#e2e8f0', border: '1px solid #2d3748' } }} />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar authenticated={authStatus.authenticated} />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {!authStatus.authenticated ? (
            <LoginPage />
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard leagueSettings={leagueSettings} />} />
              <Route path="/draft" element={<DraftAssistant leagueSettings={leagueSettings} />} />
              <Route path="/roster" element={<RosterManager leagueSettings={leagueSettings} />} />
              <Route path="/waiver" element={<WaiverWire leagueSettings={leagueSettings} />} />
              <Route path="/startsit" element={<StartSit leagueSettings={leagueSettings} />} />
              <Route path="/trade" element={<TradeAnalyzer leagueSettings={leagueSettings} />} />
              <Route path="/standings" element={<Standings leagueSettings={leagueSettings} />} />
              <Route path="/setup" element={<LeagueSetup onSave={loadLeagueSettings} />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}

function Sidebar({ authenticated }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: '⚾' },
    { to: '/draft', label: 'Draft Assistant', icon: '📋' },
    { to: '/roster', label: 'My Roster', icon: '👥' },
    { to: '/waiver', label: 'Waiver Wire', icon: '🔄' },
    { to: '/startsit', label: 'Start / Sit', icon: '⚡' },
    { to: '/trade', label: 'Trade Analyzer', icon: '🤝' },
    { to: '/standings', label: 'Standings', icon: '🏆' },
    { to: '/setup', label: 'League Setup', icon: '⚙️' },
  ]

  return (
    <nav style={{
      width: 220, background: '#0d111c', borderRight: '1px solid #2d3748',
      padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 4,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
    }}>
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #2d3748', marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>⚾ Fantasy HQ</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>MLB Draft & Season Manager</div>
      </div>
      {authenticated && navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            textDecoration: 'none', borderRadius: 8, margin: '0 8px',
            background: isActive ? '#1e3a5f' : 'transparent',
            color: isActive ? '#7dd3fc' : '#94a3b8',
            fontSize: 14, fontWeight: isActive ? 600 : 400
          })}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      {!authenticated && (
        <div style={{ padding: '0 16px', color: '#64748b', fontSize: 13 }}>
          Login to access all features
        </div>
      )}
    </nav>
  )
}

function LoginPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚾</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Fantasy Baseball HQ</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
          Your AI-powered draft assistant and season manager. Connect your Yahoo Fantasy league to get started.
        </p>
        <a href="/auth/yahoo" style={{ display: 'block', textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16 }}>
            Connect Yahoo Fantasy
          </button>
        </a>
        <p style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
          You'll be redirected to Yahoo to authorize this app securely.
        </p>
      </div>
    </div>
  )
}
