/**
 * Testes unitários para lib/currency.ts
 * Foco: Regras de negócio críticas e precisão financeira
 */

import { describe, it, expect } from 'vitest';
import {
  Money,
  calculateAmortization,
  calculateCapitalGainsTax,
  calculateCompoundInterest,
  parseMoney,
  sum,
} from '../lib/currency';
import Decimal from 'decimal.js';

describe('Money - Precisão Decimal', () => {
  it('deve somar 0.1 + 0.2 = 0.3 (exatamente)', () => {
    const a = new Money('0.1', 'USD');
    const b = new Money('0.2', 'USD');
    const result = a.add(b);

    expect(result.toNumber()).toBe(0.3);
    expect(result.format()).toBe('$ 0.30');
  });

  it('deve subtrair valores sem erro de floating-point', () => {
    const a = new Money('1.0', 'USD');
    const b = new Money('0.9', 'USD');
    const result = a.subtract(b);

    expect(result.toNumber()).toBe(0.1);
    expect(result.format()).toBe('$ 0.10');
  });

  it('deve multiplicar com precisão', () => {
    const price = new Money('0.1', 'USD');
    const result = price.multiply(3);

    expect(result.toNumber()).toBe(0.3);
  });

  it('deve dividir com precisão', () => {
    const amount = new Money('1.0', 'USD');
    const result = amount.divide(3);

    expect(result.toNumber()).toBeCloseTo(0.33, 2);
  });
});

describe('Money - Conversão de Moeda', () => {
  it('deve converter USD para BRL com 6 casas decimais', () => {
    const usd = new Money('1000.00', 'USD');
    const rate = new Decimal('5.123456');
    const brl = usd.convert('BRL', rate);

    expect(brl.currency).toBe('BRL');
    expect(brl.toNumber()).toBe(5123.46);
    expect(brl.format()).toBe('R$ 5.123,46');
  });

  it('deve converter BRL para USD corretamente', () => {
    const brl = new Money('5123.46', 'BRL');
    const rate = new Decimal('0.195186'); // 1 BRL = 0.195186 USD
    const usd = brl.convert('USD', rate);

    expect(usd.currency).toBe('USD');
    expect(usd.toNumber()).toBeCloseTo(1000.00, 2);
  });
});

describe('Money - Comparações', () => {
  it('deve comparar valores corretamente', () => {
    const a = new Money('100.00', 'USD');
    const b = new Money('50.00', 'USD');
    const c = new Money('100.00', 'USD');

    expect(a.greaterThan(b)).toBe(true);
    expect(b.lessThan(a)).toBe(true);
    expect(a.equals(c)).toBe(true);
  });

  it('deve validar saldo insuficiente', () => {
    const balance = new Money('100.00', 'USD');
    const transfer = new Money('150.00', 'USD');

    expect(transfer.greaterThan(balance)).toBe(true);
  });
});

describe('Money - Formatação i18n', () => {
  it('deve formatar USD corretamente', () => {
    const amount = new Money('1234.56', 'USD');
    expect(amount.format()).toBe('$ 1,234.56');
  });

  it('deve formatar BRL corretamente', () => {
    const amount = new Money('1234.56', 'BRL');
    expect(amount.format()).toBe('R$ 1.234,56');
  });

  it('deve formatar EUR corretamente', () => {
    const amount = new Money('1234.56', 'EUR');
    expect(amount.format()).toBe('€ 1.234,56');
  });

  it('deve arredondar para 2 casas decimais', () => {
    const amount = new Money('123.456789', 'USD');
    expect(amount.format()).toBe('$ 123.46');
  });
});

