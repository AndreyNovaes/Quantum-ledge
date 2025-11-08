/**
 * Test Data - Dados fixos para validar regras de negócio
 *
 * Este arquivo contém dados de teste que expõem edge cases
 * e validam cálculos financeiros críticos.
 *
 * Uso: ?test_mode=true (valores fixos)
 */

import { Money } from './currency';
import { Account, Asset, Transaction } from './types';
import Decimal from 'decimal.js';

/**
 * EDGE CASES PARA TESTES
 */

// Caso 1: Teste de precisão decimal (0.1 + 0.2 = 0.3)
export const PRECISION_TEST_AMOUNTS = {
  amount1: new Money('0.1', 'USD'),
  amount2: new Money('0.2', 'USD'),
  expected: new Money('0.3', 'USD'), // DEVE ser exatamente 0.3
};

// Caso 2: Conversão de moeda com muitas casas decimais
export const CURRENCY_CONVERSION_TEST = {
  sourceAmount: new Money('1000.00', 'USD'),
  exchangeRate: new Decimal('5.123456'), // 6 casas decimais
  expectedBRL: new Money('5123.46', 'BRL'), // Arredondamento correto
};

// Caso 3: Saldo insuficiente
export const INSUFFICIENT_BALANCE_TEST = {
  accountBalance: new Money('100.00', 'USD'),
  transferAmount: new Money('150.00', 'USD'), // Maior que saldo
  shouldFail: true,
};

// Caso 4: Transferência para mesma conta
export const SAME_ACCOUNT_TEST = {
  fromAccountId: 'acc-usd-checking',
  toAccountId: 'acc-usd-checking', // Mesma conta
  shouldFail: true,
};

// Caso 5: Valores com muitas casas decimais
export const HIGH_PRECISION_TEST = {
  price: new Money('123.456789', 'USD'), // Muitas casas
  expectedFormatted: '$ 123.46', // Deve arredondar para 2 casas
};

// Caso 6: Ganho/Perda zero
export const ZERO_GAIN_TEST = {
  purchasePrice: new Money('100.00', 'USD'),
  currentPrice: new Money('100.00', 'USD'),
  quantity: new Decimal('10'),
  expectedGain: new Money('0.00', 'USD'),
  expectedTax: new Money('0.00', 'USD'),
};

// Caso 7: Prejuízo (não deve cobrar imposto)
export const LOSS_TEST = {
  purchasePrice: new Money('150.00', 'USD'),
  currentPrice: new Money('100.00', 'USD'),
  quantity: new Decimal('10'),
  expectedLoss: new Money('-500.00', 'USD'),
  expectedTax: new Money('0.00', 'USD'), // Sem imposto em perda
};

// Caso 8: Empréstimo - última parcela deve zerar saldo
export const LOAN_FINAL_BALANCE_TEST = {
  loanAmount: new Money('10000.00', 'USD'),
  annualRate: new Decimal('0.05'), // 5%
  months: 12,
  // Última parcela DEVE ter balance = $0.00
};

// Caso 9: Formatação i18n
export const I18N_FORMATTING_TEST = {
  USD: {
    amount: new Money('1234.56', 'USD'),
    expected: '$ 1,234.56', // Separador de milhares: vírgula, decimal: ponto
  },
  BRL: {
    amount: new Money('1234.56', 'BRL'),
    expected: 'R$ 1.234,56', // Separador de milhares: ponto, decimal: vírgula
  },
  EUR: {
    amount: new Money('1234.56', 'EUR'),
    expected: '€ 1.234,56',
  },
};

// Caso 10: Múltiplas moedas - conversão para patrimônio líquido
export const MULTI_CURRENCY_NET_WORTH_TEST = {
  accounts: [
    { balance: new Money('1000.00', 'USD'), currency: 'USD' as const },
    { balance: new Money('5000.00', 'BRL'), currency: 'BRL' as const },
    { balance: new Money('500.00', 'EUR'), currency: 'EUR' as const },
  ],
  exchangeRates: {
    'BRL-USD': new Decimal('0.195186'), // 1 BRL = 0.195186 USD
    'EUR-USD': new Decimal('1.082945'), // 1 EUR = 1.082945 USD
  },
  // Net Worth = 1000 + (5000 × 0.195186) + (500 × 1.082945)
  // Net Worth = 1000 + 975.93 + 541.47 = 2517.40
  expectedNetWorthUSD: new Money('2517.40', 'USD'),
};

