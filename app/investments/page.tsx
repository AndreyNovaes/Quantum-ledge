/**
 * Investments Page - Portfolio management with real-time price updates
 */

'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StockTicker } from '@/components/investments/StockTicker';
import { useMarketDataContext } from '@/lib/MarketDataContext';
import { getInitialUserProfile } from '@/lib/mock-data';
import { Money, sum, calculateCapitalGainsTax } from '@/lib/currency';
import Decimal from 'decimal.js';
import clsx from 'clsx';

export default function InvestmentsPage() {
  const { prices } = useMarketDataContext();
  const userProfile = getInitialUserProfile();

  // Update assets with current prices
  const assetsWithCurrentPrices = useMemo(() => {
    return userProfile.assets.map(asset => {
      const currentPrice = prices[asset.symbol]?.price || asset.currentPrice;

      // Calculate total value
      const totalValue = currentPrice.multiply(asset.quantity);

      // Calculate cost basis
      const costBasis = asset.averagePurchasePrice.multiply(asset.quantity);

      // Calculate gain/loss
      const gainLoss = totalValue.subtract(costBasis);
      const gainLossPercent = gainLoss.toDecimal().dividedBy(costBasis.toDecimal()).times(100);

      // Calculate potential tax (15% capital gains rate)
      const taxInfo = calculateCapitalGainsTax(
        asset.averagePurchasePrice.multiply(asset.quantity),
        totalValue,
        new Decimal('0.15')
      );

      return {
        ...asset,
        currentPrice,
        totalValue,
        costBasis,
        gainLoss,
        gainLossPercent,
        taxInfo,
      };
    });
  }, [prices, userProfile.assets]);

  // Calculate totals
  const totalInvestmentValue = useMemo(() => {
    const values = assetsWithCurrentPrices.map(a => a.totalValue);
    return sum([...values, new Money(0, 'USD')]);
  }, [assetsWithCurrentPrices]);

  const totalCostBasis = useMemo(() => {
    const costs = assetsWithCurrentPrices.map(a => a.costBasis);
    return sum([...costs, new Money(0, 'USD')]);
  }, [assetsWithCurrentPrices]);

  const totalGainLoss = useMemo(() => {
    return totalInvestmentValue.subtract(totalCostBasis);
  }, [totalInvestmentValue, totalCostBasis]);

  const totalGainLossPercent = useMemo(() => {
    if (totalCostBasis.toNumber() === 0) {
      return new Decimal(0);
    }

    return totalGainLoss.toDecimal().dividedBy(totalCostBasis.toDecimal()).times(100);
  }, [totalGainLoss, totalCostBasis]);

  const isPositive = totalGainLoss.greaterThan(new Money(0, 'USD'));
  const isNegative = totalGainLoss.lessThan(new Money(0, 'USD'));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
        <p className="text-gray-600 mt-1">Track your investments and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="total-value-card">
          <CardContent>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Value</div>
            <div className="text-3xl font-bold text-gray-900" data-testid="total-investment-value">
              {totalInvestmentValue.format()}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="cost-basis-card">
          <CardContent>
            <div className="text-sm font-medium text-gray-600 mb-1">Cost Basis</div>
            <div className="text-3xl font-bold text-gray-900" data-testid="total-cost-basis">
              {totalCostBasis.format()}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="total-gain-loss-card">
          <CardContent>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Gain/Loss</div>
            <div
              className={clsx(
                'text-3xl font-bold',
                isPositive && 'text-success',
                isNegative && 'text-danger',
                !isPositive && !isNegative && 'text-gray-900'
              )}
              data-testid="total-gain-loss"
            >
              {totalGainLoss.format()}
            </div>
            <div
              className={clsx(
                'text-sm font-medium mt-1',
                isPositive && 'text-success',
                isNegative && 'text-danger',
                !isPositive && !isNegative && 'text-gray-600'
              )}
              data-testid="total-gain-loss-percent"
            >
              {isPositive && '+'}{totalGainLossPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card data-testid="holdings-card">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="holdings-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Purchase Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assetsWithCurrentPrices.map((asset, index) => {
                  const assetIsPositive = asset.gainLoss.greaterThan(new Money(0, 'USD'));
                  const assetIsNegative = asset.gainLoss.lessThan(new Money(0, 'USD'));

                  return (
                    <tr key={asset.id} className="hover:bg-gray-50" data-testid={`asset-row-${index}`}>
                      <td className="px-4 py-4" data-testid={`asset-row-${index}-name`}>
                        <div className="font-semibold text-gray-900">{asset.symbol}</div>
                        <div className="text-sm text-gray-600">{asset.name}</div>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-900" data-testid={`asset-row-${index}-quantity`}>
                        {asset.quantity.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-900" data-testid={`asset-row-${index}-avg-price`}>
                        {asset.averagePurchasePrice.format()}
                      </td>
                      <td className="px-4 py-4 text-right" data-testid={`asset-row-${index}-current-price`}>
                        <StockTicker symbol={asset.symbol} data-testid={`stock-ticker-${asset.symbol}`} />
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900" data-testid={`asset-row-${index}-total-value`}>
                        {asset.totalValue.format()}
                      </td>
                      <td className="px-4 py-4 text-right" data-testid={`asset-row-${index}-gain-loss`}>
                        <div
                          className={clsx(
                            'font-semibold',
                            assetIsPositive && 'text-success',
                            assetIsNegative && 'text-danger',
                            !assetIsPositive && !assetIsNegative && 'text-gray-900'
                          )}
                        >
                          {asset.gainLoss.format()}
                        </div>
                        <div
                          className={clsx(
                            'text-sm',
                            assetIsPositive && 'text-success',
                            assetIsNegative && 'text-danger',
                            !assetIsPositive && !assetIsNegative && 'text-gray-600'
                          )}
                          data-testid={`asset-row-${index}-gain-loss-percent`}
                        >
                          {assetIsPositive && '+'}{asset.gainLossPercent.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Implications */}
      <Card data-testid="tax-card">
        <CardHeader>
          <CardTitle>Estimated Capital Gains Tax (15% rate)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assetsWithCurrentPrices.map((asset, index) => {
              if (asset.taxInfo.gain.lessThanOrEqual(new Money(0, 'USD'))) {
                return null;
              }

              return (
                <div
                  key={asset.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  data-testid={`tax-row-${index}`}
                >
                  <div>
                    <div className="font-semibold text-gray-900">{asset.symbol}</div>
                    <div className="text-sm text-gray-600">
                      If sold at current price
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Taxable Gain: {asset.taxInfo.gain.format()}
                    </div>
                    <div className="font-semibold text-danger" data-testid={`tax-row-${index}-amount`}>
                      Tax: {asset.taxInfo.tax.format()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
