'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const GalacticThemeContext = createContext();

export function GalacticThemeProvider({ children, initialGalacticMode = false }) {
  const [galacticModeEnabled, setGalacticModeEnabled] = useState(initialGalacticMode);

  // Sync state to DOM element attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', galacticModeEnabled ? 'galactic' : 'standard');
  }, [galacticModeEnabled]);

  const toggleGalacticMode = () => {
    const newVal = !galacticModeEnabled;
    setGalacticModeEnabled(newVal);
    // Persist in cookie for 1 year
    document.cookie = `galactic_mode=${newVal}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <GalacticThemeContext.Provider value={{ galacticModeEnabled, toggleGalacticMode }}>
      {children}
    </GalacticThemeContext.Provider>
  );
}

export function useGalacticMode() {
  const context = useContext(GalacticThemeContext);
  if (!context) {
    throw new Error('useGalacticMode must be used within a GalacticThemeProvider');
  }
  return context;
}