describe('calculateAmortization - Empréstimos', () => {
  it('última parcela deve ter saldo zero', () => {
    const loanAmount = new Money('10000.00', 'USD');
    const annualRate = new Decimal('0.05'); // 5%
    const months = 12;

    const schedule = calculateAmortization(loanAmount, annualRate, months);

    expect(schedule).toHaveLength(12);

    // Última parcela
    const lastPayment = schedule[schedule.length - 1];
    expect(lastPayment.balance.toNumber()).toBe(0.0);
  });

  it('soma de principal + juros = pagamento mensal', () => {
    const loanAmount = new Money('100000.00', 'USD');
    const annualRate = new Decimal('0.055'); // 5.5%
    const months = 360;

    const schedule = calculateAmortization(loanAmount, annualRate, months);

    // Verificar primeira parcela
    const firstPayment = schedule[0];
    const sum = firstPayment.principal.add(firstPayment.interest);

    expect(sum.toNumber()).toBeCloseTo(firstPayment.payment.toNumber(), 2);
  });

  it('deve calcular pagamento mensal correto', () => {
    const loanAmount = new Money('100000.00', 'USD');
    const annualRate = new Decimal('0.055'); // 5.5%
    const months = 360;

    const schedule = calculateAmortization(loanAmount, annualRate, months);

    // Pagamento esperado: ~$567.79
    expect(schedule[0].payment.toNumber()).toBeCloseTo(567.79, 2);
  });
});

describe('calculateCapitalGainsTax - Impostos', () => {
  it('deve calcular imposto de 15% sobre ganhos', () => {
    const purchasePrice = new Money('1000.00', 'USD');
    const salePrice = new Money('1500.00', 'USD');
    const taxRate = new Decimal('0.15');

    const { gain, tax } = calculateCapitalGainsTax(purchasePrice, salePrice, taxRate);

    expect(gain.toNumber()).toBe(500.00);
    expect(tax.toNumber()).toBe(75.00); // 500 * 0.15
  });

  it('NÃO deve cobrar imposto em prejuízo', () => {
    const purchasePrice = new Money('1500.00', 'USD');
    const salePrice = new Money('1000.00', 'USD');
    const taxRate = new Decimal('0.15');

    const { gain, tax } = calculateCapitalGainsTax(purchasePrice, salePrice, taxRate);

    expect(gain.toNumber()).toBe(-500.00);
    expect(tax.toNumber()).toBe(0.00); // SEM imposto em perda
  });

  it('ganho zero = imposto zero', () => {
    const purchasePrice = new Money('1000.00', 'USD');
    const salePrice = new Money('1000.00', 'USD');
    const taxRate = new Decimal('0.15');

    const { gain, tax } = calculateCapitalGainsTax(purchasePrice, salePrice, taxRate);

    expect(gain.toNumber()).toBe(0.00);
    expect(tax.toNumber()).toBe(0.00);
  });
});

describe('calculateCompoundInterest - Juros Compostos', () => {
  it('deve calcular juros compostos corretamente', () => {
    const principal = new Money('1000.00', 'USD');
    const annualRate = new Decimal('0.05'); // 5%
    const years = 1;
    const compoundingsPerYear = 12; // Mensal

    const result = calculateCompoundInterest(principal, annualRate, compoundingsPerYear, years);

    // Fórmula: 1000 * (1 + 0.05/12)^12
    expect(result.toNumber()).toBeCloseTo(1051.16, 2);
  });
});

describe('sum - Soma de Arrays', () => {
  it('deve somar array de Money', () => {
    const amounts = [
      new Money('100.00', 'USD'),
      new Money('200.00', 'USD'),
      new Money('300.00', 'USD'),
    ];

    const total = sum(amounts);

    expect(total.toNumber()).toBe(600.00);
  });

  it('deve retornar zero para array vazio', () => {
    const total = sum([]);
    expect(total.toNumber()).toBe(0.00);
  });
});

describe('parseMoney - Parse de Strings', () => {
  it('deve parsear string USD', () => {
    const money = parseMoney('1,234.56', 'USD');

    expect(money.toNumber()).toBe(1234.56);
    expect(money.currency).toBe('USD');
  });

  it('deve parsear string BRL', () => {
    const money = parseMoney('1.234,56', 'BRL');

    expect(money.toNumber()).toBe(1234.56);
    expect(money.currency).toBe('BRL');
  });

  it('deve remover símbolos de moeda', () => {
    const money = parseMoney('$ 1,234.56', 'USD');

    expect(money.toNumber()).toBe(1234.56);
  });
});