/**
 * DADOS PARA VALIDAÇÃO DE REGRAS DE NEGÓCIO
 */

// Contas para testes
export const TEST_ACCOUNTS: Account[] = [
  {
    id: 'test-acc-1',
    name: 'Test Account USD',
    balance: new Money('5000.00', 'USD'),
    currency: 'USD',
    type: 'checking',
  },
  {
    id: 'test-acc-2',
    name: 'Test Account BRL',
    balance: new Money('10000.00', 'BRL'),
    currency: 'BRL',
    type: 'checking',
  },
  {
    id: 'test-acc-empty',
    name: 'Empty Account',
    balance: new Money('0.00', 'USD'),
    currency: 'USD',
    type: 'savings',
  },
];

// Ativos para testes de ganho/perda
export const TEST_ASSETS: Asset[] = [
  {
    id: 'test-asset-gain',
    symbol: 'GAIN',
    name: 'Asset with Gain',
    quantity: new Decimal('10'),
    averagePurchasePrice: new Money('100.00', 'USD'),
    currentPrice: new Money('150.00', 'USD'), // +50%
    currency: 'USD',
    assetType: 'stock',
  },
  {
    id: 'test-asset-loss',
    symbol: 'LOSS',
    name: 'Asset with Loss',
    quantity: new Decimal('10'),
    averagePurchasePrice: new Money('100.00', 'USD'),
    currentPrice: new Money('80.00', 'USD'), // -20%
    currency: 'USD',
    assetType: 'stock',
  },
  {
    id: 'test-asset-neutral',
    symbol: 'NEUT',
    name: 'Asset Neutral',
    quantity: new Decimal('10'),
    averagePurchasePrice: new Money('100.00', 'USD'),
    currentPrice: new Money('100.00', 'USD'), // Sem ganho/perda
    currency: 'USD',
    assetType: 'stock',
  },
];

// Transações para testes de filtros e exportação
export const TEST_TRANSACTIONS: Transaction[] = [
  {
    id: 'test-txn-1',
    date: new Date('2025-01-01T10:00:00Z'),
    description: 'Test Deposit',
    amount: new Money('1000.00', 'USD'),
    fromAccount: 'external',
    toAccount: 'test-acc-1',
    type: 'deposit',
    status: 'completed',
  },
  {
    id: 'test-txn-2',
    date: new Date('2025-01-15T14:00:00Z'),
    description: 'Test Transfer',
    amount: new Money('500.00', 'USD'),
    fromAccount: 'test-acc-1',
    toAccount: 'test-acc-2',
    type: 'transfer',
    status: 'completed',
    exchangeRate: new Decimal('5.123456'),
    convertedAmount: new Money('2561.73', 'BRL'),
  },
];

/**
 * CASOS DE TESTE DOCUMENTADOS
 *
 * Use estes dados para validar:
 *
 * 1. Precisão Numérica:
 *    - PRECISION_TEST_AMOUNTS: 0.1 + 0.2 deve ser exatamente 0.3
 *
 * 2. Conversão de Moeda:
 *    - CURRENCY_CONVERSION_TEST: Validar 6 casas decimais
 *    - MULTI_CURRENCY_NET_WORTH_TEST: Somar múltiplas moedas
 *
 * 3. Validações de Negócio:
 *    - INSUFFICIENT_BALANCE_TEST: Transferência deve falhar
 *    - SAME_ACCOUNT_TEST: Transferência para mesma conta deve falhar
 *
 * 4. Impostos:
 *    - ZERO_GAIN_TEST: Sem ganho = sem imposto
 *    - LOSS_TEST: Prejuízo = sem imposto
 *
 * 5. Empréstimos:
 *    - LOAN_FINAL_BALANCE_TEST: Última parcela = saldo zero
 *
 * 6. Formatação:
 *    - I18N_FORMATTING_TEST: Validar formato de cada moeda
 *    - HIGH_PRECISION_TEST: Arredondamento correto
 */
