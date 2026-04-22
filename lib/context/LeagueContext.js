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
  const [aiFromCache, setAiFromCache]   = useState(false);
  const [aiModel, setAiModel]           = useState(null);
  const [refreshesRemaining, setRefreshesRemaining] = useState(3); // updated from API response
  const [refreshLimitReached, setRefreshLimitReached] = useState(false);
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
   * force=false: checks daily cache first, uses Haiku if cache miss (~$0.010/call)
   * force=true:  bypasses cache, always uses Sonnet for fresh quality analysis (~$0.039/call)
   */
  const runAnalysis = useCallback(async (key, force = false) => {
    setAiLoading(true);
    try {
      const { data } = await axios.post('/api/claude/analyze', { league_key: key, force });
      setAiAnalysis(data.analysis || null);
      setScoredWaiver(data.scoredWaiver || []);
      setLineupRecs(data.lineupRecs || null);
      setAiFromCache(data.fromCache || false);
      setAiModel(data.model || null);
      setRefreshesRemaining(data.refreshesRemaining ?? 3);
      setRefreshLimitReached(data.refreshLimitReached || false);
    } catch (err) {
      console.error('[LeagueContext] Master analysis failed:', err.message);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const refreshAnalysis = useCallback(() => {
    if (selectedLeague) runAnalysis(selectedLeague, true); // force=true → always Sonnet
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
      aiFromCache,
      aiModel,
      refreshesRemaining,
      refreshLimitReached,
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
