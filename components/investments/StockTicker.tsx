/**
 * Stock Ticker component - displays real-time stock price
 */

'use client';

import React from 'react';
import { useMarketDataContext } from '@/lib/MarketDataContext';
import clsx from 'clsx';

interface StockTickerProps {
  symbol: string;
  'data-testid'?: string;
}

export function StockTicker({ symbol, 'data-testid': testId }: StockTickerProps) {
  const { prices } = useMarketDataContext();
  const price = prices[symbol];

  if (!price) {
    return (
      <div className="text-gray-500" data-testid={testId}>
        Loading...
      </div>
    );
  }

  const isPositive = price.changePercent.greaterThan(0);
  const isNegative = price.changePercent.lessThan(0);

  return (
    <div className="flex flex-col" data-testid={testId}>
      <div className="text-lg font-semibold" data-testid={`${testId}-price`}>
        {price.price.format()}
      </div>
      <div
        className={clsx(
          'text-sm font-medium flex items-center gap-1',
          isPositive && 'text-success',
          isNegative && 'text-danger',
          !isPositive && !isNegative && 'text-gray-600'
        )}
        data-testid={`${testId}-change`}
      >
        {isPositive && '▲'}
        {isNegative && '▼'}
        <span>{price.change.toFixed(2)}</span>
        <span>({price.changePercent.toFixed(2)}%)</span>
      </div>
    </div>
  );
}
