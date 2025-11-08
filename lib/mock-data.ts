/**
 * Mock data for Quantum Ledger
 * Provides STABLE data for deterministic testing when in test mode
 */

import { Account, Transaction, Asset, MarketPrice, ExchangeRate, UserProfile, PortfolioHistoryPoint } from './types';
import { Money } from './currency';
import Decimal from 'decimal.js';

/**
 * FIXED prices for test mode (test_mode=true)
 * These values are deterministic and never change
 */
export const FIXED_MARKET_PRICES: Record<string, MarketPrice> = {
  AAPL: {
    symbol: 'AAPL',
    price: new Money('175.50', 'USD'),
    change: new Decimal('2.50'),
    changePercent: new Decimal('1.44'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  GOOGL: {
    symbol: 'GOOGL',
    price: new Money('142.30', 'USD'),
    change: new Decimal('-1.20'),
    changePercent: new Decimal('-0.84'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  MSFT: {
    symbol: 'MSFT',
    price: new Money('380.75', 'USD'),
    change: new Decimal('5.25'),
    changePercent: new Decimal('1.40'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  TSLA: {
    symbol: 'TSLA',
    price: new Money('238.45', 'USD'),
    change: new Decimal('-3.15'),
    changePercent: new Decimal('-1.30'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  AMZN: {
    symbol: 'AMZN',
    price: new Money('156.88', 'USD'),
    change: new Decimal('0.88'),
    changePercent: new Decimal('0.56'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
};

/**
 * FIXED exchange rates for test mode
 */
export const FIXED_EXCHANGE_RATES: Record<string, ExchangeRate> = {
  'USD-BRL': {
    from: 'USD',
    to: 'BRL',
    rate: new Decimal('5.123456'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  'USD-EUR': {
    from: 'USD',
    to: 'EUR',
    rate: new Decimal('0.923456'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  'BRL-USD': {
    from: 'BRL',
    to: 'USD',
    rate: new Decimal('0.195186'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  'BRL-EUR': {
    from: 'BRL',
    to: 'EUR',
    rate: new Decimal('0.180234'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  'EUR-USD': {
    from: 'EUR',
    to: 'USD',
    rate: new Decimal('1.082945'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
  'EUR-BRL': {
    from: 'EUR',
    to: 'BRL',
    rate: new Decimal('5.549123'),
    timestamp: new Date('2025-01-15T16:00:00Z'),
  },
};

/**
 * Mock user accounts
 */
export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-usd-checking',
    name: 'US Dollar Checking',
    balance: new Money('15234.56', 'USD'),
    currency: 'USD',
    type: 'checking',
  },
  {
    id: 'acc-usd-savings',
    name: 'US Dollar Savings',
    balance: new Money('45678.90', 'USD'),
    currency: 'USD',
    type: 'savings',
  },
  {
    id: 'acc-brl-checking',
    name: 'Brazilian Real Checking',
    balance: new Money('78901.23', 'BRL'),
    currency: 'BRL',
    type: 'checking',
  },
  {
    id: 'acc-eur-savings',
    name: 'Euro Savings',
    balance: new Money('23456.78', 'EUR'),
    currency: 'EUR',
    type: 'savings',
  },
];

/**
 * Mock user assets (stocks)
 */
export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: new Decimal('50'),
    averagePurchasePrice: new Money('165.00', 'USD'),
    currentPrice: new Money('175.50', 'USD'), // Will be updated by market data
    currency: 'USD',
    assetType: 'stock',
  },
  {
    id: 'asset-googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    quantity: new Decimal('25'),
    averagePurchasePrice: new Money('145.00', 'USD'),
    currentPrice: new Money('142.30', 'USD'),
    currency: 'USD',
    assetType: 'stock',
  },
  {
    id: 'asset-msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    quantity: new Decimal('30'),
    averagePurchasePrice: new Money('370.00', 'USD'),
    currentPrice: new Money('380.75', 'USD'),
    currency: 'USD',
    assetType: 'stock',
  },
  {
    id: 'asset-tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    quantity: new Decimal('15'),
    averagePurchasePrice: new Money('245.00', 'USD'),
    currentPrice: new Money('238.45', 'USD'),
    currency: 'USD',
    assetType: 'stock',
  },
];

/**
 * Mock transactions
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    date: new Date('2025-01-10T10:30:00Z'),
    description: 'Salary Deposit',
    amount: new Money('5000.00', 'USD'),
    fromAccount: 'external',
    toAccount: 'acc-usd-checking',
    type: 'deposit',
    status: 'completed',
    category: 'Income',
  },
  {
    id: 'txn-002',
    date: new Date('2025-01-11T14:22:00Z'),
    description: 'Transfer to Savings',
    amount: new Money('1500.00', 'USD'),
    fromAccount: 'acc-usd-checking',
    toAccount: 'acc-usd-savings',
    type: 'transfer',
    status: 'completed',
    category: 'Savings',
  },
  {
    id: 'txn-003',
    date: new Date('2025-01-12T09:15:00Z'),
    description: 'Currency Exchange USD to BRL',
    amount: new Money('2000.00', 'USD'),
    fromAccount: 'acc-usd-checking',
    toAccount: 'acc-brl-checking',
    type: 'transfer',
    status: 'completed',
    category: 'Currency Exchange',
    exchangeRate: new Decimal('5.123456'),
    convertedAmount: new Money('10246.91', 'BRL'),
  },
  {
    id: 'txn-004',
    date: new Date('2025-01-13T11:45:00Z'),
    description: 'Purchase AAPL Stock',
    amount: new Money('8250.00', 'USD'),
    fromAccount: 'acc-usd-checking',
    toAccount: 'investment',
    type: 'investment',
    status: 'completed',
    category: 'Investment',
  },
  {
    id: 'txn-005',
    date: new Date('2025-01-14T16:30:00Z'),
    description: 'Dividend from MSFT',
    amount: new Money('45.60', 'USD'),
    fromAccount: 'investment',
    toAccount: 'acc-usd-checking',
    type: 'dividend',
    status: 'completed',
    category: 'Dividend',
  },
  {
    id: 'txn-006',
    date: new Date('2025-01-14T18:00:00Z'),
    description: 'International Wire Transfer',
    amount: new Money('500.00', 'USD'),
    fromAccount: 'acc-usd-checking',
    toAccount: 'acc-eur-savings',
    type: 'transfer',
    status: 'completed',
    category: 'International Transfer',
    exchangeRate: new Decimal('0.923456'),
    convertedAmount: new Money('461.73', 'EUR'),
  },
  {
    id: 'txn-007',
    date: new Date('2025-01-15T08:30:00Z'),
    description: 'ATM Withdrawal',
    amount: new Money('200.00', 'USD'),
    fromAccount: 'acc-usd-checking',
    toAccount: 'external',
    type: 'withdrawal',
    status: 'completed',
    category: 'Cash',
  },
];

/**
 * Mock portfolio history (for charts)
 */
export const MOCK_PORTFOLIO_HISTORY: PortfolioHistoryPoint[] = [
  { date: new Date('2025-01-01'), value: new Money('128000.00', 'USD') },
  { date: new Date('2025-01-02'), value: new Money('129500.00', 'USD') },
  { date: new Date('2025-01-03'), value: new Money('128800.00', 'USD') },
  { date: new Date('2025-01-04'), value: new Money('130200.00', 'USD') },
  { date: new Date('2025-01-05'), value: new Money('131000.00', 'USD') },
  { date: new Date('2025-01-08'), value: new Money('130500.00', 'USD') },
  { date: new Date('2025-01-09'), value: new Money('132100.00', 'USD') },
  { date: new Date('2025-01-10'), value: new Money('133500.00', 'USD') },
  { date: new Date('2025-01-11'), value: new Money('134200.00', 'USD') },
  { date: new Date('2025-01-12'), value: new Money('135800.00', 'USD') },
  { date: new Date('2025-01-13'), value: new Money('137100.00', 'USD') },
  { date: new Date('2025-01-14'), value: new Money('138400.00', 'USD') },
  { date: new Date('2025-01-15'), value: new Money('139200.00', 'USD') },
];

/**
 * Generate volatile prices for normal mode (simulates market fluctuations)
 */
export function generateVolatilePrices(basePrice: Money, volatilityPercent: number = 2): Money {
  const randomChange = (Math.random() - 0.5) * 2 * volatilityPercent / 100;
  return basePrice.multiply(new Decimal(1).plus(randomChange));
}

/**
 * Generate volatile exchange rate
 */
export function generateVolatileRate(baseRate: Decimal, volatilityPercent: number = 0.5): Decimal {
  const randomChange = (Math.random() - 0.5) * 2 * volatilityPercent / 100;
  return baseRate.times(new Decimal(1).plus(randomChange));
}

/**
 * Get initial user profile
 */
export function getInitialUserProfile(): UserProfile {
  return {
    id: 'user-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    preferredCurrency: 'USD',
    accounts: MOCK_ACCOUNTS,
    assets: MOCK_ASSETS,
    transactions: MOCK_TRANSACTIONS,
  };
}
