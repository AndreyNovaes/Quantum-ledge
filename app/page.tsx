/**
 * Dashboard Page - Main landing page
 */

'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { TransactionTable } from '@/components/reports/TransactionTable';
import { useMarketDataContext } from '@/lib/MarketDataContext';
import { getInitialUserProfile, MOCK_PORTFOLIO_HISTORY } from '@/lib/mock-data';
import { Money, sum } from '@/lib/currency';
import Decimal from 'decimal.js';
import clsx from 'clsx';

export default function DashboardPage() {
  const { prices, exchangeRates, isTestMode, scenario, scenarioDescription, tickCount } = useMarketDataContext();
  const userProfile = getInitialUserProfile();

  // Calculate total net worth across all currencies + investments
  const netWorth = useMemo(() => {
    // Sum all account balances converted to USD
    const accountBalances = userProfile.accounts.map(account => {
      if (account.currency === 'USD') {
        return account.balance;
      }

      const rateKey = `${account.currency}-USD`;
      const rate = exchangeRates[rateKey];

      if (!rate) {
        return new Money(0, 'USD');
      }

      return account.balance.convert('USD', rate.rate);
    });

    const totalAccounts = sum(accountBalances);

    // Calculate total investment value
    const investmentValues = userProfile.assets.map(asset => {
      const currentPrice = prices[asset.symbol]?.price || asset.currentPrice;
      return currentPrice.multiply(asset.quantity);
    });

    const totalInvestments = sum([...investmentValues, new Money(0, 'USD')]);

    // Total net worth
    return totalAccounts.add(totalInvestments);
  }, [prices, exchangeRates, userProfile]);

  // Calculate today's change
  const todayChange = useMemo(() => {
    const yesterday = MOCK_PORTFOLIO_HISTORY[MOCK_PORTFOLIO_HISTORY.length - 2]?.value || netWorth;
    return netWorth.subtract(yesterday);
  }, [netWorth]);

  const todayChangePercent = useMemo(() => {
    const yesterday = MOCK_PORTFOLIO_HISTORY[MOCK_PORTFOLIO_HISTORY.length - 2]?.value || netWorth;

    if (yesterday.toNumber() === 0) {
      return new Decimal(0);
    }

    return todayChange.toDecimal().dividedBy(yesterday.toDecimal()).times(100);
  }, [todayChange, netWorth]);

  // Get last 5 transactions
  const recentTransactions = userProfile.transactions.slice(0, 5);

  const isPositive = todayChange.greaterThan(new Money(0, 'USD'));
  const isNegative = todayChange.lessThan(new Money(0, 'USD'));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {userProfile.name}</p>
      </div>

      {/* Test Mode / Scenario Indicator */}
      {isTestMode && (
        <div className="bg-blue-100 border border-blue-400 text-blue-900 px-4 py-3 rounded-lg" data-testid="test-mode-banner">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-lg">
                {scenario ? `📊 Scenario: ${scenario.replace(/_/g, ' ').toUpperCase()}` : 'Test Mode Active'}
              </strong>
              <p className="text-sm mt-1">
                {scenarioDescription || 'All prices and exchange rates are frozen for deterministic testing.'}
              </p>
            </div>
            {scenario && scenario !== 'fixed' && (
              <div className="text-right">
                <div className="text-xs text-blue-700">Tick Count</div>
                <div className="text-2xl font-bold" data-testid="tick-count">{tickCount}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="net-worth-card">
          <CardContent>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Net Worth</div>
            <div className="text-3xl font-bold text-gray-900" data-testid="total-net-worth">
              {netWorth.format()}
            </div>
            <div
              className={clsx(
                'text-sm font-medium mt-2 flex items-center gap-1',
                isPositive && 'text-success',
                isNegative && 'text-danger',
                !isPositive && !isNegative && 'text-gray-600'
              )}
              data-testid="net-worth-change"
            >
              {isPositive && '▲'}
              {isNegative && '▼'}
              <span>{todayChange.format()} ({todayChangePercent.toFixed(2)}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="accounts-card">
          <CardContent>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Accounts</div>
            <div className="text-3xl font-bold text-gray-900">
              {userProfile.accounts.length}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Across {new Set(userProfile.accounts.map(a => a.currency)).size} currencies
            </div>
          </CardContent>
        </Card>

        <Card data-testid="assets-card">
          <CardContent>
            <div className="text-sm font-medium text-gray-600 mb-1">Investment Assets</div>
            <div className="text-3xl font-bold text-gray-900">
              {userProfile.assets.length}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Active positions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card data-testid="portfolio-chart-card">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioChart data={MOCK_PORTFOLIO_HISTORY} data-testid="portfolio-chart" />
        </CardContent>
      </Card>

      {/* Account Balances */}
      <Card data-testid="accounts-list-card">
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userProfile.accounts.map((account, index) => (
              <div
                key={account.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                data-testid={`account-${index}`}
              >
                <div>
                  <div className="font-semibold text-gray-900" data-testid={`account-${index}-name`}>
                    {account.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {account.type} • {account.currency}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900" data-testid={`account-${index}-balance`}>
                  {account.balance.format()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card data-testid="recent-transactions-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={recentTransactions} data-testid="recent-transactions" />
        </CardContent>
      </Card>
    </div>
  );
}
