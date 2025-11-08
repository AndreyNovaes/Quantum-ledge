/**
 * Test Scenarios - Deterministic market conditions for QA testing
 *
 * Usage: ?scenario=bull_market or ?scenario=bear_market
 *
 * This provides predictable variations instead of random volatility
 */

import { Money } from './currency';
import { MarketPrice, ExchangeRate } from './types';
import Decimal from 'decimal.js';
import { FIXED_MARKET_PRICES, FIXED_EXCHANGE_RATES } from './mock-data';

export type ScenarioType =
  | 'fixed'           // Completamente fixo (padrão do test_mode=true)
  | 'bull_market'     // Mercado em alta (preços sobem gradualmente)
  | 'bear_market'     // Mercado em queda (preços caem gradualmente)
  | 'volatile'        // Alta volatilidade (grandes variações)
  | 'stable'          // Estável (pequenas variações)
  | 'crash'           // Crash do mercado (-20% em todos os ativos)
  | 'rally'           // Rally do mercado (+15% em todos os ativos)
  | 'interest_hike'   // Aumento de juros (taxas cambiais mudam)
  | 'interest_cut';   // Corte de juros (taxas cambiais mudam)

interface ScenarioConfig {
  name: string;
  description: string;
  priceMultiplier: (basePrice: Money, tickCount: number) => Money;
  exchangeRateMultiplier: (baseRate: Decimal, tickCount: number) => Decimal;
}

/**
 * Cenários predefinidos para testes
 */
export const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
  fixed: {
    name: 'Fixed Prices',
    description: 'Preços completamente fixos, sem nenhuma variação',
    priceMultiplier: (basePrice) => basePrice,
    exchangeRateMultiplier: (baseRate) => baseRate,
  },

  bull_market: {
    name: 'Bull Market',
    description: 'Mercado em alta - preços sobem 0.5% a cada tick (previsível)',
    priceMultiplier: (basePrice, tickCount) => {
      // Cada tick = +0.5% (determinístico)
      const increase = new Decimal(1.005).pow(tickCount);
      return basePrice.multiply(increase);
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      // USD se fortalece: outras moedas ficam mais baratas
      const decrease = new Decimal(0.998).pow(tickCount);
      return baseRate.times(decrease);
    },
  },

  bear_market: {
    name: 'Bear Market',
    description: 'Mercado em queda - preços caem 0.3% a cada tick (previsível)',
    priceMultiplier: (basePrice, tickCount) => {
      // Cada tick = -0.3% (determinístico)
      const decrease = new Decimal(0.997).pow(tickCount);
      return basePrice.multiply(decrease);
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      // USD se enfraquece: outras moedas ficam mais caras
      const increase = new Decimal(1.002).pow(tickCount);
      return baseRate.times(increase);
    },
  },

  volatile: {
    name: 'High Volatility',
    description: 'Alta volatilidade - variações de ±2% alternadas (previsível)',
    priceMultiplier: (basePrice, tickCount) => {
      // Oscila: +2%, -2%, +2%, -2%... (padrão determinístico)
      const isUp = tickCount % 2 === 0;
      const multiplier = isUp ? new Decimal(1.02) : new Decimal(0.98);
      const power = Math.floor(tickCount / 2) + 1;
      return basePrice.multiply(multiplier.pow(power));
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      const isUp = tickCount % 2 === 0;
      const multiplier = isUp ? new Decimal(1.01) : new Decimal(0.99);
      return baseRate.times(multiplier);
    },
  },

  stable: {
    name: 'Stable Market',
    description: 'Mercado estável - variações mínimas de ±0.1% (previsível)',
    priceMultiplier: (basePrice, tickCount) => {
      // Variação senoidal muito pequena
      const angle = tickCount * 0.1;
      const variation = Math.sin(angle) * 0.001; // ±0.1%
      return basePrice.multiply(new Decimal(1 + variation));
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      const angle = tickCount * 0.1;
      const variation = Math.sin(angle) * 0.0005;
      return baseRate.times(new Decimal(1 + variation));
    },
  },

  crash: {
    name: 'Market Crash',
    description: 'Crash do mercado - queda súbita de 20% no primeiro tick',
    priceMultiplier: (basePrice, tickCount) => {
      if (tickCount === 0) {
        return basePrice; // Preço inicial
      }
      // -20% no primeiro tick, depois estabiliza
      return basePrice.multiply(new Decimal(0.80));
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      if (tickCount === 0) return baseRate;
      // USD se fortalece 10% durante o crash
      return baseRate.times(new Decimal(0.90));
    },
  },

  rally: {
    name: 'Market Rally',
    description: 'Rally do mercado - alta súbita de 15% no primeiro tick',
    priceMultiplier: (basePrice, tickCount) => {
      if (tickCount === 0) {
        return basePrice;
      }
      // +15% no primeiro tick, depois pequenas altas
      const initialRally = new Decimal(1.15);
      const continuedGrowth = new Decimal(1.002).pow(tickCount - 1);
      return basePrice.multiply(initialRally).multiply(continuedGrowth);
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      if (tickCount === 0) return baseRate;
      // USD se enfraquece 5% durante o rally
      return baseRate.times(new Decimal(1.05));
    },
  },

  interest_hike: {
    name: 'Interest Rate Hike',
    description: 'Aumento de juros - USD se fortalece, ações caem levemente',
    priceMultiplier: (basePrice, tickCount) => {
      // Ações caem 0.2% por tick (reação ao aumento de juros)
      const decrease = new Decimal(0.998).pow(tickCount);
      return basePrice.multiply(decrease);
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      // USD se fortalece 1% por tick
      const strengthening = new Decimal(0.99).pow(tickCount);
      return baseRate.times(strengthening);
    },
  },

  interest_cut: {
    name: 'Interest Rate Cut',
    description: 'Corte de juros - USD se enfraquece, ações sobem',
    priceMultiplier: (basePrice, tickCount) => {
      // Ações sobem 0.3% por tick (reação ao corte de juros)
      const increase = new Decimal(1.003).pow(tickCount);
      return basePrice.multiply(increase);
    },
    exchangeRateMultiplier: (baseRate, tickCount) => {
      // USD se enfraquece 0.5% por tick
      const weakening = new Decimal(1.005).pow(tickCount);
      return baseRate.times(weakening);
    },
  },
};

