'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const { data } = await axios.get(`/api/yahoo/league/${key}`);
      setLeagueData(data);
    } catch (err) {
      console.error('Failed to fetch league data', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeagueContext.Provider value={{ 
      leagues, 
      selectedLeague, 
      setSelectedLeague, 
      leagueData, 
      loading 
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
