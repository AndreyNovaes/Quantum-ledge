/**
 * Hook for managing market data with test scenarios
 * Supports deterministic scenarios for QA testing
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketPrice, ExchangeRate } from '@/lib/types';
import {
  FIXED_MARKET_PRICES,
  FIXED_EXCHANGE_RATES,
  generateVolatilePrices,
  generateVolatileRate
} from '@/lib/mock-data';
import {
  ScenarioType,
  generateScenarioPrices,
  generateScenarioExchangeRates,
  getScenarioDescription,
} from '@/lib/test-scenarios';
import Decimal from 'decimal.js';

const UPDATE_INTERVAL = 3000; // 3 seconds

interface UseMarketDataReturn {
  prices: Record<string, MarketPrice>;
  exchangeRates: Record<string, ExchangeRate>;
  isTestMode: boolean;
  scenario: ScenarioType | null;
  scenarioDescription: string | null;
  tickCount: number;
  lastUpdate: Date | null;
  toggleTestMode: () => void;
}

export function useMarketData(initialTestMode?: boolean): UseMarketDataReturn {
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [scenario, setScenario] = useState<ScenarioType | null>(null);
  const [tickCount, setTickCount] = useState<number>(0);
  const [prices, setPrices] = useState<Record<string, MarketPrice>>(FIXED_MARKET_PRICES);
  const [exchangeRates, setExchangeRates] = useState<Record<string, ExchangeRate>>(FIXED_EXCHANGE_RATES);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Check for test_mode and scenario query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      // Check for test_mode parameter
      const testModeParam = params.get('test_mode');
      if (testModeParam === 'true') {
        setIsTestMode(true);
        setScenario('fixed');
      } else if (initialTestMode !== undefined) {
        setIsTestMode(initialTestMode);
      }

      // Check for scenario parameter
      const scenarioParam = params.get('scenario') as ScenarioType;
      if (scenarioParam) {
        setScenario(scenarioParam);
        setIsTestMode(true); // Scenarios are always in test mode
      }
    }
  }, [initialTestMode]);

  const updatePrices = useCallback(() => {
    if (scenario) {
      // Use scenario-based generation (deterministic)
      const newPrices = generateScenarioPrices(scenario, tickCount);
      const newRates = generateScenarioExchangeRates(scenario, tickCount);

      setPrices(newPrices);
      setExchangeRates(newRates);
      setTickCount(prev => prev + 1);
    } else if (isTestMode) {
      // In test mode without scenario, use fixed prices
      setPrices(FIXED_MARKET_PRICES);
      setExchangeRates(FIXED_EXCHANGE_RATES);
    } else {
      // In normal mode, generate volatile prices (random)
      const newPrices: Record<string, MarketPrice> = {};

      Object.entries(FIXED_MARKET_PRICES).forEach(([symbol, basePrice]) => {
        const newPrice = generateVolatilePrices(basePrice.price, 2);
        const change = newPrice.subtract(basePrice.price);
        const changePercent = change.toDecimal()
          .dividedBy(basePrice.price.toDecimal())
          .times(100);

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
  }, [isTestMode, scenario, tickCount]);

  // Update prices on interval
  useEffect(() => {
    updatePrices();

    // Only update on interval if not in fixed mode
    if (!isTestMode || scenario !== 'fixed') {
      const interval = setInterval(updatePrices, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isTestMode, scenario, updatePrices]);

  const toggleTestMode = useCallback(() => {
    setIsTestMode(prev => !prev);
    if (isTestMode) {
      setScenario(null);
      setTickCount(0);
    }
  }, [isTestMode]);

  const scenarioDescription = scenario ? getScenarioDescription(scenario) : null;

  return {
    prices,
    exchangeRates,
    isTestMode,
    scenario,
    scenarioDescription,
    tickCount,
    lastUpdate,
    toggleTestMode,
  };
}