/**
 * Gera preços de mercado baseado no cenário escolhido
 */
export function generateScenarioPrices(
  scenario: ScenarioType,
  tickCount: number
): Record<string, MarketPrice> {
  const config = SCENARIOS[scenario];
  const prices: Record<string, MarketPrice> = {};

  Object.entries(FIXED_MARKET_PRICES).forEach(([symbol, basePrice]) => {
    const newPrice = config.priceMultiplier(basePrice.price, tickCount);
    const change = newPrice.subtract(basePrice.price);
    const changePercent = change.toDecimal()
      .dividedBy(basePrice.price.toDecimal())
      .times(100);

    prices[symbol] = {
      symbol,
      price: newPrice,
      change: change.toDecimal(),
      changePercent: new Decimal(changePercent.toFixed(2)),
      timestamp: new Date(),
    };
  });

  return prices;
}

/**
 * Gera taxas de câmbio baseado no cenário escolhido
 */
export function generateScenarioExchangeRates(
  scenario: ScenarioType,
  tickCount: number
): Record<string, ExchangeRate> {
  const config = SCENARIOS[scenario];
  const rates: Record<string, ExchangeRate> = {};

  Object.entries(FIXED_EXCHANGE_RATES).forEach(([key, baseRate]) => {
    const newRate = config.exchangeRateMultiplier(baseRate.rate, tickCount);

    rates[key] = {
      from: baseRate.from,
      to: baseRate.to,
      rate: newRate,
      timestamp: new Date(),
    };
  });

  return rates;
}

/**
 * Obter descrição do cenário
 */
export function getScenarioDescription(scenario: ScenarioType): string {
  return SCENARIOS[scenario]?.description || 'Cenário desconhecido';
}

/**
 * Listar todos os cenários disponíveis
 */
export function getAllScenarios(): Array<{ key: ScenarioType; name: string; description: string }> {
  return Object.entries(SCENARIOS).map(([key, config]) => ({
    key: key as ScenarioType,
    name: config.name,
    description: config.description,
  }));
}
