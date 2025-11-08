/**
 * Testes de Regras de Negócio
 * Validações de lógica de negócio da aplicação
 */

import { describe, it, expect } from 'vitest';
import { Money, sum } from '../lib/currency';
import { MOCK_ACCOUNTS, MOCK_ASSETS, FIXED_EXCHANGE_RATES } from '../lib/mock-data';
import Decimal from 'decimal.js';

describe('Transferências - Validações', () => {
  it('não deve permitir transferência com saldo insuficiente', () => {
    const accountBalance = new Money('100.00', 'USD');
    const transferAmount = new Money('150.00', 'USD');

    const hasInsufficientFunds = transferAmount.greaterThan(accountBalance);

    expect(hasInsufficientFunds).toBe(true);
  });

  it('deve permitir transferência com saldo suficiente', () => {
    const accountBalance = new Money('100.00', 'USD');
    const transferAmount = new Money('50.00', 'USD');

    const hasInsufficientFunds = transferAmount.greaterThan(accountBalance);

    expect(hasInsufficientFunds).toBe(false);
  });

  it('não deve permitir transferência de valor zero', () => {
    const transferAmount = new Money('0.00', 'USD');
    const zero = new Money('0', 'USD');

    expect(transferAmount.lessThanOrEqual(zero)).toBe(true);
  });

  it('não deve permitir transferência de valor negativo', () => {
    const transferAmount = new Money('-10.00', 'USD');
    const zero = new Money('0', 'USD');

    expect(transferAmount.lessThan(zero)).toBe(true);
  });
});

describe('Conversão de Moeda - Transferências', () => {
  it('deve converter USD para BRL na transferência', () => {
    const usdAmount = new Money('1000.00', 'USD');
    const rate = FIXED_EXCHANGE_RATES['USD-BRL'].rate;

    const brlAmount = usdAmount.convert('BRL', rate);

    expect(brlAmount.toNumber()).toBe(5123.46);
    expect(brlAmount.currency).toBe('BRL');
  });

  it('taxa de câmbio deve ter 6 casas decimais', () => {
    const rate = FIXED_EXCHANGE_RATES['USD-BRL'].rate;

    expect(rate.toString()).toBe('5.123456');
  });
});

describe('Portfólio - Cálculo de Ganho/Perda', () => {
  it('deve calcular ganho corretamente', () => {
    const asset = MOCK_ASSETS[0]; // AAPL
    const purchasePrice = asset.averagePurchasePrice; // $165.00
    const currentPrice = asset.currentPrice; // $175.50
    const quantity = asset.quantity; // 50

    const gainPerShare = currentPrice.subtract(purchasePrice);
    const totalGain = gainPerShare.multiply(quantity);

    expect(totalGain.toNumber()).toBe(525.00); // (175.50 - 165.00) * 50
  });

  it('deve calcular prejuízo corretamente', () => {
    const purchasePrice = new Money('245.00', 'USD');
    const currentPrice = new Money('238.45', 'USD');
    const quantity = new Decimal('15');

    const lossPerShare = currentPrice.subtract(purchasePrice);
    const totalLoss = lossPerShare.multiply(quantity);

    expect(totalLoss.toNumber()).toBe(-98.25); // (238.45 - 245.00) * 15
  });

  it('ganho/perda zero quando preços iguais', () => {
    const price = new Money('100.00', 'USD');
    const quantity = new Decimal('10');

    const gainLoss = price.subtract(price).multiply(quantity);

    expect(gainLoss.toNumber()).toBe(0.00);
  });
});

describe('Patrimônio Líquido - Multi-Moeda', () => {
  it('deve somar contas em USD', () => {
    const usdAccounts = MOCK_ACCOUNTS.filter(acc => acc.currency === 'USD');
    const balances = usdAccounts.map(acc => acc.balance);
    const total = sum(balances);

    // US Dollar Checking: $15,234.56 + US Dollar Savings: $45,678.90
    expect(total.toNumber()).toBe(60913.46);
  });

  it('deve converter BRL para USD e somar', () => {
    const brlAccount = MOCK_ACCOUNTS.find(acc => acc.id === 'acc-brl-checking');
    const rate = FIXED_EXCHANGE_RATES['BRL-USD'].rate;

    if (!brlAccount) throw new Error('BRL account not found');

    const brlInUSD = brlAccount.balance.convert('USD', rate);

    // R$ 78,901.23 * 0.195186 = ~$15,400.12
    expect(brlInUSD.toNumber()).toBeCloseTo(15400.12, 2);
  });

  it('deve calcular patrimônio líquido total', () => {
    // Contas USD
    const usdAccounts = MOCK_ACCOUNTS.filter(acc => acc.currency === 'USD');
    const usdTotal = sum(usdAccounts.map(acc => acc.balance));

    // Conta BRL convertida
    const brlAccount = MOCK_ACCOUNTS.find(acc => acc.currency === 'BRL')!;
    const brlInUSD = brlAccount.balance.convert('USD', FIXED_EXCHANGE_RATES['BRL-USD'].rate);

    // Conta EUR convertida
    const eurAccount = MOCK_ACCOUNTS.find(acc => acc.currency === 'EUR')!;
    const eurInUSD = eurAccount.balance.convert('USD', FIXED_EXCHANGE_RATES['EUR-USD'].rate);

    // Total de contas
    const totalAccounts = usdTotal.add(brlInUSD).add(eurInUSD);

    // Investimentos
    const assetValues = MOCK_ASSETS.map(asset => asset.currentPrice.multiply(asset.quantity));
    const totalInvestments = sum([...assetValues, new Money(0, 'USD')]);

    // Patrimônio líquido total
    const netWorth = totalAccounts.add(totalInvestments);

    expect(netWorth.toNumber()).toBeGreaterThan(100000); // Deve ser > $100k
  });
});

describe('Impostos - Capital Gains', () => {
  it('deve calcular imposto de 15% sobre ganhos', () => {
    const gain = new Money('500.00', 'USD');
    const taxRate = new Decimal('0.15');
    const tax = gain.multiply(taxRate);

    expect(tax.toNumber()).toBe(75.00);
  });

  it('NÃO deve cobrar imposto em prejuízo', () => {
    const loss = new Money('-500.00', 'USD');
    const zero = new Money('0', 'USD');

    const shouldPayTax = loss.greaterThan(zero);

    expect(shouldPayTax).toBe(false);
  });
});

describe('Formatação - Data Display', () => {
  it('valores grandes devem ter separador de milhares', () => {
    const amount = new Money('1234567.89', 'USD');

    expect(amount.format()).toBe('$ 1,234,567.89');
  });

  it('valores pequenos devem manter 2 casas decimais', () => {
    const amount = new Money('0.50', 'USD');

    expect(amount.format()).toBe('$ 0.50');
  });
});

describe('Edge Cases', () => {
  it('deve lidar com valores muito pequenos', () => {
    const tiny = new Money('0.01', 'USD');

    expect(tiny.toNumber()).toBe(0.01);
    expect(tiny.format()).toBe('$ 0.01');
  });

  it('deve lidar com valores muito grandes', () => {
    const large = new Money('999999999.99', 'USD');

    expect(large.toNumber()).toBe(999999999.99);
  });

  it('deve evitar erro de arredondamento em operações múltiplas', () => {
    const a = new Money('0.1', 'USD');
    const b = new Money('0.2', 'USD');
    const c = new Money('0.3', 'USD');

    const sum1 = a.add(b);
    const sum2 = sum1.add(c);

    expect(sum2.toNumber()).toBe(0.6);
  });
});
