/**
 * Card component
 */

import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function Card({ children, className, 'data-testid': testId }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-md border border-gray-200 p-6',
        className
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={clsx('text-2xl font-bold text-gray-900', className)}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
