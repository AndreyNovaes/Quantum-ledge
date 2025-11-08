/**
 * Hook for managing volatile market data
 * Supports test mode for deterministic testing
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketPrice, ExchangeRate } from '@/lib/types';
import {
  FIXED_MARKET_PRICES,
  FIXED_EXCHANGE_RATES,
  generateVolatilePrices,
  generateVolatileRate
} from '@/lib/mock-data';
import Decimal from 'decimal.js';

const UPDATE_INTERVAL = 3000; // 3 seconds

interface UseMarketDataReturn {
  prices: Record<string, MarketPrice>;
  exchangeRates: Record<string, ExchangeRate>;
  isTestMode: boolean;
  lastUpdate: Date | null;
  toggleTestMode: () => void;
}

export function useMarketData(initialTestMode?: boolean): UseMarketDataReturn {
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [prices, setPrices] = useState<Record<string, MarketPrice>>(FIXED_MARKET_PRICES);
  const [exchangeRates, setExchangeRates] = useState<Record<string, ExchangeRate>>(FIXED_EXCHANGE_RATES);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Check for test_mode query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const testModeParam = params.get('test_mode');

      if (testModeParam === 'true') {
        setIsTestMode(true);
      } else if (initialTestMode !== undefined) {
        setIsTestMode(initialTestMode);
      }
    }
  }, [initialTestMode]);

  const updatePrices = useCallback(() => {
    if (isTestMode) {
      // In test mode, use fixed prices
      setPrices(FIXED_MARKET_PRICES);
      setExchangeRates(FIXED_EXCHANGE_RATES);
    } else {
      // In normal mode, generate volatile prices
      const newPrices: Record<string, MarketPrice> = {};

      Object.entries(FIXED_MARKET_PRICES).forEach(([symbol, basePrice]) => {
        const newPrice = generateVolatilePrices(basePrice.price, 2);
        const change = newPrice.subtract(basePrice.price);
        const changePercent = change.divide(basePrice.price.toDecimal()).multiply(100);

        newPrices[symbol] = {
          symbol,
          price: newPrice,
          change: change.toDecimal(),
          changePercent: new Decimal(changePercent.toNumber().toFixed(2)),
          timestamp: new Date(),
        };
      });

      setPrices(newPrices);

      // Update exchange rates
      const newRates: Record<string, ExchangeRate> = {};

      Object.entries(FIXED_EXCHANGE_RATES).forEach(([key, baseRate]) => {
        const newRate = generateVolatileRate(baseRate.rate, 0.3);

        newRates[key] = {
          from: baseRate.from,
          to: baseRate.to,
          rate: newRate,
          timestamp: new Date(),
        };
      });

      setExchangeRates(newRates);
    }

    setLastUpdate(new Date());
  }, [isTestMode]);

  // Update prices on interval (only in normal mode)
  useEffect(() => {
    updatePrices();

    if (!isTestMode) {
      const interval = setInterval(updatePrices, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isTestMode, updatePrices]);

  const toggleTestMode = useCallback(() => {
    setIsTestMode(prev => !prev);
  }, []);

  return {
    prices,
    exchangeRates,
    isTestMode,
    lastUpdate,
    toggleTestMode,
  };
}
