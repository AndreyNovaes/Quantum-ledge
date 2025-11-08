/**
 * CRITICAL: Currency manipulation library using Decimal.js for precision
 * This library NEVER uses native JavaScript number for financial calculations
 * All monetary values are represented as integers (cents) or Decimal objects
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

export type CurrencyCode = 'USD' | 'BRL' | 'EUR';

export interface CurrencyFormat {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}

export const CURRENCY_FORMATS: Record<CurrencyCode, CurrencyFormat> = {
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
    symbolPosition: 'before',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
    symbolPosition: 'before',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
    symbolPosition: 'before',
  },
};

/**
 * Money class - represents monetary values with precision
 * All values are stored as integers (cents) to avoid floating-point errors
 */
export class Money {
  private readonly cents: Decimal;
  public readonly currency: CurrencyCode;

  constructor(amount: number | string | Decimal, currency: CurrencyCode = 'USD') {
    // Convert to cents (multiply by 100) and store as Decimal
    this.cents = new Decimal(amount).times(100).round();
    this.currency = currency;
  }

  /**
   * Create Money from cents (already integer representation)
   */
  static fromCents(cents: number | string | Decimal, currency: CurrencyCode = 'USD'): Money {
    const money = new Money(0, currency);
    (money as any).cents = new Decimal(cents);
    return money;
  }

  /**
   * Add two Money objects
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromCents(this.cents.plus(other.cents), this.currency);
  }

  /**
   * Subtract two Money objects
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromCents(this.cents.minus(other.cents), this.currency);
  }

  /**
   * Multiply Money by a factor
   */
  multiply(factor: number | string | Decimal): Money {
    return Money.fromCents(this.cents.times(factor).round(), this.currency);
  }

  /**
   * Divide Money by a divisor
   */
  divide(divisor: number | string | Decimal): Money {
    return Money.fromCents(this.cents.dividedBy(divisor).round(), this.currency);
  }

  /**
   * Compare Money objects
   */
  equals(other: Money): boolean {
    return this.currency === other.currency && this.cents.equals(other.cents);
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents.greaterThan(other.cents);
  }

  greaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents.greaterThanOrEqualTo(other.cents);
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents.lessThan(other.cents);
  }

  lessThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents.lessThanOrEqualTo(other.cents);
  }

  /**
   * Get the amount as a Decimal (main units, not cents)
   */
  toDecimal(): Decimal {
    return this.cents.dividedBy(100);
  }

  /**
   * Get the amount as a number (USE WITH CAUTION - only for display)
   */
  toNumber(): number {
    return this.toDecimal().toNumber();
  }

  /**
   * Get cents as integer
   */
  getCents(): number {
    return this.cents.toNumber();
  }

  /**
   * Format Money for display
   */
  format(includeSymbol: boolean = true): string {
    const format = CURRENCY_FORMATS[this.currency];
    const amount = this.toDecimal();

    // Format the number with proper separators
    const parts = amount.toFixed(format.decimals).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandsSeparator);
    const decimalPart = parts[1];

    const formattedNumber = `${integerPart}${format.decimalSeparator}${decimalPart}`;

    if (!includeSymbol) {
      return formattedNumber;
    }

    if (format.symbolPosition === 'before') {
      return `${format.symbol} ${formattedNumber}`;
    } else {
      return `${formattedNumber} ${format.symbol}`;
    }
  }

  /**
   * Convert to another currency using exchange rate
   */
  convert(toCurrency: CurrencyCode, exchangeRate: Decimal): Money {
    const newCents = this.cents.times(exchangeRate).round();
    return Money.fromCents(newCents, toCurrency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} and ${other.currency}`);
    }
  }
}

/**
 * Calculate compound interest
 * Formula: A = P(1 + r/n)^(nt)
 * where:
 *   P = principal amount
 *   r = annual interest rate (as decimal)
 *   n = number of times interest is compounded per year
 *   t = number of years
 */
export function calculateCompoundInterest(
  principal: Money,
  annualRate: Decimal,
  compoundingsPerYear: number,
  years: number
): Money {
  const rate = annualRate.dividedBy(compoundingsPerYear);
  const exponent = compoundingsPerYear * years;
  const multiplier = rate.plus(1).pow(exponent);

  return principal.multiply(multiplier);
}

/**
 * Calculate loan amortization schedule
 */
export interface AmortizationEntry {
  period: number;
  payment: Money;
  principal: Money;
  interest: Money;
  balance: Money;
}

export function calculateAmortization(
  loanAmount: Money,
  annualRate: Decimal,
  months: number
): AmortizationEntry[] {
  const monthlyRate = annualRate.dividedBy(12);

  // Calculate monthly payment using the formula:
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const onePlusR = monthlyRate.plus(1);
  const onePlusRPowN = onePlusR.pow(months);
  const numerator = loanAmount.multiply(monthlyRate.times(onePlusRPowN));
  const denominator = onePlusRPowN.minus(1);
  const monthlyPayment = numerator.divide(denominator);

  const schedule: AmortizationEntry[] = [];
  let balance = loanAmount;

  for (let period = 1; period <= months; period++) {
    const interestPayment = balance.multiply(monthlyRate);
    const principalPayment = monthlyPayment.subtract(interestPayment);
    balance = balance.subtract(principalPayment);

    // Ensure last payment zeros out the balance
    if (period === months) {
      balance = new Money(0, loanAmount.currency);
    }

    schedule.push({
      period,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  return schedule;
}

/**
 * Calculate capital gains tax
 */
export function calculateCapitalGainsTax(
  purchasePrice: Money,
  salePrice: Money,
  taxRate: Decimal
): { gain: Money; tax: Money } {
  const gain = salePrice.subtract(purchasePrice);

  if (gain.lessThan(new Money(0, purchasePrice.currency))) {
    // No tax on losses
    return {
      gain,
      tax: new Money(0, purchasePrice.currency),
    };
  }

  const tax = gain.multiply(taxRate);

  return { gain, tax };
}

/**
 * Sum array of Money objects
 */
export function sum(moneyArray: Money[]): Money {
  if (moneyArray.length === 0) {
    return new Money(0);
  }

  return moneyArray.reduce((acc, money) => acc.add(money));
}

/**
 * Parse currency string to Money
 */
export function parseMoney(value: string, currency: CurrencyCode): Money {
  const format = CURRENCY_FORMATS[currency];

  // Remove currency symbol and spaces
  let cleaned = value.replace(format.symbol, '').trim();

  // Remove thousands separators
  cleaned = cleaned.replace(new RegExp(`\\${format.thousandsSeparator}`, 'g'), '');

  // Replace decimal separator with dot
  cleaned = cleaned.replace(format.decimalSeparator, '.');

  // Parse as Decimal
  return new Money(cleaned, currency);
}
