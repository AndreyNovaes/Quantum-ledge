/**
 * Transaction Table component
 */

'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import clsx from 'clsx';

interface TransactionTableProps {
  transactions: Transaction[];
  'data-testid'?: string;
}

export function TransactionTable({ transactions, 'data-testid': testId }: TransactionTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid={testId}>
        No transactions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid={testId}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              className="hover:bg-gray-50"
              data-testid={`${testId}-row-${index}`}
            >
              <td className="px-4 py-3 text-sm text-gray-900" data-testid={`${testId}-row-${index}-date`}>
                {formatDate(transaction.date)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900" data-testid={`${testId}-row-${index}-description`}>
                {transaction.description}
              </td>
              <td className="px-4 py-3 text-sm" data-testid={`${testId}-row-${index}-type`}>
                <span
                  className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    transaction.type === 'deposit' && 'bg-success-light text-success-dark',
                    transaction.type === 'withdrawal' && 'bg-danger-light text-danger-dark',
                    transaction.type === 'transfer' && 'bg-primary-100 text-primary-800',
                    transaction.type === 'investment' && 'bg-purple-100 text-purple-800',
                    transaction.type === 'dividend' && 'bg-green-100 text-green-800'
                  )}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium" data-testid={`${testId}-row-${index}-amount`}>
                {transaction.amount.format()}
              </td>
              <td className="px-4 py-3 text-sm text-center" data-testid={`${testId}-row-${index}-status`}>
                <span
                  className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    transaction.status === 'completed' && 'bg-success-light text-success-dark',
                    transaction.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                    transaction.status === 'failed' && 'bg-danger-light text-danger-dark'
                  )}
                >
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
