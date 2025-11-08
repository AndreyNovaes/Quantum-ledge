/**
 * Loan Calculator Page - Calculate loan payments and amortization schedule
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Money, calculateAmortization } from '@/lib/currency';
import Decimal from 'decimal.js';

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [annualRate, setAnnualRate] = useState('5.5');
  const [months, setMonths] = useState('360');
  const [showSchedule, setShowSchedule] = useState(false);

  const amortizationSchedule = useMemo(() => {
    try {
      const amount = new Money(loanAmount, 'USD');
      const rate = new Decimal(annualRate).dividedBy(100);
      const monthsNum = parseInt(months, 10);

      if (amount.toNumber() <= 0 || rate.toNumber() <= 0 || monthsNum <= 0 || isNaN(monthsNum)) {
        return null;
      }

      return calculateAmortization(amount, rate, monthsNum);
    } catch {
      return null;
    }
  }, [loanAmount, annualRate, months]);

  const summary = useMemo(() => {
    if (!amortizationSchedule || amortizationSchedule.length === 0) {
      return null;
    }

    const monthlyPayment = amortizationSchedule[0].payment;
    const totalPayment = monthlyPayment.multiply(amortizationSchedule.length);
    const totalInterest = totalPayment.subtract(new Money(loanAmount, 'USD'));

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
    };
  }, [amortizationSchedule, loanAmount]);

  const handleCalculate = () => {
    setShowSchedule(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Loan Calculator</h1>
        <p className="text-gray-600 mt-1">Calculate loan payments and view amortization schedule</p>
      </div>

      {/* Input Form */}
      <Card data-testid="loan-input-card">
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Input
              label="Loan Amount ($)"
              data-testid="loan-amount"
              type="text"
              value={loanAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                setLoanAmount(value);
              }}
              placeholder="100000"
            />

            <Input
              label="Annual Interest Rate (%)"
              data-testid="annual-rate"
              type="text"
              value={annualRate}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                setAnnualRate(value);
              }}
              placeholder="5.5"
            />

            <Input
              label="Loan Term (months)"
              data-testid="loan-months"
              type="text"
              value={months}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                setMonths(value);
              }}
              placeholder="360"
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCalculate}
              disabled={!summary}
              data-testid="calculate-button"
            >
              Calculate Amortization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && showSchedule && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="monthly-payment-card">
            <CardContent>
              <div className="text-sm font-medium text-gray-600 mb-1">Monthly Payment</div>
              <div className="text-3xl font-bold text-gray-900" data-testid="monthly-payment">
                {summary.monthlyPayment.format()}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="total-payment-card">
            <CardContent>
              <div className="text-sm font-medium text-gray-600 mb-1">Total Payment</div>
              <div className="text-3xl font-bold text-gray-900" data-testid="total-payment">
                {summary.totalPayment.format()}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="total-interest-card">
            <CardContent>
              <div className="text-sm font-medium text-gray-600 mb-1">Total Interest</div>
              <div className="text-3xl font-bold text-danger" data-testid="total-interest">
                {summary.totalInterest.format()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amortization Schedule */}
      {amortizationSchedule && showSchedule && (
        <Card data-testid="amortization-card">
          <CardHeader>
            <CardTitle>Amortization Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full" data-testid="amortization-table">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {amortizationSchedule.map((entry, index) => (
                    <tr
                      key={entry.period}
                      className="hover:bg-gray-50"
                      data-testid={`amortization-row-${index}`}
                    >
                      <td className="px-4 py-3 text-gray-900" data-testid={`amortization-row-${index}-period`}>
                        {entry.period}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900" data-testid={`amortization-row-${index}-payment`}>
                        {entry.payment.format()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900" data-testid={`amortization-row-${index}-principal`}>
                        {entry.principal.format()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900" data-testid={`amortization-row-${index}-interest`}>
                        {entry.interest.format()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900" data-testid={`amortization-row-${index}-balance`}>
                        {entry.balance.format()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
