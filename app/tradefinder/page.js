'use client';

import React from 'react';
import TradeAnalyzer from '@/components/TradeAnalyzer/TradeAnalyzer';

// Trade Finder uses the full TradeAnalyzer component which:
// 1. Auto-loads your roster on mount
// 2. Shows InsightCard from master analyze
// 3. Has an AI "Find Trades" button that calls /api/claude/trade/find with real roster data
export default function TradeFinderPage() {
  return <TradeAnalyzer />;
}
