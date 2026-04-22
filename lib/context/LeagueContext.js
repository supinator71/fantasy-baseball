'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  const [leagues, setLeagues]           = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [leagueData, setLeagueData]     = useState(null);
  const [loading, setLoading]           = useState(false);
  // Master AI analysis — shared across all modules
  const [aiAnalysis, setAiAnalysis]     = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [scoredWaiver, setScoredWaiver] = useState([]);
  const [lineupRecs, setLineupRecs]     = useState(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchLeagueData(selectedLeague);
    }
  }, [selectedLeague]);

  async function fetchLeagues() {
    try {
      const { data } = await axios.get('/api/yahoo/leagues');
      setLeagues(data);
      if (data[0]?.league_key && !selectedLeague) {
        setSelectedLeague(data[0].league_key);
      }
    } catch (err) {
      console.error('Failed to fetch leagues', err);
    }
  }

  async function fetchLeagueData(key) {
    setLoading(true);
    setAiAnalysis(null); // clear stale analysis on league switch
    try {
      const { data } = await axios.get(`/api/yahoo/league/${key}`);
      setLeagueData(data);
      // Kick off master AI analysis in background (non-blocking)
      runAnalysis(key);
    } catch (err) {
      console.error('Failed to fetch league data', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * The single master Claude call for the entire session.
   * Only re-runs when the league changes or user explicitly refreshes.
   */
  const runAnalysis = useCallback(async (key) => {
    setAiLoading(true);
    try {
      const { data } = await axios.post('/api/claude/analyze', { league_key: key });
      setAiAnalysis(data.analysis || null);
      setScoredWaiver(data.scoredWaiver || []);
      setLineupRecs(data.lineupRecs || null);
    } catch (err) {
      console.error('[LeagueContext] Master analysis failed:', err.message);
      // Non-fatal — modules fall back to their own static UI
    } finally {
      setAiLoading(false);
    }
  }, []);

  const refreshAnalysis = useCallback(() => {
    if (selectedLeague) runAnalysis(selectedLeague);
  }, [selectedLeague, runAnalysis]);

  return (
    <LeagueContext.Provider value={{
      leagues,
      selectedLeague,
      setSelectedLeague,
      leagueData,
      loading,
      // AI analysis shared across all modules
      aiAnalysis,
      aiLoading,
      refreshAnalysis,
      // Pre-scored data from fantasyBrain (no Claude needed to display)
      scoredWaiver,
      lineupRecs,
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
