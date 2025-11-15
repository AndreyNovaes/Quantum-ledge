/**
 * Type definitions for Quantum Ledger
 */

import { Money, CurrencyCode } from './currency';
import Decimal from 'decimal.js';

export interface Account {
  id: string;
  name: string;
  balance: Money;
  currency: CurrencyCode;
  type: 'checking' | 'savings' | 'investment';
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: Money;
  fromAccount: string;
  toAccount: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'investment' | 'dividend';
  status: 'pending' | 'completed' | 'failed';
  category?: string;
  exchangeRate?: Decimal;
  convertedAmount?: Money;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: Decimal;
  averagePurchasePrice: Money;
  currentPrice: Money;
  currency: CurrencyCode;
  assetType: 'stock' | 'bond' | 'crypto' | 'commodity';
}

export interface MarketPrice {
  symbol: string;
  price: Money;
  change: Decimal;
  changePercent: Decimal;
  timestamp: Date;
}

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: Decimal;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredCurrency: CurrencyCode;
  accounts: Account[];
  assets: Asset[];
  transactions: Transaction[];
}

export interface PortfolioHistoryPoint {
  date: Date;
  value: Money;
}

export interface LoanCalculation {
  loanAmount: Money;
  annualRate: Decimal;
  months: number;
  monthlyPayment: Money;
  totalInterest: Money;
  totalPayment: Money;
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  type?: Transaction['type'];
  accountId?: string;
  minAmount?: Money;
  maxAmount?: Money;
}

export interface MarketDataContextType {
  prices: Record<string, MarketPrice>;
  exchangeRates: Record<string, ExchangeRate>;
  isTestMode: boolean;
  lastUpdate: Date | null;
}

export interface TransferFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
  convertCurrency: boolean;
}

export interface ExportFormat {
  format: 'csv' | 'pdf';
  data: Transaction[];
  currency: CurrencyCode;
}
