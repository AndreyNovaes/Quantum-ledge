/**
 * Market Data Context - provides market data throughout the application
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { MarketDataContextType } from './types';
import { useMarketData } from '@/hooks/useMarketData';

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const marketData = useMarketData();

  return (
    <MarketDataContext.Provider value={marketData}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketDataContext(): MarketDataContextType {
  const context = useContext(MarketDataContext);

  if (context === undefined) {
    throw new Error('useMarketDataContext must be used within MarketDataProvider');
  }

  return context;
}
