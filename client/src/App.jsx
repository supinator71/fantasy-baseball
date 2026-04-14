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
import MatchupPredictor from './components/MatchupPredictor/MatchupPredictor'
import LeagueSetup from './components/Layout/LeagueSetup'
import TeamAudit from './components/TeamAudit/TeamAudit'
import TradeFinder from './components/TradeFinder/TradeFinder'
import GamePlan from './components/GamePlan/GamePlan'
import PlayerTrends from './components/PlayerTrends/PlayerTrends'

export default function App() {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true })
  const [leagueSettings, setLeagueSettings] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <Toaster position="top-right" toastOptions={{ style: { background: '#0c1d35', color: '#e2e8f0', border: '1px solid #1e3d5c' } }} />
      <div className="app-layout">

        {/* Sidebar overlay (mobile) */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <Sidebar
          authenticated={authStatus.authenticated}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="app-body">
          {/* Mobile top bar */}
          <div className="mobile-topbar">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              ☰
            </button>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>⚾ Fantasy HQ</span>
          </div>

          <main className="main-content">
            {!authStatus.authenticated ? (
              <LoginPage />
            ) : (
              <Routes>
                <Route path="/"          element={<Dashboard leagueSettings={leagueSettings} />} />
                <Route path="/roster"    element={<RosterManager leagueSettings={leagueSettings} />} />
                <Route path="/waiver"    element={<WaiverWire leagueSettings={leagueSettings} />} />
                <Route path="/startsit"  element={<StartSit leagueSettings={leagueSettings} />} />
                <Route path="/trade"     element={<TradeAnalyzer leagueSettings={leagueSettings} />} />
                <Route path="/standings" element={<Standings leagueSettings={leagueSettings} />} />
                <Route path="/matchup"   element={<MatchupPredictor leagueSettings={leagueSettings} />} />
                <Route path="/trends"    element={<PlayerTrendsPage />} />
                <Route path="/setup"       element={<LeagueSetup onSave={loadLeagueSettings} />} />
                <Route path="/audit"      element={<TeamAudit leagueSettings={leagueSettings} />} />
                <Route path="/tradefinder" element={<TradeFinder leagueSettings={leagueSettings} />} />
                <Route path="/gameplan"   element={<GamePlan leagueSettings={leagueSettings} />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

function Sidebar({ authenticated, isOpen, onClose }) {
  const navItems = [
    { to: '/',          label: 'My Dashboard',      icon: '⚾' },
    { to: '/roster',    label: 'My Team',           icon: '👥' },
    { to: '/waiver',    label: 'Free Agents (Waiver Wire)',       icon: '🔄' },
    { to: '/startsit',  label: 'Who To Start',      icon: '⚡' },
    { to: '/trade',     label: 'Trade Analyzer',    icon: '🤝' },
    { to: '/standings', label: 'Standings',         icon: '🏆' },
    { to: '/matchup',   label: 'Weekly Matchup',    icon: '⚔️' },
    { to: '/audit',     label: 'Roster Checkup',    icon: '🏅' },
    { to: '/tradefinder', label: 'Trade Finder',    icon: '🔀' },
    { to: '/gameplan',  label: 'Weekly Game Plan',  icon: '🗓️' },
    { to: '/setup',     label: 'League Settings',   icon: '⚙️' },
  ]

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>⚾ Fantasy HQ</div>
        <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Season Manager</div>
      </div>

      {authenticated && navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'}
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            textDecoration: 'none', borderRadius: 10, margin: '2px 8px',
            background: isActive ? 'linear-gradient(90deg, rgba(192, 17, 31, 0.25) 0%, transparent 100%)' : 'transparent',
            color: isActive ? '#ffffff' : 'var(--text-muted)',
            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
            fontSize: 14, fontWeight: isActive ? 600 : 500,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'var(--font-heading)',
          })}>
          <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
        </NavLink>
      ))}

      {authenticated && (
        <div style={{ marginTop: 'auto', paddingTop: 20, paddingBottom: 20 }}>
          <button 
            onClick={async () => {
              try {
                await axios.post('/auth/logout');
                window.location.href = '/';
              } catch (e) {
                console.error('Logout failed:', e);
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              border: 'none', background: 'transparent', width: '100%',
              color: '#f87171', fontSize: 14, cursor: 'pointer', textAlign: 'left',
              margin: '0 8px', borderRadius: 8
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#2a1a24'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 16 }}>🚪</span> Logout
          </button>
        </div>
      )}

      {!authenticated && (
        <div style={{ padding: '0 16px', color: '#4a7a94', fontSize: 13 }}>
          Login to access all features
        </div>
      )}
    </nav>
  )
}

function LoginPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 16 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ fontSize: 72, marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(0,50,120,0.5))' }}>⚾</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'white' }}>Fantasy Baseball HQ</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.6, fontSize: 15 }}>
          Your intelligent, extremely simple personal assistant for Yahoo Fantasy Baseball. Dominating your league has never been easier.
        </p>
        <a href="/auth/yahoo" style={{ display: 'block', textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12 }}>
            Connect Yahoo Fantasy Account
          </button>
        </a>
        <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)' }}>
          Secure, effortless authentication via Yahoo.
        </p>
      </div>
    </div>
  )
}

function PlayerTrendsPage() {
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')

  useEffect(() => {
    axios.get('/api/yahoo/leagues').then(({ data }) => {
      setLeagues(data)
      if (data[0]?.league_key) setSelectedLeague(data[0].league_key)
    }).catch(() => {})
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Player Trends</h1>
          <p style={{ color: '#7aafc4', fontSize: 14 }}>Hot streaks, rising stars, and cold spells on your roster</p>
        </div>
        {leagues.length > 0 && (
          <select value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)} style={{ width: 200 }}>
            {leagues.map((l, i) => (
              <option key={i} value={l.league_key}>{l.name || l.league_key}</option>
            ))}
          </select>
        )}
      </div>
      <PlayerTrends selectedLeague={selectedLeague} />
    </div>
  )
}

