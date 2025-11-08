/**
 * Input component
 */

import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  'data-testid'?: string;
}

export function Input({
  label,
  error,
  className,
  'data-testid': testId,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
          error ? 'border-danger' : 'border-gray-300',
          className
        )}
        data-testid={testId}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
